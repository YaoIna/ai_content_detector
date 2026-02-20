import { fakeImageDetect, fakeTextDetect } from './fake-provider';

export async function detectTextWithProvider(text: string) {
  return fakeTextDetect(text);
}

export async function detectImageWithProvider(buffer: Buffer) {
  return fakeImageDetect(buffer);
}
