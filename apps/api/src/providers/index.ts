import { fakeTextDetect } from './fake-provider';

export async function detectTextWithProvider(text: string) {
  return fakeTextDetect(text);
}
