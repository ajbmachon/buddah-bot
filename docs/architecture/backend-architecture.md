# Backend Architecture

## Service Architecture: Serverless (Vercel)

BuddahBot uses Vercel's serverless architecture with **dual runtime strategy**:
- **Edge Runtime:** Chat streaming (`/api/chat`)
- **Node Runtime:** Authentication (`/api/auth/*`)

---

## Edge Runtime: Chat Streaming

**File:** `app/api/chat/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { getSystemPrompt } from "@/lib/prompts";
import { z } from "zod";

export const runtime = "edge";
export const maxDuration = 25; // Vercel Edge limit

const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(2000),
    })
  ).max(20),
});

export async function POST(req: Request) {
  try {
    // 1. Validate session
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: { code: "unauthorized", message: "Authentication required", statusCode: 401 } }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const { messages } = ChatRequestSchema.parse(body);

    // 3. Get system prompt
    const mode = (process.env.BUDDAHBOT_MODE as any) || "panel";
    const systemPrompt = getSystemPrompt(mode);

    // 4. Build Nous API request
    const nousRequest = {
      model: process.env.HERMES_MODEL || "Hermes-4-405B",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    };

    // 5. Call Nous API
    const response = await fetch(`${process.env.NOUS_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nousRequest),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      return new Response(
        JSON.stringify({
          error: {
            code: "upstream_error",
            message: error.message || "Nous API error",
            statusCode: response.status
          }
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Stream response to client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: "Invalid request",
            statusCode: 422,
            details: error.errors
          }
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Chat route error:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "internal_error",
          message: "An unexpected error occurred",
          statusCode: 500
        }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

**Key Patterns:**
- **Session validation:** First action - fail fast if unauthorized
- **Input validation:** Zod schema prevents invalid data reaching Nous API
- **Error mapping:** Transform upstream errors to standard format
- **Direct streaming:** Pipe Nous response body to client (no buffering)
- **Timeout awareness:** 25s Edge limit, no explicit timeout handling needed (platform enforces)

---

## Node Runtime: Authentication

**File:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

**File:** `lib/auth.ts`

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Resend({
      from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
});
```

**Key Patterns:**
- **Centralized config:** Single source of truth in `lib/auth.ts`
- **JWT sessions:** No database required
- **Dual providers:** Google OAuth + Email magic links
- **httpOnly cookies:** Secure session storage

---

## Authentication Middleware

**File:** `middleware.ts`

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
```

**Execution:** Runs on Edge runtime (Auth.js v5 supports this)
