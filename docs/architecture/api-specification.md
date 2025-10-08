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

## Endpoint 2: `GET /api/assistant-ui-token`

**Purpose:** Fetch AssistantCloud workspace token for authenticated user

**Runtime:** Vercel Node (serverless function)

**Authentication:** Required (session cookie)

---

## Request

**Headers:**
```
Cookie: authjs.session-token=<jwt>
```

**Body:** None (GET request)

---

## Response

**Success (200 OK):**
```json
{
  "token": "aui_workspace_abc123..."
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Failed to fetch workspace token"
}
```

---

## Implementation Notes

**Server-side token fetch:**
```typescript
import { auth } from '@/auth';

export const runtime = 'nodejs'; // Required for Auth.js

export async function GET() {
  // 1. Validate Auth.js session
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch AssistantCloud workspace token
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL}/workspaces`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ASSISTANT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.email, // Stable user identifier
        }),
      }
    );

    if (!response.ok) {
      throw new Error('AssistantCloud API error');
    }

    const { token } = await response.json();
    return Response.json({ token });
  } catch (error) {
    console.error('Failed to fetch workspace token:', error);
    return Response.json(
      { error: 'Failed to fetch workspace token' },
      { status: 500 }
    );
  }
}
```

**Key behaviors:**
- Uses `session.user.email` as stable user ID (never changes for Google account)
- `ASSISTANT_API_KEY` required (server-side only, not exposed to client)
- Token cached by AssistantCloud (subsequent calls fast)
- Client calls this endpoint on AssistantCloud initialization

---

## No Thread Management Endpoints Needed (Epic 3)

**AssistantCloud Integration:**
- Thread management handled client-side by Assistance UI
- `/api/assistant-ui-token` provides authentication token
- No custom `/api/threads` persistence routes needed
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
