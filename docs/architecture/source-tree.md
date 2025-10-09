# Source Tree Structure

This document defines the canonical directory structure for BuddhaBot. Follow this structure exactly when creating new files.

**Source:** Derived from `unified-project-structure.md`, `frontend-architecture.md`, and `backend-architecture.md`

---

## Root Directory Layout

```
buddha-bot/
├── app/                    # Next.js App Router pages and API routes
├── components/             # React components (organized by feature)
├── lib/                    # Shared utilities and configurations
├── docs/                   # Project documentation
├── public/                 # Static assets (images, fonts, etc.)
├── middleware.ts           # Route protection middleware
└── [config files]          # Root-level configuration files
```

---

## `/app` Directory (Next.js App Router)

**All routes and API endpoints live here.**

```
app/
├── (auth)/                 # Auth route group (shared layout)
│   ├── login/
│   │   └── page.tsx        # /login - Login page
│   └── auth/
│       └── error/
│           └── page.tsx    # /auth/error - Auth error page
├── (chat)/                 # Chat route group (protected)
│   └── page.tsx            # / - Main chat interface
├── api/
│   ├── chat/
│   │   └── route.ts        # Edge runtime: Chat streaming endpoint
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts    # Node runtime: Auth handler
├── layout.tsx              # Root layout (SessionProvider)
└── globals.css             # Global styles (Tailwind)
```

### Route Groups Explained

- `(auth)` - Groups auth-related pages, doesn't affect URL structure
- `(chat)` - Groups protected chat pages, doesn't affect URL structure
- **URL mapping:** `app/(chat)/page.tsx` renders at `/`

### API Route Conventions

| Path | Runtime | Purpose | Auth Required |
|------|---------|---------|---------------|
| `/api/chat` | Edge | Streaming chat completions | Yes |
| `/api/auth/*` | Node | Authentication endpoints | No (public) |

---

## `/components` Directory

**Reusable React components organized by feature.**

```
components/
├── chat/
│   ├── Thread.tsx          # Thread wrapper (Assistance UI)
│   ├── Composer.tsx        # Message input (Assistance UI)
│   ├── UserMessage.tsx     # User message bubble
│   └── AssistantMessage.tsx # AI message bubble
└── auth/
    └── SignInButtons.tsx   # Google/Email sign-in buttons
```

### Component Organization Rules

**Current Structure (Assistant UI CLI):**
- **`components/assistant-ui/`** - Assistance UI framework customizations (thread, sidebar, etc.)
- **`components/ui/`** - shadcn/ui primitive components (button, avatar, etc.)
- **`components/[feature]/`** - Feature-specific components (e.g., `auth/`, `modes/`, `settings/`)

**When to Use Each:**
- Framework overrides → `assistant-ui/`
- UI primitives → `ui/` (never create manually, use shadcn CLI)
- Feature components → `[feature]/` (e.g., `components/auth/SignInButtons.tsx`)

---

## `/lib` Directory

**Shared utilities, types, and configurations (flat structure).**

```
lib/
├── auth.ts                 # Auth.js config (centralized)
├── prompts.ts              # System prompts (DO NOT MODIFY)
├── types.ts                # Shared TypeScript types
└── api-client.ts           # API request wrapper (optional)
```

### Critical Files

- **`prompts.ts`** - Contains exact system prompts from PRD (NEVER modify these)
- **`auth.ts`** - Auth.js setup (Google + Email providers, JWT sessions)
- **`types.ts`** - Shared interfaces (ChatMessage, Session, etc.)
- **`api-client.ts`** - Fetch wrapper with error handling (optional, not needed for chat)

---

## `/docs` Directory

**Project documentation (planning, architecture, stories).**

```
docs/
├── brief.md                # Project overview
├── prd/                    # Product requirements (sharded)
│   ├── index.md            # PRD table of contents
│   ├── 1-product-summary.md
│   ├── 2-success-criteria.md
│   ├── ...
│   └── epic-*.md           # Epic definitions
├── architecture/           # Technical architecture (sharded)
│   ├── index.md            # Architecture table of contents
│   ├── tech-stack.md       # Technology decisions
│   ├── coding-standards.md
│   ├── source-tree.md      # This file
│   └── ...
└── stories/                # Development stories
    ├── 1.1.*.md            # Story files
    └── ...
```

---

## `/public` Directory

**Static assets served at root URL.**

```
public/
├── favicon.ico             # Browser favicon
└── logo.png                # BuddhaBot branding
```

---

## Root Files

### Middleware

**File:** `middleware.ts`

Route protection logic (runs on Edge runtime):

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Protected routes - redirect if not logged in
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
```

---

## Configuration Files (Root)

```
├── package.json            # npm dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # Tailwind PostCSS
├── .eslintrc.json          # ESLint rules
├── components.json         # shadcn/ui configuration (if used)
├── vercel.json             # Vercel config (optional)
├── .env.local              # Local environment variables (NOT in git)
├── .env.local.example      # Example env vars (in git)
├── .gitignore              # Git ignore rules
└── README.md               # Project readme
```

### Environment Variables Template

**File:** `.env.local.example`

```bash
# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Nous API
NOUS_API_BASE_URL=https://api.nousresearch.com/v1
NOUS_API_KEY=
HERMES_MODEL=Hermes-4-405B

# Email (optional - for magic links)
EMAIL_FROM=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **React Components** | PascalCase.tsx | `Thread.tsx`, `SignInButtons.tsx` |
| **React Hooks** | use-camelCase.ts | `useSession.ts`, `useChatMode.ts` |
| **Utilities** | kebab-case.ts | `api-client.ts`, `utils.ts` |
| **API Routes** | route.ts | `app/api/chat/route.ts` |
| **Types** | kebab-case.ts | `types.ts`, `api-types.ts` |
| **Config Files** | lowercase | `next.config.js`, `tailwind.config.ts` |
| **Middleware** | lowercase | `middleware.ts` |

---

## Import Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage:**
```typescript
// ✅ DO: Use alias
import { cn } from '@/lib/utils';
import { Thread } from '@/components/chat/Thread';
import { auth } from '@/lib/auth';

// ❌ DON'T: Use relative paths from deep files
import { cn } from '../../../lib/utils';
```

---

## Where to Put New Code

**Decision tree for adding new code:**

| What are you adding? | Where does it go? |
|---------------------|-------------------|
| **New page** | `/app/[route]/page.tsx` or `/app/(group)/[route]/page.tsx` |
| **API endpoint** | `/app/api/[route]/route.ts` |
| **UI component** | `/components/[feature]/ComponentName.tsx` |
| **React hook** | `/lib/useHookName.ts` (hooks can live in lib/) |
| **Utility function** | `/lib/utils.ts` or `/lib/[feature].ts` |
| **Type definition** | `/lib/types.ts` or `/lib/[feature]-types.ts` |
| **Static asset** | `/public/asset-name.ext` |
| **Middleware logic** | `middleware.ts` (one file only) |

**Example: Adding conversation mode selector**
```
app/(chat)/page.tsx         # Update to include mode selector

components/chat/
├── ModeSelector.tsx        # Mode selection UI
└── ModeCard.tsx            # Individual mode card

lib/
├── modes.ts                # Mode definitions and utilities
└── types.ts                # Add Mode type here
```

---

## Critical Rules

1. **Never modify** `/lib/prompts.ts` (exact prompts from PRD)
2. **Edge runtime** for streaming APIs (`export const runtime = 'edge'` in `/app/api/chat`)
3. **Node runtime** for auth APIs (default in `/app/api/auth`)
4. **Use path aliases** (`@/`) instead of relative imports
5. **Route groups** organize without affecting URLs: `(auth)` and `(chat)`
6. **Flat lib/ structure** - no subdirectories (keep it simple)
7. **Middleware at root** - `middleware.ts` (not in app/)

---

## When In Doubt

**Ask yourself:**
- Is this a **page**? → `/app/[route]/page.tsx` or `/app/(group)/[route]/page.tsx`
- Is this an **API**? → `/app/api/[route]/route.ts`
- Is this a **component**? → `/components/[feature]/ComponentName.tsx`
- Is this **shared logic**? → `/lib/[feature].ts` or hook in `/lib/use[Feature].ts`
- Is this a **type**? → `/lib/types.ts`
- Is this a **static file**? → `/public/filename.ext`

**Keep it simple.** This is a 2-day MVP for friends/family.
