# Testing Strategy

## MVP Approach: Manual Testing

**Philosophy:** Ship fast with manual validation. Add automated tests only after validating with real users.

**Rationale:**
- 2-day MVP timeline
- Solo developer
- Trusted user circle (friends/family)
- Setting up test infrastructure takes longer than building the MVP
- Real user feedback > test coverage

---

## Manual Testing Checklist

**Before First Deploy:**
- [ ] Google OAuth flow works end-to-end
- [ ] Email magic link works (if implemented)
- [ ] User can send message and see composer
- [ ] Streaming response appears within 2 seconds
- [ ] Panel format produces 3-voice responses
- [ ] Response quality matches Nous Portal testing
- [ ] Regenerate button works
- [ ] Sign out works

**After Each Deploy:**
- [ ] Login → Chat → Send message → Receive response (5 min smoke test)
- [ ] Check Vercel function logs for errors

**Chat History (if implemented):**
- [ ] Send message → Refresh page → Messages persist
- [ ] New conversation creates new thread ID
- [ ] Thread list shows all conversations

---

## Debugging Tools

**Browser DevTools:**
- Console: Check for client errors
- Network: Inspect `/api/chat` streaming
- Application: Verify session cookie

**Vercel Dashboard:**
- Function logs: Check for server errors
- Analytics: Monitor Web Vitals

---

## Future: Automated Testing

**Add automated tests when:**
- User base grows beyond trusted circle
- Multiple developers join project
- Complex features require regression testing
- CI/CD pipeline becomes necessary

**Recommended stack (future):**
- Vitest for unit tests
- Playwright for E2E tests
- GitHub Actions for CI

**For now:** Manual testing is sufficient. Focus on shipping and learning from real users.
