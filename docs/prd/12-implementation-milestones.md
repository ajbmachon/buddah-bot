# 12) Implementation Milestones

**M0: Foundation (Day 1)**
- Init Next.js project
- Install Assistance UI
- Set up Auth.js with Google + Email providers
- Deploy to Vercel (confirm auth works)

**M1: Chat Streaming (Day 1-2)**
- Implement `/api/chat` Edge route
- Integrate Nous Portal API
- Add default panel system prompt (EXACT text from Section 3)
- Test: login → send message → receive streaming panel response

**M2: Chat History Persistence (Day 2)**
- **[MANUAL STEP]** Create AssistantCloud account at https://cloud.assistant-ui.com
  - Sign up and create project named `buddhabot`
  - Get Frontend API URL and API key from dashboard
  - Add to Vercel env vars: `NEXT_PUBLIC_ASSISTANT_BASE_URL` and `ASSISTANT_API_KEY`
- Add `cloud` prop to `useChatRuntime` in `app/assistant.tsx` (5 lines of code)
- Add `<ThreadList />` sidebar component
- Test: send message → refresh → see history persisted
- **See Epic 3 stories for detailed implementation**

**M3: Polish & Launch (Day 2-3)**
- Add minimal branding/styling
- Implement thread list page (optional)
- Test error states
- Validate all checklist items
- Invite first users

**Future Iterations:**
- Custom panel mode (if desired)
- General wisdom mode (if desired)
- Mode selection UI
- Migration to Postgres (if complex queries needed)

---
