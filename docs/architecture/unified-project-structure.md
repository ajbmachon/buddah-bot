# Unified Project Structure

```
buddah-bot/
├── .github/
│   └── workflows/
│       └── ci.yaml                  # Vercel auto-deploys (optional CI checks)
├── app/
│   ├── (auth)/                      # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   └── auth/
│   │       └── error/
│   │           └── page.tsx         # Auth error page
│   ├── (chat)/                      # Chat route group (protected)
│   │   └── page.tsx                 # Main chat interface
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts             # Edge: Chat streaming endpoint
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts         # Node: Auth handler
│   ├── layout.tsx                   # Root layout (SessionProvider)
│   └── globals.css                  # Global styles (Tailwind)
├── components/
│   ├── chat/
│   │   ├── Thread.tsx               # Thread wrapper (Assistance UI)
│   │   ├── Composer.tsx             # Message input
│   │   ├── UserMessage.tsx          # User message bubble
│   │   └── AssistantMessage.tsx     # AI response bubble
│   └── auth/
│       └── SignInButtons.tsx        # Google/Email sign-in
├── lib/
│   ├── auth.ts                      # Auth.js config (centralized)
│   ├── prompts.ts                   # System prompts (panel mode)
│   ├── types.ts                     # Shared TypeScript types
│   └── api-client.ts                # API request wrapper (optional)
├── public/
│   ├── favicon.ico
│   └── logo.png                     # BuddahBot branding
├── docs/
│   ├── prd.md                       # Product requirements
│   └── architecture.md              # This document
├── .env.local.example               # Environment template
├── .env.local                       # Local dev vars (gitignored)
├── .eslintrc.json                   # ESLint config
├── .gitignore
├── middleware.ts                    # Route protection
├── next.config.js                   # Next.js config
├── package.json
├── postcss.config.js                # Tailwind PostCSS
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
├── vercel.json                      # Vercel config (optional)
└── README.md
```

**Key Organizational Principles:**
- **Route Groups:** `(auth)` and `(chat)` organize related pages without affecting URLs
- **Colocation:** Components near where they're used (`components/chat/`, `components/auth/`)
- **Centralized Config:** Auth, prompts, types in `lib/`
- **API Routes:** Separated by runtime (`chat/` = Edge, `auth/` = Node)
- **No Monorepo:** Single Next.js app (YAGNI - no need for packages/apps split)
