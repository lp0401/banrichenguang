import Button from '@/components/Button';
import Card from '@/components/Card';
import DataGrid from '@/components/DataGrid';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { calculateDaliuren, toDaliurenText } from 'banri-chenguang-core/daliuren';
import { stripMarkdown } from '@/utils/chart';
import { View, Text } from '@tarojs/components';

export default function DaliurenResultPage() {
  const [result, setResult] = useState<ReturnType<typeof calculateDaliuren> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = Taro.getCurrentInstance().router?.params || {};
        const res = calculateDaliuren({
          date: params.date || new Date().toISOString().slice(0, 10),
          hour: Number(params.hour),
          minute: Number(params.minute) || 0,
          question: params.question ? decodeURIComponent(params.question) : undefined,
          birthYear: params.birthYear ? Number(params.birthYear) : undefined,
          gender: params.gender as 'male' | 'female' | undefined,
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

  const sanchuanItems = [
    { label: '初传', value: result.sanChuan.chu.slice(0, 2).join(' · ') },
    { label: '中传', value: result.sanChuan.zhong.slice(0, 2).join(' · ') },
    { label: '末传', value: result.sanChuan.mo.slice(0, 2).join(' · ') },
  ];

  return (
    <View className="container">
      <ResultHeader
        title="大六壬"
        emoji="🌊"
        tag={result.keName}
        subtitle={`月将：${result.dateInfo.yueJiangName}（${result.dateInfo.yueJiang}）· 四柱：${result.dateInfo.bazi}`}
      />

      <Section title="三传">
        <DataGrid items={sanchuanItems} columns={3} />
      </Section>

      <Section title="课体解读">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {stripMarkdown(toDaliurenText(result, { detailLevel: 'default' }))}
          </Text>
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新排盘
      </Button>
    </View>
  );
}
