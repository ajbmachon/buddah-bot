# Data Models

## Overview

BuddahBot uses **minimal persistence**:
- **Session data:** JWT tokens (Auth.js, no database)
- **Chat history:** Vercel KV (Redis) for message persistence
- **Temporary state:** Client-side (Assistance UI runtime)

---

## 1. User (Auth Session)

**Storage:** JWT token (httpOnly cookie)

**Managed by:** Auth.js

**Structure:**
```typescript
interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface Session {
  user: User;
  expires: string; // ISO 8601
}
```

**Lifespan:** 30 days (configurable in Auth.js)

---

## 2. ChatMessage (Runtime)

**Storage:** Client memory + Vercel KV

**Structure:**
```typescript
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: string; // ISO 8601
}
```

**Usage:**
- **Client:** Assistance UI manages in-memory thread
- **Server:** Full thread sent with each request (stateless API)
- **Persistence:** Saved to Vercel KV after streaming completes

---

## 3. Thread (Chat History)

**Storage:** Vercel KV (Redis)

**Structure:**
```typescript
interface Thread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
```

**Key pattern:**
```
user:{userId}:threads              → Set of thread IDs
user:{userId}:thread:{threadId}:meta     → Thread metadata
user:{userId}:thread:{threadId}:messages → List of messages
```

**TTL:** 90 days auto-expiry

---

## 4. NousAPIRequest

**Transient data structure** (not persisted)

```typescript
interface NousAPIRequest {
  model: "Hermes-4-405B" | "Hermes-4-70B";
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
  stream: boolean;
}
```

**Usage:** Constructed in `/api/chat`, sent to Nous API, discarded

---

## 5. NousAPIResponse (Streaming)

**Transient data structure** (not persisted)

```typescript
interface NousStreamChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: [{
    index: number;
    delta: {
      role?: "assistant";
      content?: string;
    };
    finish_reason: string | null;
  }];
}
```

**Usage:** Streamed from Nous API, proxied to client, content extracted for persistence

---

## Data Flow Summary

```mermaid
graph LR
    Client[Client] -->|Send messages| API[/api/chat]
    API -->|Validate| Session[JWT Session]
    API -->|Proxy| Nous[Nous API]
    Nous -->|Stream| API
    API -->|Stream| Client
    API -->|Save| KV[Vercel KV]
    Client -->|Load history| API2[/api/threads]
    API2 -->|Fetch| KV
```

**Key points:**
- No database needed for MVP
- Vercel KV handles chat history (simple Redis key-value)
- JWT sessions mean no user database
- Full conversation context sent each request (stateless API)

---

## Persistence Implementation

**See PRD Section 10** for complete Vercel KV setup:
- `saveMessage()` - Store message after streaming
- `getThreadMessages()` - Load thread history
- `getUserThreads()` - List all user conversations
- `deleteThread()` - Remove conversation

**Setup time:** 2 minutes (Vercel Dashboard → Create KV)

---

## Future: Migration to Postgres

**Consider migrating when:**
- Need complex queries (search across conversations)
- Want analytics on message patterns
- Require structured relationships

**Current approach is sufficient for MVP.** Keep it simple.
