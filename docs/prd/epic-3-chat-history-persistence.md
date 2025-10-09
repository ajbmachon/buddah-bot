# Epic 3: Chat History Persistence

## Epic Goal

Implement conversation history persistence using **AssistantCloud** (Assistance UI's native persistence layer) so users can refresh the page or return later and see their previous messages, enabling continuity in spiritual guidance conversations across sessions.

## Epic Description

**Existing System Context:**
- Working authentication and chat streaming (Epics 1 & 2)
- Messages currently lost on page refresh
- Each conversation is ephemeral with no persistence

**Enhancement Details:**
- **What's being added:** AssistantCloud integration, automatic message persistence, thread management UI, conversation history sidebar
- **How it integrates:** Adds `cloud` prop to existing `useChatRuntime` hook, integrates built-in `<ThreadList />` component, zero backend code required
- **Success criteria:** User sends messages, refreshes page, and sees complete conversation history restored automatically

**Why AssistantCloud:**
- Official Assistance UI persistence solution (native integration)
- Zero custom backend code needed
- Built-in thread management and UI components
- Integrates with existing Auth.js authentication (friends/family login)
- 4 stories instead of 7 (80% less implementation work)
- Can migrate to self-hosted later if needed

## Stories

### Story 3.1: Set Up AssistantCloud and Configure Authentication

**As a** developer,
**I want** to set up AssistantCloud with Auth.js integration,
**so that** authenticated users can have persistent chat history tied to their Google account.

**Acceptance Criteria:**
1. AssistantCloud account created at https://cloud.assistant-ui.com
2. Project created in AssistantCloud dashboard with name `buddhabot`
3. Environment variables configured:
   - `NEXT_PUBLIC_ASSISTANT_BASE_URL` - Frontend API URL from dashboard
   - `ASSISTANT_API_KEY` - API key from dashboard (for server-side operations)
4. Auth.js integration configured (user ID from session, not anonymous)
5. Connection test successful (can create and retrieve threads)
6. `.env.local.example` updated with new environment variables
7. Environment variables deployed to Vercel production

---

### Story 3.2: Integrate AssistantCloud with Existing Chat Runtime

**As a** user,
**I want** my chat messages to be saved automatically,
**so that** I can refresh the page and see my conversation history.

**Acceptance Criteria:**
1. AssistantCloud instance created in `app/assistant.tsx` with Auth.js session integration
2. `cloud` prop passed to `useChatRuntime` hook with `authToken` from session
3. Messages automatically persist to AssistantCloud after streaming
4. Page refresh loads previous conversation automatically
5. No manual save/load code required (handled by Assistance UI)
6. Thread ID managed automatically by AssistantCloud
7. First message in conversation auto-generates thread title
8. No errors in console related to cloud persistence

---

### Story 3.3: Add Thread List Sidebar for Conversation History

**As a** user,
**I want** to see a list of my previous conversations,
**so that** I can navigate back to earlier spiritual guidance sessions.

**Acceptance Criteria:**
1. `<ThreadList />` component added to `app/assistant.tsx`
2. Sidebar layout implemented using `<SidebarProvider>` and `<SidebarInset>`
3. Thread list displays:
   - Thread titles (auto-generated from first message)
   - Last updated timestamp
   - Active thread indicator
4. Clicking a thread switches to that conversation
5. "New Conversation" button creates fresh thread
6. Thread list populated automatically from AssistantCloud
7. Sidebar collapsible on mobile devices
8. No custom thread management code required (built-in)

---

### Story 3.4: Verify End-to-End Persistence in Production

**As a** user,
**I want** confidence that my conversations are reliably saved and restored,
**so that** I can trust the system to maintain continuity in my spiritual practice.

**Acceptance Criteria:**
1. Full persistence flow tested in production:
   - Send message → message saved to AssistantCloud
   - Refresh page (F5) → active conversation restored with full history
   - Send another message → appends to existing thread
   - Navigate away and return → full history intact
   - Close browser and reopen → last active conversation restored (if localStorage intact)
2. Thread list functionality verified:
   - Multiple threads per user working correctly
   - Thread switching maintains history
   - New thread creation works
   - Thread titles auto-generated accurately
3. Performance verified:
   - History load time < 500ms
   - Message save doesn't block streaming response
   - Thread list loads quickly (< 300ms)
4. Authenticated mode verified:
   - User ID derived from Auth.js session (Google OAuth)
   - Conversations tied to Google account (cross-device sync works)
   - Different browsers with same Google login = same conversations
   - Sign out and sign in = conversations restored
5. Error scenarios tested:
   - AssistantCloud unavailable (graceful degradation - streaming still works)
   - localStorage unavailable (fallback behavior documented)
   - Network issues during save (retry behavior verified)
6. Cross-browser testing:
   - Chrome (desktop + mobile)
   - Safari (desktop + mobile)
   - Firefox (desktop)

---

## Compatibility Requirements

- [ ] AssistantCloud free tier limits (check dashboard for current limits)
- [ ] `@assistant-ui/react` v0.11.10+
- [ ] `@assistant-ui/react-ai-sdk` latest version
- [ ] Auth.js session active (user must be signed in)
- [ ] Vercel hosting (unchanged - AssistantCloud is just storage layer)

## Risk Mitigation

**Primary Risk:** AssistantCloud third-party dependency

**Mitigation:**
- AssistantCloud is official Assistance UI solution (maintained by framework authors)
- Free tier sufficient for MVP testing
- Migration path documented (can self-host with Vercel KV later if needed)
- Streaming still works if cloud unavailable (graceful degradation)

**Secondary Risk:** Auth.js session expiry or token issues

**Mitigation:**
- AssistantCloud uses Auth.js session user ID (already working in Epic 1)
- Session refresh handled by Auth.js automatically
- Clear error messages if session invalid
- Graceful fallback to login if session expired

**Rollback Plan:**
- If AssistantCloud issues arise, can quickly implement Vercel KV fallback
- All chat streaming continues working (persistence is additive feature)
- Research agent found Vercel KV pattern as alternative (documented)

## Definition of Done

- [ ] All 4 stories completed with acceptance criteria met
- [ ] AssistantCloud account set up and configured
- [ ] Messages persist across page refreshes in production
- [ ] Thread list displays conversation history
- [ ] Thread switching works correctly
- [ ] Performance targets met (< 500ms history load, < 300ms thread list)
- [ ] Error handling tested for all failure modes
- [ ] At least 3 users tested multi-session conversations successfully
- [ ] Anonymous mode limitations documented in README

---

## Technical Decision Record

**Decision:** Use AssistantCloud instead of Vercel KV

**Context:**
- Original plan: Custom Vercel KV implementation (7 stories, ~400 lines of code)
- Discovery: AssistantCloud is Assistance UI's native persistence solution
- Research: Validated both approaches are production-ready

**Alternatives Considered:**

1. **Vercel KV + Custom Storage** (Original Plan)
   - ✅ Full control over data
   - ✅ Production-standard pattern
   - ❌ ~400 lines of custom code
   - ❌ 7 stories (slower to MVP)
   - ❌ No built-in ThreadList component

2. **AssistantCloud** (Selected)
   - ✅ Zero backend persistence code
   - ✅ Built-in thread management UI
   - ✅ 4 stories (faster to MVP)
   - ✅ Official Assistance UI solution
   - ✅ Auth.js integration = cross-device sync
   - ❌ Third-party dependency

3. **Vercel Postgres** (Rejected)
   - ✅ Relational data (better for complex queries)
   - ❌ Overkill for MVP
   - ❌ More complex schema
   - ❌ Slower queries for simple message retrieval

**Decision Rationale:**
- **Speed to MVP:** AssistantCloud reduces Epic 3 from 7 stories to 4
- **Code Reduction:** ~400 lines of custom code eliminated
- **Native Integration:** Official Assistance UI solution (better framework support)
- **Auth Integration:** Uses existing Auth.js session (friends/family already logging in)
- **Cross-Device Sync:** Conversations follow Google account across devices
- **Migration Path:** Can switch to self-hosted Vercel KV post-MVP if needed

**Trade-offs Accepted:**
- Third-party dependency (acceptable for MVP)
- Less data control (acceptable for simple chat storage)
- Requires active session (already required by app architecture)

**Validation:**
- Research agents confirmed both approaches are production-ready
- AssistantCloud used by Assistance UI's own examples
- Vercel AI SDK + Vercel KV pattern validated as standard alternative

---

## Post-MVP Migration Path (If Needed)

**Scenario:** Want to self-host persistence or need cross-device sync

**Steps:**
1. Implement Vercel KV storage using validated patterns from research
2. Create `/api/threads` routes for message persistence
3. Update `useChatRuntime` to remove `cloud` prop
4. Add `onFinish` callback to save messages server-side
5. Migrate existing AssistantCloud data (export/import via API)

**Estimated Effort:** 2-3 stories (implementation patterns already researched)

**No Rush:** AssistantCloud scales well beyond MVP, migration only if business requires it

---

## References

- [AssistantCloud Documentation](https://www.assistant-ui.com/docs/cloud/persistence/ai-sdk)
- [Vercel AI SDK Persistence Guide](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence)
- Research Agent Reports (attached to Story 3.1)
