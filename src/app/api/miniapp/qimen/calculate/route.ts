/**
 * 小程序奇门遁甲排盘计算接口
 *
 * 小程序环境无法运行 taobi（依赖 DOM），因此把纯计算逻辑放在服务端。
 * 该端点不鉴权、不持久化，仅返回排盘数据。
 */
import { NextRequest } from 'next/server';
import { calculateQimen, type QimenOutput } from 'banri-chenguang-core/qimen';
import { jsonError, jsonOk } from '@/lib/api-utils';

interface QimenCalculateRequest {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  question?: string;
  juMethod?: 'chaibu' | 'maoshan';
  zhiFuJiGong?: 'ji_liuyi' | 'ji_wugong';
}

interface QimenCalculateInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  question?: string;
  juMethod: 'chaibu' | 'maoshan';
  zhiFuJiGong: 'ji_liuyi' | 'ji_wugong';
}

function isIntegerField(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

function parseInput(body: QimenCalculateRequest): QimenCalculateInput | null {
  const { year, month, day, hour, minute, question, juMethod, zhiFuJiGong } = body;

  if (
    !isIntegerField(year)
    || !isIntegerField(month)
    || !isIntegerField(day)
    || !isIntegerField(hour)
  ) {
    return null;
  }

  if (juMethod && juMethod !== 'chaibu' && juMethod !== 'maoshan') {
    return null;
  }

  if (zhiFuJiGong && zhiFuJiGong !== 'ji_liuyi' && zhiFuJiGong !== 'ji_wugong') {
    return null;
  }

  return {
    year,
    month,
    day,
    hour,
    minute: isIntegerField(minute) ? minute : 0,
    question: typeof question === 'string' && question.trim() ? question.trim() : undefined,
    juMethod: juMethod || 'chaibu',
    zhiFuJiGong: zhiFuJiGong || 'ji_liuyi',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QimenCalculateRequest;
    const parsed = parseInput(body);

    if (!parsed) {
      return jsonError('请提供完整的日期时间', 400, { success: false });
    }

    const output: QimenOutput = await calculateQimen({
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      hour: parsed.hour,
      minute: parsed.minute,
      question: parsed.question,
      juMethod: parsed.juMethod,
      zhiFuJiGong: parsed.zhiFuJiGong,
      panType: 'zhuan',
    });

    return jsonOk({ success: true, data: output });
  } catch (error) {
    console.error('[miniapp/qimen/calculate] API 错误:', error);
    const message = error instanceof Error ? error.message : '服务器错误';
    return jsonError(message, 500, { success: false });
  }
}
