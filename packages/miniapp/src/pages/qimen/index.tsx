import './index.css';
import Button from '@/components/Button';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Picker, Input } from '@tarojs/components';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

const JU_METHOD_OPTIONS = [
  { value: 'chaibu', label: '拆补法' },
  { value: 'maoshan', label: '茅山法' },
] as const;

const ZHIFU_OPTIONS = [
  { value: 'ji_liuyi', label: '寄六仪' },
  { value: 'ji_wugong', label: '寄五宫' },
] as const;

const INPUT_STYLE = {
  padding: 'var(--space-4) var(--space-5)',
  background: 'var(--bg-tertiary)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-base)',
  color: 'var(--text-primary)',
  width: '100%',
  boxSizing: 'border-box',
} as const;

export default function QimenIndexPage() {
  const now = new Date();
  const [form, setForm] = useState({
    question: '',
    date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    juMethod: 'chaibu' as typeof JU_METHOD_OPTIONS[number]['value'],
    zhiFuJiGong: 'ji_liuyi' as typeof ZHIFU_OPTIONS[number]['value'],
  });

  const updateForm = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const [year, month, day] = form.date.split('-').map(Number);
    const [hour, minute] = form.time.split(':').map(Number);
    const query = new URLSearchParams({
      question: form.question,
      year: String(year),
      month: String(month),
      day: String(day),
      hour: String(hour),
      minute: String(minute),
      juMethod: form.juMethod,
      zhiFuJiGong: form.zhiFuJiGong,
    });
    Taro.navigateTo({ url: `/pages/qimen/result?${query.toString()}` });
  };

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          奇门遁甲
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          选择占卜时间，推演九宫格局与吉凶方位。
        </Text>
      </View>

      <View className="card">
        <FormItem label="占问问题（可选）">
          <Input
            type="text"
            placeholder="如：这次合作能否成功？"
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

        <FormItem label="定局法" required>
          <Picker
            mode="selector"
            range={JU_METHOD_OPTIONS.map((o) => o.label)}
            value={JU_METHOD_OPTIONS.findIndex((o) => o.value === form.juMethod)}
            onChange={(e) => updateForm('juMethod', JU_METHOD_OPTIONS[Number(e.detail.value)].value)}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {JU_METHOD_OPTIONS.find((o) => o.value === form.juMethod)?.label}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="直符寄宫" required>
          <Picker
            mode="selector"
            range={ZHIFU_OPTIONS.map((o) => o.label)}
            value={ZHIFU_OPTIONS.findIndex((o) => o.value === form.zhiFuJiGong)}
            onChange={(e) => updateForm('zhiFuJiGong', ZHIFU_OPTIONS[Number(e.detail.value)].value)}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {ZHIFU_OPTIONS.find((o) => o.value === form.zhiFuJiGong)?.label}
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
