/**
 * 微信小程序登录端点
 *
 * POST /api/auth/wechat
 *   body: { code: string }
 *   response: { success: true, data: { accessToken, refreshToken, user } }
 *
 * 流程：
 * 1. 用 code 调微信 jscode2session 获取 openid
 * 2. 用 openid 生成确定性邮箱/密码，尝试登录 Supabase
 * 3. 登录成功：补充 public.users 与 provider 绑定（幂等）
 * 4. 登录失败：创建 Supabase 用户，初始化 public.users，绑定 provider，再登录
 * 5. 返回 token
 */
import { NextRequest } from 'next/server';
import { createAnonClient, getAuthAdminClient, getSystemAdminClient, jsonError, jsonOk } from '@/lib/api-utils';
import { ensureUserRecordRow, type UserRecordSeedInput } from '@/lib/user/profile-record';
import {
  exchangeMiniProgramCode,
  generateDeterministicPassword,
  buildWechatUserMetadata,
  type WechatMiniSession,
} from '@/lib/oauth/wechat';

type AuthUserSeed = UserRecordSeedInput & { email?: string };

const WECHAT_MINIAPP_EMAIL_DOMAIN = process.env.WECHAT_MINIAPP_EMAIL_DOMAIN || 'miniapp.local';

function generateEmailFromOpenid(openid: string): string {
  return `wechat_${openid.slice(-16)}@${WECHAT_MINIAPP_EMAIL_DOMAIN}`;
}

async function signInWechatUser(
  anonClient: ReturnType<typeof createAnonClient>,
  email: string,
  password: string,
) {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    console.error('[wechat-auth] Sign in failed:', error);
    return null;
  }

  return data.session;
}

async function createWechatUser(
  authAdminClient: NonNullable<ReturnType<typeof getAuthAdminClient>>,
  openid: string,
  unionid?: string,
): Promise<AuthUserSeed> {
  const email = generateEmailFromOpenid(openid);
  const password = generateDeterministicPassword(openid);
  const metadata = buildWechatUserMetadata(openid, unionid);

  const { data, error } = await authAdminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error || !data.user) {
    console.error('[wechat-auth] Create user failed:', error);
    throw new Error('创建用户失败');
  }

  return data.user;
}

async function bindWechatProvider(
  dbClient: ReturnType<typeof getSystemAdminClient> | NonNullable<ReturnType<typeof getAuthAdminClient>>,
  userId: string,
  session: WechatMiniSession,
) {
  const { error } = await dbClient.from('user_oauth_providers').upsert({
    user_id: userId,
    provider: 'wechat',
    provider_user_id: session.openid,
    provider_email: generateEmailFromOpenid(session.openid),
    provider_username: `微信用户_${session.openid.slice(-8)}`,
    provider_metadata: {
      openid: session.openid,
      unionid: session.unionid || null,
    },
  }, {
    onConflict: 'provider,provider_user_id',
    ignoreDuplicates: true,
  });

  if (error) {
    console.error('[wechat-auth] Bind provider failed:', error);
    throw new Error('绑定微信账号失败');
  }
}

async function ensureUserRecordWithFallback(
  serviceClient: ReturnType<typeof getSystemAdminClient>,
  authAdminClient: NonNullable<ReturnType<typeof getAuthAdminClient>>,
  user: Parameters<typeof ensureUserRecordRow>[1],
) {
  // 优先使用 system admin 会话客户端；若因 RLS 策略未配置导致失败，
  // 降级到 service role 客户端完成初始化（service role 不暴露给客户端）。
  const serviceResult = await ensureUserRecordRow(serviceClient, user);
  if (serviceResult.ok) {
    return serviceResult;
  }

  const rlsError = serviceResult.error && typeof serviceResult.error === 'object'
    && 'message' in serviceResult.error
    && typeof serviceResult.error.message === 'string'
    && serviceResult.error.message.includes('row-level security');

  if (!rlsError) {
    return serviceResult;
  }

  console.warn('[wechat-auth] System admin client hit RLS, falling back to service role client');
  return ensureUserRecordRow(authAdminClient, user);
}

export async function POST(request: NextRequest) {
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('请求体格式错误', 400);
  }

  const { code } = body;
  if (!code || typeof code !== 'string') {
    return jsonError('缺少微信登录 code', 400);
  }

  // 1. 微信换 openid
  let session: WechatMiniSession;
  try {
    session = await exchangeMiniProgramCode(code);
  } catch (err) {
    const message = err instanceof Error ? err.message : '微信登录失败';
    console.error('[wechat-auth] Code exchange failed:', err);
    return jsonError(message, 400);
  }

  const serviceClient = getSystemAdminClient();
  const anonClient = createAnonClient();
  const authAdminClient = getAuthAdminClient();

  if (!authAdminClient) {
    return jsonError('服务端未配置 Auth 管理员密钥，无法创建用户', 500);
  }

  try {
    const authEmail = generateEmailFromOpenid(session.openid);
    const authPassword = generateDeterministicPassword(session.openid);

    // 2. 先用确定性密码登录。如果 auth 用户已存在（如上次绑定失败残留），
    //    直接拿到 session，无需再查库。
    let supabaseSession = await signInWechatUser(anonClient, authEmail, authPassword);

    if (!supabaseSession) {
      // 3. 登录失败说明 auth 用户不存在或密码不对，尝试创建
      let newUser: AuthUserSeed;
      try {
        newUser = await createWechatUser(authAdminClient, session.openid, session.unionid);
      } catch {
        // 创建也失败（通常是邮箱已存在），尝试直接登录
        supabaseSession = await signInWechatUser(anonClient, authEmail, authPassword);
        if (!supabaseSession) {
          return jsonError('登录失败，请重试', 500);
        }
        newUser = supabaseSession.user;
      }

      // 初始化 public.users
      const ensureResult = await ensureUserRecordWithFallback(serviceClient, authAdminClient, newUser);
      if (!ensureResult.ok) {
        console.error('[wechat-auth] Ensure user record failed:', ensureResult.error);
        return jsonError('初始化用户资料失败', 500);
      }

      // 绑定 provider
      await bindWechatProvider(authAdminClient, newUser.id, session);

      // 如果刚才是新建用户，需要再次登录（createUser 不返回 session）
      if (!supabaseSession) {
        supabaseSession = await signInWechatUser(anonClient, authEmail, authPassword);
      }
    } else {
      // 4. 已存在 auth 用户，补充 public.users 和 provider 绑定（幂等）
      const ensureResult = await ensureUserRecordWithFallback(serviceClient, authAdminClient, supabaseSession.user);
      if (!ensureResult.ok) {
        console.error('[wechat-auth] Ensure user record failed:', ensureResult.error);
        return jsonError('初始化用户资料失败', 500);
      }

      await bindWechatProvider(authAdminClient, supabaseSession.user.id, session);
    }

    if (!supabaseSession) {
      return jsonError('登录失败，请重试', 500);
    }

    // 5. 返回 token
    return jsonOk({
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      user: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email,
        nickname: supabaseSession.user.user_metadata?.nickname || `微信用户_${session.openid.slice(-8)}`,
        avatarUrl: supabaseSession.user.user_metadata?.avatar_url || null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录处理失败';
    console.error('[wechat-auth] Unexpected error:', err);
    return jsonError(message, 500);
  }
}
