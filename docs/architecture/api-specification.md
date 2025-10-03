# API Specification

## REST API: `/api/chat` (OpenAI-Compatible Streaming)

**Base URL:** `https://buddahbot.yourdomain.com/api`

**Endpoint:** `POST /chat`

**Runtime:** Vercel Edge (25s timeout)

**Authentication:** Required (JWT session cookie)

---

### Request Format

**Headers:**
```
Content-Type: application/json
Cookie: authjs.session-token=<jwt_token>
```

**Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the nature of suffering?"
    }
  ]
}
```

**Schema (Zod):**
```typescript
const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(2000)
    })
  ).max(20)
});
```

---

### Response Format (SSE Streaming)

**Headers:**
```
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
```

**Stream Format:**
```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1696789012,"model":"Hermes-4-405B","choices":[{"index":0,"delta":{"role":"assistant","content":"**Eckhart"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1696789012,"model":"Hermes-4-405B","choices":[{"index":0,"delta":{"content":" Tolle:**"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1696789012,"model":"Hermes-4-405B","choices":[{"index":0,"delta":{"content":" Suffering"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1696789012,"model":"Hermes-4-405B","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

---

### Error Responses

**401 Unauthorized:**
```json
{
  "error": {
    "code": "unauthorized",
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

**422 Validation Error:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request format",
    "statusCode": 422,
    "details": [
      {
        "path": ["messages", 0, "content"],
        "message": "String must contain at least 1 character"
      }
    ]
  }
}
```

**429 Rate Limit:**
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "statusCode": 429
  }
}
```

**500 Internal Error:**
```json
{
  "error": {
    "code": "internal_error",
    "message": "An unexpected error occurred",
    "statusCode": 500
  }
}
```

**504 Timeout:**
```json
{
  "error": {
    "code": "timeout",
    "message": "Request timed out after 25 seconds",
    "statusCode": 504
  }
}
```

---

### Implementation Notes

- **System Prompt Injection:** Server injects panel prompt before forwarding to Nous API
- **Mode Selection:** Read from `process.env.BUDDAHBOT_MODE` (MVP: always "panel")
- **Streaming:** Pass-through Nous API SSE stream (OpenAI-compatible)
- **Error Mapping:** Transform Nous API errors to standardized format
- **Timeout Handling:** Edge runtime 25s limit with heartbeat keepalive
