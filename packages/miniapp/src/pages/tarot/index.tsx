import './index.css';
import Button from '@/components/Button';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { TAROT_SPREADS } from 'banri-chenguang-core/tarot';
import { View, Text, Picker, Input, Switch } from '@tarojs/components';

export default function TarotIndexPage() {
  const [form, setForm] = useState({
    question: '',
    spreadIndex: 0,
    allowReversed: true,
    birthDate: '',
  });

  const updateForm = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const spread = TAROT_SPREADS[form.spreadIndex];
    const [birthYear, birthMonth, birthDay] = form.birthDate
      ? form.birthDate.split('-')
      : ['', '', ''];
    const query = new URLSearchParams({
      question: form.question,
      spreadType: spread.id,
      allowReversed: String(form.allowReversed),
      birthYear,
      birthMonth,
      birthDay,
    });
    Taro.navigateTo({ url: `/pages/tarot/result?${query.toString()}` });
  };

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          塔罗抽牌
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          聚焦心中的问题，让塔罗牌给出当下的启示。
        </Text>
      </View>

      <View className="card">
        <FormItem label="问题（可选）">
          <Input
            type="text"
            placeholder="如：这段感情将如何发展？"
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

        <FormItem label="牌阵" required>
          <Picker
            mode="selector"
            range={TAROT_SPREADS.map((s) => `${s.name}（${s.positions.length}张）`)}
            value={form.spreadIndex}
            onChange={(e) => updateForm('spreadIndex', e.detail.value)}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {TAROT_SPREADS[form.spreadIndex].name}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="允许逆位" helper="开启后牌面会出现逆位解读">
          <View style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-4) var(--space-5)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
          }}
          >
            <Text style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              {form.allowReversed ? '已开启' : '已关闭'}
            </Text>
            <Switch checked={form.allowReversed} onChange={(e) => updateForm('allowReversed', e.detail.value)} />
          </View>
        </FormItem>

        <FormItem label="生日" helper="用于生命灵数，可选">
          <Picker mode="date" value={form.birthDate} onChange={(e) => updateForm('birthDate', e.detail.value)}>
            <FormControl suffix="📅" style={{ width: '100%', boxSizing: 'border-box' }}>
              {form.birthDate || '请选择生日'}
            </FormControl>
          </Picker>
        </FormItem>

        <Button onClick={handleSubmit} variant="primary" block>
          开始抽牌
        </Button>
      </View>
    </View>
  );
}
