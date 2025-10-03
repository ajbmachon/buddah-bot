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
- **[MANUAL STEP]** Create Vercel KV database in Vercel Dashboard:
  - Go to: Project → Storage → Create Database → Select "KV"
  - Name: `buddahbot-kv`
  - Click Create (environment variables auto-added to project)
- Install `@vercel/kv`
- Implement `lib/chat-storage.ts` utility functions
- Update `/api/chat` to save messages after streaming
- Update frontend to load thread history
- Create `/api/threads/[threadId]` route
- Test: send message → refresh → see history persisted

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
