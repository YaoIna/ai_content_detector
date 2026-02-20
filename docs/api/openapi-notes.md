# API Notes (V1)

These notes define current endpoint behavior and response shape.

## Health

- `GET /health`
- Response: `{ "status": "ok" }`

## Detect Text

- `POST /api/detect/text`
- Content-Type: `application/json`
- Request body:

```json
{ "text": "string (20..20000)" }
```

- Success response (200):

```json
{
  "type": "text",
  "ai_probability": 78,
  "confidence_band": "high",
  "explanations": ["可能依据：uniform phrasing"],
  "disclaimer": "检测结果仅供参考，不构成绝对判定。"
}
```

- Validation error (400):

```json
{ "error": "Invalid input" }
```

## Detect Image

- `POST /api/detect/image`
- Content-Type: `multipart/form-data`
- Form field: `image_file`

- Success response (200):

```json
{
  "type": "image",
  "ai_probability": 12,
  "confidence_band": "low",
  "explanations": ["可能依据：texture irregularity"],
  "disclaimer": "检测结果仅供参考，不构成绝对判定。"
}
```

- Validation error (400):

```json
{ "error": "Invalid input" }
```

## Rate Limiting

- Global limit is enforced at request hook level.
- Exceeded limit response (429):

```json
{
  "error": "RATE_LIMITED",
  "message": "Too many requests"
}
```
