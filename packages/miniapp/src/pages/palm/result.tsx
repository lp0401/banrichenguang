import Button from '@/components/Button';
import Card from '@/components/Card';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import { post } from '@/utils/request';
import { handleAnalysisError } from '@/utils/divination-errors';
import { safeDecodeURIComponent } from '@/utils/string';
import { getAccessToken } from '@/utils/storage';
import { extractPhysiognomyAnnotation, stripChartBlocks, stripMarkdown, type PhysiognomyAnnotationData, type PhysiognomyAnnotationEntry } from '@/utils/chart';
import type { ImageData, InterpretResponse } from '@/types/vision';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';

interface PalmType {
  id: string;
  name: string;
}

interface HandOption {
  id: string;
  name: string;
}

const PALM_TYPES: PalmType[] = [
  { id: 'full', name: '综合分析' },
  { id: 'lifeline', name: '生命线' },
  { id: 'headline', name: '智慧线' },
  { id: 'heartline', name: '感情线' },
  { id: 'fateline', name: '事业线' },
  { id: 'marriage', name: '婚姻线' },
];

const HAND_OPTIONS: HandOption[] = [
  { id: 'left', name: '左手' },
  { id: 'right', name: '右手' },
  { id: 'both', name: '双手' },
];

function getAnnotationLabel(item: PhysiognomyAnnotationEntry): string {
  return item.label || item.feature || item.name || item.title || '';
}

function getAnnotationObservation(item: PhysiognomyAnnotationEntry): string {
  return item.observation || item.description || item.content || item.interpretation || item.detail || '';
}

function getPalmTypeName(id: string): string {
  return PALM_TYPES.find((t) => t.id === id)?.name || '综合分析';
}

function getHandName(id: string): string {
  return HAND_OPTIONS.find((h) => h.id === id)?.name || '左手';
}

const GENERIC_ERROR = '请求失败，请稍后重试';

export default function PalmResultPage() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [chart, setChart] = useState<PhysiognomyAnnotationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageParams, setPageParams] = useState<{ analysisType: string; handType: string; question: string; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = Taro.getCurrentInstance().router?.params || {};
    const analysisType = params.analysisType || 'full';
    const handType = (params.handType as string) || 'left';
    const question = safeDecodeURIComponent(params.question as string | undefined);
    const imageKey = params.imageKey as string | undefined;

    if (!getAccessToken()) {
      setError('请先登录');
      setLoading(false);
      handleAnalysisError('401 登录');
      return;
    }

    if (!PALM_TYPES.some((t) => t.id === analysisType)) {
      setError('无效的分析类型');
      setLoading(false);
      return;
    }

    if (!HAND_OPTIONS.some((h) => h.id === handType)) {
      setError('无效的手掌选择');
      setLoading(false);
      return;
    }

    if (!imageKey) {
      setError('缺少图片标识，请重新上传');
      setLoading(false);
      return;
    }

    const image = Taro.getStorageSync<ImageData | null>(imageKey);

    if (!image || !image.base64) {
      Taro.removeStorageSync(imageKey);
      setError('未找到照片，请重新上传');
      setLoading(false);
      return;
    }

    setPageParams({
      analysisType,
      handType,
      question,
      title: `手相分析 - ${getHandName(handType)}${getPalmTypeName(analysisType)}`,
    });

    (async () => {
      try {
        const response = await post<InterpretResponse>(
          '/api/palm',
          {
            action: 'analyze',
            imageBase64: image.base64,
            imageMimeType: image.mimeType,
            analysisType,
            handType,
            question: question || undefined,
          },
          { silent: true },
        );

        if (typeof response?.analysis !== 'string') {
          throw new Error('分析结果格式异常');
        }

        if (!cancelled) {
          setAnalysis(stripChartBlocks(response.analysis));
          setReasoning(response.reasoning ?? null);
          setChart(extractPhysiognomyAnnotation(response.analysis));
        }
      } catch (err) {
        if (cancelled) return;
        const rawMessage = err instanceof Error ? err.message : GENERIC_ERROR;
        if (handleAnalysisError(rawMessage)) {
          setError(rawMessage);
        } else {
          Taro.showToast({ title: GENERIC_ERROR, icon: 'none' });
          setError(GENERIC_ERROR);
        }
      } finally {
        Taro.removeStorageSync(imageKey);
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Loading fullScreen text="AI 分析中..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        retryText="重新上传"
        onRetry={() => Taro.navigateBack()}
      />
    );
  }

  if (!analysis || !pageParams) {
    return (
      <ErrorState
        message="未能获取分析结果"
        retryText="重新上传"
        onRetry={() => Taro.navigateBack()}
      />
    );
  }

  return (
    <View className="container">
      <ResultHeader
        title={pageParams.title}
        emoji="🖐️"
        subtitle="基于掌纹与手型的传统文化解读，仅供参考。"
      />

      {reasoning && (
        <Section title="推理过程">
          <Card bg="muted" padding="md">
            <Text
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {stripMarkdown(reasoning)}
            </Text>
          </Card>
        </Section>
      )}

      {chart && chart.data.annotations.length > 0 && (
        <Section title={chart.title || '手相特征'}>
          <View style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {chart.data.annotations.map((item, idx) => {
              const displayLabel = getAnnotationLabel(item);
              const displayObservation = getAnnotationObservation(item);
              return (
                <Card key={idx} bg="default" padding="md">
                  <View
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <View
                      style={{
                        width: '40rpx',
                        height: '40rpx',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient, linear-gradient(135deg, #8b5cf6, #a78bfa))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2rpx',
                      }}
                    >
                      <Text style={{ fontSize: 'var(--text-xs)', color: '#fff', fontWeight: 'var(--font-bold)' }}>
                        {idx + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        {displayLabel && (
                          <Text
                            style={{
                              fontSize: 'var(--text-base)',
                              fontWeight: 'var(--font-bold)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {displayLabel}
                          </Text>
                        )}
                        {item.confidence && (
                          <Text
                            style={{
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-tertiary)',
                              backgroundColor: 'var(--bg-muted)',
                              paddingLeft: 'var(--space-2)',
                              paddingRight: 'var(--space-2)',
                              paddingTop: '2rpx',
                              paddingBottom: '2rpx',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            可信度：{item.confidence}
                          </Text>
                        )}
                      </View>
                      {displayObservation ? (
                        <Text
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-secondary)',
                            lineHeight: 'var(--leading-relaxed)',
                          }}
                        >
                          {displayObservation}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {JSON.stringify(item, null, 2)}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
            {chart.data.overallAssessment && (
              <Card bg="muted" padding="md">
                <View style={{ marginBottom: 'var(--space-2)' }}>
                  <Text
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-tertiary)',
                      fontWeight: 'var(--font-bold)',
                    }}
                  >
                    总体评价
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-relaxed)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {stripMarkdown(chart.data.overallAssessment)}
                </Text>
              </Card>
            )}
          </View>
        </Section>
      )}

      {analysis && (
        <Section title="分析结果">
          <Card bg="muted" padding="md">
            <Text
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {stripMarkdown(analysis)}
            </Text>
          </Card>
        </Section>
      )}

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新分析
      </Button>
    </View>
  );
}
