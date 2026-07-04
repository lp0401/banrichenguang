import Button from '@/components/Button';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { MBTI_QUESTIONS, calculateResult } from '@/lib/mbti';
import { View, Text, Slider } from '@tarojs/components';

const LIKERT_LABELS = ['强烈同意 A', '同意 A', '略同意 A', '中立', '略同意 B', '同意 B', '强烈同意 B'];

export default function MbtiTestPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionIndex: number; likertValue: number }>>([]);
  const [sliderValue, setSliderValue] = useState(4);

  const question = MBTI_QUESTIONS[index];

  const handleNext = () => {
    const nextAnswers = [
      ...answers,
      { questionIndex: index, likertValue: sliderValue },
    ];

    if (index >= MBTI_QUESTIONS.length - 1) {
      const result = calculateResult(MBTI_QUESTIONS, nextAnswers as Parameters<typeof calculateResult>[1]);
      Taro.setStorageSync('mbti_result', JSON.stringify(result));
      Taro.redirectTo({ url: '/pages/mbti/result' });
      return;
    }

    setAnswers(nextAnswers);
    setIndex(index + 1);
    setSliderValue(4);
  };

  return (
    <View className="container">
      <View className="card">
        <View style={{ marginBottom: '24rpx' }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '28rpx' }}>
            问题 {index + 1} / {MBTI_QUESTIONS.length}
          </Text>
          <View style={{
            height: '8rpx',
            background: '#E5E7EB',
            borderRadius: '4rpx',
            marginTop: '12rpx',
            overflow: 'hidden',
          }}
          >
            <View style={{
              height: '100%',
              width: `${((index + 1) / MBTI_QUESTIONS.length) * 100}%`,
              background: 'var(--primary-color)',
            }} />
          </View>
        </View>

        <Text style={{ fontSize: '34rpx', fontWeight: 'bold', marginBottom: '48rpx', lineHeight: '1.5' }}>
          {question.question}
        </Text>

        <View style={{
          background: '#F9FAFB',
          borderRadius: '12rpx',
          padding: '24rpx',
          marginBottom: '32rpx',
        }}
        >
          <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16rpx' }}>
            <Text style={{ flex: 1, fontSize: '28rpx', color: 'var(--text-primary)', paddingRight: '16rpx' }}>
              A. {question.choice_a.text}
            </Text>
            <Text style={{ flex: 1, fontSize: '28rpx', color: 'var(--text-primary)', textAlign: 'right', paddingLeft: '16rpx' }}>
              B. {question.choice_b.text}
            </Text>
          </View>

          <Slider
            min={1}
            max={7}
            step={1}
            value={sliderValue}
            onChange={(e) => setSliderValue(e.detail.value)}
            blockSize={28}
            activeColor="var(--primary-color)"
          />

          <View style={{ textAlign: 'center', marginTop: '16rpx' }}>
            <Text style={{ fontSize: '28rpx', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {LIKERT_LABELS[sliderValue - 1]}
            </Text>
          </View>
        </View>

        <Button onClick={handleNext} className="btn-primary">
          {index >= MBTI_QUESTIONS.length - 1 ? '查看结果' : '下一题'}
        </Button>
      </View>
    </View>
  );
}
