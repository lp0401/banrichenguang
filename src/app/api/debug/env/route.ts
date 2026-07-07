import { NextResponse } from 'next/server';
import { getModelsAsync } from '@/lib/server/ai-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const models = await getModelsAsync();
  const visionModels = models.filter(
    (m) => m.usageType === 'vision' || m.supportsVision,
  );

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
  });
}
