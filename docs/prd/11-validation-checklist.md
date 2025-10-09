# 11) Validation Checklist

**Auth:**
- [ ] Google OAuth works end-to-end
- [ ] Email magic link works (if implemented)
- [ ] Session persists across refreshes
- [ ] Unauthenticated users redirected to login
- [ ] Sign out works

**Chat:**
- [ ] Message sent → streaming response appears
- [ ] Panel prompt produces 3-voice responses as expected
- [ ] Responses match quality from direct Nous Portal testing
- [ ] Regenerate works
- [ ] Edit works
- [ ] Voice input works (Assistance UI feature)

**Chat History:**
- [ ] Messages persist after page refresh
- [ ] Thread ID generated and stored in URL
- [ ] Loading existing thread shows previous messages
- [ ] New thread creates unique ID
- [ ] Thread list displays all user conversations (if implemented)
- [ ] Thread titles auto-generated from first message
- [ ] TTL set correctly (90 days)

**Modes:**
- [ ] Default panel mode active by default
- [ ] Changing BUDDHABOT_MODE env var switches prompt
- [ ] (Future) Custom panel and wisdom modes work

**Deployment:**
- [ ] Deploy to Vercel succeeds
- [ ] Env vars set correctly (dev/prod)
- [ ] Edge function streaming works
- [ ] No errors in Vercel logs

**Quality:**
- [ ] UI is clean and distraction-free
- [ ] Mobile responsive
- [ ] Error messages are user-friendly
- [ ] Loading states feel calm

---
