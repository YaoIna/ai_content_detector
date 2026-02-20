# AI Content Detector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a V1 web app that lets general users submit text or images and returns AI-generation probability plus explanations, with immediate content deletion after processing.

**Architecture:** Use a TypeScript monorepo with a React frontend and a Node.js backend. Backend exposes detect APIs, routes requests through provider adapters, normalizes scores, generates user-friendly explanations, and removes raw content after processing. Frontend provides a simple upload/input UI, progress state, and result rendering with disclaimer.

**Tech Stack:** pnpm workspace, React + Vite + TypeScript, Fastify backend (TypeScript), Vitest, Supertest, Zod, Multer, Pino.

---

### Task 1: Initialize workspace and test harness

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `apps/web/package.json`
- Create: `apps/api/package.json`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/tests/health.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/health.test.ts
import request from 'supertest';
import { buildApp } from '../src/app';

describe('health', () => {
  it('returns ok', async () => {
    const app = buildApp();
    const res = await request(app.server).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- health.test.ts`
Expected: FAIL with module/app bootstrap missing.

**Step 3: Write minimal implementation**

```ts
// apps/api/src/app.ts
import Fastify from 'fastify';
export function buildApp() {
  const app = Fastify();
  app.get('/health', async () => ({ status: 'ok' }));
  return app;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- health.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git init
git add package.json pnpm-workspace.yaml apps/api apps/web
git commit -m "chore: initialize monorepo and api test harness"
```

### Task 2: Define shared detection contract and validation

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/detect-contract.ts`
- Create: `apps/api/src/schemas/detect.ts`
- Create: `apps/api/tests/schemas.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/schemas.test.ts
import { textDetectSchema } from '../src/schemas/detect';

describe('text schema', () => {
  it('rejects empty input', () => {
    const parsed = textDetectSchema.safeParse({ text: '' });
    expect(parsed.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- schemas.test.ts`
Expected: FAIL because schema file/symbol missing.

**Step 3: Write minimal implementation**

```ts
// apps/api/src/schemas/detect.ts
import { z } from 'zod';
export const textDetectSchema = z.object({
  text: z.string().min(20).max(20000),
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- schemas.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared apps/api/src/schemas apps/api/tests/schemas.test.ts
git commit -m "feat: add detection input/output contracts and validation"
```

### Task 3: Add provider adapter interface with fake provider

**Files:**
- Create: `apps/api/src/providers/types.ts`
- Create: `apps/api/src/providers/fake-provider.ts`
- Create: `apps/api/src/providers/index.ts`
- Create: `apps/api/tests/provider.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/provider.test.ts
import { detectTextWithProvider } from '../src/providers';

it('returns normalized score range', async () => {
  const result = await detectTextWithProvider('sample text content for test');
  expect(result.aiProbability).toBeGreaterThanOrEqual(0);
  expect(result.aiProbability).toBeLessThanOrEqual(100);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- provider.test.ts`
Expected: FAIL because provider abstraction missing.

**Step 3: Write minimal implementation**

```ts
// apps/api/src/providers/fake-provider.ts
export async function fakeTextDetect(text: string) {
  const aiProbability = Math.min(100, Math.max(0, text.length % 101));
  return { aiProbability, signals: ['repetitive structure'] };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- provider.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/src/providers apps/api/tests/provider.test.ts
git commit -m "feat: add provider interface and fake implementation"
```

### Task 4: Implement POST /api/detect/text endpoint

**Files:**
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/src/services/text-detect-service.ts`
- Create: `apps/api/tests/detect-text.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/detect-text.test.ts
import request from 'supertest';
import { buildApp } from '../src/app';

it('returns probability and explanations for text', async () => {
  const app = buildApp();
  const res = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is a sufficiently long sample to pass validation.' });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('ai_probability');
  expect(Array.isArray(res.body.explanations)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- detect-text.test.ts`
Expected: FAIL with 404 or handler missing.

**Step 3: Write minimal implementation**

```ts
// apps/api/src/app.ts (new route)
app.post('/api/detect/text', async (req, reply) => {
  // validate body, call text service, return normalized payload
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- detect-text.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/src/app.ts apps/api/src/services/text-detect-service.ts apps/api/tests/detect-text.test.ts
git commit -m "feat: add text detection endpoint"
```

### Task 5: Implement POST /api/detect/image endpoint

**Files:**
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/src/services/image-detect-service.ts`
- Create: `apps/api/tests/detect-image.test.ts`
- Create: `apps/api/tests/fixtures/sample.jpg`

**Step 1: Write the failing test**

```ts
// apps/api/tests/detect-image.test.ts
import path from 'node:path';
import request from 'supertest';
import { buildApp } from '../src/app';

it('returns probability and explanations for image upload', async () => {
  const app = buildApp();
  const res = await request(app.server)
    .post('/api/detect/image')
    .attach('image_file', path.resolve(__dirname, 'fixtures/sample.jpg'));
  expect(res.status).toBe(200);
  expect(res.body.type).toBe('image');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- detect-image.test.ts`
Expected: FAIL with route/upload handler missing.

**Step 3: Write minimal implementation**

```ts
// apps/api/src/app.ts (new route)
app.post('/api/detect/image', async (req, reply) => {
  // parse multipart, call image detection service, return normalized payload
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- detect-image.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/src/app.ts apps/api/src/services/image-detect-service.ts apps/api/tests/detect-image.test.ts apps/api/tests/fixtures/sample.jpg
git commit -m "feat: add image detection endpoint"
```

### Task 6: Add explanation layer and confidence band mapping

**Files:**
- Create: `apps/api/src/services/explanation-service.ts`
- Modify: `apps/api/src/services/text-detect-service.ts`
- Modify: `apps/api/src/services/image-detect-service.ts`
- Create: `apps/api/tests/explanation-service.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/explanation-service.test.ts
import { buildExplanation } from '../src/services/explanation-service';

it('returns cautious user-facing reasons', () => {
  const out = buildExplanation({ aiProbability: 78, signals: ['uniform phrasing'] });
  expect(out.explanations[0]).toContain('可能');
  expect(out.confidenceBand).toBe('high');
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- explanation-service.test.ts`
Expected: FAIL due missing explanation service.

**Step 3: Write minimal implementation**

```ts
// apps/api/src/services/explanation-service.ts
export function buildExplanation(input: { aiProbability: number; signals: string[] }) {
  const confidenceBand = input.aiProbability >= 70 ? 'high' : input.aiProbability >= 40 ? 'medium' : 'low';
  return {
    confidenceBand,
    explanations: input.signals.map((s) => `可能依据：${s}`),
    disclaimer: '检测结果仅供参考，不构成绝对判定。',
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- explanation-service.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/src/services/explanation-service.ts apps/api/src/services/text-detect-service.ts apps/api/src/services/image-detect-service.ts apps/api/tests/explanation-service.test.ts
git commit -m "feat: add explanation layer and confidence band mapping"
```

### Task 7: Enforce immediate raw-content deletion policy

**Files:**
- Modify: `apps/api/src/services/image-detect-service.ts`
- Modify: `apps/api/src/services/text-detect-service.ts`
- Create: `apps/api/tests/privacy-cleanup.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/privacy-cleanup.test.ts
import { processImageAndCleanup } from '../src/services/image-detect-service';

it('removes temp file after processing', async () => {
  const { tempPath, cleaned } = await processImageAndCleanup(Buffer.from('abc'));
  expect(cleaned).toBe(true);
  expect(tempPath).toBeDefined();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- privacy-cleanup.test.ts`
Expected: FAIL because cleanup flow is missing.

**Step 3: Write minimal implementation**

```ts
// in image/text services
// ensure raw payload references are nulled and temp files unlinked in finally blocks
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- privacy-cleanup.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/src/services/image-detect-service.ts apps/api/src/services/text-detect-service.ts apps/api/tests/privacy-cleanup.test.ts
git commit -m "feat: enforce immediate content cleanup"
```

### Task 8: Add rate limiting and consistent error mapping

**Files:**
- Create: `apps/api/src/plugins/rate-limit.ts`
- Create: `apps/api/src/errors/api-error.ts`
- Modify: `apps/api/src/app.ts`
- Create: `apps/api/tests/error-handling.test.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/error-handling.test.ts
import request from 'supertest';
import { buildApp } from '../src/app';

it('returns 429 after too many requests', async () => {
  const app = buildApp();
  for (let i = 0; i < 15; i++) {
    await request(app.server).post('/api/detect/text').send({ text: 'This is long enough to pass schema validation for testing.' });
  }
  const res = await request(app.server).post('/api/detect/text').send({ text: 'This is long enough to pass schema validation for testing.' });
  expect(res.status).toBe(429);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- error-handling.test.ts`
Expected: FAIL as rate limiting is not enabled.

**Step 3: Write minimal implementation**

```ts
// register fastify-rate-limit and centralized error mapper
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- error-handling.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/src/plugins/rate-limit.ts apps/api/src/errors/api-error.ts apps/api/src/app.ts apps/api/tests/error-handling.test.ts
git commit -m "feat: add rate limiting and normalized api errors"
```

### Task 9: Build frontend detect page and result panel

**Files:**
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/components/TextInputPanel.tsx`
- Create: `apps/web/src/components/ImageUploadPanel.tsx`
- Create: `apps/web/src/components/ResultCard.tsx`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/App.test.tsx`

**Step 1: Write the failing test**

```tsx
// apps/web/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders detect form and result disclaimer placeholder', () => {
  render(<App />);
  expect(screen.getByText(/AI 内容鉴别/i)).toBeInTheDocument();
  expect(screen.getByText(/检测结果仅供参考/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/web test -- App.test.tsx`
Expected: FAIL as app/components do not exist.

**Step 3: Write minimal implementation**

```tsx
// App with text input, image upload, submit buttons, loading state, result card
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/web test -- App.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/web/src
git commit -m "feat: add v1 detect UI for text and image"
```

### Task 10: End-to-end API integration tests with mocked provider

**Files:**
- Create: `apps/api/tests/integration-text.test.ts`
- Create: `apps/api/tests/integration-image.test.ts`
- Modify: `apps/api/src/providers/index.ts`

**Step 1: Write the failing test**

```ts
// apps/api/tests/integration-text.test.ts
it('returns normalized response contract', async () => {
  // boot app with mocked provider and assert response keys
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @ai-detector/api test -- integration-text.test.ts integration-image.test.ts`
Expected: FAIL because provider injection for tests is missing.

**Step 3: Write minimal implementation**

```ts
// allow provider injection through app factory options for deterministic tests
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @ai-detector/api test -- integration-text.test.ts integration-image.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add apps/api/tests/integration-text.test.ts apps/api/tests/integration-image.test.ts apps/api/src/providers/index.ts
git commit -m "test: add deterministic integration coverage for text and image flows"
```

### Task 11: Documentation and operational checks

**Files:**
- Create: `README.md`
- Create: `.env.example`
- Create: `docs/api/openapi-notes.md`

**Step 1: Write the failing test/check**

```bash
pnpm -r test
```

Expected before doc/config updates: setup ambiguity for new contributors.

**Step 2: Run check to verify current gap**

Run: `pnpm -r test`
Expected: PASS tests but onboarding still unclear without docs/env template.

**Step 3: Write minimal implementation**

```md
# README sections
- quick start
- run web/api
- env vars
- privacy policy behavior
- disclaimer policy
```

**Step 4: Run check to verify completion**

Run:
- `pnpm -r test`
- `pnpm --filter @ai-detector/api dev`
- `pnpm --filter @ai-detector/web dev`
Expected: tests pass, both apps boot.

**Step 5: Commit**

```bash
git add README.md .env.example docs/api/openapi-notes.md
git commit -m "docs: add setup, env template, and api notes"
```

---

## Final Verification Checklist

Run from repo root:

1. `pnpm install`
2. `pnpm -r test`
3. `pnpm --filter @ai-detector/api test`
4. `pnpm --filter @ai-detector/web test`
5. `pnpm --filter @ai-detector/api dev`
6. `pnpm --filter @ai-detector/web dev`

Expected:
- All tests PASS
- `/health`, `/api/detect/text`, `/api/detect/image` function correctly
- Frontend can submit text/image and render probability + explanations + disclaimer
- No raw user content persisted after processing
