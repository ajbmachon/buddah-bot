# Frontend Architecture

## Component Organization

Assistance UI provides pre-built chat components via the CLI. This creates a framework-specific organization structure that we adopt for the MVP.

**Actual Directory Structure (CLI-generated):**
```
app/
├── (auth)/                      # Auth route group (future stories)
│   ├── login/
│   │   └── page.tsx             # Login page
│   └── auth/
│       └── error/
│           └── page.tsx         # Auth error page
├── page.tsx                     # Root page → renders Assistant component
├── assistant.tsx                # Main chat interface (Assistance UI runtime)
├── layout.tsx                   # Root layout (providers)
├── globals.css                  # Global styles
└── api/
    ├── chat/
    │   └── route.ts             # Edge streaming endpoint (AI SDK integration)
    └── auth/[...nextauth]/
        └── route.ts             # Auth handler

components/
├── assistant-ui/                # Assistance UI customizations/overrides
│   ├── thread.tsx               # Thread component override
│   ├── thread-list.tsx          # Thread history list
│   ├── threadlist-sidebar.tsx  # Sidebar with thread list
│   ├── markdown-text.tsx        # Markdown message renderer
│   ├── attachment.tsx           # File attachment UI
│   ├── tool-fallback.tsx        # Tool execution fallback
│   └── tooltip-icon-button.tsx  # Icon buttons with tooltips
└── ui/                          # shadcn/ui primitives
    ├── button.tsx
    ├── avatar.tsx
    ├── dialog.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── input.tsx
    ├── separator.tsx
    ├── skeleton.tsx
    ├── tooltip.tsx
    └── breadcrumb.tsx

hooks/
└── use-mobile.ts                # Mobile detection hook

lib/
├── utils.ts                     # Utility functions (cn, etc.)
├── auth.ts                      # Auth.js config (future)
├── prompts.ts                   # System prompts (future)
└── types.ts                     # Shared TypeScript types (future)
```

### Organizational Philosophy

**Framework-First Structure:**
- `components/assistant-ui/` contains Assistance UI component customizations
- `components/ui/` contains shadcn/ui primitive components
- Future feature-specific components (auth, settings) will create new folders as needed

**Why This Structure:**
- Assistant UI CLI generates this pattern automatically
- Follows framework conventions for easier upgrades
- Clear separation: framework overrides vs. primitive UI components vs. feature components

---

## Component Templates

### Main Chat Page

**Current Implementation:**
```typescript
// app/page.tsx
import { Assistant } from "./assistant";

export default function Home() {
  return <Assistant />;
}
```

### Assistant Component (Main Chat Interface)

**Updated with Thread Restoration (Story 3.4):**

```typescript
// app/assistant.tsx
"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateThreadId } from "@/lib/chat-storage";

export const Assistant = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Thread restoration on mount
  useEffect(() => {
    async function restoreOrCreateThread() {
      // 1. Check URL for threadId
      let tid = searchParams.get('threadId');

      if (tid) {
        // URL has threadId - save to localStorage and use it
        localStorage.setItem('currentThreadId', tid);
      } else {
        // No URL threadId - check localStorage
        tid = localStorage.getItem('currentThreadId');

        if (tid) {
          // Try to load thread from KV
          const messages = await fetchThreadHistory(tid);
          if (messages && messages.length > 0) {
            // Thread exists - restore it
            setInitialMessages(messages);
          } else {
            // Thread doesn't exist - create new
            tid = generateThreadId();
            localStorage.setItem('currentThreadId', tid);
          }
        } else {
          // No localStorage - create new thread
          tid = generateThreadId();
          localStorage.setItem('currentThreadId', tid);
        }

        // Update URL without reload
        router.replace(`/?threadId=${tid}`, { scroll: false });
      }

      setThreadId(tid);
      setIsLoading(false);
    }

    restoreOrCreateThread();
  }, []);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: { threadId }, // Pass threadId to API
    }),
    initialMessages, // Restore history
  });

  if (isLoading) {
    return <div>Loading conversation...</div>;
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      BuddahBot
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chat</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};

// Helper function
async function fetchThreadHistory(threadId: string) {
  try {
    const res = await fetch(`/api/threads/${threadId}`);
    if (res.ok) {
      const data = await res.json();
      return data.messages;
    }
  } catch (err) {
    console.error('Failed to load thread history:', err);
  }
  return [];
}
```

**Key Implementation Details:**
- localStorage stores `currentThreadId` for session restoration
- URL always reflects active threadId (`?threadId=xyz`)
- History loaded from `/api/threads/[threadId]` on mount
- Empty/missing threads trigger new thread generation
- URL updates without page reload using `router.replace()`

### API Route (Chat Streaming)

```typescript
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4"), // Will be replaced with Nous Hermes-4
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

**Note:** This placeholder will be replaced in Story 2.1 with Nous API integration and system prompt injection.

---

## State Management

**No external state management library needed.**

Assistance UI Runtime handles all chat state internally via the `useChatRuntime` hook:
- Message history
- Streaming status
- Thread management
- Composer text

### Client-Side State Layers

**1. Assistance UI Runtime (In-Memory)**
- Current thread messages
- Streaming status
- Composer text
- UI state (loading, error)

**2. localStorage (Persistent Client-Side)**
- `currentThreadId` - Active thread identifier for session restoration
- Purpose: Restore active conversation on page reload (F5)
- Lifespan: Until user clears browser data or starts "New Conversation"

**Access chat state (read-only):**
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

**Thread persistence (localStorage):**
```typescript
// Save active thread on first message
function saveActiveThread(threadId: string) {
  localStorage.setItem('currentThreadId', threadId);
}

// Restore active thread on mount
function getActiveThread(): string | null {
  return localStorage.getItem('currentThreadId');
}

// Clear on "New Conversation"
function clearActiveThread() {
  localStorage.removeItem('currentThreadId');
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

// Usage in components
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

**Current Route Structure:**
```
app/
├── page.tsx               # / (root) - Main chat interface
├── layout.tsx             # Root layout (future: SessionProvider)
└── (auth)/                # Auth route group (future stories)
    ├── login/
    │   └── page.tsx       # /login
    └── auth/
        └── error/
            └── page.tsx   # /auth/error
```

**Route Protection (Middleware - Story 1.3):**
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

  // Protected routes - redirect if not logged in
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
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

**API Client (fetch wrapper - optional, not used for chat):**
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
// But useful for future features like settings persistence

import { apiRequest } from "@/lib/api-client";

async function saveSettings(settings: Settings) {
  return apiRequest("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}
```

---

## Component Customization Strategy

### When to Add Components

**1. Assistant UI Overrides** → `components/assistant-ui/`
- Customizing thread appearance
- Adding custom message renderers
- Overriding default UI behavior

**2. shadcn/ui Additions** → `components/ui/`
- Adding new primitive components via `npx shadcn@latest add [component]`
- Never manually create files here

**3. Feature Components** → `components/[feature]/`
- Auth-related: `components/auth/SignInButtons.tsx`
- Settings: `components/settings/SettingsPanel.tsx`
- Mode selection: `components/modes/ModeSelector.tsx`

### Example: Adding Auth Components (Story 1.2)

```
components/
├── assistant-ui/          # Existing
├── ui/                    # Existing
└── auth/                  # NEW
    ├── SignInButtons.tsx  # Google + Email sign-in
    └── UserMenu.tsx       # User dropdown menu
```

---

## Documentation Note

**2025-10-03:** This file was updated to reflect the actual Assistant UI CLI structure (`components/assistant-ui/`) rather than the originally planned custom structure (`components/chat/`). All code examples now match reality.
