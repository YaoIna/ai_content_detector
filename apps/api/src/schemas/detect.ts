import { z } from 'zod';

export const textDetectSchema = z.object({
  text: z.string().min(20).max(20000)
});
