/**
 * 微信小程序登录协议封装
 *
 * 通过 wx.login 获取的 code 换取 openid + session_key
 */
import { createHmac } from 'crypto';

export interface WechatMiniSession {
  openid: string;
  session_key?: string;
  unionid?: string;
}

function getAppId(): string {
  const v = process.env.WECHAT_MINIAPP_APPID;
  if (!v) throw new Error('WECHAT_MINIAPP_APPID is not set');
  return v;
}

function getAppSecret(): string {
  const v = process.env.WECHAT_MINIAPP_SECRET;
  if (!v) throw new Error('WECHAT_MINIAPP_SECRET is not set');
  return v;
}

function getStablePasswordSeed(): string {
  return process.env.INTERNAL_API_SECRET || process.env.SUPABASE_SECRET_KEY || getAppSecret();
}

export async function exchangeMiniProgramCode(code: string): Promise<WechatMiniSession> {
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
  url.searchParams.set('appid', getAppId());
  url.searchParams.set('secret', getAppSecret());
  url.searchParams.set('js_code', code);
  url.searchParams.set('grant_type', 'authorization_code');

  const res = await fetch(url.toString());
  const payload = await res.json() as {
    openid?: string;
    session_key?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (payload.errcode) {
    throw new Error(`Wechat jscode2session failed: ${payload.errcode} ${payload.errmsg}`);
  }

  if (!payload.openid) {
    throw new Error('Wechat jscode2session response missing openid');
  }

  return {
    openid: payload.openid,
    session_key: payload.session_key,
    unionid: payload.unionid,
  };
}

export function generateDeterministicPassword(openid: string): string {
  return createHmac('sha256', getStablePasswordSeed())
    .update(`wechat:${openid}`)
    .digest('hex');
}

export function buildWechatUserMetadata(openid: string, unionid?: string) {
  return {
    wechat_openid: openid,
    wechat_unionid: unionid || null,
  };
}
