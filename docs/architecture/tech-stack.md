# Tech Stack

This is the DEFINITIVE technology selection for the entire project. All development must use these exact versions.

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.9.3 | Type-safe frontend development | Latest stable (Oct 2025), catch errors at compile time, better IDE support, required by Assistance UI |
| **Frontend Framework** | Next.js (App Router) | 15.5.4 | React framework with SSR/SSG | Latest stable (Sep 2025), Assistance UI compatible, App Router production-ready, Vercel-optimized |
| **UI Component Library** | Assistance UI | 0.11.10 | AI chat interface framework | Latest version (Oct 2025), purpose-built for chat streaming, provides all chat UI features out-of-box |
| **State Management** | React Context + Assistance UI Runtime | N/A | Minimal state management | No complex client state needed - Assistance UI runtime handles chat state, React Context for auth session |
| **Backend Language** | TypeScript | 5.9.3 | Type-safe backend development | Share types across frontend/backend, serverless functions support TS natively |
| **Backend Framework** | Next.js API Routes | 15.5.4 | Serverless API endpoints | Edge runtime for streaming, Node runtime for auth, unified with frontend |
| **API Style** | REST (OpenAI-compatible) | N/A | Streaming chat completions | Nous API is OpenAI-compatible REST, simple proxy pattern, no GraphQL overhead needed |
| **Database** | None | N/A | No database required | JWT sessions (no user DB), AssistantCloud handles chat persistence |
| **Chat Persistence** | AssistantCloud | Latest | Thread & message storage | Official Assistance UI persistence layer, zero backend code, anonymous mode for MVP |
| **File Storage** | None (MVP) | N/A | No file uploads | Assistance UI supports file sharing but MVP doesn't require it |
| **Authentication** | Auth.js (NextAuth) | 5.0.0-beta | OAuth + Email authentication | Google OAuth + magic links, JWT sessions, Vercel-optimized - **Note: v5 is beta but production-ready** |
| **Frontend Testing** | Vitest + React Testing Library | 3.2.4 + 16.3.0 | Component and unit tests | Vitest latest stable (Jun 2025), RTL with React 19 support (Apr 2025) |
| **Backend Testing** | Vitest | 3.2.4 | API route testing | Unified testing tool for frontend and backend, serverless function testing |
| **E2E Testing** | Playwright | 1.55.1 | End-to-end flows | Latest stable (Sep 2025), auth flow, chat streaming, cross-browser testing |
| **Build Tool** | Next.js (built-in) | 15.5.4 | Transpilation and bundling | Next.js handles all build concerns, no separate build tool needed |
| **Bundler** | Turbopack (dev) / Webpack (prod) | Built-in | Fast dev bundling | Turbopack stable for dev mode, Webpack still default for production builds |
| **IaC Tool** | None (MVP) | N/A | Infrastructure as Code | Vercel handles infrastructure, no manual IaC needed |
| **CI/CD** | Vercel (built-in) | N/A | Continuous deployment | Auto-deploy on git push, preview deployments, zero config |
| **Monitoring** | Vercel Analytics | N/A | Basic metrics and logs | Built-in function logs, error tracking, sufficient for MVP |
| **Logging** | Vercel Logs | N/A | Centralized logging | Serverless function logs, accessible via Vercel dashboard |
| **CSS Framework** | Tailwind CSS | 4.1.14 | Utility-first styling | Latest v4 with CSS-first config, installed by Assistant UI CLI - modern rewrite with improved performance |

## Critical Version Notes

**Auth.js v5 Beta:**
- Install: `npm install next-auth@beta`
- Production-ready beta but not 5.0 stable
- Breaking changes from v4: New cookie names, import paths
- **Decision:** Use beta - stable enough for greenfield project

**Tailwind CSS v4:**
- **v4.1.14** installed (major rewrite, CSS-first config)
- **v3.4.x** is legacy but stable
- **Decision:** Assistant UI CLI installed v4 automatically - using modern version with improved performance and DX. CSS-first config is more intuitive for MVP development.

**Turbopack Status:**
- **Dev mode:** Stable (`next dev --turbopack`) - 3.78x faster builds
- **Production builds:** Beta with bundle size concerns
- **Decision:** Use Turbopack for dev, Webpack for production (Next.js default)

**Nous API Integration:**
- **Base URL:** `https://api.nousresearch.com/v1`
- **Models:** `Hermes-4-405B` (128k context, $1.50/1M tokens), `Hermes-4-70B` (128k context, $0.70/1M tokens)
- **Authentication:** Bearer token via `Authorization` header
- **Endpoint:** `/chat/completions` (OpenAI-compatible)
- **Streaming:** SSE format supported
- **Waitlist:** API access requires approval from portal.nousresearch.com
- **Free Credits:** $5 for new accounts

## Installation Commands

```bash
# Assistant UI - use CLI (installs all dependencies automatically)
npx assistant-ui@latest init

# Authentication
npm install next-auth@beta

# Testing
npm install -D vitest@3.2.4 @testing-library/react@16.3.0 @testing-library/dom
npm install -D playwright@1.55.1

# Development
npm install -D @vitejs/plugin-react
```
