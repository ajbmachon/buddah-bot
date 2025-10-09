# Introduction

This document outlines the complete fullstack architecture for **BuddhaBot**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

## Starter Template or Existing Project

**Decision: Assistance UI Framework (`@assistant-ui/react`) on Next.js**

The foundational architectural choice is **Assistance UI** - a complete React framework for building AI chat interfaces. This is not a traditional starter template, but rather a comprehensive UI framework that dictates our frontend architecture.

**What Assistance UI Provides Out-of-Box:**
- Thread and message rendering components
- Composer with voice/text input
- Regenerate/edit functionality
- File sharing capability
- Markdown rendering
- Mobile responsive design
- Runtime provider for API integration

**Technical Foundation:**
- Built on React (works with Next.js App Router)
- Next.js 14+ with App Router for application structure
- Vercel for deployment (optimal for Next.js + Edge runtime)
- TypeScript support

**Why This Choice:**
- PRD explicitly requires chat interface with streaming, voice, regenerate capabilities
- Building these features from scratch would be significant over-engineering
- Assistance UI is purpose-built for exactly this use case
- Allows MVP focus on spiritual guidance logic, not UI plumbing

**What We Build:**
- Next.js application structure
- Auth integration (Auth.js/NextAuth)
- `/api/chat` Edge route to proxy Nous API
- System prompt injection logic
- Integration between Assistance UI runtime and our backend

**Constraints Inherited:**
- Must follow Assistance UI runtime patterns for `/api/chat` endpoint
- Frontend UI customization limited to Assistance UI theming
- Next.js App Router structure (not Pages Router)
- Vercel Edge runtime limits (25s timeout, Node.js for auth)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-03 | 1.0 | Initial architecture document | Winston (Architect) |
