-- 添加 AI 对话积分扣减/增加 RPC 函数
-- 以 service role 权限执行，确保 RLS 下也能安全扣减积分

CREATE OR REPLACE FUNCTION public.decrement_ai_chat_count(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_remaining integer;
BEGIN
    UPDATE public.users
    SET ai_chat_count = GREATEST(COALESCE(ai_chat_count, 0) - 1, 0),
        updated_at = now()
    WHERE id = user_id
    RETURNING ai_chat_count INTO v_remaining;

    IF v_remaining IS NULL THEN
        RETURN 0;
    END IF;

    RETURN v_remaining;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_ai_chat_count(user_id uuid, amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_remaining integer;
BEGIN
    UPDATE public.users
    SET ai_chat_count = COALESCE(ai_chat_count, 0) + GREATEST(amount, 0),
        updated_at = now()
    WHERE id = user_id
    RETURNING ai_chat_count INTO v_remaining;

    IF v_remaining IS NULL THEN
        RETURN 0;
    END IF;

    RETURN v_remaining;
END;
$$;

-- 授予 execute 权限给 authenticated 和 anon 用户
GRANT EXECUTE ON FUNCTION public.decrement_ai_chat_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_ai_chat_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_ai_chat_count(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ai_chat_count(uuid, integer) TO anon;
