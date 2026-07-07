-- 修复 ai_models 表 RLS：启用读取策略
-- 现象：后端使用 authenticated 系统管理员 token 查询 ai_models 时返回空结果，
-- 因为该表启用了 RLS 但缺少 SELECT policy，导致模型配置无法被读取。

ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_models_select_authenticated" ON public.ai_models;

CREATE POLICY "ai_models_select_authenticated"
  ON public.ai_models
  FOR SELECT
  TO authenticated
  USING (true);
