# AI Content Detector

V1 web app for checking whether text or image content is likely AI-generated.

## Features

- Text detection endpoint: `POST /api/detect/text`
- Image detection endpoint: `POST /api/detect/image`
- Unified response fields: probability, confidence band, explanations, disclaimer
- Basic global rate limiting and normalized API errors
- Privacy baseline: temporary image artifacts are removed after processing

## Monorepo Structure

- `apps/api`: Fastify API service
- `apps/web`: React + Vite frontend
- `packages/shared`: shared contracts/types
- `docs/`: plans and API notes

## Requirements

- Node.js 18+
- pnpm 10+

## Quick Start

```bash
pnpm install
```

Run tests:

```bash
pnpm -r test
```

Run API:

```bash
pnpm --filter @ai-detector/api dev
```

Run Web:

```bash
pnpm --filter @ai-detector/web dev
```

## Environment Variables

Copy `.env.example` and adjust as needed.

Current implementation uses fake provider logic by default. Provider injection is supported in app factory for deterministic tests.

## Privacy Policy (V1)

- Raw image artifacts are written to temporary files only during processing.
- Temporary files are deleted in `finally` blocks after detection.
- Text content is processed in memory and not persisted by current implementation.

## Disclaimer Policy

Detection output is advisory only and does not represent absolute proof.
