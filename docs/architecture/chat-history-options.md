# Chat History Persistence - Architectural Options

**Decision Document for BuddahBot**
*Research Date: October 2025*

---

## The Decision

You need to add chat history persistence so users don't lose conversations on page refresh.

**Current State:** Stateless - no persistence, JWT sessions only
**Requirement:** Save chat messages per user, load on return

---

## Three Viable Paths

### Path 1: Vercel KV (Redis) - RECOMMENDED FOR MVP

**What it is:** Simple key-value store, perfect for append-only chat logs

**Setup:**
```bash
# Vercel Dashboard → Storage → Create KV
npm install @vercel/kv
# Done. 2 minutes.
```

**Implementation:**
```typescript
import { kv } from '@vercel/kv'

// Save message
await kv.rpush(`user:${userId}:thread:${threadId}`, JSON.stringify(message))

// Load messages
const messages = await kv.lrange(`user:${userId}:thread:${threadId}`, 0, -1)
```

**Pros:**
- ✅ Fastest setup (literally 2 minutes)
- ✅ No schema migrations or ORM complexity
- ✅ Lowest latency (~20-50ms cold start)
- ✅ Perfect for simple chat storage
- ✅ Free tier: 256MB, 10k commands/day (plenty for your scale)

**Cons:**
- ❌ No SQL queries (can't search across threads easily)
- ❌ No relational data (just key-value pairs)
- ❌ Limited to 256MB on free tier

**Best For:** MVP - get it working fast, iterate later

**Migration Path:** Can export to Postgres later if you need complex queries

---

### Path 2: Vercel Postgres (Neon) - ROBUST LONG-TERM

**What it is:** Real PostgreSQL database, structured data with relations

**Setup:**
```bash
# Vercel Dashboard → Storage → Create Postgres
npm install @neondatabase/serverless drizzle-orm drizzle-kit
# Define schema, run migrations. 10-15 minutes.
```

**Schema:**
```typescript
// drizzle schema
export const threads = pgTable('threads', {
  id: uuid('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow()
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey(),
  threadId: uuid('thread_id').references(() => threads.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow()
})
```

**Pros:**
- ✅ Structured data with foreign keys
- ✅ Can add complex queries later (search, analytics)
- ✅ Proper data integrity
- ✅ Free tier: 512MB (double KV)
- ✅ Auth.js adapter available

**Cons:**
- ❌ Schema design required upfront
- ❌ Migrations needed for changes
- ❌ More setup time (~10 mins vs 2 mins)
- ❌ Slightly higher cold start (~50-100ms vs 20-50ms)

**Best For:** If you know you'll need structured queries soon

**IMPORTANT:** Use Drizzle ORM, NOT Prisma (Prisma requires special Edge adapters, adds complexity)

---

### Path 3: Supabase - FULL BACKEND ALTERNATIVE

**What it is:** PostgreSQL + Auth + Storage + Real-time, all-in-one

**Setup:**
```bash
# Supabase Dashboard → New Project
npm install @supabase/supabase-js
# 10-15 minutes
```

**Pros:**
- ✅ Most generous free tier (500MB database + 1GB storage)
- ✅ Real-time subscriptions built-in
- ✅ Can replace Auth.js entirely (Supabase Auth)
- ✅ Row-level security (RLS)
- ✅ File storage included

**Cons:**
- ❌ Another service to manage (Vercel + Supabase)
- ❌ Real-time features likely overkill for MVP
- ❌ Adds vendor complexity

**Best For:** If you want all backend features in one place, or plan to use real-time chat updates

---

## Decision Matrix

| Criteria | Vercel KV | Vercel Postgres | Supabase |
|----------|-----------|-----------------|----------|
| **Setup Time** | 2 min | 10 min | 15 min |
| **Complexity** | Lowest | Medium | Medium |
| **Free Tier** | 256MB | 512MB | 500MB+1GB |
| **Query Power** | Basic | Full SQL | Full SQL |
| **Edge Latency** | ~30ms | ~70ms | ~150ms |
| **Migration Later** | Easy → Postgres | N/A | Locked in |
| **Fits MVP Philosophy** | ✅ Yes | Maybe | No (over-engineered) |

---

## Winston's Recommendation

**Start with Vercel KV.**

**Why:**
1. You can ship this in 30 minutes
2. Matches "no over-engineering" philosophy
3. Zero schema design needed
4. Fastest possible performance
5. Stays free at your scale forever
6. Easy to migrate to Postgres later if needed

**When to upgrade to Postgres:**
- You need to search across all messages
- You want analytics/reporting
- You need complex user management
- You're storing more than just chat logs

**Implementation Plan:**
1. Create Vercel KV database (2 mins)
2. Add save/load functions in `lib/chat-storage.ts` (15 mins)
3. Update `/api/chat` route to save on completion (10 mins)
4. Test: send message → refresh → see history (3 mins)
5. **Total: 30 minutes**

---

## Code Starter (Vercel KV)

```typescript
// lib/chat-storage.ts
import { kv } from '@vercel/kv'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}

export async function saveMessage(
  userId: string,
  threadId: string,
  message: Message
) {
  const key = `user:${userId}:thread:${threadId}`
  await kv.rpush(key, JSON.stringify(message))
  // Auto-cleanup after 90 days
  await kv.expire(key, 60 * 60 * 24 * 90)
}

export async function getThreadHistory(
  userId: string,
  threadId: string
): Promise<Message[]> {
  const key = `user:${userId}:thread:${threadId}`
  const messages = await kv.lrange<string>(key, 0, -1)
  return messages.map(m => JSON.parse(m))
}

export async function getThreadsList(userId: string): Promise<string[]> {
  const pattern = `user:${userId}:thread:*`
  const keys = await kv.keys(pattern)
  return keys.map(key => key.split(':')[3]) // Extract threadId
}

export async function deleteThread(userId: string, threadId: string) {
  const key = `user:${userId}:thread:${threadId}`
  await kv.del(key)
}
```

```typescript
// app/api/chat/route.ts (add this)
import { saveMessage } from '@/lib/chat-storage'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { messages, threadId } = await req.json()

  // ... existing chat logic ...

  // Save after streaming completes
  const assistantMessage = { role: 'assistant', content: responseText, createdAt: new Date() }
  await saveMessage(session.user.id, threadId, assistantMessage)

  return response
}
```

---

## Next Steps

1. **Approve approach:** Vercel KV for MVP, migrate to Postgres if needed later
2. **Implementation:** 30-minute task to add persistence
3. **Testing:** Verify messages persist across refresh
4. **Document:** Update architecture docs with chosen solution

**Question for you:** Do you want to start with KV (simple, fast) or jump straight to Postgres (more robust)?

---

*Winston, Architect Agent*
