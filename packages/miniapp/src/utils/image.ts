import Taro from '@tarojs/taro';

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

function isCancelError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const errMsg = (error as { errMsg?: unknown }).errMsg;
  return typeof errMsg === 'string' && errMsg.toLowerCase().includes('cancel');
}

function inferMimeType(path: string): string {
  const cleanPath = path.split('?')[0].split('#')[0];
  const ext = cleanPath.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  return mimeMap[ext] || 'image/jpeg';
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

/**
 * 调起小程序图片选择（支持拍照/相册），并返回 base64 编码的图片数据。
 * 优先使用微信文件系统；H5 环境回退到 FileReader。
 * @throws 非用户取消的异常会抛出，调用方应给用户反馈。
 */
export async function chooseImageAsBase64(): Promise<ImageData | null> {
  try {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    });

    const tempFilePath = res.tempFilePaths?.[0] || res.tempFiles?.[0]?.path;
    const tempFileSize = res.tempFiles?.[0]?.size ?? 0;

    if (!tempFilePath) {
      return null;
    }

    if (tempFileSize > MAX_IMAGE_SIZE) {
      throw new Error('图片过大，请选择较小的照片');
    }

    let base64: string;
    const fs = Taro.getFileSystemManager?.();
    if (fs && typeof fs.readFileSync === 'function') {
      const raw = fs.readFileSync(tempFilePath, 'base64');
      if (typeof raw !== 'string') {
        throw new Error('读取图片失败');
      }
      base64 = raw;
    } else {
      const response = await fetch(tempFilePath);
      if (!response.ok) {
        throw new Error(`读取图片失败: ${response.status}`);
      }
      const blob = await response.blob();
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const idx = dataUrl.indexOf(',');
          resolve(idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl);
        };
        reader.onerror = () => reject(new Error('读取图片失败'));
        reader.onabort = () => reject(new Error('读取图片已取消'));
        reader.readAsDataURL(blob);
      });
    }

    return { base64, mimeType: inferMimeType(tempFilePath) };
  } catch (error) {
    if (isCancelError(error)) {
      return null;
    }
    throw error instanceof Error ? error : new Error('读取图片失败，请重试');
  }
}
