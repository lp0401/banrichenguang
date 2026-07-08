import './index.css';
import Button from '@/components/Button';
import { useState, useCallback } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { loginWithWechat, logout } from '@/utils/auth';
import { getUser, getAccessToken, setUser } from '@/utils/storage';
import { get } from '@/utils/request';
import { formatMembershipLabel, getPlanConfig, type MembershipApiResponse } from '@/lib/membership';
import { View, Text, Image } from '@tarojs/components';

interface UserInfo {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
}

interface MembershipState {
  type: 'free' | 'plus' | 'pro';
  expiresAt: string | null;
  isActive: boolean;
  aiChatCount: number;
  creditLimit: number;
}

export default function ProfilePage() {
  const [user, setUserState] = useState<UserInfo | null>(() => getUser<UserInfo>());
  const [membership, setMembership] = useState<MembershipState | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMembership = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<MembershipApiResponse>('/api/user/membership');
      const info = res.membership;
      setMembership({
        type: info.type,
        expiresAt: info.expiresAt,
        isActive: info.isActive,
        aiChatCount: info.aiChatCount,
        creditLimit: getPlanConfig(info.type).creditLimit,
      });
    } catch {
      // 失败时保持原状，不弹 toast（request 已处理）
    } finally {
      setLoading(false);
    }
  }, []);

  const syncUserFromServer = useCallback(async () => {
    if (user) return;
    if (!getAccessToken()) return;
    try {
      const res = await get<{ profile: (UserInfo & { avatar_url?: string | null }) | null }>('/api/user/profile');
      const profile = res.profile;
      if (profile) {
        const normalized: UserInfo = {
          id: profile.id,
          email: profile.email,
          nickname: profile.nickname || undefined,
          avatarUrl: profile.avatar_url || undefined,
        };
        setUser(normalized);
        setUserState(normalized);
      }
    } catch {
      // 静默失败，保持未登录状态
    }
  }, [user]);

  useDidShow(() => {
    void syncUserFromServer();
    void loadMembership();
  });

  const handleLogin = async () => {
    const data = await loginWithWechat();
    if (data) {
      setUserState(data.user);
    }
  };

  const handleLogout = () => {
    logout();
    setUserState(null);
    setMembership(null);
  };

  const navigateTo = (url: string) => {
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    void Taro.navigateTo({ url });
  };

  return (
    <View className="container">
      <View className="card" style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
        {user?.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            style={{ width: '120rpx', height: '120rpx', borderRadius: '60rpx' }}
          />
        ) : (
          <View
            style={{
              width: '120rpx',
              height: '120rpx',
              borderRadius: '60rpx',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48rpx',
              fontWeight: 'bold',
            }}
          >
            {user ? user.nickname?.[0] || '用' : '客'}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '36rpx', fontWeight: 'bold' }}>
            {user ? user.nickname || '微信用户' : '未登录'}
          </Text>
          {user?.email && (
            <Text style={{ color: 'var(--text-secondary)', fontSize: '26rpx', marginTop: '8rpx' }}>
              {user.email}
            </Text>
          )}
          {membership && (
            <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '12rpx' }}>
              <View style={{
                background: membership.isActive ? 'var(--primary-color)' : '#9CA3AF',
                color: 'white',
                padding: '6rpx 16rpx',
                borderRadius: '8rpx',
                fontSize: '24rpx',
              }}
              >
                {formatMembershipLabel(membership.type)}
              </View>
              <Text style={{ fontSize: '26rpx', color: 'var(--text-secondary)' }}>
                {membership.aiChatCount} / {membership.creditLimit} 积分
              </Text>
            </View>
          )}
          {loading && !membership && (
            <Text style={{ fontSize: '24rpx', color: 'var(--text-secondary)', marginTop: '8rpx' }}>加载中...</Text>
          )}
        </View>
      </View>

      {!user ? (
        <View className="card">
          <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx', marginBottom: '24rpx' }}>
            登录后可查看历史记录、积分和会员状态
          </Text>
          <Button onClick={handleLogin} className="btn-primary">
            微信一键登录
          </Button>
        </View>
      ) : (
        <View className="card">
          <View style={{ display: 'flex', flexDirection: 'column', gap: '16rpx' }}>
            <Button onClick={() => navigateTo('/pages/checkin/index')} className="btn-primary">
              每日签到
            </Button>
            <Button onClick={() => navigateTo('/pages/membership/index')} style={{ background: '#F3F4F6', color: 'var(--text-primary)' }}>
              会员与积分
            </Button>
            <Button onClick={handleLogout} style={{ background: '#FEF2F2', color: '#DC2626' }}>
              退出登录
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
