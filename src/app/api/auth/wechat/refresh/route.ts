/**
 * 微信小程序 Token 刷新端点
 *
 * POST /api/auth/wechat/refresh
 *   header: Authorization: Bearer <refresh_token>
 *   response: { success: true, data: { accessToken, refreshToken, user } }
 */
import { NextRequest } from 'next/server';
import { createAnonClient, jsonError, jsonOk } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const refreshToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

  if (!refreshToken) {
    return jsonError('缺少 refresh token', 401);
  }

  const anonClient = createAnonClient();
  const { data, error } = await anonClient.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    console.error('[wechat-auth-refresh] Refresh failed:', error);
    return jsonError('刷新登录状态失败', 401);
  }

  return jsonOk({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.session.user.id,
      email: data.session.user.email,
      nickname: data.session.user.user_metadata?.nickname || null,
      avatarUrl: data.session.user.user_metadata?.avatar_url || null,
    },
  });
}
