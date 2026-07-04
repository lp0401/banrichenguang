import Taro from '@tarojs/taro';
import { getAccessToken, getRefreshToken, setAccessToken, clearAuth } from './storage';

// 通过环境变量 TARO_APP_API_URL 配置后端地址
// 本地开发：http://localhost:3000
// 生产部署：部署到 Vercel 后改为 https://<项目名>.vercel.app
const BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:3000';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  silent?: boolean;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await Taro.request({
      url: `${BASE_URL}/api/auth/wechat/refresh`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    const result = res.data as ApiResponse<{ accessToken: string }>;
    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
      return result.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, headers = {}, skipAuth = false } = options;

  const token = getAccessToken();

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth && token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
    });

    // 处理 401，尝试刷新 token 后重试一次
    if (res.statusCode === 401 && !skipAuth) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        header['Authorization'] = `Bearer ${newToken}`;
        const retryRes = await Taro.request({
          url: `${BASE_URL}${url}`,
          method,
          data,
          header,
        });
        return handleResponse<T>(retryRes);
      }
      clearAuth();
      throw new Error('登录已过期，请重新登录');
    }

    return handleResponse<T>(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : '网络请求失败';
    if (!options.silent) {
      Taro.showToast({ title: message, icon: 'none' });
    }
    throw err;
  }
}

function handleResponse<T>(res: Taro.request.SuccessCallbackResult<Record<string, unknown> | unknown[]>): T {
  const result = res.data as unknown as ApiResponse<T>;

  if (res.statusCode >= 200 && res.statusCode < 300) {
    // 后端统一 envelope：{ success, data, error }，也有部分接口直接返回业务对象
    if (result && typeof result === 'object' && 'data' in result) {
      if (result.success) {
        return result.data as T;
      }
      throw new Error(result.error || '请求失败');
    }
    return res.data as T;
  }

  throw new Error(result?.error || `HTTP ${res.statusCode}`);
}

export function get<T = unknown>(url: string, params?: Record<string, string | number>, options?: { silent?: boolean }): Promise<T> {
  const query = params
    ? '?' + Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  return request<T>({ url: `${url}${query}`, method: 'GET', silent: options?.silent });
}

export function post<T = unknown>(url: string, data?: unknown, options?: { silent?: boolean }): Promise<T> {
  return request<T>({ url, method: 'POST', data, silent: options?.silent });
}
