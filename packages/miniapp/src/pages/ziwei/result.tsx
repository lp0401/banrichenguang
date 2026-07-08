import Button from '@/components/Button';
import Card from '@/components/Card';
import DataGrid from '@/components/DataGrid';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import Tag from '@/components/Tag';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { calculateZiwei, toZiweiText } from 'banri-chenguang-core/ziwei';
import { stripMarkdown } from '@/utils/chart';
import { View, Text } from '@tarojs/components';

export default function ZiweiResultPage() {
  const [result, setResult] = useState<ReturnType<typeof calculateZiwei> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = Taro.getCurrentInstance().router?.params || {};
        const res = calculateZiwei({
          birthYear: Number(params.birthYear),
          birthMonth: Number(params.birthMonth),
          birthDay: Number(params.birthDay),
          birthHour: Number(params.birthHour),
          birthMinute: Number(params.birthMinute) || 0,
          gender: (params.gender as 'male' | 'female') || 'male',
        });
        if (!cancelled) setResult(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '排盘失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Loading fullScreen text="排盘中..." />;
  }

  if (error) {
    return <ErrorState message={error} onBack={() => Taro.navigateBack()} />;
  }

  if (!result) {
    return (
      <ErrorState
        message="未能生成排盘结果"
        retryText="重新排盘"
        onRetry={() => Taro.navigateBack()}
      />
    );
  }

  const pillarItems = [
    { label: '年柱', value: `${result.fourPillars.year.gan}${result.fourPillars.year.zhi}` },
    { label: '月柱', value: `${result.fourPillars.month.gan}${result.fourPillars.month.zhi}` },
    { label: '日柱', value: `${result.fourPillars.day.gan}${result.fourPillars.day.zhi}` },
    { label: '时柱', value: `${result.fourPillars.hour.gan}${result.fourPillars.hour.zhi}` },
  ];

  return (
    <View className="container">
      <ResultHeader
        title="紫微斗数"
        emoji="⭐"
        tag={result.fiveElement}
        subtitle={`阳历 ${result.solarDate} · 阴历 ${result.lunarDate}`}
      />

      <Section title="四柱">
        <DataGrid items={pillarItems} columns={4} />
      </Section>

      <Section title="命宫与身宫">
        <View style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Tag variant="primary" active>
            命宫：{result.soul}
          </Tag>
          <Tag variant="default" active>
            身宫：{result.body}
          </Tag>
        </View>
      </Section>

      <Section title="命盘解读">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {stripMarkdown(toZiweiText(result, { detailLevel: 'default' }))}
          </Text>
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新排盘
      </Button>
    </View>
  );
}
