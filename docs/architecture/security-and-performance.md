# Security and Performance

## Security Approach

**Philosophy: Simple and Sufficient**

BuddhaBot is a personal project for a trusted circle of friends and family. Security is important, but over-engineering it would violate the project's core principle of simplicity. We rely on proven platform defaults and avoid custom security implementations.

**What We Actually Need:**
- Secure authentication (handled by Auth.js)
- Environment variable protection (handled by Vercel)
- Session security (JWT with httpOnly cookies)
- HTTPS (automatic on Vercel)

**What We Don't Need:**
- Custom CSP headers
- Rate limiting (trusted users only)
- CORS policies (same-origin app)
- Complex input validation schemas
- WAF or DDoS protection

---

## Authentication Security

Auth.js handles all authentication security out-of-the-box:

**Default Protections (Automatic):**
- httpOnly cookies (JavaScript cannot access tokens)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- Google OAuth state parameter (CSRF protection)
- Magic link expiry (24 hours, one-time use)

**Session Configuration:**
```typescript
// lib/auth.ts
session: {
  strategy: 'jwt'  // No database needed, secure by default
}
```

**That's it.** Auth.js defaults are secure for our use case.

---

## API Security

**Session Validation:**
```typescript
// app/api/chat/route.ts
const session = await getServerSession(authOptions);
if (!session) {
  return new Response('Unauthorized', { status: 401 });
}
```

**Environment Variables:**
All secrets stored in Vercel environment variables:
- `NOUS_API_KEY`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- Never committed to git

**Input Handling:**
- Assistance UI components escape user content automatically
- Markdown rendering uses safe parser
- No custom validation needed for MVP

---

## Platform Security (Vercel Defaults)

**Automatic Protections:**
- HTTPS/TLS on all deployments
- DDoS protection at edge
- Secure environment variable storage
- Automatic security headers (X-Content-Type-Options, etc.)

**No Custom Configuration Needed**

If security issues arise in production, we can add specific protections then. Start simple.

---

## Performance Optimization

**Frontend Performance:**

**Bundle Size Target:** < 300KB initial JS (excluding Assistance UI framework)

**Loading Strategy:**
- Next.js automatic code splitting
- Assistance UI components are already optimized
- Next.js Image for any images

**Caching Strategy:**
- Static assets: Cached by Vercel CDN (immutable)
- API routes: No caching (streaming responses)
- Pages: Static where possible

---

**Backend Performance:**

**Response Time Target:** < 2s time-to-first-token (PRD requirement)

**Optimization Strategy:**
- Edge runtime for `/api/chat` (global distribution, low latency)
- System prompts loaded from constants (no I/O)
- Sessions validated via JWT (no DB lookup)
- Direct proxy to Nous API (no processing overhead)

**Edge Runtime Benefits:**
- Global distribution (low latency)
- Fast cold starts (< 50ms)
- Automatic scaling

---

## Performance Monitoring

**Vercel Analytics (built-in):**
- Core Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Function execution time
- Error tracking

**Access:**
- Vercel Dashboard → Analytics
- Function logs: Vercel Dashboard → Functions → Logs

**Key Metrics to Monitor:**
- Chat streaming latency - Target: < 2s time-to-first-token
- Largest Contentful Paint (LCP) - Target: < 2.5s
- First Input Delay (FID) - Target: < 100ms

**That's sufficient for MVP.** Add more observability only if needed.
