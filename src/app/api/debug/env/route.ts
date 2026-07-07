import { NextResponse } from 'next/server';
import { getModelsAsync } from '@/lib/server/ai-config';
import { getSystemAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const models = await getModelsAsync();
  const visionModels = models.filter(
    (m) => m.usageType === 'vision' || m.supportsVision,
  );

  const supabase = getSystemAdminClient();
  const { data: rawBindings, error: bindingsError } = await supabase
    .from('ai_model_gateway_bindings')
    .select('id, model_id, gateway_id, model_id_override, is_enabled, gateway:ai_gateways(*)');

  const { data: rawGateways, error: gatewaysError } = await supabase
    .from('ai_gateways')
    .select('*');

  return NextResponse.json({
    nvidiaBaseUrl: process.env.NVIDIA_BASE_URL || null,
    nvidiaKeyExists: !!process.env.NVIDIA_API_KEY,
    nvidiaKeyLength: process.env.NVIDIA_API_KEY?.length ?? 0,
    modelCount: models.length,
    visionModelCount: visionModels.length,
    visionModels: visionModels.map((m) => ({
      id: m.id,
      usageType: m.usageType,
      supportsVision: m.supportsVision,
      apiUrl: m.apiUrl,
      apiKeyEnvVar: m.apiKeyEnvVar,
      sourceKey: m.sourceKey,
      sources: m.sources?.map((s) => ({
        sourceKey: s.sourceKey,
        apiUrl: s.apiUrl,
        apiKeyEnvVar: s.apiKeyEnvVar,
        isEnabled: s.isEnabled,
      })),
    })),
    rawBindings,
    bindingsError,
    rawGateways,
    gatewaysError,
  });
}
