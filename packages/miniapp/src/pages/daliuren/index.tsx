import Button from '@/components/Button';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Picker, Input } from '@tarojs/components';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

const INPUT_STYLE = {
  padding: 'var(--space-4) var(--space-5)',
  background: 'var(--bg-tertiary)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  width: '100%',
  boxSizing: 'border-box',
} as const;

const START_YEAR = 1900;
const END_YEAR = new Date().getFullYear() + 1;
const YEAR_OPTIONS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => String(START_YEAR + i));

export default function DaliurenIndexPage() {
  const now = new Date();
  const [form, setForm] = useState({
    question: '',
    date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    birthYear: '',
    gender: 'male' as 'male' | 'female',
  });

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const [hour, minute] = form.time.split(':').map(Number);
    const query = new URLSearchParams({
      question: form.question,
      date: form.date,
      hour: String(hour),
      minute: String(minute),
      birthYear: form.birthYear,
      gender: form.gender,
    });
    Taro.navigateTo({ url: `/pages/daliuren/result?${query.toString()}` });
  };

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          大六壬
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          以占时课体为核心，推演人事吉凶。
        </Text>
      </View>

      <View className="card">
        <FormItem label="占问问题（可选）">
          <Input
            type="text"
            placeholder="如：此次出行是否顺利？"
            value={form.question}
            onInput={(e) => updateForm('question', e.detail.value)}
            style={INPUT_STYLE}
          />
        </FormItem>

        <FormItem label="日期" required>
          <Picker mode="date" value={form.date} onChange={(e) => updateForm('date', e.detail.value)}>
            <FormControl suffix="📅" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.date}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="时间" required>
          <Picker mode="time" value={form.time} onChange={(e) => updateForm('time', e.detail.value)}>
            <FormControl suffix="🕐" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.time}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="性别" helper="用于行年，可选">
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

        <FormItem label="出生年" helper="用于行年，可选">
          <Picker
            mode="selector"
            range={YEAR_OPTIONS}
            value={form.birthYear ? YEAR_OPTIONS.indexOf(form.birthYear) : YEAR_OPTIONS.indexOf(String(now.getFullYear() - 30))}
            onChange={(e) => updateForm('birthYear', YEAR_OPTIONS[e.detail.value as number])}
          >
            <FormControl
              placeholder="请选择出生年份"
              suffix="📅"
              style={{ width: '100%', boxSizing: 'border-box' }}
            >
              {form.birthYear || ''}
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
