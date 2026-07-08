import Button from '@/components/Button';
import Card from '@/components/Card';
import DataGrid from '@/components/DataGrid';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { toQimenText, type QimenOutput } from 'banri-chenguang-core/qimen';
import { View, Text } from '@tarojs/components';
import { post } from '@/utils/request';
import { stripMarkdown } from '@/utils/chart';

type QimenResult = QimenOutput;

export default function QimenResultPage() {
  const [result, setResult] = useState<QimenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {};
    let cancelled = false;

    (async () => {
      try {
        const res = await post<QimenOutput>('/api/miniapp/qimen/calculate', {
          year: Number(params.year),
          month: Number(params.month),
          day: Number(params.day),
          hour: Number(params.hour),
          minute: Number(params.minute) || 0,
          question: params.question ? decodeURIComponent(params.question) : undefined,
          juMethod: (params.juMethod as 'chaibu' | 'maoshan') || 'chaibu',
          zhiFuJiGong: (params.zhiFuJiGong as 'ji_liuyi' | 'ji_wugong') || 'ji_liuyi',
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
    { label: '年', value: result.siZhu.year },
    { label: '月', value: result.siZhu.month },
    { label: '日', value: result.siZhu.day },
    { label: '时', value: result.siZhu.hour },
  ];

  const panjuItems = [
    { label: '旬首', value: result.xunShou },
    { label: '值符', value: result.zhiFu.star },
    { label: '值使', value: result.zhiShi.gate },
    { label: '元', value: result.yuan },
  ];

  return (
    <View className="container">
      <ResultHeader
        title="奇门遁甲"
        emoji="🔮"
        tag={`${result.dunType === 'yang' ? '阳遁' : '阴遁'} ${result.juNumber} 局`}
        subtitle="奇门遁甲以时空格局推演事物发展趋势，重在值符、值使与八门九星。"
      />

      <Section title="四柱">
        <DataGrid items={sizhuItems} columns={4} />
      </Section>

      <Section title="盘局信息">
        <DataGrid items={panjuItems} columns={4} />
      </Section>

      <Section title="盘局解读">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {stripMarkdown(toQimenText(result, { detailLevel: 'default' }))}
          </Text>
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新排盘
      </Button>
    </View>
  );
}
