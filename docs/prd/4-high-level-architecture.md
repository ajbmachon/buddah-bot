# 4) High-Level Architecture

**Frontend:**
- Next.js (App Router)
- **Assistance UI** (`@assistant-ui/react`) - provides everything out of the box:
  - Thread and message rendering
  - Composer with voice/text input
  - Regenerate/edit functionality
  - File sharing capability
  - Markdown rendering
  - Mobile responsive

**Backend:**
- **Chat route** (`/api/chat`): **Edge runtime** for streaming
  - Validates session
  - Selects system prompt based on mode
  - Proxies to Nous Portal API
  - Streams responses back to client

- **Auth routes**: **Node runtime** (Auth.js/NextAuth)
  - Google OAuth provider
  - Email provider (magic link or credentials with verification)
  - JWT-based sessions (no database required for OAuth)

**Hosting:** Vercel
- Edge Functions for chat (low latency, global)
- Node Functions for auth
- Automatic scaling, zero DevOps

**Model Integration:**
- Hermes 4 via **Nous Portal API** (first-party)
- Default: `Hermes-4-405B`
- Optional: `Hermes-4-70B` (env-switchable)
- OpenAI-compatible chat/completions endpoint
- 128k context window

**Data Flow:**
1. User authenticates via Google OAuth or Email
2. Client posts messages to `/api/chat` (Edge)
3. Edge handler injects appropriate system prompt
4. Forwards to Nous Portal API with bearer auth
5. Streams tokens back via SSE to Assistance UI

---
