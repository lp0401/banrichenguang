import Button from '@/components/Button';
import Card from '@/components/Card';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import Markdown from '@/components/Markdown';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import { post } from '@/utils/request';
import { handleAnalysisError } from '@/utils/divination-errors';
import { safeDecodeURIComponent } from '@/utils/string';
import { getAccessToken } from '@/utils/storage';
import type { ImageData, InterpretResponse } from '@/types/vision';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { View } from '@tarojs/components';

interface FaceType {
  id: string;
  name: string;
}

const FACE_TYPES: FaceType[] = [
  { id: 'full', name: '综合分析' },
  { id: 'forehead', name: '天庭分析' },
  { id: 'eyes', name: '眼相分析' },
  { id: 'nose', name: '鼻相分析' },
  { id: 'mouth', name: '口相分析' },
  { id: 'career', name: '事业运势' },
  { id: 'love', name: '感情运势' },
  { id: 'wealth', name: '财运分析' },
];

function getFaceTypeName(id: string): string {
  return FACE_TYPES.find((t) => t.id === id)?.name || '综合分析';
}

const GENERIC_ERROR = '请求失败，请稍后重试';

export default function FaceResultPage() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageParams, setPageParams] = useState<{ analysisType: string; question: string; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const params = Taro.getCurrentInstance().router?.params || {};
    const analysisType = params.analysisType || 'full';
    const question = safeDecodeURIComponent(params.question as string | undefined);
    const imageKey = params.imageKey as string | undefined;

    if (!getAccessToken()) {
      setError('请先登录');
      setLoading(false);
      handleAnalysisError('401 登录');
      return;
    }

    if (!FACE_TYPES.some((t) => t.id === analysisType)) {
      setError('无效的分析类型');
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
      question,
      title: `面相分析 - ${getFaceTypeName(analysisType)}`,
    });

    (async () => {
      try {
        const response = await post<InterpretResponse>(
          '/api/face',
          {
            action: 'analyze',
            imageBase64: image.base64,
            imageMimeType: image.mimeType,
            analysisType,
            question: question || undefined,
          },
          { silent: true },
        );

        if (typeof response?.analysis !== 'string') {
          throw new Error('分析结果格式异常');
        }

        if (!cancelled) {
          setAnalysis(response.analysis);
          setReasoning(response.reasoning ?? null);
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
        emoji="👤"
        subtitle="基于面部特征的传统文化解读，仅供参考。"
      />

      {reasoning && (
        <Section title="推理过程">
          <Card bg="muted" padding="md">
            <Markdown content={reasoning} />
          </Card>
        </Section>
      )}

      <Section title="分析结果">
        <Card bg="muted" padding="md">
          <Markdown content={analysis} />
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新分析
      </Button>
    </View>
  );
}
