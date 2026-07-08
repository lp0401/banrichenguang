import './index.css';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FormControl from '@/components/FormControl';
import FormItem from '@/components/FormItem';
import { chooseImageAsBase64 } from '@/utils/image';
import { getAccessToken } from '@/utils/storage';
import type { ImageData } from '@/types/vision';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { View, Text, Picker, Input } from '@tarojs/components';

interface PalmType {
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

interface HandOption {
  id: string;
  name: string;
}

const HAND_OPTIONS: HandOption[] = [
  { id: 'left', name: '左手' },
  { id: 'right', name: '右手' },
  { id: 'both', name: '双手' },
];

export default function PalmIndexPage() {
  const [typeIndex, setTypeIndex] = useState(0);
  const [handIndex, setHandIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken());

  useDidShow(() => {
    setIsLoggedIn(!!getAccessToken());
  });

  const selectedType = PALM_TYPES[typeIndex];
  const selectedHand = HAND_OPTIONS[handIndex];

  const handleChooseImage = async () => {
    try {
      const result = await chooseImageAsBase64();
      if (result) {
        setImage(result);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '读取图片失败';
      Taro.showToast({ title: message, icon: 'none' });
    }
  };

  const handleSubmit = () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '登录解锁',
        content: '手相分析需要登录后使用',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            void Taro.switchTab({ url: '/pages/profile/index' });
          }
        },
      });
      return;
    }

    if (!image) {
      Taro.showToast({ title: '请先上传手相照片', icon: 'none' });
      return;
    }

    const imageKey = `palm_img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      Taro.setStorageSync(imageKey, image);
    } catch {
      Taro.showToast({ title: '图片保存失败，请尝试选择更小的照片', icon: 'none' });
      return;
    }
    const query = new URLSearchParams({
      analysisType: selectedType.id,
      handType: selectedHand.id,
      question: question.trim(),
      imageKey,
    });
    void Taro.navigateTo({ url: `/pages/palm/result?${query.toString()}` });
  };

  const previewUrl = image ? `data:${image.mimeType};base64,${image.base64}` : null;

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
          手相分析
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
          上传清晰的手掌照片，从掌纹与手型中读取运势信息。
        </Text>
      </View>

      <Card>
        <FormItem label="分析类型" required>
          <Picker
            mode="selector"
            range={PALM_TYPES.map((t) => t.name)}
            value={typeIndex}
            onChange={(e) => setTypeIndex(Number(e.detail.value))}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {selectedType.name}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="手掌" required>
          <Picker
            mode="selector"
            range={HAND_OPTIONS.map((h) => h.name)}
            value={handIndex}
            onChange={(e) => setHandIndex(Number(e.detail.value))}
          >
            <FormControl suffix="请选择" style={{ width: '100%', boxSizing: 'border-box' }}>
              {selectedHand.name}
            </FormControl>
          </Picker>
        </FormItem>

        <FormItem label="想重点问的问题（可选）" helper="例如：事业发展、感情婚姻">
          <Input
            type="text"
            placeholder="可留空"
            value={question}
            onInput={(e) => setQuestion(e.detail.value)}
            style={{
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </FormItem>

        <FormItem label="手相照片" required>
          {previewUrl ? (
            <View style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <View
                style={{
                  width: '100%',
                  height: '320rpx',
                  background: `var(--bg-tertiary) url(${previewUrl}) no-repeat center/contain`,
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <Button variant="secondary" size="md" onClick={handleChooseImage} block>
                重新选择
              </Button>
            </View>
          ) : (
            <View
              onClick={handleChooseImage}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                height: '320rpx',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '2rpx dashed var(--border-color)',
              }}
            >
              <Text style={{ fontSize: 'var(--text-3xl)' }}>📷</Text>
              <Text style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                拍照或从相册选择
              </Text>
            </View>
          )}
        </FormItem>

        <Button onClick={handleSubmit} variant="primary" block>
          {isLoggedIn ? '开始分析' : '登录解锁'}
        </Button>
      </Card>
    </View>
  );
}
