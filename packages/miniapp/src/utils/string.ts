/**
 * 安全解码 URL 参数。
 * - 将 '+' 还原为空格，兼容 URLSearchParams 编码。
 * - 捕获 URIError，返回原始值兜底。
 */
export function safeDecodeURIComponent(value?: string): string {
  if (!value) {
    return '';
  }
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}
