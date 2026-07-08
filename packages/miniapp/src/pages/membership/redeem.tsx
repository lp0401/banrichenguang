import './redeem.css';
import Button from '@/components/Button';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { post } from '@/utils/request';
import { formatMembershipLabel } from '@/lib/membership';
import { View, Text, Input } from '@tarojs/components';

interface ActivateResult {
  success: boolean;
  error?: string;
  keyType?: 'membership' | 'credits';
  membershipType?: 'free' | 'plus' | 'pro';
  creditsAmount?: number;
}

export default function MembershipRedeemPage() {
  const [keyCode, setKeyCode] = useState('');
  const [result, setResult] = useState<ActivateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    const code = keyCode.trim();
    if (!code) {
      Taro.showToast({ title: '请输入激活码', icon: 'none' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await post<ActivateResult>('/api/activation-keys', {
        action: 'activate',
        keyCode: code,
      });
      setResult(res);
      if (res.success) {
        setKeyCode('');
      }
    } catch {
      // request 已 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="container">
      <View className="card">
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', marginBottom: '16rpx' }}>
          兑换激活码
        </Text>
        <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx', marginBottom: '32rpx', lineHeight: '1.6' }}>
          请输入以 sk- 开头的激活码，可兑换积分或会员时长。
        </Text>

        <View style={{ marginBottom: '24rpx' }}>
          <Input
            type="text"
            placeholder="如：sk-xxxxxxxxxxxxxxxx"
            value={keyCode}
            onInput={(e) => setKeyCode(e.detail.value)}
            style={{ padding: '24rpx', background: '#F9FAFB', borderRadius: '12rpx', fontSize: '30rpx' }}
          />
        </View>

        <Button onClick={handleRedeem} loading={loading} disabled={loading} className="btn-primary">
          {loading ? '兑换中...' : '立即兑换'}
        </Button>

        {result && (
          <View
            style={{
              marginTop: '32rpx',
              padding: '24rpx',
              borderRadius: '12rpx',
              background: result.success ? '#ECFDF5' : '#FEF2F2',
            }}
          >
            <Text
              style={{
                fontSize: '30rpx',
                fontWeight: 'bold',
                color: result.success ? '#059669' : '#DC2626',
                marginBottom: '12rpx',
              }}
            >
              {result.success ? '兑换成功' : '兑换失败'}
            </Text>
            <Text style={{ fontSize: '28rpx', color: result.success ? '#047857' : '#B91C1C', lineHeight: '1.6' }}>
              {result.success
                ? result.keyType === 'credits'
                  ? `获得 ${result.creditsAmount} 积分`
                  : `获得 ${formatMembershipLabel(result.membershipType || 'free')} 会员`
                : result.error || '激活码无效或已被使用'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
