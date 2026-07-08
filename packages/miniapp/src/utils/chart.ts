/**
 * 从 AI 返回的 Markdown 中提取 ```chart 代码块
 *
 * Web 端同样用 ```chart 块嵌入图表 JSON，小程序复用相同格式。
 */

const CHART_BLOCK_REGEX = /```(?:chart|json)\s*\n([\s\S]*?)```/g;

export interface ExtractedChart<T = unknown> {
  chartType: string;
  title: string;
  raw: T;
}

export interface TarotElementEntry {
  count: number;
  percentage: number;
  label: string;
}

export interface TarotElementsData {
  chartType: 'tarot_elements';
  title: string;
  subtitle?: string;
  data: {
    elements: Record<'fire' | 'water' | 'air' | 'earth', TarotElementEntry>;
    keywords: string[];
    positions: Array<{
      position: string;
      card: string;
      upright: boolean;
      energy: number;
    }>;
    coreCard: {
      name: string;
      meaning: string;
    };
  };
}

/**
 * 移除 Markdown 标记符号，转成纯文本。
 * 用于 RichText 不稳定时的降级展示。
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 从 Markdown 中提取第一个 ```chart 代码块。
 * 解析失败或格式不符时返回 null，调用方应降级为纯文本展示。
 */
export function extractFirstChart<T = unknown>(markdown: string): ExtractedChart<T> | null {
  CHART_BLOCK_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = CHART_BLOCK_REGEX.exec(markdown)) !== null) {
    const jsonStr = match[1]?.trim();
    if (!jsonStr) continue;

    try {
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
      if (
        parsed &&
        typeof parsed.chartType === 'string' &&
        typeof parsed.title === 'string'
      ) {
        return {
          chartType: parsed.chartType,
          title: parsed.title,
          raw: parsed as T,
        };
      }
    } catch {
      // 当前块解析失败，继续尝试下一个
    }
  }

  return null;
}

/**
 * 移除 Markdown 中的所有 ```chart 代码块，并清理多余空行。
 * 用于把图表交给组件渲染，文字部分直接展示。
 */
export function stripChartBlocks(markdown: string): string {
  return markdown
    .replace(/```(?:chart|json)\s*\n[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface PhysiognomyAnnotationEntry {
  label?: string;
  observation?: string;
  confidence?: string;
  feature?: string;
  description?: string;
  name?: string;
  title?: string;
  content?: string;
  interpretation?: string;
  detail?: string;
}

export interface PhysiognomyAnnotationData {
  chartType: 'physiognomy_annotation';
  title: string;
  data: {
    type: 'palm' | 'face';
    annotations: PhysiognomyAnnotationEntry[];
    overallAssessment?: string;
  };
}

/**
 * 从 Markdown 中提取 physiognomy_annotation 图表数据（手相/面相特征标注）。
 */
export function extractPhysiognomyAnnotation(
  markdown: string,
): PhysiognomyAnnotationData | null {
  const chart = extractFirstChart<PhysiognomyAnnotationData>(markdown);
  if (!chart || chart.chartType !== 'physiognomy_annotation') return null;
  return chart.raw;
}
export function extractTarotElements(markdown: string): TarotElementsData | null {
  const chart = extractFirstChart<TarotElementsData>(markdown);
  if (!chart || chart.chartType !== 'tarot_elements') return null;
  return chart.raw;
}

/**
 * 元素常量：颜色与 Web 端 `TarotElements.tsx` 保持一致。
 */
export const TAROT_ELEMENT_CONFIG = {
  fire: { color: '#ef4444', icon: '🔥', label: '火' },
  water: { color: '#3b82f6', icon: '💧', label: '水' },
  air: { color: '#a855f7', icon: '💨', label: '风' },
  earth: { color: '#22c55e', icon: '🌍', label: '土' },
};

export type TarotElementKey = keyof typeof TAROT_ELEMENT_CONFIG;

/**
 * 把 tarot_elements 数据转换成绘图/图例可用的条目列表。
 */
export function transformTarotElements(
  elements: TarotElementsData['data']['elements'],
): Array<{
  key: TarotElementKey;
  count: number;
  percentage: number;
  label: string;
  color: string;
  icon: string;
}> {
  return Object.entries(elements)
    .filter(([key]) => key in TAROT_ELEMENT_CONFIG)
    .map(([key, value]) => ({
      key: key as TarotElementKey,
      count: value.count,
      percentage: value.percentage,
      label: value.label,
      color: TAROT_ELEMENT_CONFIG[key as TarotElementKey].color,
      icon: TAROT_ELEMENT_CONFIG[key as TarotElementKey].icon,
    }))
    .sort((a, b) => b.count - a.count);
}
