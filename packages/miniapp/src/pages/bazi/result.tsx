import Button from '@/components/Button';
import Card from '@/components/Card';
import DataGrid from '@/components/DataGrid';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { calculateBazi, toBaziText } from 'banri-chenguang-core/bazi';
import { stripMarkdown } from '@/utils/chart';
import { View, Text } from '@tarojs/components';

export default function BaziResultPage() {
  const [result, setResult] = useState<ReturnType<typeof calculateBazi> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = Taro.getCurrentInstance().router?.params || {};
        const res = calculateBazi({
          birthYear: Number(params.birthYear),
          birthMonth: Number(params.birthMonth),
          birthDay: Number(params.birthDay),
          birthHour: Number(params.birthHour),
          birthMinute: Number(params.birthMinute) || 0,
          gender: (params.gender as 'male' | 'female') || 'male',
          birthPlace: params.birthPlace ? decodeURIComponent(params.birthPlace) : undefined,
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

  const { fourPillars, dayMaster } = result;

  const pillarItems = [
    { label: '年柱', value: `${fourPillars.year.stem}${fourPillars.year.branch}` },
    { label: '月柱', value: `${fourPillars.month.stem}${fourPillars.month.branch}` },
    { label: '日柱', value: `${fourPillars.day.stem}${fourPillars.day.branch}`, highlight: true },
    { label: '时柱', value: `${fourPillars.hour.stem}${fourPillars.hour.branch}` },
  ];

  return (
    <View className="container">
      <ResultHeader
        title="八字排盘"
        emoji="🧭"
        tag={`日主：${dayMaster}`}
        subtitle="四柱八字是命理分析的基础，日柱天干为日主，代表命主自身。"
      />

      <Section title="四柱">
        <DataGrid items={pillarItems} columns={4} />
      </Section>

      <Section title="命局解读">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {stripMarkdown(toBaziText(result, { detailLevel: 'default' }))}
          </Text>
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新排盘
      </Button>
    </View>
  );
}
