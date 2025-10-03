# Unified Project Structure

**Current Implementation (Assistant UI CLI-generated)**

```
buddah-bot/
├── .github/
│   └── workflows/
│       └── ci.yaml                  # Vercel auto-deploys (optional CI checks)
├── app/
│   ├── (auth)/                      # Auth route group (future stories)
│   │   ├── login/
│   │   │   └── page.tsx             # /login - Login page
│   │   └── auth/
│   │       └── error/
│   │           └── page.tsx         # /auth/error - Auth error page
│   ├── page.tsx                     # / - Root page (renders Assistant component)
│   ├── assistant.tsx                # Main chat interface with Assistance UI runtime
│   ├── layout.tsx                   # Root layout (SessionProvider wrapper)
│   ├── globals.css                  # Global styles (Tailwind)
│   ├── favicon.ico                  # Browser favicon
│   └── api/
│       ├── chat/
│       │   └── route.ts             # Edge: Chat streaming endpoint
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts         # Node: Auth handler
├── components/
│   ├── assistant-ui/                # Assistance UI customizations/overrides
│   │   ├── thread.tsx               # Thread component override
│   │   ├── thread-list.tsx          # Thread history list
│   │   ├── threadlist-sidebar.tsx  # Sidebar with thread list
│   │   ├── markdown-text.tsx        # Markdown message renderer
│   │   ├── attachment.tsx           # File attachment UI
│   │   ├── tool-fallback.tsx        # Tool execution fallback
│   │   └── tooltip-icon-button.tsx  # Icon buttons with tooltips
│   ├── ui/                          # shadcn/ui primitives (CLI-generated)
│   │   ├── button.tsx
│   │   ├── avatar.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── tooltip.tsx
│   │   └── breadcrumb.tsx
│   └── auth/                        # Auth components (future Story 1.2)
│       └── SignInButtons.tsx        # Google/Email sign-in buttons
├── hooks/
│   └── use-mobile.ts                # Mobile device detection
├── lib/
│   ├── utils.ts                     # Utility functions (cn, etc.)
│   ├── auth.ts                      # Auth.js config (future Story 1.2)
│   ├── prompts.ts                   # System prompts (future Story 2.1)
│   ├── types.ts                     # Shared TypeScript types
│   └── api-client.ts                # API request wrapper (optional)
├── public/                          # Static assets
│   └── logo.png                     # BuddahBot branding (future)
├── docs/
│   ├── brief.md                     # Project overview
│   ├── prd/                         # Product requirements (sharded)
│   │   ├── index.md
│   │   ├── 1-product-summary.md
│   │   └── ...
│   ├── architecture/                # Technical architecture (sharded)
│   │   ├── index.md
│   │   ├── tech-stack.md
│   │   ├── source-tree.md
│   │   └── ...
│   └── stories/                     # Development stories
│       ├── 1.1.*.md
│       └── ...
├── .env.example                     # Environment template (checked into git)
├── .env.local                       # Local dev vars (gitignored)
├── .gitignore
├── middleware.ts                    # Route protection (future Story 1.3)
├── next.config.ts                   # Next.js configuration
├── package.json
├── postcss.config.mjs               # PostCSS config
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
├── eslint.config.mjs                # ESLint rules
├── components.json                  # shadcn/ui configuration
├── vercel.json                      # Vercel config (optional)
└── README.md
```

---

## Key Organizational Principles

**Framework-First Structure:**
- **`components/assistant-ui/`** - Assistance UI framework customizations and overrides
- **`components/ui/`** - shadcn/ui primitive components (never edit manually, use CLI)
- **`components/[feature]/`** - Feature-specific components (auth, settings, modes)

**Why This Differs From Original Plan:**
- Original plan specified `components/chat/Thread.tsx` (feature-based organization)
- Assistant UI CLI generated `components/assistant-ui/thread.tsx` (framework-based organization)
- **Decision:** Accept CLI structure for MVP speed, clarity, and maintainability

**Route Groups:**
- `(auth)` and `(chat)` organize related pages without affecting URLs
- Current: Main chat at `/` (root), no `(chat)` route group used yet
- Future: Login at `/login` using `(auth)` route group

**Centralized Config:**
- Auth, prompts, types in `lib/` (flat structure, no subdirectories)
- Environment variables in `.env.local` (gitignored) with `.env.example` template

**API Routes:**
- Separated by runtime: `chat/` = Edge (streaming), `auth/` = Node (session handling)

**No Monorepo:**
- Single Next.js app (YAGNI - no need for packages/apps split)

---

## Component Organization Strategy

### Current (MVP)

```
components/
├── assistant-ui/          # Framework overrides
│   ├── thread.tsx
│   ├── thread-list.tsx
│   ├── threadlist-sidebar.tsx
│   └── ...
└── ui/                    # Primitive components (shadcn/ui)
    ├── button.tsx
    ├── avatar.tsx
    └── ...
```

### Future (Adding Features)

```
components/
├── assistant-ui/          # Framework overrides
├── ui/                    # Primitive components
├── auth/                  # Auth feature (Story 1.2)
│   ├── SignInButtons.tsx
│   └── UserMenu.tsx
├── modes/                 # Mode selection (Epic 2)
│   ├── ModeSelector.tsx
│   └── ModeCard.tsx
└── settings/              # Settings (future)
    └── SettingsPanel.tsx
```

**Rule:** Feature components go in `components/[feature]/`, framework overrides stay in `components/assistant-ui/`

---

## Documentation Note

**2025-10-03:** Architecture documentation updated to reflect actual Assistant UI CLI-generated structure. Original planning docs specified `components/chat/` but CLI created `components/assistant-ui/`. This is the correct, production-ready structure and all docs now reflect reality.
