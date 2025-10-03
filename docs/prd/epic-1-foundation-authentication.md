# Epic 1: Foundation & Authentication

## Epic Goal

Establish the core project infrastructure with Next.js, Assistance UI, and authentication, enabling users to sign in with Google OAuth or email magic links, and deploy the application to Vercel with a protected chat interface.

## Epic Description

**Existing System Context:**
- Greenfield project with no existing codebase
- Targeting modern web browsers (Chrome, Safari, Firefox, Edge)
- Deploying to Vercel for zero-DevOps serverless hosting

**Enhancement Details:**
- **What's being added:** Next.js 14+ application with App Router, Assistance UI chat framework, Auth.js authentication with Google OAuth and email providers, JWT sessions, and Vercel deployment
- **How it integrates:** Standalone application with no external integrations yet (Nous API integration comes in Epic 2)
- **Success criteria:** User can visit the deployed site, authenticate with Google or email, and see a protected chat interface

## Stories

### Story 1.1: Initialize Next.js Project with Assistance UI

**As a** developer,
**I want** to initialize a Next.js project with Assistance UI configured,
**so that** I have the foundation for building the chat interface.

**Acceptance Criteria:**
1. Next.js 14+ project initialized with App Router and TypeScript
2. `@assistant-ui/react` package installed and configured
3. Basic chat page renders with Assistance UI `<Thread>` component
4. Project runs locally on `localhost:3000`
5. `.gitignore` properly configured for Node.js projects
6. Initial commit created with project structure

---

### Story 1.2: Set Up Auth.js with Google OAuth and Email Providers

**As a** user,
**I want** to sign in with Google OAuth or receive a magic link via email,
**so that** I can access the chat application without managing passwords.

**Acceptance Criteria:**
1. Auth.js/NextAuth installed and configured with Google OAuth provider
2. Email provider configured with magic link authentication (no passwords)
3. JWT session strategy implemented (no database required for sessions)
4. Environment variables defined for:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `EMAIL_FROM`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (or `RESEND_API_KEY`)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
5. `/api/auth/[...nextauth]/route.ts` properly configured
6. Custom login page created at `/login` with both auth options
7. Session accessible via `getServerSession()` in API routes and `useSession()` in client components

---

### Story 1.3: Protect Chat Routes with Authentication Middleware

**As a** user,
**I want** the chat interface to be protected by authentication,
**so that** only signed-in users can access conversations.

**Acceptance Criteria:**
1. Next.js middleware configured to protect `/` and `/chat` routes
2. Unauthenticated users redirected to `/login` page
3. Authenticated users can access chat interface
4. Session data available in protected routes
5. Sign-out functionality working correctly

---

### Story 1.4: Deploy to Vercel with Environment Variables

**As a** developer,
**I want** to deploy the application to Vercel with all required environment variables configured,
**so that** authentication works in production and the app is accessible to users.

**Acceptance Criteria:**
1. Project connected to Vercel via GitHub/GitLab integration
2. All environment variables configured in Vercel project settings:
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Email provider credentials
   - `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (production URL)
3. OAuth callback URLs configured in Google Cloud Console for production domain
4. Deployment successful with no build errors
5. Production site accessible at Vercel-provided URL
6. Authentication flow working end-to-end in production:
   - Google OAuth sign-in successful
   - Email magic link sign-in successful
   - Protected routes properly enforcing authentication

---

## Compatibility Requirements

- [ ] Next.js 14+ with App Router
- [ ] Node.js 18+ runtime for auth routes
- [ ] Modern browser support (ES2020+)
- [ ] Mobile responsive design (via Assistance UI defaults)

## Risk Mitigation

**Primary Risk:** Email provider configuration issues causing magic link delivery failures

**Mitigation:**
- Use Google OAuth as primary authentication method
- Document clear SMTP/Resend setup instructions
- Test magic link delivery in both development and production

**Rollback Plan:**
- If email auth fails, disable email provider and rely solely on Google OAuth
- If deployment fails, roll back to previous Vercel deployment

## Definition of Done

- [ ] All stories completed with acceptance criteria met
- [ ] Project deployed to Vercel and accessible via public URL
- [ ] Both Google OAuth and email magic link authentication working in production
- [ ] Chat interface protected by authentication middleware
- [ ] No build or runtime errors in production
- [ ] Initial users can successfully sign in and see the chat interface

---
