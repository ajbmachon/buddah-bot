# Data Models

Since BuddahBot has **no database** in the MVP, this section focuses on **in-memory data structures and API contracts** rather than persistent models.

## 1. User (Auth Session)

**Purpose:** Represents authenticated user session (managed by Auth.js)

**Key Attributes:**
- `id`: string - Unique user identifier
- `email`: string | null - User email (from OAuth or magic link)
- `name`: string | null - Display name (from OAuth profile)
- `image`: string | null - Profile picture URL (from OAuth)

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface Session {
  user: User;
  expires: string; // ISO 8601 date string
}
```

**Relationships:** None (no persistent storage)

**Notes:**
- Stored as JWT token (client cookie)
- No database persistence required
- Auth.js handles serialization/deserialization

---

## 2. ChatMessage

**Purpose:** Represents a single message in the chat thread (used by Assistance UI and Nous API)

**Key Attributes:**
- `role`: "system" | "user" | "assistant" - Message sender type
- `content`: string - Message text content
- `id`: string (optional) - Client-side message ID for UI tracking

**TypeScript Interface:**
```typescript
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  id?: string; // Optional: used by Assistance UI for optimistic updates
}

interface ChatThread {
  messages: ChatMessage[];
}
```

**Relationships:**
- Messages form a conversation thread (array structure)
- System message (panel prompt) prepended server-side
- No persistence - thread exists only in client memory

**Notes:**
- Compatible with OpenAI chat completion format
- Assistance UI manages thread state in browser
- Server is stateless - receives full thread on each request

---

## 3. NousAPIRequest

**Purpose:** Request payload sent to Nous Portal API

**TypeScript Interface:**
```typescript
interface NousAPIRequest {
  model: "Hermes-4-405B" | "Hermes-4-70B";
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}
```

**Relationships:**
- Constructed in `/api/chat` Edge route
- Includes system prompt + user messages

---

## 4. NousAPIResponse (Streaming)

**Purpose:** Server-sent events (SSE) response from Nous API

**TypeScript Interface:**
```typescript
interface StreamChoice {
  index: number;
  delta: {
    role?: "assistant";
    content?: string;
  };
  finish_reason: string | null;
}

interface NousStreamChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: StreamChoice[];
}
```

**Relationships:**
- Streamed as SSE events (data: {...} format)
- Proxied through `/api/chat` to Assistance UI
- Final chunk has `finish_reason: "stop"`

---

## 5. ConversationMode

**Purpose:** Configuration for different conversation modes (Mode 1/2/3)

**TypeScript Interface:**
```typescript
type ModeType = "panel" | "custom" | "wisdom";

interface ConversationMode {
  mode: ModeType;
  systemPrompt: string;
  model: "Hermes-4-405B" | "Hermes-4-70B";
}

interface ModeConfig {
  default: ConversationMode;
  modes: Record<ModeType, ConversationMode>;
}
```

**Notes:**
- MVP uses only "panel" mode
- Mode 2/3 implementation deferred to iteration 1

---

## 6. APIError

**Purpose:** Standardized error format for API responses

**TypeScript Interface:**
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
  };
}
```

**Notes:**
- Used for both client-facing and internal errors
- Nous API errors are transformed to this format

---

## Data Flow Summary

```mermaid
graph LR
    Client[Client/Assistance UI] -->|ChatMessage[]| Edge[/api/chat Edge]
    Edge -->|Validate| Session[JWT Session]
    Edge -->|Build| Request[NousAPIRequest]
    Request -->|HTTP POST| Nous[Nous API]
    Nous -->|SSE Stream| Response[NousStreamChunk]
    Response -->|Proxy| Edge
    Edge -->|SSE Stream| Client
```

**Key Points:**
- **Type sharing:** All interfaces live in `lib/types.ts` (shared across frontend/backend)
- **Validation:** Use Zod schemas at API boundaries

**⚠️ ARCHITECTURE UPDATE REQUIRED:**
The current design has NO conversation persistence. User correction indicates **conversation history is required**.

**Recommended Changes:**
1. **Add Database:** Vercel Postgres or Supabase for conversation storage
2. **Update Data Models:** Add `Conversation` and persistent `Message` entities with user FK
3. **Modify `/api/chat`:** Save messages before/after streaming
4. **Update Assistance UI:** Load conversation history on mount
5. **Add Conversations List:** UI to view/resume past conversations

**Implementation Impact:** Medium complexity - requires database setup, schema migration, conversation CRUD APIs.

**Alternative (Simpler):** Use `localStorage` for client-side history (no server persistence, per-device only).

**Decision needed:** Server-side DB vs client-side `localStorage` for conversation history.
