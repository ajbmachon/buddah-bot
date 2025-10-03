# Frontend Architecture

## Component Organization

Assistance UI provides pre-built chat components. We customize styling via Tailwind and add minimal custom components.

**Directory Structure:**
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── auth/
│       └── error/
│           └── page.tsx          # Auth error page
├── (chat)/
│   └── page.tsx                  # Main chat page (Assistance UI)
├── layout.tsx                    # Root layout (providers)
└── api/
    ├── chat/
    │   └── route.ts              # Edge streaming endpoint
    └── auth/[...nextauth]/
        └── route.ts              # Auth handler

components/
├── chat/
│   ├── Thread.tsx                # Thread wrapper (Assistance UI)
│   ├── Composer.tsx              # Message input (Assistance UI)
│   ├── UserMessage.tsx           # User message bubble
│   └── AssistantMessage.tsx      # AI message bubble
└── auth/
    └── SignInButtons.tsx         # Login buttons

lib/
├── auth.ts                       # Auth.js config
├── prompts.ts                    # System prompts
└── types.ts                      # Shared TypeScript types
```

---

## Component Templates

### Main Chat Page
```typescript
// app/(chat)/page.tsx
"use client";

import { useDataStreamRuntime } from "@assistant-ui/react-data-stream";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@/components/chat/Thread";

export default function ChatPage() {
  const runtime = useDataStreamRuntime({
    api: "/api/chat",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-screen bg-gray-50">
        <Thread />
      </main>
    </AssistantRuntimeProvider>
  );
}
```

### Thread Component
```typescript
// components/chat/Thread.tsx
"use client";

import { ThreadPrimitive } from "@assistant-ui/react";
import { Composer } from "./Composer";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

export function Thread() {
  return (
    <ThreadPrimitive.Root className="h-full flex flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
        <ThreadPrimitive.Empty>
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Ask a question to begin your spiritual wisdom conversation
            </p>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <Composer />
    </ThreadPrimitive.Root>
  );
}
```

### Composer Component
```typescript
// components/chat/Composer.tsx
"use client";

import { ComposerPrimitive } from "@assistant-ui/react";

export function Composer() {
  return (
    <ComposerPrimitive.Root className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <ComposerPrimitive.Input
          className="w-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask your question..."
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <ComposerPrimitive.Send className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Send
          </ComposerPrimitive.Send>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
}
```

### Message Components
```typescript
// components/chat/UserMessage.tsx
import { MessagePrimitive } from "@assistant-ui/react";

export function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end mb-4">
      <div className="bg-blue-600 text-white rounded-lg p-4 max-w-[80%]">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

// components/chat/AssistantMessage.tsx
export function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start mb-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[80%] prose prose-sm">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}
```

---

## State Management

**No external state management library needed.**

Assistance UI Runtime handles all chat state internally:
- Message history
- Streaming status
- Composer text
- Thread branching

**Access state (read-only):**
```typescript
import { useThread } from "@assistant-ui/react";

function ChatStatus() {
  const { messages, isRunning } = useThread();

  return (
    <div>
      <p>{messages.length} messages</p>
      <p>{isRunning ? "Streaming..." : "Ready"}</p>
    </div>
  );
}
```

**Perform actions:**
```typescript
import { useThreadRuntime } from "@assistant-ui/react";

function Controls() {
  const thread = useThreadRuntime();

  return (
    <button onClick={() => thread.cancelRun()}>
      Stop
    </button>
  );
}
```

**Auth session (React Context):**
```typescript
// app/layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

// components/UserProfile.tsx
"use client";

import { useSession } from "next-auth/react";

export function UserProfile() {
  const { data: session } = useSession();

  return <p>{session?.user?.name}</p>;
}
```

---

## Routing Architecture

Next.js 15 App Router with route groups for organization.

**Route Structure:**
```
app/
├── (auth)/            # Auth route group (shared layout)
│   ├── login/
│   │   └── page.tsx   # /login
│   └── auth/
│       └── error/
│           └── page.tsx # /auth/error
├── (chat)/            # Chat route group (protected)
│   └── page.tsx       # / (main chat)
└── layout.tsx         # Root layout (providers)
```

**Route Protection (Middleware):**
```typescript
// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

**Navigation (programmatic):**
```typescript
"use client";

import { useRouter } from "next/navigation";

function Navigation() {
  const router = useRouter();

  return (
    <button onClick={() => router.push("/")}>
      Chat
    </button>
  );
}
```

---

## Frontend Services Layer

**API Client (fetch wrapper):**
```typescript
// lib/api-client.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new APIError(
      error.error.message,
      response.status,
      error.error.code,
      error.error.details
    );
  }

  return response.json();
}
```

**Usage:**
```typescript
// Not needed for chat (Assistance UI handles)
// But useful for future features

import { apiRequest } from "@/lib/api-client";

async function saveSettings(settings: Settings) {
  return apiRequest("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}
```
