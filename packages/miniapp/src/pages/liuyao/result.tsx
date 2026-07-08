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
import { calculateLiuyao, toLiuyaoText } from 'banri-chenguang-core/liuyao';
import { stripMarkdown } from '@/utils/chart';
import { View, Text } from '@tarojs/components';

type LiuyaoResult = Awaited<ReturnType<typeof calculateLiuyao>>;

function normalizeDateTime(value?: string): string {
  if (!value || !value.trim()) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const trimmed = value.trim();
  const hasTime = /[T ]\d{2}:\d{2}/.test(trimmed);
  if (!hasTime) {
    const now = new Date();
    return `${trimmed}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  return trimmed.replace(' ', 'T');
}

export default function LiuyaoResultPage() {
  const [result, setResult] = useState<LiuyaoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {};
    let cancelled = false;

    (async () => {
      try {
        const numbers = params.numbers
          ? params.numbers.split(/[\s,，]+/).filter(Boolean).map(Number)
          : undefined;

        const res = await calculateLiuyao({
          question: params.question ? decodeURIComponent(params.question) : '',
          yongShenTargets: (params.yongShen ? decodeURIComponent(params.yongShen) : '').split(',').filter(Boolean) as Parameters<typeof calculateLiuyao>[0]['yongShenTargets'],
          method: (params.method as 'auto' | 'number' | 'time') || 'auto',
          numbers,
          date: normalizeDateTime(params.date as string | undefined),
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
        message="排盘失败，未能获取结果"
        retryText="重新排盘"
        onRetry={() => Taro.navigateBack()}
      />
    );
  }

  const sizhuItems = [
    { label: '年', value: `${result.ganZhiTime.year.gan}${result.ganZhiTime.year.zhi}` },
    { label: '月', value: `${result.ganZhiTime.month.gan}${result.ganZhiTime.month.zhi}` },
    { label: '日', value: `${result.ganZhiTime.day.gan}${result.ganZhiTime.day.zhi}` },
    { label: '时', value: `${result.ganZhiTime.hour.gan}${result.ganZhiTime.hour.zhi}` },
  ];

  return (
    <View className="container">
      <ResultHeader
        title="六爻排盘"
        emoji="☯️"
        tag={result.hexagramGong}
        subtitle={result.question}
      />

      <Section title="卦象">
        <View style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Card bg="default" padding="sm">
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>本卦</Text>
              <Text style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{result.hexagramName}</Text>
            </View>
          </Card>
          {result.changedHexagramName && (
            <Card bg="default" padding="sm">
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>变卦</Text>
                <Text style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{result.changedHexagramName}</Text>
              </View>
            </Card>
          )}
        </View>

        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Tag variant="primary" active>
            五行：{result.hexagramElement}
          </Tag>
          {result.yongShen?.map((group) => (
            <Tag key={group.targetLiuQin} variant="success" active>
              用神：{group.targetLiuQin}
            </Tag>
          ))}
        </View>

        <DataGrid items={sizhuItems} columns={4} />
      </Section>

      <Section title="卦象解读">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {stripMarkdown(toLiuyaoText(result, { detailLevel: 'default' }))}
          </Text>
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新排盘
      </Button>
    </View>
  );
}
