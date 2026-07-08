import './index.css';
import Button from '@/components/Button';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Picker } from '@tarojs/components';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export default function BaziIndexPage() {
  const now = new Date();
  const [form, setForm] = useState({
    birthDate: `${now.getFullYear() - 30}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    birthTime: `${pad2(12)}:${pad2(0)}`,
    gender: 'male' as 'male' | 'female',
    birthPlace: '',
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
      birthPlace: form.birthPlace,
    });
    Taro.navigateTo({ url: `/pages/bazi/result?${query.toString()}` });
  };

  return (
    <View className="container">
      <View className="hero" style={{ marginBottom: 'var(--space-6)' }}>
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          八字排盘
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          输入出生时间，生成四柱八字与命局解读。
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

        <FormItem label="出生地点" helper="用于出生地信息展示，可选">
          <Picker
            mode="region"
            value={form.birthPlace ? form.birthPlace.split(' ') : ['', '', '']}
            onChange={(e) => {
              const [province, city, district] = e.detail.value as string[];
              const parts = [province, city, district].filter((p) => p && p !== '市辖区');
              updateForm('birthPlace', parts.join(' '));
            }}
          >
            <FormControl
              placeholder="请选择省 / 市 / 区县"
              suffix="📍"
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              {form.birthPlace || ''}
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
