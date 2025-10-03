# Core Workflows

## Workflow 1: Google OAuth Authentication

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant App
    participant AuthAPI as Auth.js<br/>(Node Runtime)
    participant Google as Google OAuth
    participant EdgeAPI as /api/chat<br/>(Edge Runtime)

    User->>Browser: Visit buddahbot.com
    Browser->>App: GET /
    App-->>Browser: Redirect to /login (no session)

    User->>Browser: Click "Sign in with Google"
    Browser->>AuthAPI: POST /api/auth/signin?provider=google
    AuthAPI-->>Browser: Redirect to Google consent screen

    Browser->>Google: OAuth consent (email, profile)
    User->>Google: Approve
    Google-->>Browser: Redirect with auth code

    Browser->>AuthAPI: GET /api/auth/callback/google?code=...
    AuthAPI->>Google: Exchange code for tokens
    Google-->>AuthAPI: Access token + user profile
    AuthAPI->>AuthAPI: Create JWT session
    AuthAPI-->>Browser: Set httpOnly cookie + Redirect to /

    Browser->>App: GET / (with session cookie)
    App->>AuthAPI: Validate session
    AuthAPI-->>App: Session valid (user data)
    App-->>Browser: Render chat interface

    User->>Browser: Type message
    Browser->>EdgeAPI: POST /api/chat (with cookie)
    EdgeAPI->>AuthAPI: Validate session
    AuthAPI-->>EdgeAPI: Session valid
    EdgeAPI->>EdgeAPI: Process request
    EdgeAPI-->>Browser: Stream response
```

**Key Points:**
- **Stateless:** No server-side session storage (JWT only)
- **Cookie Security:** httpOnly, secure (prod), sameSite=lax
- **Redirect Flow:** `/` → `/login` → Google → callback → `/`
- **Session Lifetime:** 30 days (configurable)

---

## Workflow 2: Email Magic Link Authentication

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant App
    participant AuthAPI as Auth.js<br/>(Node Runtime)
    participant Resend
    participant Email as User's Email

    User->>Browser: Click "Sign in with Email"
    Browser->>AuthAPI: POST /api/auth/signin?provider=email
    AuthAPI->>AuthAPI: Generate verification token
    AuthAPI->>Resend: POST /emails (magic link)
    Resend->>Email: Send verification email
    Resend-->>AuthAPI: Email sent (ID)
    AuthAPI-->>Browser: "Check your inbox" message

    User->>Email: Check inbox
    User->>Email: Click magic link
    Email->>Browser: Open link (new tab/window)
    Browser->>AuthAPI: GET /api/auth/callback/email?token=...
    AuthAPI->>AuthAPI: Verify token (valid + not expired)
    AuthAPI->>AuthAPI: Create JWT session
    AuthAPI-->>Browser: Set httpOnly cookie + Redirect to /

    Browser->>App: GET / (with session cookie)
    App->>AuthAPI: Validate session
    AuthAPI-->>App: Session valid
    App-->>Browser: Render chat interface
```

**Key Points:**
- **Token Expiry:** 24 hours (Auth.js default)
- **One-Time Use:** Token invalidated after use
- **No Password:** Zero password management complexity
- **Email Verification:** User must have access to email inbox

---

## Workflow 3: Chat Streaming (Happy Path)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Runtime as Assistance UI<br/>Runtime
    participant EdgeAPI as /api/chat<br/>(Edge Runtime)
    participant Nous as Nous Portal API

    User->>Browser: Type message "What is suffering?"
    Browser->>Runtime: User submits message
    Runtime->>Runtime: Add message to local state

    Runtime->>EdgeAPI: POST /api/chat<br/>{ messages: [...] }
    EdgeAPI->>EdgeAPI: Validate session (from cookie)
    EdgeAPI->>EdgeAPI: Validate input (Zod schema)
    EdgeAPI->>EdgeAPI: Get system prompt (panel mode)

    EdgeAPI->>Nous: POST /v1/chat/completions<br/>{ model, messages, stream: true }
    Note over EdgeAPI,Nous: Messages include:<br/>1. System prompt (panel)<br/>2. Conversation history<br/>3. New user message

    Nous-->>EdgeAPI: SSE: data: {"choices":[{"delta":{"content":"**Eckhart"}}]}
    EdgeAPI-->>Runtime: SSE: data: {"choices":[{"delta":{"content":"**Eckhart"}}]}
    Runtime->>Browser: Render: "**Eckhart"

    Nous-->>EdgeAPI: SSE: data: {"choices":[{"delta":{"content":" Tolle:**"}}]}
    EdgeAPI-->>Runtime: SSE: data: {"choices":[{"delta":{"content":" Tolle:**"}}]}
    Runtime->>Browser: Render: "**Eckhart Tolle:**"

    Note over Nous,Browser: Streaming continues...<br/>Panel conversation unfolds

    Nous-->>EdgeAPI: SSE: data: {"choices":[{"delta":{},"finish_reason":"stop"}]}
    EdgeAPI-->>Runtime: SSE: data: {"choices":[{"delta":{},"finish_reason":"stop"}]}
    Runtime->>Runtime: Mark message complete
    Runtime->>Browser: Display complete response

    User->>Browser: Message complete (< 2s time-to-first-token)
```

**Performance Targets:**
- **Time-to-first-token:** < 2 seconds
- **Streaming start:** < 2 seconds (PRD requirement)
- **Total completion:** < 25 seconds (Edge timeout)
- **Request completion rate:** > 99% (PRD requirement)

---

## Workflow 4: Error Handling (Network/API Failure)

```mermaid
sequenceDiagram
    actor User
    participant Runtime as Assistance UI
    participant EdgeAPI as /api/chat<br/>(Edge)
    participant Nous as Nous Portal API

    User->>Runtime: Submit message
    Runtime->>EdgeAPI: POST /api/chat
    EdgeAPI->>EdgeAPI: Validate session ✓
    EdgeAPI->>EdgeAPI: Validate input ✓

    EdgeAPI->>Nous: POST /v1/chat/completions
    Nous-->>EdgeAPI: 429 Too Many Requests

    EdgeAPI->>EdgeAPI: Map error to standard format
    EdgeAPI-->>Runtime: { error: { code: "rate_limit"... } }
    Runtime->>Browser: Display: "Too many requests. Try again in a moment."

    alt User Retries
        User->>Runtime: Click retry
        Runtime->>EdgeAPI: POST /api/chat (retry)
        EdgeAPI->>Nous: POST /v1/chat/completions
        Nous-->>EdgeAPI: SSE: Success
        EdgeAPI-->>Runtime: SSE: Stream response
        Runtime->>Browser: Display response
    end
```

**Error Scenarios:**
- **401 Unauthorized:** Session expired → redirect to login
- **422 Validation Error:** Invalid input → display field errors
- **429 Rate Limit:** Too many requests → retry with backoff
- **500 Internal Error:** Nous API down → display generic error + retry option
- **504 Timeout:** Request > 25s → notify user, allow retry

---

## Workflow 5: Session Expiry Mid-Chat

```mermaid
sequenceDiagram
    actor User
    participant Runtime as Assistance UI
    participant EdgeAPI as /api/chat
    participant AuthAPI as Auth.js

    User->>Runtime: Submit message (session expired)
    Runtime->>EdgeAPI: POST /api/chat (expired cookie)
    EdgeAPI->>AuthAPI: Validate session
    AuthAPI-->>EdgeAPI: Invalid session (expired/missing)
    EdgeAPI-->>Runtime: 401 Unauthorized
    Runtime->>Browser: Display: "Session expired. Please sign in again."
    Browser->>Browser: Redirect to /login

    User->>Browser: Sign in again
    Note over Browser,AuthAPI: Auth workflow (Google/Email)
    Browser->>Browser: Return to / (with new session)
    Runtime->>Browser: Chat restored (no history - client-side only)
    User->>User: Continue conversation (fresh thread)
```

**Session Behavior:**
- **Expiry:** 30 days of inactivity
- **No Persistence:** Previous conversation lost (no DB)
- **Client State:** Assistance UI maintains thread in memory (cleared on refresh)
- **Graceful UX:** Clear message + redirect to login
