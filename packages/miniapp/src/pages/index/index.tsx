import './index.css';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface MenuItem {
  label: string;
  url: string;
  emoji: string;
  desc: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: '八字', url: '/pages/bazi/index', emoji: '🧭', desc: '四柱命理' },
  { label: '紫微', url: '/pages/ziwei/index', emoji: '⭐', desc: '斗数排盘' },
  { label: '六爻', url: '/pages/liuyao/index', emoji: '☯️', desc: '纳甲占断' },
  { label: '奇门', url: '/pages/qimen/index', emoji: '🔮', desc: '遁甲择时' },
  { label: '大六壬', url: '/pages/daliuren/index', emoji: '🌊', desc: '三传四课' },
  { label: '塔罗', url: '/pages/tarot/index', emoji: '🃏', desc: '西方占卜' },
  { label: 'MBTI', url: '/pages/mbti/index', emoji: '🧠', desc: '性格测试' },
  { label: '面相', url: '/pages/face/index', emoji: '👤', desc: '五官面相' },
  { label: '手相', url: '/pages/palm/index', emoji: '🖐️', desc: '掌纹手相' },
];

export default function IndexPage() {
  const navigateTo = (url: string) => {
    Taro.navigateTo({ url });
  };

  return (
    <View className="container">
      <View className="hero">
        <Text style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-3)' }}>
          半日辰光
        </Text>
        <Text style={{ fontSize: 'var(--text-base)', opacity: 0.9, lineHeight: 'var(--leading-normal)' }}>
          传统命理文化探索工具
        </Text>
      </View>

      <View className="card">
        <Text style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-5)' }}>
          命理排盘
        </Text>
        <View className="menu-grid">
          {MENU_ITEMS.map((item) => (
            <View
              key={item.label}
              className="menu-grid-item"
              onClick={() => navigateTo(item.url)}
            >
              <Text style={{ fontSize: 'var(--text-3xl)', display: 'block', marginBottom: 'var(--space-2)' }}>
                {item.emoji}
              </Text>
              <Text style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', display: 'block', marginBottom: 'var(--space-1)' }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {item.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="card" style={{ background: 'var(--bg-tertiary)', boxShadow: 'none' }}>
        <Text style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          半日辰光小程序仅供传统文化学习交流，结果不构成任何决策建议。
        </Text>
      </View>
    </View>
  );
}
