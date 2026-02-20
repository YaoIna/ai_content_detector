import type { DetectProviderResult } from './types';

function requireHiveApiKey(key?: string) {
  if (!key) {
    throw new Error('Hive API key is required for hive provider');
  }
}

export async function hiveTextDetect(_text: string, apiKey?: string): Promise<DetectProviderResult> {
  requireHiveApiKey(apiKey);

  // Skeleton only: real Hive integration will be added once credentials and endpoint details are finalized.
  throw new Error('Hive text provider skeleton is configured but not implemented yet');
}

export async function hiveImageDetect(_buffer: Buffer, apiKey?: string): Promise<DetectProviderResult> {
  requireHiveApiKey(apiKey);

  // Skeleton only: real Hive integration will be added once credentials and endpoint details are finalized.
  throw new Error('Hive image provider skeleton is configured but not implemented yet');
}
