declare module 'crypto-js' {
  export function SHA256(message: string | number[]): {
    toString(encoder?: unknown): string;
  };
}
