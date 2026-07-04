export type MembershipType = 'free' | 'plus' | 'pro';

export interface MembershipInfo {
  type: MembershipType;
  expiresAt: string | null;
  isActive: boolean;
  aiChatCount: number;
  creditLimit: number;
}

export interface MembershipApiResponse {
  userId: string;
  membership: {
    type: MembershipType;
    expiresAt: string | null;
    isActive: boolean;
    aiChatCount: number;
  };
  isAdmin: boolean;
}

export interface PricingPlan {
  id: MembershipType;
  name: string;
  title: string;
  price: number;
  period: string;
  features: string[];
  creditLimit: number;
  checkinMultiplier: number;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    title: '免费版',
    price: 0,
    period: '永久',
    features: [
      '基础命盘排盘',
      '每日运势预览',
      '塔罗、六爻、MBTI',
      '积分上限 10',
      '每日签到 1-3 积分',
    ],
    creditLimit: 10,
    checkinMultiplier: 1,
  },
  {
    id: 'plus',
    name: 'Plus',
    title: '进阶版',
    price: 0,
    period: '30 天',
    features: [
      '全部 Free 功能',
      '积分上限 20',
      '每日签到奖励 x2',
      '更多模型支持',
      '全部 AI 分析',
    ],
    creditLimit: 20,
    checkinMultiplier: 2,
  },
  {
    id: 'pro',
    name: 'Pro',
    title: '专业版',
    price: 0,
    period: '30 天',
    features: [
      '全部 Plus 功能',
      '积分上限 50',
      '每日签到奖励 x3',
      '高级模型支持',
      '更精确知识库',
    ],
    creditLimit: 50,
    checkinMultiplier: 3,
  },
];

export function getPlanConfig(type: MembershipType): PricingPlan {
  return PRICING_PLANS.find((p) => p.id === type) || PRICING_PLANS[0];
}

export function formatMembershipLabel(type: MembershipType): string {
  return getPlanConfig(type).title;
}

export function formatExpiresAt(expiresAt: string | null): string {
  if (!expiresAt) return '永久有效';
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return '永久有效';
  return `有效期至 ${date.toLocaleDateString('zh-CN')}`;
}

export function isMembershipExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const date = new Date(expiresAt);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}
