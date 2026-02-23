import { chatgptImageDetect, chatgptTextDetect } from './chatgpt-provider';
import { fakeImageDetect, fakeTextDetect } from './fake-provider';
import { hiveImageDetect, hiveTextDetect } from './hive-provider';
import type { DetectProvider } from './types';

export type ProviderKind = 'fake' | 'hive' | 'chatgpt';

export type ProviderConfig = {
  textProvider?: ProviderKind;
  imageProvider?: ProviderKind;
  hiveApiKey?: string;
  chatgptApiKey?: string;
  chatgptBaseUrl?: string;
  chatgptModel?: string;
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
      if (textProvider === 'chatgpt') {
        return chatgptTextDetect(input, {
          apiKey: config.chatgptApiKey,
          baseUrl: config.chatgptBaseUrl,
          model: config.chatgptModel
        });
      }
      return fakeTextDetect(input);
    },
    detectImage: (input: Buffer) => {
      if (imageProvider === 'hive') {
        return hiveImageDetect(input, config.hiveApiKey);
      }
      if (imageProvider === 'chatgpt') {
        return chatgptImageDetect(input, {
          apiKey: config.chatgptApiKey,
          baseUrl: config.chatgptBaseUrl,
          model: config.chatgptModel
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
