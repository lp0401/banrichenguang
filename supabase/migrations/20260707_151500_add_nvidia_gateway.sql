-- 支持 NVIDIA NIM 直连：扩展 ai_gateways.gateway_key 的 CHECK 约束，允许 'nvidia'
-- 此前只允许 'newapi' 与 'octopus'，导致无法配置 NVIDIA NIM 作为 vision 模型网关。

ALTER TABLE public.ai_gateways
DROP CONSTRAINT IF EXISTS ai_gateways_gateway_key_check;

ALTER TABLE public.ai_gateways
ADD CONSTRAINT ai_gateways_gateway_key_check
CHECK (gateway_key = ANY (ARRAY['newapi'::text, 'octopus'::text, 'nvidia'::text]));
