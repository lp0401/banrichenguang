import Button from '@/components/Button';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { post, get } from '@/utils/request';
import { View, Text, Input, Picker } from '@tarojs/components';

interface ActivationKey {
  id: string;
  key_code: string;
  key_type: 'membership' | 'credits';
  membership_type: 'plus' | 'pro' | null;
  credits_amount: number | null;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

type CreateKeyType = 'plus' | 'pro' | 'credits';

interface CreateResult {
  success: boolean;
  keys?: string[];
  error?: string;
}

export default function AdminKeysPage() {
  const [createType, setCreateType] = useState<CreateKeyType>('plus');
  const [count, setCount] = useState('1');
  const [creditsAmount, setCreditsAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);
  const [recentKeys, setRecentKeys] = useState<ActivationKey[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const typeOptions: { value: CreateKeyType; label: string }[] = [
    { value: 'plus', label: 'Plus 会员' },
    { value: 'pro', label: 'Pro 会员' },
    { value: 'credits', label: '积分' },
  ];

  const loadRecentKeys = async () => {
    setRecentLoading(true);
    try {
      const res = await get<ActivationKey[]>('/api/activation-keys', {
        isUsed: 'false',
      });
      setRecentKeys(res.slice(0, 20) || []);
    } catch {
      // request 已 toast
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    void loadRecentKeys();
  }, []);

  const handleCreate = async () => {
    const countNum = parseInt(count, 10);
    if (Number.isNaN(countNum) || countNum < 1 || countNum > 100) {
      Taro.showToast({ title: '数量需在 1-100 之间', icon: 'none' });
      return;
    }

    const body: Record<string, unknown> = {
      action: 'create',
      count: countNum,
    };

    if (createType === 'credits') {
      const amountNum = parseInt(creditsAmount, 10);
      if (Number.isNaN(amountNum) || amountNum < 1) {
        Taro.showToast({ title: '请输入有效积分数量', icon: 'none' });
        return;
      }
      body.keyType = 'credits';
      body.creditsAmount = amountNum;
    } else {
      body.keyType = 'membership';
      body.membershipType = createType;
    }

    setLoading(true);
    try {
      const res = await post<CreateResult>('/api/activation-keys', body);
      if (res.success && res.keys) {
        setKeys(res.keys);
        const codesText = res.keys.join('\n');
        Taro.showModal({
          title: `成功创建 ${res.keys.length} 个激活码`,
          content: codesText,
          showCancel: true,
          cancelText: '关闭',
          confirmText: '复制全部',
          success: (modalRes) => {
            if (modalRes.confirm) {
              void Taro.setClipboardData({ data: codesText });
            }
          },
        });
        void loadRecentKeys();
      } else {
        Taro.showToast({ title: res.error || '创建失败', icon: 'none' });
      }
    } catch {
      // request 已 toast
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (code: string) => {
    await Taro.setClipboardData({ data: code });
  };

  const getTypeLabel = (key: ActivationKey) => {
    if (key.key_type === 'credits') {
      return `${key.credits_amount} 积分`;
    }
    return key.membership_type === 'plus' ? 'Plus 会员' : 'Pro 会员';
  };

  const pickerRange = typeOptions.map((o) => o.label);
  const pickerIndex = typeOptions.findIndex((o) => o.value === createType);

  return (
    <View className="container">
      <View className="card">
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', marginBottom: '16rpx' }}>
          管理员发码
        </Text>
        <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx', marginBottom: '32rpx', lineHeight: '1.6' }}>
          仅管理员可见，可批量创建会员或积分激活码。
        </Text>

        <View style={{ marginBottom: '24rpx' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: '500', marginBottom: '12rpx', display: 'block' }}>
            类型
          </Text>
          <Picker
            mode="selector"
            range={pickerRange}
            value={pickerIndex}
            onChange={(e) => setCreateType(typeOptions[Number(e.detail.value)].value)}
          >
            <View
              style={{
                padding: '24rpx',
                background: '#F9FAFB',
                borderRadius: '12rpx',
                fontSize: '30rpx',
              }}
            >
              {typeOptions[pickerIndex].label}
            </View>
          </Picker>
        </View>

        {createType === 'credits' && (
          <View style={{ marginBottom: '24rpx' }}>
            <Text style={{ fontSize: '28rpx', fontWeight: '500', marginBottom: '12rpx', display: 'block' }}>
              积分数量
            </Text>
            <Input
              type="number"
              placeholder="如：10"
              value={creditsAmount}
              onInput={(e) => setCreditsAmount(e.detail.value)}
              style={{ padding: '24rpx', background: '#F9FAFB', borderRadius: '12rpx', fontSize: '30rpx' }}
            />
          </View>
        )}

        <View style={{ marginBottom: '32rpx' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: '500', marginBottom: '12rpx', display: 'block' }}>
            创建数量（1-100）
          </Text>
          <Input
            type="number"
            placeholder="如：5"
            value={count}
            onInput={(e) => setCount(e.detail.value)}
            style={{ padding: '24rpx', background: '#F9FAFB', borderRadius: '12rpx', fontSize: '30rpx' }}
          />
        </View>

        <Button onClick={handleCreate} loading={loading} disabled={loading} className="btn-primary">
          {loading ? '创建中...' : '批量创建'}
        </Button>

        {keys.length > 0 && (
          <View style={{ marginTop: '32rpx' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 'bold', marginBottom: '16rpx' }}>
              本次生成（点击复制）
            </Text>
            {keys.map((code, idx) => (
              <View
                key={idx}
                onClick={() => void handleCopy(code)}
                style={{
                  padding: '20rpx',
                  background: '#ECFDF5',
                  borderRadius: '12rpx',
                  marginBottom: '12rpx',
                  fontFamily: 'monospace',
                  fontSize: '28rpx',
                  color: '#047857',
                  wordBreak: 'break-all',
                }}
              >
                {code}
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: '48rpx' }}>
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 'bold' }}>未使用激活码</Text>
            <Text
              onClick={() => void loadRecentKeys()}
              style={{ fontSize: '26rpx', color: 'var(--primary-color)' }}
            >
              刷新
            </Text>
          </View>

          {recentLoading ? (
            <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx' }}>加载中...</Text>
          ) : recentKeys.length === 0 ? (
            <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx' }}>暂无未使用激活码</Text>
          ) : (
            recentKeys.map((key) => (
              <View
                key={key.id}
                onClick={() => void handleCopy(key.key_code)}
                style={{
                  padding: '20rpx',
                  background: '#F9FAFB',
                  borderRadius: '12rpx',
                  marginBottom: '12rpx',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '28rpx',
                      color: 'var(--text-primary)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {key.key_code}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: 'var(--text-secondary)', marginTop: '8rpx' }}>
                    {getTypeLabel(key)}
                  </Text>
                </View>
                <Text style={{ fontSize: '24rpx', color: 'var(--primary-color)', flexShrink: 0, marginLeft: '16rpx' }}>
                  复制
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}
