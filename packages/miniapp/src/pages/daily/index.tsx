import './index.css';
import Button from '@/components/Button';
import { useState } from 'react';
import { calculateDailyAlmanac, toAlmanacText } from 'banri-chenguang-core/almanac';
import type { AlmanacOutput } from 'banri-chenguang-core/almanac';
import { View, Text, Picker, Input } from '@tarojs/components';

export default function DailyPage() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    date: today,
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '12',
  });

  const [result, setResult] = useState<AlmanacOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const output = await calculateDailyAlmanac({
        date: form.date,
        birthYear: form.birthYear ? Number(form.birthYear) : undefined,
        birthMonth: form.birthMonth ? Number(form.birthMonth) : undefined,
        birthDay: form.birthDay ? Number(form.birthDay) : undefined,
        birthHour: form.birthHour ? Number(form.birthHour) : undefined,
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="container">
      <View className="card">
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', marginBottom: '32rpx' }}>
          每日运势
        </Text>

        <View style={{ marginBottom: '24rpx' }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx', marginBottom: '12rpx' }}>
            日期
          </Text>
          <Picker mode="date" value={form.date} onChange={(e) => updateForm('date', e.detail.value)}>
            <View style={{ padding: '20rpx', background: '#F9FAFB', borderRadius: '12rpx' }}>
              {form.date}
            </View>
          </Picker>
        </View>

        <View style={{ marginBottom: '24rpx' }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx', marginBottom: '12rpx' }}>
            出生时间（用于个性化十神，可选）
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>
            <View style={{ flex: 1, minWidth: '120rpx' }}>
              <Input
                type="number"
                placeholder="年"
                value={form.birthYear}
                onInput={(e) => updateForm('birthYear', e.detail.value)}
                style={{ padding: '20rpx', background: '#F9FAFB', borderRadius: '12rpx' }}
              />
            </View>
            <View style={{ flex: 1, minWidth: '80rpx' }}>
              <Input
                type="number"
                placeholder="月"
                value={form.birthMonth}
                onInput={(e) => updateForm('birthMonth', e.detail.value)}
                style={{ padding: '20rpx', background: '#F9FAFB', borderRadius: '12rpx' }}
              />
            </View>
            <View style={{ flex: 1, minWidth: '80rpx' }}>
              <Input
                type="number"
                placeholder="日"
                value={form.birthDay}
                onInput={(e) => updateForm('birthDay', e.detail.value)}
                style={{ padding: '20rpx', background: '#F9FAFB', borderRadius: '12rpx' }}
              />
            </View>
            <View style={{ flex: 1, minWidth: '80rpx' }}>
              <Input
                type="number"
                placeholder="时"
                value={form.birthHour}
                onInput={(e) => updateForm('birthHour', e.detail.value)}
                style={{ padding: '20rpx', background: '#F9FAFB', borderRadius: '12rpx' }}
              />
            </View>
          </View>
        </View>

        <Button onClick={handleCalculate} className="btn-primary" loading={loading}>
          {loading ? '计算中...' : '查看运势'}
        </Button>
      </View>

      {error && (
        <View className="card">
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      )}

      {result && (
        <View className="card">
          <View style={{ marginBottom: '16rpx' }}>
            <Text style={{ fontSize: '32rpx', fontWeight: 'bold' }}>
              {result.date} · {result.dayInfo.ganZhi}
            </Text>
          </View>

          <View style={{ marginBottom: '16rpx' }}>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx' }}>
              农历：{result.almanac.lunarDate} · 生肖：{result.almanac.zodiac}
            </Text>
          </View>

          {result.tenGod && (
            <View style={{ marginBottom: '16rpx' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx' }}>
                日柱十神：{result.tenGod}
              </Text>
            </View>
          )}

          <View style={{
            display: 'flex',
            gap: '16rpx',
            marginBottom: '24rpx',
          }}
          >
            <View style={{ flex: 1, background: '#ECFDF5', padding: '20rpx', borderRadius: '12rpx' }}>
              <Text style={{ color: '#059669', fontWeight: 'bold', marginBottom: '8rpx', fontSize: '28rpx' }}>宜</Text>
              <Text style={{ fontSize: '26rpx', color: '#047857' }}>
                {result.almanac.suitable.slice(0, 8).join('、') || '—'}
              </Text>
            </View>
            <View style={{ flex: 1, background: '#FEF2F2', padding: '20rpx', borderRadius: '12rpx' }}>
              <Text style={{ color: '#DC2626', fontWeight: 'bold', marginBottom: '8rpx', fontSize: '28rpx' }}>忌</Text>
              <Text style={{ fontSize: '26rpx', color: '#B91C1C' }}>
                {result.almanac.avoid.slice(0, 8).join('、') || '—'}
              </Text>
            </View>
          </View>

          <View style={{ background: '#FAFAFA', padding: '24rpx', borderRadius: '12rpx' }}>
            <Text style={{ fontSize: '28rpx', fontWeight: 'bold', marginBottom: '16rpx' }}>
              运势解读
            </Text>
            <Text style={{ fontSize: '26rpx', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              {toAlmanacText(result, { detailLevel: 'default' })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
