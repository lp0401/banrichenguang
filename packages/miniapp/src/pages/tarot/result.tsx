import './result.css';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ErrorState from '@/components/ErrorState';
import Loading from '@/components/Loading';
import ResultHeader from '@/components/ResultHeader';
import Section from '@/components/Section';
import Tag from '@/components/Tag';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { calculateTarot, toTarotText } from 'banri-chenguang-core/tarot';
import { View, Text } from '@tarojs/components';
import { post } from '@/utils/request';
import { getAccessToken } from '@/utils/storage';
import { stripMarkdown, stripMarkdownAndCharts } from '@/utils/chart';

type TarotResult = Awaited<ReturnType<typeof calculateTarot>>;

interface InterpretResponse {
  analysis: string;
  reasoning?: string | null;
  conversationId?: string | null;
}

function buildInterpretCacheKey(result: TarotResult): string {
  const cardSignature = result.cards
    .map((c) => `${c.card.nameChinese}:${c.orientation}`)
    .join('|');
  return `tarot_interpret_${result.spreadId}_${cardSignature}`;
}

export default function TarotResultPage() {
  const [result, setResult] = useState<TarotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getAccessToken());

  useDidShow(() => {
    setIsLoggedIn(!!getAccessToken());
  });

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {};
    let cancelled = false;

    (async () => {
      try {
        const res = await calculateTarot({
          spreadType: params.spreadType || 'single',
          question: params.question ? decodeURIComponent(params.question) : undefined,
          allowReversed: params.allowReversed !== 'false',
          birthYear: params.birthYear ? Number(params.birthYear) : undefined,
          birthMonth: params.birthMonth ? Number(params.birthMonth) : undefined,
          birthDay: params.birthDay ? Number(params.birthDay) : undefined,
        });
        if (!cancelled) {
          setResult(res);
          const cacheKey = buildInterpretCacheKey(res);
          try {
            const cached = Taro.getStorageSync<{ analysis: string; reasoning?: string | null }>(cacheKey);
            if (cached?.analysis) {
              applyInterpretResult(cached.analysis, cached.reasoning);
            }
          } catch {
            // 缓存读取失败不阻塞主流程
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '抽牌失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function applyInterpretResult(analysis: string, reasoning?: string | null) {
    setAiReasoning(reasoning ? stripMarkdown(reasoning) : null);
    setAiText(stripMarkdownAndCharts(analysis));
  }

  const handleInterpret = async () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '登录解锁',
        content: '登录后可获取 AI 深度解读',
        confirmText: '去登录',
        success: (modalRes) => {
          if (modalRes.confirm) {
            void Taro.switchTab({ url: '/pages/profile/index' });
          }
        },
      });
      return;
    }

    if (!result) return;

    setIsInterpreting(true);
    setAiReasoning(null);
    setAiText(null);

    try {
      const response = await post<InterpretResponse>('/api/tarot', {
        action: 'interpret',
        stream: false,
        cards: result.cards,
        question: result.question || undefined,
        spreadId: result.spreadId,
        birthDate: result.birthDate || undefined,
        numerology: result.numerology || undefined,
        seed: result.seed || undefined,
      });

      applyInterpretResult(response.analysis, response.reasoning);

      const cacheKey = buildInterpretCacheKey(result);
      try {
        Taro.setStorageSync(cacheKey, {
          analysis: response.analysis,
          reasoning: response.reasoning,
        });
      } catch {
        // 缓存写入失败可忽略
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '解读失败';
      if (message.includes('401') || message.includes('登录') || message.includes('认证')) {
        setIsLoggedIn(false);
        Taro.showModal({
          title: '登录已过期',
          content: '请重新登录以使用 AI 解读',
          confirmText: '去登录',
          success: (modalRes) => {
            if (modalRes.confirm) {
              void Taro.switchTab({ url: '/pages/profile/index' });
            }
          },
        });
      } else if (message.includes('402') || message.includes('积分不足')) {
        Taro.showModal({
          title: '积分不足',
          content: '积分不足，请通过签到、激活码或会员权益获取积分后再使用',
          confirmText: '去获取积分',
          success: (modalRes) => {
            if (modalRes.confirm) {
              void Taro.navigateTo({ url: '/pages/membership/index' });
            }
          },
        });
      } else {
        Taro.showToast({ title: message, icon: 'none' });
      }
    } finally {
      setIsInterpreting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="抽牌中..." />;
  }

  if (error) {
    return <ErrorState message={error} onBack={() => Taro.navigateBack()} />;
  }

  if (!result) {
    return (
      <ErrorState
        message="抽牌失败，未能获取结果"
        retryText="重新抽牌"
        onRetry={() => Taro.navigateBack()}
      />
    );
  }

  return (
    <View className="container">
      <ResultHeader
        title={result.spreadName}
        emoji="🃏"
        tag={`${result.cards.length} 张牌`}
        subtitle={result.question || '本次抽牌关注当下问题的启示与指引。'}
      />

      <Section title="牌阵">
        <View style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {result.cards.map((card, idx) => (
            <Card key={idx} bg="default" padding="md">
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <View>
                  <Text style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                    位置 {idx + 1} · {card.position}
                  </Text>
                  <Text style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>
                    {card.card.nameChinese}
                  </Text>
                </View>
                <Tag variant={card.orientation === 'reversed' ? 'danger' : 'primary'} active>
                  {card.orientation === 'reversed' ? '逆位' : '正位'}
                </Tag>
              </View>
              <Text style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                {card.card.name}
              </Text>
              <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)' }}>
                {card.meaning}
              </Text>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="牌阵解读">
        <Card bg="muted" padding="md">
          <Text style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {stripMarkdown(toTarotText(result, { detailLevel: 'default' }))}
          </Text>
        </Card>
      </Section>

      <Section title="AI 深度解读">
        <Card bg="muted" padding="md">
          {isInterpreting ? (
            <Loading text="AI 解读中..." />
          ) : aiText ? (
            <View style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {aiReasoning && (
                <View
                  style={{
                    padding: 'var(--space-3)',
                    background: '#F3F4F6',
                    borderRadius: '12rpx',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--text-tertiary)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    推理过程
                  </Text>
                  <Text
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {aiReasoning}
                  </Text>
                </View>
              )}
              <Text
                style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {aiText}
              </Text>
              <Button variant="secondary" size="sm" onClick={handleInterpret} block>
                重新解读
              </Button>
            </View>
          ) : (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-8) 0',
              }}
            >
              <Text
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  textAlign: 'center',
                }}
              >
                {isLoggedIn
                  ? '基于 AI 模型的深度塔罗解读，结合牌阵与问题给出个性化分析'
                  : '登录后可获取 AI 深度解读'}
              </Text>
              <Button variant="primary" size="md" onClick={handleInterpret} block>
                {isLoggedIn ? '获取 AI 深度洞察' : '登录解锁 AI 深度解读'}
              </Button>
            </View>
          )}
        </Card>
      </Section>

      <Button variant="primary" onClick={() => Taro.navigateBack()} block>
        重新抽牌
      </Button>
    </View>
  );
}
