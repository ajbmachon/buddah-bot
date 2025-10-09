# 8) Backend Implementation Details

## Chat Route — `/api/chat` (Edge Runtime)

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
  const mode = process.env.BUDDHABOT_MODE || 'panel'
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

## Auth Routes — `/api/auth/[...nextauth]` (Node Runtime)

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
