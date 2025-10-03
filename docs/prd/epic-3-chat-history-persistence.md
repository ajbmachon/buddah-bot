# Epic 3: Chat History Persistence

## Epic Goal

Implement conversation history persistence using Vercel KV (Redis) so users can refresh the page or return later and see their previous messages, enabling continuity in spiritual guidance conversations across sessions.

## Epic Description

**Existing System Context:**
- Working authentication and chat streaming (Epics 1 & 2)
- Messages currently lost on page refresh
- Each conversation is ephemeral with no persistence

**Enhancement Details:**
- **What's being added:** Vercel KV database setup, chat storage utility library, message persistence after streaming, thread history loading on page mount, thread management API routes
- **How it integrates:** Extends existing `/api/chat` route to save messages, adds new API routes for thread retrieval, updates frontend to load and display history
- **Success criteria:** User sends messages, refreshes page, and sees complete conversation history restored

## Stories

### Story 3.1: Set Up Vercel KV Database and Install Package

**As a** developer,
**I want** to create a Vercel KV database and install the client package,
**so that** I can store and retrieve chat messages with minimal latency.

**Acceptance Criteria:**
1. Vercel KV database created via Vercel Dashboard:
   - Navigate to Project → Storage → Create Database → KV
   - Name: `buddahbot-kv`
   - Database created successfully
2. Environment variables automatically added to Vercel project:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
3. `@vercel/kv` package installed via npm/yarn/pnpm
4. Local development `.env.local` configured with KV credentials (copy from Vercel)
5. Connection test successful (can read/write to KV in development)

---

### Story 3.2: Create Chat Storage Utility Library

**As a** developer,
**I want** a utility library for chat storage operations,
**so that** I have consistent, type-safe functions for managing messages and threads.

**Acceptance Criteria:**
1. `lib/chat-storage.ts` file created with TypeScript interfaces:
   - `Message` interface (role, content, createdAt)
   - `Thread` interface (id, userId, title, createdAt, updatedAt)
2. Functions implemented:
   - `saveMessage(userId, threadId, message)` - appends message to thread
   - `getThreadMessages(userId, threadId)` - retrieves all messages
   - `getUserThreads(userId)` - lists all threads for user
   - `deleteThread(userId, threadId)` - removes thread and messages
   - `updateThreadMetadata(userId, threadId, lastMessage)` - updates thread info
   - `generateThreadTitle(message)` - creates title from first message
   - `generateThreadId()` - creates unique thread identifier
3. Redis key structure documented:
   - `user:{userId}:threads` - Set of thread IDs
   - `user:{userId}:thread:{threadId}:meta` - Thread metadata
   - `user:{userId}:thread:{threadId}:messages` - List of messages
4. TTL (Time To Live) set to 90 days for all keys
5. All functions include error handling
6. Code follows TypeScript best practices with proper types

---

### Story 3.3: Update Chat API to Save Messages After Streaming

**As a** system,
**I want** to persist user and assistant messages after streaming completes,
**so that** conversations are stored for future retrieval.

**Acceptance Criteria:**
1. `/api/chat/route.ts` updated to accept `threadId` in request body
2. Request validation includes `threadId` check (400 error if missing)
3. Streaming response modified to capture complete assistant message
4. After stream completion, both messages saved:
   - User message saved with `role: 'user'`
   - Assistant message saved with `role: 'assistant'`
   - Both include `createdAt` ISO timestamps
5. Storage failures logged but don't fail the streaming response
6. Thread metadata updated with latest message for title generation
7. Edge runtime compatibility maintained (no Node.js-only APIs)

---

### Story 3.4: Update Frontend to Load and Restore Thread History

**As a** user,
**I want** my conversation history to load when I return to a thread,
**so that** I can continue where I left off without losing context.

**Acceptance Criteria:**
1. Frontend generates or retrieves `threadId` on page mount:
   - Check URL query parameter `?threadId=...`
   - If missing, generate new thread ID and update URL
   - If present, use existing thread ID
2. `threadId` passed to `useAssistant` hook in `body` parameter
3. On mount, fetch thread history from `/api/threads/[threadId]`
4. `initialMessages` populated with loaded history
5. Assistance UI displays full conversation history
6. New messages append to existing thread
7. URL updates without page reload when thread ID changes
8. Loading state displayed while fetching history
9. Empty threads (new conversations) start with empty message list

---

### Story 3.5: Create Thread History API Route

**As a** developer,
**I want** an API route to retrieve thread messages,
**so that** the frontend can load conversation history.

**Acceptance Criteria:**
1. `/api/threads/[threadId]/route.ts` created with Edge runtime
2. GET handler implemented accepting `threadId` from URL parameters
3. Session validation ensures user can only access their own threads
4. Messages retrieved using `getThreadMessages(userId, threadId)`
5. Response format: `{ messages: Message[] }`
6. Empty threads return `{ messages: [] }` (not 404)
7. Unauthorized requests return 401
8. Errors handled and logged appropriately

---

### Story 3.6: (Optional) Implement Thread List Page

**As a** user,
**I want** to see a list of all my previous conversations,
**so that** I can navigate back to earlier spiritual guidance sessions.

**Acceptance Criteria:**
1. `/threads/page.tsx` created with thread list UI
2. Page fetches user threads from `/api/threads` endpoint
3. Each thread displays:
   - Thread title (truncated first message)
   - Last updated timestamp (human-readable format)
4. Threads sorted by most recent first
5. Clicking a thread navigates to `/?threadId={id}`
6. "New Conversation" button creates fresh thread
7. Page protected by authentication middleware
8. `/api/threads/route.ts` GET endpoint implemented:
   - Retrieves threads using `getUserThreads(userId)`
   - Returns `{ threads: Thread[] }`
   - Session validated

---

### Story 3.7: Verify End-to-End Persistence in Production

**As a** user,
**I want** confidence that my conversations are reliably saved and restored,
**so that** I can trust the system to maintain continuity in my spiritual practice.

**Acceptance Criteria:**
1. Full persistence flow tested in production:
   - Send message → message saved to KV
   - Refresh page → history restored
   - Send another message → appends to existing thread
   - Navigate away and return → full history intact
2. Multiple threads per user working correctly
3. Thread list page displays all conversations (if implemented)
4. Performance verified:
   - History load time < 500ms
   - Message save doesn't block streaming response
5. TTL verified (keys expire after 90 days)
6. Error scenarios tested:
   - KV unavailable (graceful degradation - streaming still works)
   - Missing threadId (appropriate error message)
   - Unauthorized access attempt (403/401 response)

---

## Compatibility Requirements

- [ ] Vercel KV (Redis) compatibility
- [ ] Edge runtime for all API routes
- [ ] Vercel free tier limits (256MB storage, 10k commands/day)
- [ ] `@vercel/kv` package compatibility

## Risk Mitigation

**Primary Risk:** KV storage unavailable causing message loss

**Mitigation:**
- Message saving happens AFTER streaming completes (streaming never blocked)
- Storage failures logged but don't affect user experience
- Display warning banner if persistence fails
- Document KV free tier limits and monitoring approach

**Rollback Plan:**
- If KV issues persist, temporarily disable persistence (chat continues working)
- Can migrate to Vercel Postgres if KV limitations encountered
- Previous Epic 2 deployment remains functional (streaming works without persistence)

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Vercel KV database created and connected
- [ ] Messages persist across page refreshes in production
- [ ] Thread history loads correctly on mount
- [ ] Thread list page implemented (if Story 3.6 completed)
- [ ] Performance targets met (< 500ms history load)
- [ ] Error handling tested for all failure modes
- [ ] TTL verified (90-day expiration working)
- [ ] At least 3 users tested multi-session conversations successfully

---
