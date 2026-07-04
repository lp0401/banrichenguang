import Button from '@/components/Button';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Picker } from '@tarojs/components';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export default function ZiweiIndexPage() {
  const now = new Date();
  const [form, setForm] = useState({
    birthDate: `${now.getFullYear() - 30}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    birthTime: `${pad2(12)}:${pad2(0)}`,
    gender: 'male' as 'male' | 'female',
  });

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const [birthYear, birthMonth, birthDay] = form.birthDate.split('-').map(Number);
    const [birthHour, birthMinute] = form.birthTime.split(':').map(Number);
    const query = new URLSearchParams({
      birthYear: String(birthYear),
      birthMonth: String(birthMonth),
      birthDay: String(birthDay),
      birthHour: String(birthHour),
      birthMinute: String(birthMinute),
      gender: form.gender,
    });
    Taro.navigateTo({ url: `/pages/ziwei/result?${query.toString()}` });
  };

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          紫微斗数
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          输入出生时间，排出十二宫位与星曜组合。
        </Text>
      </View>

      <View className="card">
        <FormItem label="性别" required>
          <Picker
            mode="selector"
            range={['男', '女']}
            value={form.gender === 'male' ? 0 : 1}
            onChange={(e) => updateForm('gender', e.detail.value === 0 ? 'male' : 'female')}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.gender === 'male' ? '男' : '女'}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="出生日期" required>
          <Picker mode="date" value={form.birthDate} onChange={(e) => updateForm('birthDate', e.detail.value)}>
            <FormControl suffix="📅" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.birthDate}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="出生时间" required>
          <Picker mode="time" value={form.birthTime} onChange={(e) => updateForm('birthTime', e.detail.value)}>
            <FormControl suffix="🕐" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.birthTime}
            </FormControl>
          </Picker>
        </FormItem>

        <Button onClick={handleSubmit} variant="primary" block>
          开始排盘
        </Button>
      </View>
    </View>
  );
}
