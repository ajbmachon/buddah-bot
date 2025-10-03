# PRD — BuddahBot: Spiritual Wisdom Chat App

> **Mission:** Provide friends and family easy access to a proven spiritual guidance prompt running on Hermes 4.
>
> **Scope:** Personal passion project. Simple MVP to test and learn. No over-engineering, no feature creep.

---

## 1) Product Summary

**What**: A lightweight chat application where authenticated users interact with **Hermes 4** (405B default, 70B optional) using a proven spiritual wisdom prompt. Three conversation modes support different use cases.

**Why**: The prompt works beautifully on Nous Portal, but it's too technical for non-technical friends/family. BuddahBot makes it accessible with simple login and clean chat interface.

**For whom**: Friends, family, and personal circle seeking spiritual guidance.

**Not commercial**: No monetization, no growth targets, no analytics dashboards. Just testing and sharing with trusted circle.

**Non-goals**: No RAG, no complex user management, no billing, no custom UI components. Keep it simple.

---

## 2) Success Criteria

**Functional:**
- User can sign in (Google or Email) and reach chat within 2 clicks
- Streaming responses with <2s time-to-first-token
- Mode selection works reliably (3 modes documented below)
- Panel format produces multi-voice responses as expected

**Reliability:**
- 99%+ successful request completion
- Streaming starts within 25s (Edge limit), completes within 300s
- Graceful error handling with user-friendly messages

**Security:**
- Secrets in Vercel env only
- Access control enforced; unauthenticated users blocked
- No PII persisted beyond auth session

**Quality:**
- Responses match the quality proven in direct Nous Portal testing
- UI is clean and distraction-free
- Basic Vercel logs for monitoring

---

## 3) Three Conversation Modes

### Mode 1: Default Panel (Out of the Box)

Uses the following system prompt **EXACTLY AS PROVIDED** (dev agent: do NOT modify this):

```
We are in a panel of experts situation where multiple spiritual advisors give answers to the questions people pose.
**Only 3 of them may speak in answer to a question!**

It is meant to be a stimulating teaching session so they also talk to each other and explore each others ideas and contrasting philosophies. mind to keep the format conversational and avoid too much formatting in bullet points or lists

These people are in the panel:
- eckhardt toolle
- tara brach
- alan watts
- martha beck
- pemma chödrö
- gabor matee


# Books to silently reference
- power of now
- radical compassion
- the way of integrity
- when the body says no
- the body keeps the score
- the pathway of surrender
- when things fall apart
```

**Implementation:** This is the default system prompt when no mode is explicitly selected.

**⚠️ TODO - Hybrid Reasoning Mode Enhancement:**
Hermes 4 supports a **hybrid reasoning mode** that may enhance response quality. Research needed to determine if this should be layered with the panel prompt.

**Hybrid Reasoning System Prompt (from Nous Research):**
```
You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <thinking> tags, and then provide your solution or response to the problem.
```

**Questions to resolve:**
1. Can hybrid reasoning be combined with panel format? (e.g., prepend to panel prompt)
2. Does `<thinking>` tag output interfere with conversational panel format?
3. Should this be enabled by default or as Mode 4?
4. Does it match the quality observed in user's Nous Portal testing?

**Source:** https://portal.nousresearch.com/models (Hermes 4 model card)
**Action:** Test in implementation and compare against original Nous Portal experience

### Mode 2: Custom Panel

At conversation start, user is asked: "Who would you like on your panel today?"

**Implementation:**
- Dynamically construct system prompt based on user input
- Maintain same panel format structure (3 speakers, conversational, etc.)
- Could be a simple text input or selection from expanded list of teachers

**MVP Decision:** Ship Mode 1 first. Add Mode 2 in iteration 1 if needed.

### Mode 3: General Wisdom (No Panel Structure)

Direct spiritual guidance drawing from same influences but without panel dialogue format.

**Implementation:**
- Use simplified system prompt that references same teachers/books
- Single voice instead of multi-voice dialogue
- More intimate, direct guidance tone

**MVP Decision:** Ship Mode 1 first. Add Mode 3 in iteration 1 if needed.

---

## 4) High-Level Architecture

**Frontend:**
- Next.js (App Router)
- **Assistance UI** (`@assistant-ui/react`) - provides everything out of the box:
  - Thread and message rendering
  - Composer with voice/text input
  - Regenerate/edit functionality
  - File sharing capability
  - Markdown rendering
  - Mobile responsive

**Backend:**
- **Chat route** (`/api/chat`): **Edge runtime** for streaming
  - Validates session
  - Selects system prompt based on mode
  - Proxies to Nous Portal API
  - Streams responses back to client

- **Auth routes**: **Node runtime** (Auth.js/NextAuth)
  - Google OAuth provider
  - Email provider (magic link or credentials with verification)
  - JWT-based sessions (no database required for OAuth)

**Hosting:** Vercel
- Edge Functions for chat (low latency, global)
- Node Functions for auth
- Automatic scaling, zero DevOps

**Model Integration:**
- Hermes 4 via **Nous Portal API** (first-party)
- Default: `Hermes-4-405B`
- Optional: `Hermes-4-70B` (env-switchable)
- OpenAI-compatible chat/completions endpoint
- 128k context window

**Data Flow:**
1. User authenticates via Google OAuth or Email
2. Client posts messages to `/api/chat` (Edge)
3. Edge handler injects appropriate system prompt
4. Forwards to Nous Portal API with bearer auth
5. Streams tokens back via SSE to Assistance UI

---

## 5) Authentication (Simple & Flexible)

**Primary: Google OAuth**

Fast, zero friction, no password handling.

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Secondary: Email**

Option A - **Magic Link** (recommended):
- User enters email → receives verification link
- Click link → signed in
- No passwords, no database

```env
EMAIL_FROM=buddahbot@yourdomain.com
RESEND_API_KEY=...  # or SMTP config
```

Option B - **Email + Password with Verification**:
- User signs up with email/password
- Receive verification email
- Click to verify → can sign in
- Requires database (Postgres + Prisma)

**MVP Decision:** Google OAuth + Email Magic Link. No passwords unless explicitly needed.

**Session Strategy:** JWT (no database needed)

---

## 6) Configuration & Environment Variables

```bash
# Nous API
NOUS_API_KEY=...
NOUS_API_BASE_URL=https://api.nousresearch.com  # verify from Nous Portal docs
HERMES_MODEL=Hermes-4-405B  # or Hermes-4-70B

# Mode Selection (MVP)
BUDDAHBOT_MODE=panel  # default | custom | wisdom

# Auth - Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Auth - Email Magic Link
EMAIL_FROM=buddahbot@yourdomain.com
RESEND_API_KEY=...

# NextAuth
NEXTAUTH_URL=https://buddahbot.yourdomain.com
NEXTAUTH_SECRET=...  # generate with: openssl rand -base64 32

# App
NODE_ENV=production
```

All secrets in Vercel Project Settings → Environment Variables. Never commit to git.

---

## 7) User Experience Flow

**Landing Page (Unauthenticated):**
- Clean, minimal design
- BuddahBot branding
- Two sign-in options:
  - "Sign in with Google" (primary CTA)
  - "Sign in with Email" (secondary)

**Auth Flow:**
- **Google:** OAuth consent → redirect back → session created → chat
- **Email:** Enter email → "Check your inbox" → click link → session created → chat

**Chat Interface:**
- Single thread view (Assistance UI default)
- Message composer at bottom (supports text + voice)
- Streaming responses render naturally
- Regenerate/edit controls built-in
- Clean, spacious layout

**Profile/Settings (Minimal):**
- Sign out button
- Optional: Display current mode
- Optional: Mode selector (future iteration)

**UI/Aesthetic Suggestions:**
- Calm color palette (earth tones, soft neutrals)
- Generous whitespace (breathing room)
- Clean typography (readable, not cluttered)
- Minimal distractions (no badges, notifications, gamification)
- Loading states should feel calm, not anxious

---

## 8) Backend Implementation Details

### Chat Route — `/api/chat` (Edge Runtime)

**File:** `app/api/chat/route.ts`

**Responsibilities:**
1. Validate session (reject if unauthenticated)
2. Get mode from env or session
3. Load appropriate system prompt (EXACT text, no modifications)
4. Transform Assistance UI messages to Nous API format
5. Stream from Nous Portal API back to client

**Pseudocode:**
```typescript
export const runtime = 'edge'

export async function POST(req: Request) {
  // Auth check
  const session = await getSession(req)
  if (!session) return new Response('Unauthorized', { status: 401 })

  // Get messages from Assistance UI
  const { messages } = await req.json()

  // Get system prompt based on mode
  const mode = process.env.BUDDAHBOT_MODE || 'panel'
  const systemPrompt = getSystemPromptForMode(mode)  // Returns EXACT prompt text

  // Build request for Nous API
  const payload = {
    model: process.env.HERMES_MODEL || 'Hermes-4-405B',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true
  }

  // Call Nous Portal API
  const response = await fetch(`${process.env.NOUS_API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOUS_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  // Stream to client (Assistance UI expects SSE format)
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

**Error Handling:**
- Map upstream errors to user-friendly messages
- Timeout at 290s with retry message
- Include request ID for debugging
- Log errors to Vercel

**CRITICAL:** The system prompt text is used **EXACTLY AS PROVIDED**. The dev agent should NOT modify, improve, or rewrite any part of the prompt.

### Auth Routes — `/api/auth/[...nextauth]` (Node Runtime)

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      from: process.env.EMAIL_FROM
    })
  ],
  session: {
    strategy: 'jwt'  // No database needed
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Middleware to protect routes:**
```typescript
// middleware.ts
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/', '/chat']
}
```

---

## 9) Frontend Implementation

**Main Chat Page:**
```tsx
// app/page.tsx
'use client'

import { useAssistant } from '@assistant-ui/react'
import { AssistantRuntimeProvider, Thread } from '@assistant-ui/react'

export default function ChatPage() {
  const runtime = useAssistant({
    api: '/api/chat'
  })

  return (
    <main className="h-screen">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>
    </main>
  )
}
```

**That's it.** Assistance UI handles everything else.

**Login Page:**
```tsx
// app/login/page.tsx
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="login-container">
      <h1>BuddahBot</h1>
      <button onClick={() => signIn('google')}>
        Sign in with Google
      </button>
      <button onClick={() => signIn('email')}>
        Sign in with Email
      </button>
    </div>
  )
}
```

---

## 10) Chat History Persistence with Vercel KV

**Update:** Conversation history is now part of MVP scope. Users need to see their previous messages on page refresh.

**Solution:** Vercel KV (Redis) - simplest, fastest option for MVP.

### Why Vercel KV?

- ✅ 2-minute setup (Vercel Dashboard → Storage → Create KV)
- ✅ No schema design or migrations needed
- ✅ Perfect for append-only chat logs
- ✅ Lowest latency (~20-50ms cold start)
- ✅ Free tier: 256MB, 10k commands/day (plenty for personal project scale)
- ✅ Edge runtime compatible
- ✅ Can migrate to Postgres later if complex queries needed

**Alternative considered:** Vercel Postgres (more robust, requires schema design) - save for later if you need structured queries.

### Setup Instructions

**Step 1: Create KV Database (2 minutes)**
```bash
# In Vercel Dashboard:
# 1. Go to your project → Storage tab
# 2. Click "Create Database" → Select "KV"
# 3. Name it "buddahbot-kv"
# 4. Click "Create"
# 5. Environment variables are automatically added to your project
```

**Step 2: Install Package**
```bash
npm install @vercel/kv
```

**Step 3: Create Storage Utility**

Create `lib/chat-storage.ts`:

```typescript
import { kv } from '@vercel/kv'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string  // ISO string
}

export interface Thread {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

/**
 * Save a message to a thread
 */
export async function saveMessage(
  userId: string,
  threadId: string,
  message: Message
): Promise<void> {
  const key = `user:${userId}:thread:${threadId}:messages`
  await kv.rpush(key, JSON.stringify(message))

  // Auto-cleanup after 90 days
  await kv.expire(key, 60 * 60 * 24 * 90)

  // Update thread metadata
  await updateThreadMetadata(userId, threadId, message)
}

/**
 * Get all messages for a thread
 */
export async function getThreadMessages(
  userId: string,
  threadId: string
): Promise<Message[]> {
  const key = `user:${userId}:thread:${threadId}:messages`
  const messages = await kv.lrange<string>(key, 0, -1)

  if (!messages || messages.length === 0) {
    return []
  }

  return messages.map(m => JSON.parse(m))
}

/**
 * Update thread metadata (title, last updated time)
 */
async function updateThreadMetadata(
  userId: string,
  threadId: string,
  lastMessage: Message
): Promise<void> {
  const metaKey = `user:${userId}:thread:${threadId}:meta`
  const existing = await kv.get<Thread>(metaKey)

  const metadata: Thread = {
    id: threadId,
    userId,
    title: existing?.title || generateThreadTitle(lastMessage),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  await kv.set(metaKey, metadata)
  await kv.expire(metaKey, 60 * 60 * 24 * 90) // 90 days

  // Add to user's thread list
  const listKey = `user:${userId}:threads`
  await kv.sadd(listKey, threadId)
  await kv.expire(listKey, 60 * 60 * 24 * 90)
}

/**
 * Get all threads for a user
 */
export async function getUserThreads(userId: string): Promise<Thread[]> {
  const listKey = `user:${userId}:threads`
  const threadIds = await kv.smembers<string>(listKey)

  if (!threadIds || threadIds.length === 0) {
    return []
  }

  const threads: Thread[] = []
  for (const threadId of threadIds) {
    const metaKey = `user:${userId}:thread:${threadId}:meta`
    const meta = await kv.get<Thread>(metaKey)
    if (meta) {
      threads.push(meta)
    }
  }

  // Sort by most recent
  return threads.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

/**
 * Delete a thread (all messages + metadata)
 */
export async function deleteThread(
  userId: string,
  threadId: string
): Promise<void> {
  const messagesKey = `user:${userId}:thread:${threadId}:messages`
  const metaKey = `user:${userId}:thread:${threadId}:meta`
  const listKey = `user:${userId}:threads`

  await kv.del(messagesKey)
  await kv.del(metaKey)
  await kv.srem(listKey, threadId)
}

/**
 * Generate thread title from first message
 */
function generateThreadTitle(message: Message): string {
  const content = message.content.trim()
  if (content.length <= 50) {
    return content
  }
  return content.substring(0, 47) + '...'
}

/**
 * Generate a new thread ID
 */
export function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
```

### Step 4: Update Chat API Route

Modify `app/api/chat/route.ts` to save messages:

```typescript
import { saveMessage, getThreadMessages } from '@/lib/chat-storage'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'edge'

export async function POST(req: Request) {
  // Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get messages and threadId from request
  const { messages, threadId } = await req.json()

  // Validate threadId exists
  if (!threadId) {
    return new Response('threadId required', { status: 400 })
  }

  // Get system prompt
  const mode = process.env.BUDDAHBOT_MODE || 'panel'
  const systemPrompt = getSystemPromptForMode(mode)

  // Build request for Nous API
  const payload = {
    model: process.env.HERMES_MODEL || 'Hermes-4-405B',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true
  }

  // Call Nous Portal API
  const response = await fetch(
    `${process.env.NOUS_API_BASE_URL}/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOUS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  )

  if (!response.ok) {
    return new Response('AI service error', { status: response.status })
  }

  // Stream response and capture assistant message
  let assistantMessage = ''
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              assistantMessage += content
              controller.enqueue(value)
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      controller.close()

      // Save messages after stream completes
      try {
        // Save user message
        const userMessage = messages[messages.length - 1]
        await saveMessage(session.user.id, threadId, {
          role: 'user',
          content: userMessage.content,
          createdAt: new Date().toISOString()
        })

        // Save assistant message
        await saveMessage(session.user.id, threadId, {
          role: 'assistant',
          content: assistantMessage,
          createdAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to save messages:', error)
        // Don't fail the request if storage fails
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

### Step 5: Update Frontend to Load History

Modify `app/page.tsx` to load thread history:

```tsx
'use client'

import { useAssistant } from '@assistant-ui/react'
import { AssistantRuntimeProvider, Thread } from '@assistant-ui/react'
import { useEffect, useState } from 'react'
import { generateThreadId } from '@/lib/chat-storage'

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string>('')
  const [initialMessages, setInitialMessages] = useState([])

  // Load or create thread on mount
  useEffect(() => {
    const loadThread = async () => {
      // Check if threadId in URL
      const params = new URLSearchParams(window.location.search)
      let currentThreadId = params.get('threadId')

      if (!currentThreadId) {
        // Create new thread
        currentThreadId = generateThreadId()
        window.history.replaceState({}, '', `?threadId=${currentThreadId}`)
      }

      setThreadId(currentThreadId)

      // Load message history
      const response = await fetch(`/api/threads/${currentThreadId}`)
      if (response.ok) {
        const { messages } = await response.json()
        setInitialMessages(messages || [])
      }
    }

    loadThread()
  }, [])

  const runtime = useAssistant({
    api: '/api/chat',
    body: { threadId }, // Pass threadId to API
    initialMessages
  })

  if (!threadId) {
    return <div>Loading...</div>
  }

  return (
    <main className="h-screen">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>
    </main>
  )
}
```

### Step 6: Create Thread History API Route

Create `app/api/threads/[threadId]/route.ts`:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getThreadMessages } from '@/lib/chat-storage'

export const runtime = 'edge'

export async function GET(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { threadId } = params
  const messages = await getThreadMessages(session.user.id, threadId)

  return Response.json({ messages })
}
```

### Step 7: (Optional) Thread List Page

Create `app/threads/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Thread {
  id: string
  title: string
  updatedAt: string
}

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([])

  useEffect(() => {
    fetch('/api/threads')
      .then(res => res.json())
      .then(data => setThreads(data.threads))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Conversations</h1>
      <div className="space-y-2">
        {threads.map(thread => (
          <Link
            key={thread.id}
            href={`/?threadId=${thread.id}`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <div className="font-medium">{thread.title}</div>
            <div className="text-sm text-gray-500">
              {new Date(thread.updatedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
      <Link href="/" className="mt-4 inline-block text-blue-600">
        + New Conversation
      </Link>
    </div>
  )
}
```

Create `app/api/threads/route.ts`:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserThreads } from '@/lib/chat-storage'

export const runtime = 'edge'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const threads = await getUserThreads(session.user.id)
  return Response.json({ threads })
}
```

### Environment Variables

No additional env vars needed! Vercel KV credentials are auto-injected when you create the database.

If deploying outside Vercel or want explicit configuration:

```bash
# Added automatically by Vercel when you create KV database:
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

### Data Model Summary

**Keys Structure:**
```
user:{userId}:threads                           # Set of thread IDs
user:{userId}:thread:{threadId}:meta            # Thread metadata (title, dates)
user:{userId}:thread:{threadId}:messages        # List of messages
```

**TTL:** All keys expire after 90 days (configurable in code)

### Testing Checklist

- [ ] Create KV database in Vercel
- [ ] Install `@vercel/kv`
- [ ] Create `lib/chat-storage.ts` with functions above
- [ ] Update `/api/chat` to save messages
- [ ] Update frontend to load thread history
- [ ] Create `/api/threads/[threadId]` route
- [ ] Test: Send message → refresh page → see history
- [ ] Test: Create new thread → see in thread list
- [ ] Verify TTL works (check keys expire after 90 days)

### Migration to Postgres (Future)

If you later need complex queries (search, analytics), migration path:

1. Create Vercel Postgres database
2. Define schema with Drizzle
3. Export KV data → import to Postgres
4. Update `chat-storage.ts` to use Postgres queries
5. Keep same interface - no frontend changes needed

**Estimated migration time:** 2-3 hours

---

## 11) Validation Checklist

**Auth:**
- [ ] Google OAuth works end-to-end
- [ ] Email magic link works (if implemented)
- [ ] Session persists across refreshes
- [ ] Unauthenticated users redirected to login
- [ ] Sign out works

**Chat:**
- [ ] Message sent → streaming response appears
- [ ] Panel prompt produces 3-voice responses as expected
- [ ] Responses match quality from direct Nous Portal testing
- [ ] Regenerate works
- [ ] Edit works
- [ ] Voice input works (Assistance UI feature)

**Chat History:**
- [ ] Messages persist after page refresh
- [ ] Thread ID generated and stored in URL
- [ ] Loading existing thread shows previous messages
- [ ] New thread creates unique ID
- [ ] Thread list displays all user conversations (if implemented)
- [ ] Thread titles auto-generated from first message
- [ ] TTL set correctly (90 days)

**Modes:**
- [ ] Default panel mode active by default
- [ ] Changing BUDDAHBOT_MODE env var switches prompt
- [ ] (Future) Custom panel and wisdom modes work

**Deployment:**
- [ ] Deploy to Vercel succeeds
- [ ] Env vars set correctly (dev/prod)
- [ ] Edge function streaming works
- [ ] No errors in Vercel logs

**Quality:**
- [ ] UI is clean and distraction-free
- [ ] Mobile responsive
- [ ] Error messages are user-friendly
- [ ] Loading states feel calm

---

## 11) Observability (Keep It Simple)

**MVP: Vercel Built-in Only**
- Function logs
- Error tracking
- Basic metrics (request count, latency)

**Access logs:** Vercel dashboard → Project → Logs

**No additional tools for MVP.** Add Sentry or analytics only if needed later.

---

## 12) Implementation Milestones

**M0: Foundation (Day 1)**
- Init Next.js project
- Install Assistance UI
- Set up Auth.js with Google + Email providers
- Deploy to Vercel (confirm auth works)

**M1: Chat Streaming (Day 1-2)**
- Implement `/api/chat` Edge route
- Integrate Nous Portal API
- Add default panel system prompt (EXACT text from Section 3)
- Test: login → send message → receive streaming panel response

**M2: Chat History Persistence (Day 2)**
- Create Vercel KV database
- Install `@vercel/kv`
- Implement `lib/chat-storage.ts` utility functions
- Update `/api/chat` to save messages after streaming
- Update frontend to load thread history
- Create `/api/threads/[threadId]` route
- Test: send message → refresh → see history persisted

**M3: Polish & Launch (Day 2-3)**
- Add minimal branding/styling
- Implement thread list page (optional)
- Test error states
- Validate all checklist items
- Invite first users

**Future Iterations:**
- Custom panel mode (if desired)
- General wisdom mode (if desired)
- Mode selection UI
- Migration to Postgres (if complex queries needed)

---

## 13) Design Philosophy

**Ship Fast, Learn Fast:**
- Start with Mode 1 only
- Add Google OAuth first (Email optional)
- Use Assistance UI defaults (no custom UI)
- Deploy early, iterate based on real use

**Constraints as Features:**
- No user management UI → manual account handling keeps it simple
- No analytics → trust your intuition and user feedback
- No monetization → freedom to experiment

**Quality Over Features:**
- Perfect the panel prompt experience first
- Add other modes only if users want them
- Keep UI minimal and distraction-free

---

## 14) Source Links (For Developers)

**Nous Research:**
- API Docs: https://portal.nousresearch.com/api-docs
- Models: https://portal.nousresearch.com/models
- Hermes 4 Overview: https://hermes4.nousresearch.com/
- HuggingFace:
  - https://huggingface.co/NousResearch/Hermes-4-70B
  - https://huggingface.co/NousResearch/Hermes-4-14B

**Assistance UI:**
- Docs: https://www.assistant-ui.com/docs/getting-started
- GitHub: https://github.com/assistant-ui/assistant-ui
- NPM: https://www.npmjs.com/package/@assistant-ui/react

**Vercel/Next.js:**
- Edge Runtime: https://vercel.com/docs/functions/runtimes/edge
- Next.js Edge: https://nextjs.org/docs/app/api-reference/edge
- Vercel Functions: https://vercel.com/docs/functions

**Auth.js:**
- Installation: https://authjs.dev/getting-started/installation
- Next.js Guide: https://authjs.dev/reference/nextjs
- Google Provider: https://next-auth.js.org/providers/google
- Email Provider: https://next-auth.js.org/providers/email
- Magic Links with Resend: https://authjs.dev/guides/configuring-resend

---

## 15) Critical Implementation Notes for Dev Agent

**DO NOT modify the system prompts:**
- Use the exact text provided in Section 3
- Do not rewrite, improve, or add instructions
- Do not add behaviors not specified
- The prompts have been tested and proven to work

**Keep it simple:**
- Use Assistance UI defaults (no custom components unless required)
- Start with Google OAuth only (Email optional)
- Ship Mode 1 first (panel mode)
- No over-engineering

**Focus areas:**
- Get streaming working smoothly
- Ensure auth is secure and simple
- Keep UI clean and minimal
- Error handling should be graceful

---

**End of PRD.**
