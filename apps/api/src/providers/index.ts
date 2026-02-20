import { fakeImageDetect, fakeTextDetect } from './fake-provider';
import type { DetectProvider } from './types';

const defaultProvider: DetectProvider = {
  detectText: fakeTextDetect,
  detectImage: fakeImageDetect
};

export function resolveProvider(provider?: DetectProvider): DetectProvider {
  return provider ?? defaultProvider;
}

export async function detectTextWithProvider(text: string, provider?: DetectProvider) {
  return resolveProvider(provider).detectText(text);
}

export async function detectImageWithProvider(buffer: Buffer, provider?: DetectProvider) {
  return resolveProvider(provider).detectImage(buffer);
}
