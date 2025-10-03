# 2) Success Criteria

**Functional:**
- User can sign in (Google or Email) and reach chat within 2 clicks
- Streaming responses with <2s time-to-first-token
- Mode selection works reliably (3 modes documented below)
- Panel format produces multi-voice responses as expected

**Reliability:**
- 99%+ successful request completion
- Streaming starts within 25s (Edge limit), completes within 300s
- Graceful error handling with user-friendly messages

**Security:**
- Secrets in Vercel env only
- Access control enforced; unauthenticated users blocked
- No PII persisted beyond auth session

**Quality:**
- Responses match the quality proven in direct Nous Portal testing
- UI is clean and distraction-free
- Basic Vercel logs for monitoring

---
