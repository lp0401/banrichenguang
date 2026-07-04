import Taro from '@tarojs/taro';
import { post } from './request';
import { setAccessToken, setRefreshToken, setUser, clearAuth } from './storage';

interface WechatLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname?: string;
    avatarUrl?: string;
  };
}

export async function loginWithWechat(): Promise<WechatLoginResponse | null> {
  try {
    const { code } = await Taro.login({});
    if (!code) {
      throw new Error('获取微信登录 code 失败');
    }

    const data = await post<WechatLoginResponse>('/api/auth/wechat', { code });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败';
    Taro.showToast({ title: message, icon: 'none' });
    return null;
  }
}

export function logout(): void {
  clearAuth();
  Taro.showToast({ title: '已退出登录', icon: 'success' });
}
