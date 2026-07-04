import Button from '@/components/Button';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import Taro from '@tarojs/taro';
import { PERSONALITY_BASICS, type TestResult } from '@/lib/mbti';
import { View, Text } from '@tarojs/components';

function getStoredResult(): TestResult | null {
  const raw = Taro.getStorageSync('mbti_result');
  if (raw) {
    try {
      return JSON.parse(raw) as TestResult;
    } catch {
      return null;
    }
  }
  return null;
}

function renderDimensionBar(
  labelA: string,
  labelB: string,
  percentA: number,
  percentB: number,
) {
  return (
    <View style={{ marginBottom: 'var(--space-5)' }}>
      <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <Text style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
          {labelA} {percentA}%
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)' }}>
          {labelB} {percentB}%
        </Text>
      </View>
      <View style={{
        height: '16rpx',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}
      >
        <View style={{
          height: '100%',
          width: `${percentA}%`,
          background: 'linear-gradient(90deg, var(--primary-color), var(--primary-light))',
          borderRadius: 'var(--radius-full)',
        }} />
      </View>
    </View>
  );
}

export default function MbtiResultPage() {
  const result = getStoredResult();

  if (!result) {
    return (
      <EmptyState
        icon="📝"
        title="暂无测试结果"
        description="请先完成 MBTI 测试，查看你的性格类型"
        actionText="去测试"
        onAction={() => Taro.redirectTo({ url: '/pages/mbti/test' })}
      />
    );
  }

  const basic = PERSONALITY_BASICS[result.type];

  return (
    <View className="container">
      <ResultHeader
        title={result.type}
        emoji={basic.emoji}
        tag={basic.title}
        subtitle={basic.description}
      />

      <Section title="性格简介">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)' }}>
            {basic.description}
          </Text>
        </Card>
      </Section>

      <Section title="维度分布">
        <Card bg="default" padding="md">
          {renderDimensionBar('外向 E', '内向 I', result.percentages.EI.E, result.percentages.EI.I)}
          {renderDimensionBar('实感 S', '直觉 N', result.percentages.SN.S, result.percentages.SN.N)}
          {renderDimensionBar('思考 T', '情感 F', result.percentages.TF.T, result.percentages.TF.F)}
          {renderDimensionBar('判断 J', '感知 P', result.percentages.JP.J, result.percentages.JP.P)}
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.redirectTo({ url: '/pages/mbti/test' })} block>
        重新测试
      </Button>
    </View>
  );
}
