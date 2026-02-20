# AI Content Detector Design (V1)

**Date:** 2026-02-20
**Audience:** General users
**Scope:** Detect whether uploaded text or image is likely AI-generated

---

## 1. Goals and Scope

- Provide a simple consumer-facing experience.
- Accept `text` and `image` inputs.
- Return `AI probability + explanation` for each request.
- Enforce privacy by deleting user content immediately after processing.
- Start with third-party detectors while keeping architecture ready for gradual in-house model replacement.

Out of scope for V1:
- Video detection
- User accounts and long-term report history
- Final legal-grade adjudication

---

## 2. Product Principles

- Result language must be probabilistic, not absolute.
- Show clear disclaimer: detection is advisory, not definitive proof.
- Keep input friction low and response fast.
- Fail gracefully with user-readable error messages.

---

## 3. High-Level Architecture

1. Web Frontend
- Text input and image upload
- Client-side validation (length, type, size)
- Task status UI (uploading, processing, done, failed)
- Result panel (probability, explanation, disclaimer)

2. API Layer
- Request validation and throttling
- Routing to text/image detection pipelines
- Result normalization to one unified response schema

3. Detection Provider Interface
- `detectText(input)`
- `detectImage(input)`
- Current implementation: third-party providers
- Future: in-house models as drop-in providers

4. Explanation Layer
- Converts detector signals into readable “possible reasons”
- Uses cautious wording and confidence bands

5. Ephemeral Processing Layer
- Temporary storage/queue for in-flight jobs only
- Raw content deleted immediately after result generation

---

## 4. User Experience and Flows

### 4.1 Main Detect Page
- Input options: text box or image upload
- Guardrails: supported formats and size limits
- Privacy notice visible before submit

### 4.2 Results View
- Primary output: `Likely AI-generated: XX%`
- Secondary output: 2-4 explanation bullets
- Disclaimer always shown
- Actions: rerun detection, copy summary

### 4.3 Error States
- Validation errors (bad format/size/empty input)
- Provider timeout/service busy
- Unsupported or unreadable content

---

## 5. API Contract (V1)

### `POST /api/detect/text`
Input:
- `text: string`

Output:
- `type: "text"`
- `ai_probability: number` (0-100)
- `confidence_band: "low" | "medium" | "high"`
- `explanations: string[]`
- `disclaimer: string`
- `request_id: string`
- `processed_at: ISO8601`

### `POST /api/detect/image`
Input:
- `image_file: multipart file`

Output:
- Same schema as text endpoint with `type: "image"`

### `GET /api/detect/:request_id/status` (optional async path)
Output:
- `pending | done | failed`
- Result payload when done

---

## 6. Error Handling and Reliability

- `400`: invalid input
- `429`: rate limit exceeded
- `502/503`: provider error or timeout
- Fallback: switch to backup provider when available
- Never leak internal provider details in client-facing errors

---

## 7. Privacy and Compliance Baseline

- Delete input text/image immediately after inference and response.
- Keep only non-sensitive operational metadata (request ID, timing, status, error class).
- No long-term storage of raw user content in V1.

---

## 8. Testing Strategy (V1)

1. Unit tests
- Validation rules
- Explanation generation rules
- Provider adapter normalization

2. Integration tests
- Text happy path + failure path
- Image happy path + failure path

3. Contract tests
- Frontend/backend schema compatibility

4. Privacy verification
- Assert raw input cleanup post-processing

5. Load baseline
- Small concurrency test for latency/error budget

---

## 9. Delivery Milestones (Example 4-Week Plan)

1. Week 1
- Product wireframe
- API contract finalization
- Provider evaluation and selection

2. Week 2
- Text and image pipelines functional
- Frontend detect page and result rendering

3. Week 3
- Explanation layer
- Rate limiting, failure handling, privacy cleanup

4. Week 4
- Test hardening, monitoring, staged rollout, launch

---

## 10. Recommended V1 Approach

Use a hybrid evolution strategy:
- Launch quickly with third-party detection providers.
- Add a local explanation layer for better UX.
- Keep provider interface stable so in-house models can gradually replace external services.
