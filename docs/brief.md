# Project Brief: BuddhaBot

## Executive Summary

BuddhaBot is a lightweight spiritual wisdom chat application that makes a proven Hermes 4 AI prompt accessible to friends and family. Built with Next.js and Assistance UI, it provides authenticated users with streaming conversations featuring a panel of spiritual teachers (Eckhart Tolle, Tara Brach, Alan Watts, and others). This is a personal passion project focused on simplicity and ease of access—no commercialization, no over-engineering.

## Problem Statement

The spiritual guidance prompt works beautifully on Nous Portal, but the technical interface creates a barrier for non-technical friends and family who would benefit from this wisdom. They need a simple, accessible way to engage with spiritual guidance without navigating complex AI platforms.

**Impact:** Valuable spiritual support remains inaccessible to those who need it most
**Urgency:** Personal circle is actively seeking guidance; proven prompt exists but needs accessible wrapper

## Proposed Solution

A clean chat interface where users sign in (Google or Email), select a conversation mode, and interact with Hermes 4 using carefully crafted spiritual wisdom prompts. The app handles all technical complexity—authentication, API integration, streaming—while presenting a calm, distraction-free experience.

**Key Differentiator:** Purpose-built for spiritual guidance with proven prompts, not a general-purpose chatbot

## Target Users

**Primary Segment: Friends & Family Seeking Spiritual Guidance**
- Non-technical users who appreciate spiritual wisdom
- Currently use meditation apps, read spiritual books, or seek life guidance
- Want accessible, conversational format without technical barriers
- Value multi-perspective wisdom from various spiritual traditions

**Not Targeting:** Commercial users, enterprise, or monetization

## Goals & Success Metrics

**Business Objectives:**
- Provide trusted circle with easy access to spiritual guidance
- Learn from real usage to refine experience
- Test and validate prompt effectiveness

**User Success Metrics:**
- Sign in to chat within 2 clicks
- Streaming responses begin within 2 seconds
- 99%+ successful request completion
- Clean, distraction-free UI that feels calm

**Quality Indicators:**
- Responses match quality from direct Nous Portal testing
- Panel format produces engaging multi-voice dialogue
- Users return for continued guidance

## MVP Scope

### Core Features (Must Have)
- **Simple Authentication:** Google OAuth + Email magic links (no password management)
- **Default Panel Mode:** 3 spiritual teachers respond conversationally to user questions
- **Streaming Chat:** Sub-2s time-to-first-token, <300s completion
- **Chat History:** Conversation persistence using Vercel KV (Redis) - messages saved and restored
- **Assistance UI Framework:** Voice input, message regeneration, markdown rendering all built-in
- **Secure Configuration:** All secrets in Vercel environment variables

### Out of Scope for MVP
- Custom panel selection (Mode 2)
- General wisdom mode (Mode 3)
- User management UI
- Analytics dashboards
- Billing/monetization
- RAG or document upload
- Custom UI components

**Note:** Conversation history/persistence was moved INTO MVP scope using Vercel KV (simple Redis storage).

### MVP Success Criteria
User can authenticate, send a message, and receive a quality multi-voice spiritual response within 30 seconds of first visit.

## Post-MVP Vision

**Phase 2 Features:**
- Custom panel composition (user selects which teachers)
- General wisdom mode (single-voice, more intimate)
- Optional hybrid reasoning mode enhancement
- Conversation history

**Long-term Vision:**
Remain a simple, personal tool for spiritual guidance. May expand teacher panel or add new modes based on user feedback. No commercial pivot planned.

## Technical Considerations

### Platform Requirements
- **Target Platform:** Web (desktop + mobile responsive)
- **Browser Support:** Modern browsers (Chrome, Safari, Firefox, Edge)
- **Performance:** <2s streaming start, <300s completion (Vercel Edge limits)

### Technology Stack
- **Frontend:** Next.js 14+ (App Router), Assistance UI (`@assistant-ui/react`), TypeScript
- **Backend:** Vercel Edge Functions (chat streaming), Node runtime (auth)
- **Auth:** Auth.js/NextAuth with Google + Email providers, JWT sessions
- **AI Model:** Hermes 4 (405B default, 70B optional) via Nous Portal API
- **Hosting:** Vercel (zero DevOps, automatic scaling, global edge network)

### Architecture Pattern
Serverless Jamstack: Edge runtime for streaming, Node runtime for auth, no database required (JWT sessions), proxy to Nous API with system prompt injection

## Constraints & Assumptions

**Constraints:**
- **Budget:** Personal project (Vercel free tier + Nous API costs)
- **Timeline:** Ship MVP in 2 days
- **Resources:** Solo developer, no team
- **Technical:** Vercel Edge 25s timeout, 300s max streaming, no custom authentication flows

**Key Assumptions:**
- Nous Portal API remains stable and accessible
- Hermes 4 continues providing quality spiritual guidance
- Assistance UI framework handles all required chat features
- Google OAuth sufficient for most users
- Friends/family comfortable with web-based access (no native app needed)

## Risks & Open Questions

**Key Risks:**
- **Nous API Reliability:** Dependency on third-party service; mitigation via graceful error handling
- **Prompt Quality:** Panel format must match Nous Portal experience; mitigation via exact prompt preservation
- **Auth Complexity:** Magic links require email service; mitigation via Google OAuth as primary

**Open Questions:**
- Should hybrid reasoning mode be combined with panel format?
- Does `<thinking>` tag output interfere with conversational flow?
- Is Mode 1 sufficient, or will users immediately want custom panels?

**Research Needed:**
- Nous Portal API exact endpoint and authentication format
- Assistance UI runtime requirements and Edge compatibility
- Email provider setup (Resend vs SMTP)

## Next Steps

### Immediate Actions
1. Initialize Next.js project with Assistance UI
2. Set up Auth.js with Google provider
3. Configure Nous Portal API integration
4. Deploy to Vercel and test end-to-end flow
5. Invite initial users from trusted circle

### Development Handoff
This brief provides full context for BuddhaBot. The PRD (`docs/prd.md`) contains detailed implementation specifications, including exact system prompts (which must not be modified). Begin with M0 (Foundation) milestone, focusing on authentication first, then chat streaming with default panel mode.
