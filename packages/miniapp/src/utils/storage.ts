import Taro from '@tarojs/taro';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'banri_chenguang_access_token',
  REFRESH_TOKEN: 'banri_chenguang_refresh_token',
  USER: 'banri_chenguang_user',
} as const;

export function getAccessToken(): string | null {
  try {
    const value = Taro.getStorageSync<string>(STORAGE_KEYS.ACCESS_TOKEN);
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  Taro.setStorageSync(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export function getRefreshToken(): string | null {
  try {
    const value = Taro.getStorageSync<string>(STORAGE_KEYS.REFRESH_TOKEN);
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  Taro.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function getUser<T = unknown>(): T | null {
  try {
    const value = Taro.getStorageSync<T>(STORAGE_KEYS.USER);
    return value === undefined || value === null || value === '' ? null : value;
  } catch {
    return null;
  }
}

export function setUser<T>(user: T): void {
  Taro.setStorageSync(STORAGE_KEYS.USER, user);
}

export function clearAuth(): void {
  Taro.removeStorageSync(STORAGE_KEYS.ACCESS_TOKEN);
  Taro.removeStorageSync(STORAGE_KEYS.REFRESH_TOKEN);
  Taro.removeStorageSync(STORAGE_KEYS.USER);
}
