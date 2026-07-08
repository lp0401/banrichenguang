// 为 banri-chenguang-core 在小程序环境提供 Node crypto 的极简 polyfill
// 仅覆盖 core 实际使用的 sha256 + readUInt32BE/digest('hex')

import CryptoJS from 'crypto-js';

class HashShim {
  private input = '';

  update(data: string): this {
    this.input = data;
    return this;
  }

  digest(): { readUInt32BE(offset: number): number };
  digest(encoding: 'hex'): string;
  digest(encoding?: 'hex'): { readUInt32BE(offset: number): number } | string {
    const hex = CryptoJS.SHA256(this.input).toString();
    if (encoding === 'hex') {
      return hex;
    }
    return {
      readUInt32BE(offset: number): number {
        return Number.parseInt(hex.slice(offset * 2, offset * 2 + 8), 16);
      },
    };
  }
}

export function createHash(algorithm: string): HashShim {
  if (algorithm !== 'sha256') {
    throw new Error(`crypto-shim: unsupported algorithm "${algorithm}"`);
  }
  return new HashShim();
}

const cryptoShim = { createHash };
export default cryptoShim;
