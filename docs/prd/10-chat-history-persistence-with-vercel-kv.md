# 10) Chat History Persistence with Vercel KV

**Update:** Conversation history is now part of MVP scope. Users need to see their previous messages on page refresh.

**Solution:** Vercel KV (Redis) - simplest, fastest option for MVP.

## Why Vercel KV?

- ✅ 2-minute setup (Vercel Dashboard → Storage → Create KV)
- ✅ No schema design or migrations needed
- ✅ Perfect for append-only chat logs
- ✅ Lowest latency (~20-50ms cold start)
- ✅ Free tier: 256MB, 10k commands/day (plenty for personal project scale)
- ✅ Edge runtime compatible
- ✅ Can migrate to Postgres later if complex queries needed

**Alternative considered:** Vercel Postgres (more robust, requires schema design) - save for later if you need structured queries.

## Setup Instructions

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

## Step 4: Update Chat API Route

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

## Step 5: Update Frontend to Load History

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

## Step 6: Create Thread History API Route

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

## Step 7: (Optional) Thread List Page

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

## Environment Variables

No additional env vars needed! Vercel KV credentials are auto-injected when you create the database.

If deploying outside Vercel or want explicit configuration:

```bash
# Added automatically by Vercel when you create KV database:
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

## Data Model Summary

**Keys Structure:**
```
user:{userId}:threads                           # Set of thread IDs
user:{userId}:thread:{threadId}:meta            # Thread metadata (title, dates)
user:{userId}:thread:{threadId}:messages        # List of messages
```

**TTL:** All keys expire after 90 days (configurable in code)

## Testing Checklist

- [ ] Create KV database in Vercel
- [ ] Install `@vercel/kv`
- [ ] Create `lib/chat-storage.ts` with functions above
- [ ] Update `/api/chat` to save messages
- [ ] Update frontend to load thread history
- [ ] Create `/api/threads/[threadId]` route
- [ ] Test: Send message → refresh page → see history
- [ ] Test: Create new thread → see in thread list
- [ ] Verify TTL works (check keys expire after 90 days)

## Migration to Postgres (Future)

If you later need complex queries (search, analytics), migration path:

1. Create Vercel Postgres database
2. Define schema with Drizzle
3. Export KV data → import to Postgres
4. Update `chat-storage.ts` to use Postgres queries
5. Keep same interface - no frontend changes needed

**Estimated migration time:** 2-3 hours

---
