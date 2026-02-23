import { fakeImageDetect, fakeTextDetect } from './fake-provider';
import { hiveImageDetect, hiveTextDetect } from './hive-provider';
import { llmImageDetect, llmTextDetect } from './llm-judge-provider';
import type { DetectProvider } from './types';

export type ProviderKind = 'fake' | 'hive' | 'llm';

export type ProviderConfig = {
  textProvider?: ProviderKind;
  imageProvider?: ProviderKind;
  hiveApiKey?: string;
  llmApiKey?: string;
  llmBaseUrl?: string;
  llmModel?: string;
};

const defaultProvider: DetectProvider = {
  detectText: fakeTextDetect,
  detectImage: fakeImageDetect
};

export function createProviderFromConfig(config: ProviderConfig = {}): DetectProvider {
  const textProvider = config.textProvider ?? 'fake';
  const imageProvider = config.imageProvider ?? 'fake';

  return {
    detectText: (input: string) => {
      if (textProvider === 'hive') {
        return hiveTextDetect(input, config.hiveApiKey);
      }
      if (textProvider === 'llm') {
        return llmTextDetect(input, {
          apiKey: config.llmApiKey,
          baseUrl: config.llmBaseUrl,
          model: config.llmModel
        });
      }
      return fakeTextDetect(input);
    },
    detectImage: (input: Buffer) => {
      if (imageProvider === 'hive') {
        return hiveImageDetect(input, config.hiveApiKey);
      }
      if (imageProvider === 'llm') {
        return llmImageDetect(input, {
          apiKey: config.llmApiKey,
          baseUrl: config.llmBaseUrl,
          model: config.llmModel
        });
      }
      return fakeImageDetect(input);
    }
  };
}

export function resolveProvider(provider?: DetectProvider, config: ProviderConfig = {}): DetectProvider {
  return provider ?? createProviderFromConfig(config) ?? defaultProvider;
}

export async function detectTextWithProvider(text: string, provider?: DetectProvider, config: ProviderConfig = {}) {
  return resolveProvider(provider, config).detectText(text);
}

export async function detectImageWithProvider(buffer: Buffer, provider?: DetectProvider, config: ProviderConfig = {}) {
  return resolveProvider(provider, config).detectImage(buffer);
}
