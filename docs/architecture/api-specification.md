# API Specification

## Single API Endpoint: `POST /api/chat`

**Purpose:** Proxy streaming chat requests to Nous API with system prompt injection

**Runtime:** Vercel Edge (25s timeout)

**Authentication:** Required (session cookie)

---

## Request

**Headers:**
```
Content-Type: application/json
Cookie: authjs.session-token=<jwt>
```

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is the nature of suffering?" }
  ]
}
```

**Rules:**
- Max 20 messages per request
- Each message max 2000 characters
- Only `user` and `assistant` roles

---

## Response (Streaming)

**Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Stream format (OpenAI-compatible SSE):**
```
data: {"choices":[{"delta":{"role":"assistant","content":"**Eckhart"}}]}

data: {"choices":[{"delta":{"content":" Tolle:**"}}]}

data: {"choices":[{"delta":{"content":" Suffering"}}]}

data: {"choices":[{"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

**Client consumption:** Assistance UI handles this automatically.

---

## Errors

**401 Unauthorized:**
```json
{ "error": { "code": "unauthorized", "message": "Please sign in again" } }
```

**422 Validation Error:**
```json
{ "error": { "code": "validation_error", "message": "Please check your message" } }
```

**500 Service Error:**
```json
{ "error": { "code": "service_error", "message": "Something went wrong" } }
```

---

## Implementation Notes

**Server-side prompt injection:**
```typescript
const payload = {
  model: 'Hermes-4-405B',
  messages: [
    { role: 'system', content: getSystemPrompt('panel') },
    ...userMessages
  ],
  stream: true
};
```

**Key behaviors:**
- System prompt never exposed to client
- Full conversation context sent each request (stateless)
- Streaming piped directly (no buffering)
- Nous API errors mapped to standard format

---

## That's It

**This is an internal API** (not public). Formal OpenAPI specs are overkill for MVP.

See PRD Section 8 for full implementation example.
