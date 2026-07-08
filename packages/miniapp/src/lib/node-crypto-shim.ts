// 为 banri-chenguang-core 的 seeded-rng 提供 Node crypto 的最小 polyfill
// 不依赖 crypto-js，避免 UMD/CommonJS 在小程序运行时的 interop 问题

import { sha256Words, wordsToBytes } from './sha256';

interface BufferLike {
  length: number;
  readUInt32BE(offset: number): number;
  toString(encoding?: string): string;
  slice(start?: number, end?: number): BufferLike;
  [Symbol.iterator](): Iterator<number>;
}

interface HashLike {
  update(data: string): HashLike;
  digest(encoding?: string): BufferLike | string;
}

function createBufferLike(bytes: number[]): BufferLike {
  const hex = wordsToBytes(sha256Words(String.fromCharCode(...bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const self: BufferLike = {
    length: bytes.length,
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
      return String.fromCharCode(...bytes);
    },
    slice(start = 0, end = bytes.length): BufferLike {
      return createBufferLike(bytes.slice(start, end));
    },
    [Symbol.iterator](): Iterator<number> {
      let i = 0;
      return {
        next(): IteratorResult<number> {
          if (i < bytes.length) return { value: bytes[i++], done: false };
          return { value: undefined as unknown as number, done: true };
        },
      };
    },
  };
  return self;
}

function createHash(): HashLike {
  let data = '';
  return {
    update(value: string): HashLike {
      data += value;
      return this;
    },
    digest(encoding?: string): BufferLike | string {
      const bytes = wordsToBytes(sha256Words(data));
      if (encoding === 'hex') {
        return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
      return createBufferLike(bytes);
    },
  };
}

export default { createHash };
export { createHash };
