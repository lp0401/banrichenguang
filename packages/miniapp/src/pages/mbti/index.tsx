import './index.css';
import Button from '@/components/Button';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

const FEATURES = [
  { emoji: '🧩', text: '28 道精选题目' },
  { emoji: '📊', text: '四维性格分析' },
  { emoji: '🎯', text: '职业与关系建议' },
];

export default function MbtiIndexPage() {
  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          MBTI 性格测试
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          快速了解你的性格类型，发现潜在优势。
        </Text>
      </View>

      <View className="card">
        <View style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {FEATURES.map((item) => (
            <View key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Text style={{ fontSize: 'var(--text-xl)' }}>{item.emoji}</Text>
              <Text style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Button onClick={() => Taro.navigateTo({ url: '/pages/mbti/test' })} variant="primary" block>
          开始测试
        </Button>
      </View>

      <View className="card" style={{ background: 'var(--bg-tertiary)', boxShadow: 'none' }}>
        <Text style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 'var(--leading-relaxed)' }}>
          测试结果仅供自我探索参考，不代表专业心理诊断。
        </Text>
      </View>
    </View>
  );
}
