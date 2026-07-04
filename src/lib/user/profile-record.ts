import type { User } from '@supabase/supabase-js';
import { getAuthAdminClient, getSystemAdminClient } from '@/lib/api-utils';

export type UserRecordSeedInput = Pick<User, 'id' | 'user_metadata'>;

type UserRecordEnsureClient = {
  from: (table: 'users') => {
    upsert: (
      payload: ReturnType<typeof buildUserRecordSeed>,
      options: { onConflict: string; ignoreDuplicates: boolean },
    ) => PromiseLike<{ error: unknown }>;
  };
};

export function buildUserRecordSeed(user: UserRecordSeedInput) {
  return {
    id: user.id,
    nickname: typeof user.user_metadata?.nickname === 'string' && user.user_metadata.nickname.trim().length > 0
      ? user.user_metadata.nickname.trim()
      : '命理爱好者',
    avatar_url: typeof user.user_metadata?.avatar_url === 'string'
      ? user.user_metadata.avatar_url
      : null,
    membership: 'free' as const,
    ai_chat_count: 1,
  };
}

export async function ensureUserRecordRow(
  supabase: UserRecordEnsureClient,
  user: UserRecordSeedInput,
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  try {
    const { error } = await supabase
      .from('users')
      .upsert(buildUserRecordSeed(user), {
        onConflict: 'id',
        ignoreDuplicates: true,
      });

    if (error) {
      return { ok: false, error };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

function isRlsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (error as { message: string }).message.includes('row-level security')
  );
}

export async function ensureUserRecordWithFallback(
  user: UserRecordSeedInput,
  standardClient?: UserRecordEnsureClient,
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  if (standardClient) {
    const standardResult = await ensureUserRecordRow(standardClient, user);
    if (standardResult.ok) {
      return standardResult;
    }
    if (!isRlsError(standardResult.error)) {
      return standardResult;
    }
  }

  const systemClient = getSystemAdminClient();
  const systemResult = await ensureUserRecordRow(systemClient, user);
  if (systemResult.ok) {
    return systemResult;
  }

  if (!isRlsError(systemResult.error)) {
    return systemResult;
  }

  const authAdminClient = getAuthAdminClient();
  if (!authAdminClient) {
    return { ok: false, error: new Error('Missing auth admin client') };
  }

  return ensureUserRecordRow(authAdminClient, user);
}
