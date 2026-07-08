import './index.css';
import Button from '@/components/Button';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import Tag from '@/components/Tag';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Picker, Input } from '@tarojs/components';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

const YONG_SHEN_OPTIONS = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
const METHOD_OPTIONS = ['auto', 'number', 'time'] as const;
const METHOD_LABELS = ['自动起卦', '数字起卦', '时间起卦'];

export default function LiuyaoIndexPage() {
  const now = new Date();
  const [form, setForm] = useState({
    question: '',
    yongShen: [] as string[],
    method: 'auto' as typeof METHOD_OPTIONS[number],
    numbers: '',
    date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
    time: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
  });

  const updateForm = (key: string, value: string | number | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleYongShen = (target: string) => {
    setForm((prev) => {
      const next = prev.yongShen.includes(target)
        ? prev.yongShen.filter((t) => t !== target)
        : [...prev.yongShen, target];
      return { ...prev, yongShen: next };
    });
  };

  const handleSubmit = () => {
    if (!form.question.trim()) {
      Taro.showToast({ title: '请输入占问问题', icon: 'none' });
      return;
    }
    if (form.yongShen.length === 0) {
      Taro.showToast({ title: '请选择用神', icon: 'none' });
      return;
    }

    const date = `${form.date}T${form.time}`;
    const query = new URLSearchParams({
      question: form.question,
      yongShen: form.yongShen.join(','),
      method: form.method,
      numbers: form.numbers,
      date,
    });
    Taro.navigateTo({ url: `/pages/liuyao/result?${query.toString()}` });
  };

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          六爻排盘
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          诚心起问，纳甲成卦，洞察事情发展趋势。
        </Text>
      </View>

      <View className="card">
        <FormItem label="占问问题" required>
          <Input
            type="text"
            placeholder="如：这次考试能否通过？"
            value={form.question}
            onInput={(e) => updateForm('question', e.detail.value)}
            style={{
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </FormItem>

        <FormItem label="用神（可多选）" required helper="选择与问题相关的六亲关系">
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {YONG_SHEN_OPTIONS.map((option) => (
              <Tag
                key={option}
                variant="primary"
                active={form.yongShen.includes(option)}
                onClick={() => toggleYongShen(option)}
              >
                {option}
              </Tag>
            ))}
          </View>
        </FormItem>

        <FormItem label="起卦方式" required>
          <Picker
            mode="selector"
            range={METHOD_LABELS}
            value={METHOD_OPTIONS.indexOf(form.method)}
            onChange={(e) => updateForm('method', METHOD_OPTIONS[Number(e.detail.value)])}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {METHOD_LABELS[METHOD_OPTIONS.indexOf(form.method)]}
            </FormControl>
          </Picker>
        </FormItem>

        {form.method === 'number' && (
          <FormItem label="数字" helper="用空格或逗号分隔">
            <Input
              type="text"
              placeholder="如：12 34 56"
              value={form.numbers}
              onInput={(e) => updateForm('numbers', e.detail.value)}
              style={{
                padding: 'var(--space-4) var(--space-5)',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </FormItem>
        )}

        <FormItem label="占卜日期" required>
          <Picker mode="date" value={form.date} onChange={(e) => updateForm('date', e.detail.value)}>
            <FormControl suffix="📅" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.date}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="占卜时间" required>
          <Picker mode="time" value={form.time} onChange={(e) => updateForm('time', e.detail.value)}>
            <FormControl suffix="🕐" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.time}
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
