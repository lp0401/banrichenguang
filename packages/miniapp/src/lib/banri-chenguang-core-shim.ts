// 为 banri-chenguang-core 在小程序环境提供 polyfill
// 此文件需要在应用启动时最先执行

import CryptoJS from 'crypto-js';

interface ProcessPolyfill {
  env: Record<string, string>;
}

interface GlobalWithProcess {
  process?: ProcessPolyfill;
}

const globalWithProcess = globalThis as unknown as GlobalWithProcess;

function createProcessPolyfill(): ProcessPolyfill {
  return {
    env: {
      TZ: 'Asia/Shanghai',
    },
  };
}

if (typeof globalWithProcess.process === 'undefined') {
  globalWithProcess.process = createProcessPolyfill();
}
if (typeof globalWithProcess.process.env === 'undefined') {
  globalWithProcess.process.env = {};
}
if (!globalWithProcess.process.env.TZ) {
  globalWithProcess.process.env.TZ = 'Asia/Shanghai';
}

// 暴露一个安全的 sha256 工具（供可能的手动调用）
export function sha256Hex(input: string): string {
  return CryptoJS.SHA256(input).toString();
}

const processPolyfill = globalWithProcess.process;
export default processPolyfill;
