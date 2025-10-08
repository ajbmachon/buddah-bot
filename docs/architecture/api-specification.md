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
  ],
  "threadId": "uuid-or-nanoid"
}
```

**Rules:**
- Max 20 messages per request
- Each message max 2000 characters
- Only `user` and `assistant` roles
- `threadId` required for persistence (Story 3.3)

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
- Full conversation context sent each request (stateless API)
- Streaming piped directly (no buffering)
- Messages saved to KV **after** streaming completes (Story 3.3)
- Nous API errors mapped to standard format

**Persistence flow:**
```typescript
// Handled automatically by AssistantCloud
// No manual persistence code in /api/chat route
// Messages save automatically after streaming via Assistance UI runtime
```

---

## No Additional Endpoints Needed (Epic 3)

**AssistantCloud Integration:**
- Thread management handled client-side by Assistance UI
- No custom `/api/threads` routes needed
- No manual message save/load endpoints
- Thread list populated via `<ThreadList />` component (queries AssistantCloud directly)

**Architecture:**
```
Client → AssistantCloud API (direct)
  ├── Thread creation
  ├── Message persistence
  ├── Thread retrieval
  └── Thread list
```

**Benefits:**
- Zero backend persistence code
- No additional API routes to maintain
- Built-in error handling and retry logic
- Automatic message batching and optimization

---

## That's It

**This is an internal API** (not public). Formal OpenAPI specs are overkill for MVP.

See PRD Epic 2 and Epic 3 for full implementation examples.
