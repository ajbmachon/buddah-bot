# Epic 2: Chat Streaming with Panel Mode

## Epic Goal

Implement the core chat functionality with streaming responses from Hermes 4 via Nous Portal API, using the exact panel system prompt to deliver multi-voice spiritual guidance from three teachers, ensuring sub-2-second time-to-first-token and complete responses within 300 seconds.

## Epic Description

**Existing System Context:**
- Next.js application deployed with working authentication (Epic 1)
- Assistance UI chat interface rendered but not connected to AI backend
- User sessions managed with JWT

**Enhancement Details:**
- **What's being added:** Edge API route for chat streaming, Nous Portal API integration, system prompt injection for panel mode, error handling and timeout management
- **How it integrates:** Connects Assistance UI frontend to Hermes 4 backend via Edge function proxy
- **Success criteria:** Authenticated user sends message and receives streaming multi-voice response from spiritual panel within performance targets

## Stories

### Story 2.1: Create Chat API Edge Route with Session Validation

**As a** developer,
**I want** to create an Edge runtime API route that validates user sessions,
**so that** only authenticated users can send chat requests.

**Acceptance Criteria:**
1. `/api/chat/route.ts` created with `export const runtime = 'edge'`
2. POST handler implemented accepting `{ messages }` from Assistance UI
3. Session validation using `getServerSession()` from Auth.js
4. Unauthenticated requests return 401 Unauthorized
5. Malformed requests return 400 Bad Request with clear error messages
6. Edge function deploys successfully to Vercel

---

### Story 2.2: Integrate Nous Portal API with System Prompt Injection

**As a** developer,
**I want** to connect to Nous Portal API with the exact panel system prompt,
**so that** responses feature the multi-voice spiritual panel format.

**Acceptance Criteria:**
1. Environment variables configured:
   - `NOUS_API_BASE_URL` (default: Nous Portal endpoint)
   - `NOUS_API_KEY` (API bearer token)
   - `HERMES_MODEL` (default: `Hermes-4-405B`)
   - `BUDDHABOT_MODE` (default: `panel`)
2. System prompt loaded **exactly as specified** in Section 3 of PRD (no modifications)
3. Request payload correctly formatted for OpenAI-compatible endpoint:
   - `model`: from `HERMES_MODEL` env var
   - `messages`: `[{ role: 'system', content: systemPrompt }, ...userMessages]`
   - `temperature`: 0.7
   - `max_tokens`: 2048
   - `stream`: true
4. API call made to `${NOUS_API_BASE_URL}/v1/chat/completions` with Authorization header
5. Upstream errors mapped to user-friendly messages
6. Request logging includes request ID for debugging

---

### Story 2.3: Stream Responses from Nous API to Client

**As a** user,
**I want** to see the AI response streaming in real-time,
**so that** I don't wait for the complete response before seeing any output.

**Acceptance Criteria:**
1. Edge function streams SSE (Server-Sent Events) format to client
2. Response headers set correctly:
   - `Content-Type: text/event-stream`
   - `Cache-Control: no-cache`
   - `Connection: keep-alive`
3. Nous API stream properly piped to client response
4. Assistance UI renders streaming tokens in real-time
5. Time-to-first-token < 2 seconds (measured in production)
6. Complete response delivered < 300 seconds (Vercel Edge limit)
7. Stream completion handled gracefully with proper cleanup

---

### Story 2.4: Verify End-to-End Chat Flow in Production

**As a** user,
**I want** to have a working conversation with the spiritual panel,
**so that** I can receive multi-voice guidance on my questions.

**Acceptance Criteria:**
1. Full flow working: login → send message → receive streaming panel response
2. Panel response features exactly 3 spiritual teachers (per system prompt)
3. Response quality matches Nous Portal testing (conversational, multi-voice format)
4. Performance targets met:
   - Time-to-first-token < 2s
   - Complete response < 300s
5. Basic error handling verified (AI SDK handles errors automatically)
6. Multiple consecutive messages in same conversation working correctly
7. Production deployment successful with all environment variables configured

---

## Compatibility Requirements

- [ ] Vercel Edge runtime compatibility (no Node.js-specific APIs)
- [ ] Assistance UI message format compatibility
- [ ] Nous Portal API OpenAI-compatible endpoint format
- [ ] SSE streaming format for real-time delivery

## Risk Mitigation

**Primary Risk:** Nous Portal API reliability or changes to endpoint format

**Mitigation:**
- Use official Nous Portal API documentation for integration
- Implement comprehensive error handling and retries
- Log all API interactions for debugging
- Test with both 405B and 70B models to verify format consistency

**Rollback Plan:**
- If streaming fails, implement fallback to non-streaming responses
- If Nous API issues persist, temporarily show maintenance message
- Previous Epic 1 deployment remains functional for authentication

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Chat streaming working end-to-end in production
- [ ] Panel format responses verified (3 teachers, conversational format)
- [ ] Performance targets met (< 2s first token, < 300s complete)
- [ ] Error handling tested and working for all failure modes
- [ ] Environment variables documented and configured in Vercel
- [ ] At least 3 successful test conversations with diverse spiritual questions

---
