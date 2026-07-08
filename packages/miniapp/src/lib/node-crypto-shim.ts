// 为 banri-chenguang-core 的 seeded-rng 提供 Node crypto 的最小 polyfill
// 不依赖 crypto-js，避免 UMD/CommonJS 在小程序运行时的 interop 问题

import { sha256Hex, sha256Words, wordsToBytes } from './sha256';

interface HashLike {
  update(data: string): HashLike;
  digest(): Buffer;
}

function createHash(): HashLike {
  let data = '';
  return {
    update(value: string): HashLike {
      data += value;
      return this;
    },
    digest(): Buffer {
      const hex = sha256Hex(data);
      const bytes = wordsToBytes(sha256Words(data));
      return {
        readUInt32BE(offset: number): number {
          return (
            ((bytes[offset] << 24) |
              (bytes[offset + 1] << 16) |
              (bytes[offset + 2] << 8) |
              bytes[offset + 3]) >>>
            0
          );
        },
        toString(encoding?: string): string {
          if (encoding === 'hex') return hex;
          return data;
        },
        length: bytes.length,
        [Symbol.iterator](): Iterator<number> {
          let i = 0;
          return {
            next(): IteratorResult<number> {
              if (i < bytes.length) return { value: bytes[i++], done: false };
              return { value: undefined as unknown as number, done: true };
            },
          };
        },
      } as unknown as Buffer;
    },
  };
}

export default { createHash };
export { createHash };
