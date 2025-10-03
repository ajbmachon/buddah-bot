# Monitoring and Observability

## Monitoring Stack

**Built-in Vercel Tools (No additional setup required):**

1. **Vercel Analytics**
   - Purpose: Real User Monitoring, Web Vitals
   - Access: Vercel Dashboard → Analytics
   - Free tier: Sufficient for MVP

2. **Function Logs**
   - Purpose: Serverless function execution logs
   - Access: Vercel Dashboard → Functions → Logs
   - Retention: 7 days (free tier)

3. **Deployment Logs**
   - Purpose: Build and deployment tracking
   - Access: Vercel Dashboard → Deployments → [deployment] → Logs

**Optional (Future):**
- **Sentry:** Error tracking with stack traces
- **LogTail:** Centralized log management
- **Uptime Robot:** External uptime monitoring

---

## Key Metrics

**Frontend Metrics (Vercel Analytics):**

| Metric | Target | Description |
|--------|--------|-------------|
| **Largest Contentful Paint (LCP)** | < 2.5s | Time to render largest element |
| **First Input Delay (FID)** | < 100ms | Time to interactive |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Visual stability |
| **Time to First Byte (TTFB)** | < 600ms | Server response time |
| **First Contentful Paint (FCP)** | < 1.8s | Time to first render |

**Access:** Vercel Dashboard → Analytics → Web Vitals

**Backend Metrics:**

| Metric | Target | Description |
|--------|--------|-------------|
| **Chat API P95 Latency** | < 2s | 95th percentile time-to-first-token |
| **Chat API Error Rate** | < 1% | Failed requests / total requests |
| **Auth API Success Rate** | > 99% | Successful auth flows |
| **Edge Function Cold Starts** | < 50ms | Initial function execution time |

**Access:** Vercel Dashboard → Functions → [function name] → Metrics

---

## Logging Strategy

**Frontend Logging:**
```typescript
// Only log errors to console (browser)
// Vercel Analytics automatically tracks:
// - Page views
// - Navigation events
// - Web Vitals
// - Errors (via window.onerror)

// Custom error tracking (optional):
"use client";

useEffect(() => {
  const handleError = (event: ErrorEvent) => {
    // Could send to external service
    console.error("Caught error:", event.error);
  };

  window.addEventListener("error", handleError);
  return () => window.removeEventListener("error", handleError);
}, []);
```

**Backend Logging:**
```typescript
// app/api/chat/route.ts

export async function POST(req: Request) {
  // Log start of request
  console.log("Chat request started", {
    timestamp: new Date().toISOString(),
    userId: session?.user?.id,
  });

  try {
    // ... processing

    // Log successful completion
    console.log("Chat request completed", {
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      duration: Date.now() - startTime,
    });

  } catch (error) {
    // Log errors with context
    console.error("Chat request failed", {
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
}
```

**Log Levels:**
- `console.log()` - Informational (request start/end)
- `console.warn()` - Warnings (deprecated features, slow requests)
- `console.error()` - Errors (failures, exceptions)

**Access Logs:**
- Vercel Dashboard → Functions → [function name] → Logs
- Filter by severity, time range, search keywords

---

## Alerting (Optional for MVP)

**Vercel doesn't have built-in alerting. For future:**

1. **Set up Sentry:**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Configure error thresholds:**
   - Alert on error rate > 5% (1 hour window)
   - Alert on P95 latency > 5s (1 hour window)

3. **Notification channels:**
   - Email
   - Slack webhook
   - PagerDuty (if on-call needed)

**MVP Decision:** Monitor manually, add alerting if service reliability issues observed.

---

## Debugging Workflow

**1. Check Vercel Logs:**
```
Vercel Dashboard → Functions → /api/chat → Logs
```
- Filter by error level
- Search for user ID or session ID
- Check timestamp correlation with user report

**2. Check Nous API Status:**
```bash
curl -I https://api.nousresearch.com/v1/models \
  -H "Authorization: Bearer $NOUS_API_KEY"
```
- 200 OK: Service healthy
- 429: Rate limited
- 5xx: Service down

**3. Reproduce Locally:**
```bash
# Use production env vars
cp .env.local .env.local.backup
# Copy production env from Vercel
npm run dev
# Test flow
```

**4. Check Browser Console:**
- Open DevTools → Console
- Look for network errors (red)
- Check `/api/chat` request/response

**5. Test Edge Runtime:**
```bash
# Install Vercel CLI
npm i -g vercel

# Run edge function locally
vercel dev
```

---

## Performance Debugging

**Slow Chat Responses:**

1. Check Edge function logs for latency
2. Check Nous API response time:
   ```
   Vercel Logs → Search for "Chat request completed" → Check duration
   ```
3. If duration > 2s, check:
   - Nous API status (may be slow)
   - Message count (large context = slower)
   - System prompt size

**High Error Rate:**

1. Check error codes in logs
2. Common causes:
   - `401`: Session expired (check Auth.js logs)
   - `429`: Rate limited (reduce requests or implement rate limiting)
   - `500`: Nous API down (check status)

**Memory Issues:**

Edge runtime: 128MB limit
- Don't buffer entire stream
- Pipe directly: `return new Response(stream.body)`

---

## Monitoring Checklist

**Daily (Manual Check):**
- [ ] Check Vercel Analytics for traffic patterns
- [ ] Review function logs for errors
- [ ] Verify Web Vitals within targets

**Weekly (Manual Check):**
- [ ] Review error logs for patterns
- [ ] Check function performance metrics
- [ ] Verify no degradation in latency

**After Deployment:**
- [ ] Monitor first 10 minutes for errors
- [ ] Check function logs immediately
- [ ] Verify Web Vitals don't degrade
- [ ] Test chat flow manually

**Incident Response:**
- [ ] Check Vercel Status page (status.vercel.com)
- [ ] Check Nous Portal status
- [ ] Review recent deployments (rollback if needed)
- [ ] Check logs for error spike timing

