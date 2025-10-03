# External APIs

## 1. Nous Research Portal API

**Purpose:** AI model inference for spiritual wisdom responses

**Documentation:** https://portal.nousresearch.com/api-docs

**Base URL:** `https://api.nousresearch.com/v1`

**Authentication:** Bearer token

```bash
Authorization: Bearer ${NOUS_API_KEY}
```

**API Key Management:**
1. Sign up at https://portal.nousresearch.com
2. Join API waitlist (first-come, first-serve)
3. Generate API key at https://portal.nousresearch.com/api-keys
4. Add to Vercel environment variables

**Rate Limits:** Not publicly documented - monitor 429 responses

**Key Endpoints Used:**

### POST `/chat/completions`

**Request:**
```json
{
  "model": "Hermes-4-405B",
  "messages": [
    { "role": "system", "content": "<panel prompt>" },
    { "role": "user", "content": "User question" }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Response:** SSE stream (OpenAI-compatible format)

**Pricing:**
- Hermes-4-405B: $1.50 per 1M tokens
- Hermes-4-70B: $0.70 per 1M tokens
- Free credits: $5 for new accounts

**Context Window:** 128,000 tokens (both models)

**Integration Notes:**
- Fully OpenAI-compatible API
- No custom SDK needed - use standard fetch
- Supports streaming via SSE
- System prompts fully supported
- Model parameter: use exact casing (`Hermes-4-405B` not `hermes-4-405b`)

---

## 2. Google OAuth API

**Purpose:** User authentication via Google accounts

**Documentation:** https://developers.google.com/identity/protocols/oauth2

**OAuth 2.0 Endpoints:**
- Authorization: `https://accounts.google.com/o/oauth2/v2/auth`
- Token: `https://oauth2.googleapis.com/token`
- User Info: `https://www.googleapis.com/oauth2/v1/userinfo`

**Authentication:** OAuth 2.0 client credentials

**Setup:**
1. Create project at https://console.cloud.google.com
2. Enable Google+ API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
5. Save Client ID and Secret to environment variables

**Required Scopes:**
- `openid`
- `email`
- `profile`

**Environment Variables:**
```bash
AUTH_GOOGLE_ID=<client_id>.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=<client_secret>
```

**Integration Notes:**
- Handled automatically by Auth.js Google provider
- No rate limits for OAuth flow
- Profile images served from Google CDN
- Consider consent screen customization for brand consistency

---

## 3. Email Provider (Resend)

**Purpose:** Send magic link authentication emails

**Documentation:** https://resend.com/docs

**Base URL:** `https://api.resend.com`

**Authentication:** API key in header

```bash
Authorization: Bearer ${AUTH_RESEND_KEY}
```

**API Key Management:**
1. Sign up at https://resend.com
2. Verify domain for sending
3. Generate API key
4. Add to Vercel environment variables

**Rate Limits:**
- Free tier: 100 emails/day
- Pro: 50,000 emails/month

**Key Endpoints Used:**

### POST `/emails`

**Request:**
```json
{
  "from": "noreply@yourdomain.com",
  "to": "user@example.com",
  "subject": "Sign in to BuddahBot",
  "html": "<p>Click <a href='https://yourdomain.com/api/auth/callback/email?token=xxx'>here</a> to sign in.</p>"
}
```

**Response:**
```json
{
  "id": "email-id-12345",
  "from": "noreply@yourdomain.com",
  "to": "user@example.com",
  "created_at": "2025-10-03T12:00:00Z"
}
```

**Integration Notes:**
- Integrated via Auth.js Resend provider
- Magic links expire in 24 hours (Auth.js default)
- Consider custom email templates for branding
- Requires verified domain for production sending

**Alternative:** Use SMTP provider if Resend not available

---

## External API Summary Table

| API | Purpose | Auth Method | Rate Limits | Cost |
|-----|---------|-------------|-------------|------|
| Nous Portal | AI inference | Bearer token | TBD | $0.70-$1.50/1M tokens |
| Google OAuth | User authentication | OAuth 2.0 | None (OAuth flow) | Free |
| Resend | Magic link emails | API key | 100/day (free) | Free (low volume) |

**Environment Variables Checklist:**
```bash
# Nous API
NOUS_API_KEY=sk_nous_...
NOUS_API_BASE_URL=https://api.nousresearch.com/v1
HERMES_MODEL=Hermes-4-405B

# Google OAuth
AUTH_GOOGLE_ID=...apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-...

# Resend
AUTH_RESEND_KEY=re_...

# Auth.js
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://buddahbot.yourdomain.com
```
