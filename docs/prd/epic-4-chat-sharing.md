# Epic 4: Chat Sharing - Brownfield Enhancement

## Epic Goal

Enable users to share their spiritual guidance conversations via secure public links, allowing them to pass along wisdom to friends and family.

## Epic Description

**Existing System Context:**
- Current functionality: Authenticated users have persistent chat threads stored in AssistantCloud, thread list UI displays conversations
- Technology stack: Next.js 14+ (App Router), Assistance UI, AssistantCloud persistence, Auth.js JWT sessions
- Integration points: AssistantCloud share-link API, existing thread-list.tsx component, Auth.js session for userId

**Enhancement Details:**
- **What's being added:** Backend API route for share link creation, share button in thread list UI, public viewer page for read-only transcripts
- **How it integrates:** API route validates userId from session then calls AssistantCloud API; UI extends ThreadListItemPrimitive; public page fetches from AssistantCloud server-side
- **Success criteria:** Users can generate copyable share links, public viewers see read-only transcripts, unauthorized sharing prevented

## Stories

### Story 4.1: Backend Share API & Security

Create server-side API route that validates thread ownership and generates share links via AssistantCloud.

**Key implementation:**
- `app/api/threads/[threadId]/share/route.ts` - POST creates share link, DELETE revokes (optional for MVP)
- Validate `session.user.id` matches thread owner before calling AssistantCloud
- Helper functions in `lib/assistant-cloud/share.ts` for API calls
- Error handling for invalid threads and expired sessions

### Story 4.2: Thread List Share UI

Add share button to thread list with dialog showing copyable link.

**Key implementation:**
- Share button in `components/assistant-ui/thread-list.tsx`
- Use `useThreadListItem()` hook to get thread ID
- Simple dialog component with copyable URL and expiration info
- Optional: In-chat share button in `app/assistant.tsx` for active conversation

### Story 4.3: Public Viewer Page

Build read-only public transcript viewer that fetches shared data server-side.

**Key implementation:**
- `app/share/[shareId]/page.tsx` - server component fetches from AssistantCloud
- Reuse existing message components in read-only mode
- Display thread title, expiration time, and friendly error for expired/revoked links
- Basic caching with revalidate

## Compatibility Requirements

- [ ] Existing chat and thread list functionality unchanged
- [ ] Auth.js session validation consistent with current API patterns
- [ ] AssistantCloud API integration uses server-side key only
- [ ] UI components follow existing patterns

## Risk Mitigation

**Primary Risk:** Cross-account thread leakage (user sharing another user's thread)

**Mitigation:**
- Server-side userId validation before creating share links
- API key never exposed to client
- Clear error messages for unauthorized attempts

**Rollback Plan:**
- Remove new API route, share UI components, and viewer page
- Existing chat/authentication functionality unaffected (sharing is additive)

## Definition of Done

- [ ] All 3 stories completed with acceptance criteria met
- [ ] Backend validates userId before creating share links
- [ ] Share button integrated into thread list with working dialog
- [ ] Public viewer displays read-only transcripts
- [ ] Expired/revoked links show appropriate error messages
- [ ] No regression in existing functionality
