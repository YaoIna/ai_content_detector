# Project Tech Stack And File Map

## Maintenance Rule

- After every completed task, update this file in the same commit.
- Keep `Tech Stack` and `File Purposes` aligned with the latest code.

## Tech Stack

- Runtime: Node.js 18+
- Package manager: pnpm (workspace monorepo)
- Language: TypeScript
- API: Fastify + multipart upload handling
- Networking: undici (global ProxyAgent for backend outbound requests)
- Web: React + Vite
- Testing: Vitest + Supertest + Testing Library + happy-dom

## File Purposes

### Root

- `package.json`: monorepo root metadata and shared scripts.
- `pnpm-workspace.yaml`: pnpm workspace package discovery config.
- `pnpm-lock.yaml`: lockfile for reproducible installs.
- `.env.example`: environment variable template for local setup (including fake/hive/chatgpt provider switching variables).
- `README.md`: project overview, setup, run/test instructions.
- `scripts/deploy_aws_ec2.sh`: step-by-step EC2 deployment command script with sectioned comments (install, build, PM2, Nginx, verification).

### API App (`apps/api`)

- `apps/api/package.json`: API package scripts and dependencies.
- `apps/api/tsconfig.json`: TypeScript config for API source/tests.
- `apps/api/vitest.config.ts`: Vitest config for API tests.

- `apps/api/src/server.ts`: API process entrypoint (loads project-root .env, applies global outbound proxy, and starts Fastify server).
- `apps/api/src/network-proxy.ts`: backend outgoing-proxy resolver and undici global dispatcher setup (supports CHATGPT_PROXY_URL/HTTPS_PROXY/HTTP_PROXY with local default).
- `apps/api/src/app.ts`: app factory, route wiring, request/error logging, plugin registration.

- `apps/api/src/errors/api-error.ts`: API error class and error-to-response mapper, supporting passthrough payloads for upstream errors.
- `apps/api/src/plugins/rate-limit.ts`: global in-memory rate-limiting hook with env-driven config (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`) and per-app isolated buckets.
- `apps/api/src/schemas/detect.ts`: request payload validation schemas.

- `apps/api/src/providers/types.ts`: provider interface/contracts.
- `apps/api/src/providers/fake-provider.ts`: fake text/image detection provider implementation.
- `apps/api/src/providers/hive-provider.ts`: Hive provider skeleton with API-key validation and placeholder calls.
- `apps/api/src/providers/chatgpt-provider.ts`: ChatGPT-based text/image judging provider for prototype detection results, including raw upstream response logging, robust parsing for both `output_text` and `output[].content[].text` shapes, and decimal probability normalization (`0.9` -> `90`).
- `apps/api/src/providers/index.ts`: provider resolver, switching logic for fake/hive/chatgpt providers, and config-based provider factory.

- `apps/api/src/services/text-detect-service.ts`: text detection service flow + explanation mapping.
- `apps/api/src/services/image-detect-service.ts`: image detection flow + temp file cleanup.
- `apps/api/src/services/explanation-service.ts`: probability-to-confidence mapping and user explanations.

- `apps/api/tests/health.test.ts`: health endpoint test.
- `apps/api/tests/schemas.test.ts`: schema validation behavior test.
- `apps/api/tests/provider.test.ts`: provider output range normalization test.
- `apps/api/tests/chatgpt-provider-logging.test.ts`: verifies ChatGPT provider logs raw upstream response body.
- `apps/api/tests/detect-text.test.ts`: text detection endpoint behavior test.
- `apps/api/tests/detect-image.test.ts`: image detection endpoint behavior test.
- `apps/api/tests/explanation-service.test.ts`: explanation generation test.
- `apps/api/tests/privacy-cleanup.test.ts`: temporary artifact cleanup test.
- `apps/api/tests/error-handling.test.ts`: rate-limit and error mapping test.
- `apps/api/tests/integration-text.test.ts`: injected-provider integration test for text flow.
- `apps/api/tests/integration-image.test.ts`: injected-provider integration test for image flow.
- `apps/api/tests/fixtures/sample.jpg`: upload fixture for image endpoint tests.

### Web App (`apps/web`)

- `apps/web/package.json`: Web package scripts and dependencies.
- `apps/web/tsconfig.json`: TypeScript config for React app/tests.
- `apps/web/vite.config.ts`: Vite + Vitest config for frontend, including /api proxy to backend in local dev.
- `apps/web/index.html`: Vite HTML entry that mounts the React root container.

- `apps/web/src/main.tsx`: React client entrypoint that mounts `<App />` to `#root`.
- `apps/web/src/App.tsx`: main UI container and detect flow orchestration, including request error feedback banner and in-result loading indicator during detection.
- `apps/web/src/App.css`: editorial-style page layout, color system, motion, and responsive UI rules.
- `apps/web/src/App.test.tsx`: UI render/content tests plus loading-state and button-disable behavior tests.
- `apps/web/src/test-setup.ts`: test environment setup (`jest-dom` matchers).

- `apps/web/src/lib/api.ts`: frontend API client functions and result types.
- `apps/web/src/components/TextInputPanel.tsx`: text submit form UI.
- `apps/web/src/components/ImageUploadPanel.tsx`: image upload form UI.
- `apps/web/src/components/ResultCard.tsx`: detection result and disclaimer display.

### Shared Package (`packages/shared`)

- `packages/shared/package.json`: shared package metadata.
- `packages/shared/src/detect-contract.ts`: shared detection response contract types.

### Documentation (`docs`)

- `docs/api/openapi-notes.md`: API behavior/spec notes for V1 endpoints.
- `docs/plans/2026-02-20-ai-content-detector-design.md`: approved product/system design.
- `docs/plans/2026-02-20-ai-content-detector-implementation-plan.md`: step-by-step implementation plan.
- `docs/project-tech-stack-and-file-map.md`: this document.
