export type Dimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface MBTIChoice {
  value: Dimension;
  text: string;
}

export interface MBTIQuestion {
  question: string;
  choice_a: MBTIChoice;
  choice_b: MBTIChoice;
}

export interface TestAnswer {
  questionIndex: number;
  likertValue: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface TestResult {
  type: MBTIType;
  scores: Record<Dimension, number>;
  percentages: {
    EI: { E: number; I: number };
    SN: { S: number; N: number };
    TF: { T: number; F: number };
    JP: { J: number; P: number };
  };
}

export const PERSONALITY_BASICS: Record<MBTIType, { name: string; title: string; emoji: string; description: string }> = {
  INTJ: { name: 'INTJ', title: '策略家', emoji: '🧠', description: '富有想象力和战略性的思想家，有着明确的计划' },
  INTP: { name: 'INTP', title: '逻辑学家', emoji: '🔬', description: '创新型发明家，对知识有着永恒的渴望' },
  ENTJ: { name: 'ENTJ', title: '指挥官', emoji: '👔', description: '大胆、富有想象力的领导者，总能找到或创造解决方案' },
  ENTP: { name: 'ENTP', title: '辩论家', emoji: '💡', description: '聪明好奇的思想家，无法抵抗智力挑战' },
  INFJ: { name: 'INFJ', title: '提倡者', emoji: '🌟', description: '安静而神秘的理想主义者，鼓舞人心' },
  INFP: { name: 'INFP', title: '调停者', emoji: '🌸', description: '诗意、善良的利他主义者，总在寻求帮助他人' },
  ENFJ: { name: 'ENFJ', title: '主人公', emoji: '🎭', description: '魅力四射的领导者，能够感染和激励听众' },
  ENFP: { name: 'ENFP', title: '活动家', emoji: '🎉', description: '热情、创造性的自由精神，总能找到理由微笑' },
  ISTJ: { name: 'ISTJ', title: '物流师', emoji: '📋', description: '实际且注重事实的人，可靠性不容置疑' },
  ISFJ: { name: 'ISFJ', title: '守卫者', emoji: '🛡️', description: '非常专注和温暖的守护者，随时准备保护亲人' },
  ESTJ: { name: 'ESTJ', title: '总经理', emoji: '📊', description: '卓越的管理者，在管理事务或人员方面无与伦比' },
  ESFJ: { name: 'ESFJ', title: '执政官', emoji: '👨‍👩‍👧‍👦', description: '关心他人，社交且受欢迎，总是热心帮助' },
  ISTP: { name: 'ISTP', title: '鉴赏家', emoji: '🔧', description: '勇敢而实际的实验者，掌握各种工具' },
  ISFP: { name: 'ISFP', title: '探险家', emoji: '🎨', description: '灵活迷人的艺术家，随时准备探索和体验新事物' },
  ESTP: { name: 'ESTP', title: '企业家', emoji: '🚀', description: '聪明、精力充沛的人，喜欢冒险' },
  ESFP: { name: 'ESFP', title: '表演者', emoji: '🎤', description: '自发、精力充沛的表演者，生活永不无聊' },
};

const LIKERT_WEIGHTS: Record<TestAnswer['likertValue'], { a: number; b: number }> = {
  1: { a: 3, b: 0 },
  2: { a: 2, b: 0 },
  3: { a: 1, b: 0 },
  4: { a: 0, b: 0 },
  5: { a: 0, b: 1 },
  6: { a: 0, b: 2 },
  7: { a: 0, b: 3 },
};

export const MBTI_QUESTIONS: MBTIQuestion[] = [
  { question: '当你要外出一整天，你会', choice_a: { value: 'J', text: '计划你要做什么和在什么时候做' }, choice_b: { value: 'P', text: '说去就去' } },
  { question: '你认为自己是一个', choice_a: { value: 'P', text: '较为随兴所至的人' }, choice_b: { value: 'J', text: '较为有条理的人' } },
  { question: '假如你是一名老师，你会选教', choice_a: { value: 'S', text: '以事实为主的课程' }, choice_b: { value: 'N', text: '涉及理论的课程' } },
  { question: '你通常', choice_a: { value: 'E', text: '与人容易混熟' }, choice_b: { value: 'I', text: '比较沉静或矜持' } },
  { question: '一般来说，你和哪些人比较合得来？', choice_a: { value: 'N', text: '富于想象力的人' }, choice_b: { value: 'S', text: '现实的人' } },
  { question: '你是否经常让', choice_a: { value: 'F', text: '你的情感支配你的理智' }, choice_b: { value: 'T', text: '你的理智主宰你的情感' } },
  { question: '处理许多事情上，你会喜欢', choice_a: { value: 'P', text: '凭兴所至行事' }, choice_b: { value: 'J', text: '按照计划行事' } },
  { question: '你是否', choice_a: { value: 'E', text: '喜欢参加热烈的辩论' }, choice_b: { value: 'I', text: '尽量避免引起争论' } },
  { question: '你会跟哪些人做朋友？', choice_a: { value: 'S', text: '脚踏实地的' }, choice_b: { value: 'N', text: '经常提出新主意的' } },
  { question: '你倾向于重视', choice_a: { value: 'F', text: '感情多于逻辑' }, choice_b: { value: 'T', text: '逻辑多于感情' } },
  { question: '在社交场合中，你通常会觉得', choice_a: { value: 'E', text: '与别人谈话令你很振奋' }, choice_b: { value: 'I', text: '与别人谈话令你疲惫不堪' } },
  { question: '你通常较喜欢的科目是', choice_a: { value: 'N', text: '讲授概念和原则的' }, choice_b: { value: 'S', text: '讲授事实和数据的' } },
  { question: '你容易受以下哪类人感动？', choice_a: { value: 'F', text: '情感丰富的人' }, choice_b: { value: 'T', text: '理智的人' } },
  { question: '你通常喜欢', choice_a: { value: 'P', text: '先安排好的聚会' }, choice_b: { value: 'J', text: '即兴的聚会' } },
  { question: '当你有一个需要解决的问题时，你会', choice_a: { value: 'T', text: '用逻辑分析' }, choice_b: { value: 'F', text: '考虑他人的感受' } },
  { question: '你通常喜欢', choice_a: { value: 'E', text: '有很多朋友' }, choice_b: { value: 'I', text: '有几个深交的朋友' } },
  { question: '你更相信', choice_a: { value: 'S', text: '确凿的证据' }, choice_b: { value: 'N', text: '自己的灵感' } },
  { question: '在工作上，你更喜欢', choice_a: { value: 'J', text: '有计划和目标' }, choice_b: { value: 'P', text: '灵活应变' } },
  { question: '当你计划旅行时，你更喜欢', choice_a: { value: 'J', text: '提前订好行程' }, choice_b: { value: 'P', text: '到了再说' } },
  { question: '你认为自己更像', choice_a: { value: 'T', text: '公正的人' }, choice_b: { value: 'F', text: '有同情心的人' } },
  { question: '在人群中，你通常', choice_a: { value: 'E', text: '主动与人交谈' }, choice_b: { value: 'I', text: '等待别人来找你' } },
  { question: '你更喜欢', choice_a: { value: 'N', text: '抽象的想法' }, choice_b: { value: 'S', text: '具体的事实' } },
  { question: '做决定时，你更依赖', choice_a: { value: 'F', text: '内心的价值观' }, choice_b: { value: 'T', text: '客观分析' } },
  { question: '你的生活方式更偏向', choice_a: { value: 'P', text: '自由自在' }, choice_b: { value: 'J', text: '井然有序' } },
  { question: '在社交活动中，你通常', choice_a: { value: 'E', text: '精力充沛' }, choice_b: { value: 'I', text: '需要独处恢复' } },
  { question: '你更欣赏', choice_a: { value: 'S', text: '实用技能' }, choice_b: { value: 'N', text: '创新思维' } },
  { question: '面对批评，你更在意', choice_a: { value: 'T', text: '是否合理' }, choice_b: { value: 'F', text: '是否伤人' } },
  { question: '你更喜欢的工作方式是', choice_a: { value: 'J', text: '按部就班' }, choice_b: { value: 'P', text: '随机应变' } },
];

export function calculateResult(questions: MBTIQuestion[], answers: TestAnswer[]): TestResult {
  const scores: Record<Dimension, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const answer of answers) {
    const question = questions[answer.questionIndex];
    if (!question) continue;

    const weights = LIKERT_WEIGHTS[answer.likertValue];
    const dimA = question.choice_a.value;
    const dimB = question.choice_b.value;

    scores[dimA] += weights.a;
    scores[dimB] += weights.b;
  }

  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P',
  ].join('') as MBTIType;

  const calcPercent = <K extends string, L extends string>(a: number, b: number, keyA: K, keyB: L): Record<K | L, number> => {
    const total = a + b;
    if (total === 0) {
      return { [keyA]: 50, [keyB]: 50 } as Record<K | L, number>;
    }
    return {
      [keyA]: Math.round((a / total) * 100),
      [keyB]: Math.round((b / total) * 100),
    } as Record<K | L, number>;
  };

  return {
    type,
    scores,
    percentages: {
      EI: calcPercent(scores.E, scores.I, 'E', 'I'),
      SN: calcPercent(scores.S, scores.N, 'S', 'N'),
      TF: calcPercent(scores.T, scores.F, 'T', 'F'),
      JP: calcPercent(scores.J, scores.P, 'J', 'P'),
    },
  };
}
