import { View, Text } from '@tarojs/components';
import Button from '@/components/Button';
import { useState, useCallback } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { get } from '@/utils/request';
import {
  PRICING_PLANS,
  formatMembershipLabel,
  formatExpiresAt,
  getPlanConfig,
  type MembershipApiResponse,
  type MembershipType,
} from '@/lib/membership';

interface MembershipState {
  type: MembershipType;
  expiresAt: string | null;
  isActive: boolean;
  aiChatCount: number;
  creditLimit: number;
  isAdmin: boolean;
}

export default function MembershipIndexPage() {
  const [membership, setMembership] = useState<MembershipState | null>(null);

  const loadMembership = useCallback(async () => {
    try {
      const res = await get<MembershipApiResponse>('/api/user/membership');
      const info = res.membership;
      setMembership({
        type: info.type,
        expiresAt: info.expiresAt,
        isActive: info.isActive,
        aiChatCount: info.aiChatCount,
        creditLimit: getPlanConfig(info.type).creditLimit,
        isAdmin: res.isAdmin,
      });
    } catch {
      // request 已 toast
    }
  }, []);

  useDidShow(() => {
    void loadMembership();
  });

  return (
    <View className="container">
      <View className="card">
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', marginBottom: '32rpx' }}>
          会员与积分
        </Text>

        {membership ? (
          <View
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              borderRadius: '16rpx',
              padding: '40rpx',
              marginBottom: '32rpx',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
              <View
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8rpx 20rpx',
                  borderRadius: '8rpx',
                  fontSize: '28rpx',
                  fontWeight: 'bold',
                }}
              >
                {formatMembershipLabel(membership.type)}
              </View>
              <Text style={{ fontSize: '48rpx', fontWeight: 'bold', color: 'white' }}>
                {membership.aiChatCount}
              </Text>
            </View>
            <Text style={{ fontSize: '26rpx', color: 'rgba(255,255,255,0.9)', marginBottom: '8rpx' }}>
              积分上限 {membership.creditLimit}
            </Text>
            <Text style={{ fontSize: '24rpx', color: 'rgba(255,255,255,0.8)' }}>
              {formatExpiresAt(membership.expiresAt)}
              {!membership.isActive && membership.type !== 'free' && '（已过期）'}
            </Text>
          </View>
        ) : (
          <View style={{ background: '#F9FAFB', borderRadius: '16rpx', padding: '40rpx', marginBottom: '32rpx' }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx' }}>加载中...</Text>
          </View>
        )}

        <Button
          onClick={() => Taro.navigateTo({ url: '/pages/membership/redeem' })}
          className="btn-primary"
          style={{ marginBottom: '32rpx' }}
        >
          兑换激活码
        </Button>

        {membership?.isAdmin ? (
          <Button
            onClick={() => Taro.navigateTo({ url: '/pages/membership/admin-keys' })}
            style={{
              marginBottom: '32rpx',
              background: '#FEF3C7',
              color: '#92400E',
              borderColor: '#FDE68A',
            }}
          >
            管理员发码
          </Button>
        ) : null}

        <View
          style={{
            background: '#FEF3C7',
            borderRadius: '12rpx',
            padding: '20rpx',
            marginBottom: '32rpx',
          }}
        >
          <Text style={{ fontSize: '26rpx', color: '#92400E', lineHeight: '1.5' }}>
            个人开发者小程序暂不支持微信支付，会员和积分仅可通过每日签到或激活码兑换获得。
          </Text>
        </View>

        <Text style={{ fontSize: '32rpx', fontWeight: 'bold', marginBottom: '24rpx' }}>
          会员权益
        </Text>

        {PRICING_PLANS.map((plan) => {
          const isCurrent = membership?.type === plan.id;
          return (
            <View
              key={plan.id}
              style={{
                background: isCurrent ? '#F5F3FF' : '#FAFAFA',
                borderRadius: '16rpx',
                padding: '28rpx',
                marginBottom: '20rpx',
                border: isCurrent ? '2rpx solid var(--primary-color)' : '2rpx solid transparent',
              }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <Text style={{ fontSize: '34rpx', fontWeight: 'bold' }}>{plan.title}</Text>
                  {isCurrent && (
                    <View
                      style={{
                        background: 'var(--primary-color)',
                        color: 'white',
                        padding: '4rpx 12rpx',
                        borderRadius: '6rpx',
                        fontSize: '22rpx',
                      }}
                    >
                      当前
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: '28rpx', color: 'var(--text-secondary)' }}>
                  上限 {plan.creditLimit} 积分
                </Text>
              </View>

              <View style={{ display: 'flex', flexDirection: 'column', gap: '10rpx' }}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10rpx' }}>
                    <Text style={{ color: 'var(--primary-color)', fontSize: '28rpx' }}>✓</Text>
                    <Text style={{ fontSize: '27rpx', color: 'var(--text-secondary)' }}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
