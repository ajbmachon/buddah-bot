# BuddhaBot Deployment Guide (October 2025)

Complete step-by-step guide to deploy BuddhaBot to production using Vercel, with accurate UI navigation for current dashboards.

---

## Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] All code committed and pushed to GitHub
- [ ] GitHub account with repository access
- [ ] Google Cloud Platform account (for OAuth)
- [ ] Resend account (for email magic links)
- [ ] Nous Research API key (from portal.nousresearch.com)
- [ ] Local development working (`npm run dev` succeeds)

---

## Part 1: Google OAuth Setup (15 minutes)

### Step 1.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** dropdown (top-left, near Google Cloud logo)
3. Click **NEW PROJECT** button
4. Configure project:
   - **Project name:** "BuddhaBot"
   - **Organization:** Leave as "No organization"
   - Click **CREATE** button
5. Wait for project creation (notification appears top-right)
6. Select newly created "BuddhaBot" project from dropdown

### Step 1.2: Configure OAuth Consent Screen (REQUIRED FIRST)

1. In left sidebar, navigate to: **APIs & Services** → **OAuth consent screen**
2. **User Type:** Select **External** radio button
3. Click **CREATE** button
4. Fill **OAuth consent screen** form:

| Field | Value | Required? |
|-------|-------|-----------|
| App name | BuddhaBot | ✅ Yes |
| User support email | your-email@gmail.com | ✅ Yes |
| App logo | (Optional - upload 120x120px) | ❌ No |
| Application home page | https://your-domain.vercel.app | ❌ No |
| Application privacy policy link | (Leave blank for MVP) | ❌ No |
| Application terms of service link | (Leave blank for MVP) | ❌ No |
| Authorized domains | (Leave blank for MVP) | ❌ No |
| Developer contact information | your-email@gmail.com | ✅ Yes |

5. Click **SAVE AND CONTINUE** button

### Step 1.3: Add OAuth Scopes

1. On **Scopes** step, click **ADD OR REMOVE SCOPES** button
2. In the popup, filter/search for and select:
   - ✅ `.../auth/userinfo.email` - "See your primary Google Account email address"
   - ✅ `.../auth/userinfo.profile` - "See your personal info"
   - ✅ `openid` - "Associate you with your personal info on Google"
3. Click **UPDATE** button
4. Click **SAVE AND CONTINUE** button

### Step 1.4: Add Test Users (While in Testing Mode)

1. On **Test users** step, click **+ ADD USERS** button
2. Enter email addresses (comma-separated):
   - Your email
   - 2-3 friends/family who will test
   - Example: `you@gmail.com, friend@gmail.com`
3. Click **ADD** button
4. Click **SAVE AND CONTINUE** button
5. Review **Summary** page
6. Click **BACK TO DASHBOARD** button

### Step 1.5: Create OAuth Client ID

1. In left sidebar, click **Credentials**
2. Click **+ CREATE CREDENTIALS** button (top)
3. Select **OAuth client ID** from dropdown
4. Configure OAuth client:

| Field | Value |
|-------|-------|
| Application type | **Web application** (dropdown) |
| Name | BuddhaBot Production |

5. **Authorized JavaScript origins:** Click **+ ADD URI** button:
   - Add: `http://localhost:3000`
   - Click **+ ADD URI** again
   - Add: `https://your-project-name.vercel.app` (update after first deploy)

6. **Authorized redirect URIs:** Click **+ ADD URI** button:
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Click **+ ADD URI** again
   - Add: `https://your-project-name.vercel.app/api/auth/callback/google` (update after first deploy)

7. Click **CREATE** button
8. **OAuth client created** popup appears:
   - **Copy Client ID** (starts with: `xxxxx.apps.googleusercontent.com`)
   - **Copy Client Secret** (random string)
   - Click **DOWNLOAD JSON** (optional backup)
   - Click **OK** button

**IMPORTANT:** Save these credentials securely - you'll need them for environment variables.

---

## Part 2: Resend Email Setup (5 minutes)

### Step 2.1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click **Sign Up** button (top-right)
3. Sign up with email or Google
4. Verify email via confirmation link

### Step 2.2: Create API Key

1. After login, navigate to **API Keys** in left sidebar
2. Click **+ Create API Key** button
3. Configure:
   - **Name:** "BuddhaBot Production"
   - **Permission:** Select **Sending access** radio button (recommended)
   - **Domain:** Select **resend.dev** (default testing domain)
4. Click **Add** button
5. **CRITICAL:** Copy API key immediately (format: `re_xxxxxxxxxxxx`)
   - API key shown only once
   - Store securely

### Step 2.3: Test Email Configuration (Optional)

For MVP, you can use the default `onboarding@resend.dev` sender address (no domain setup needed).

**Custom domain setup (Production - Optional):**
1. Click **Domains** in left sidebar
2. Click **+ Add Domain** button
3. Follow DNS setup instructions
4. Wait for verification (5-60 minutes)

---

## Part 3: Vercel Deployment (15 minutes)

### Step 3.1: Prepare Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Verify `.env.local` is NOT committed:**
   ```bash
   git status
   # Should NOT show .env.local in tracked files
   ```

### Step 3.2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login (use GitHub for easy integration)
3. On dashboard, click **Add New...** → **Project** button (top-right)
4. **Import Git Repository** section:
   - Click **+ Add GitHub Account** (if first time)
   - Authorize Vercel to access repositories
   - Find "buddha-bot" repository in list
   - Click **Import** button next to it

5. **Configure Project** page:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./ (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

6. **DO NOT CLICK DEPLOY YET** - Expand **Environment Variables** section first

### Step 3.3: Configure Environment Variables

Still on the **Configure Project** page, in the **Environment Variables** section:

**Add each variable** (click **Add** button after each):

| Name | Value | Notes |
|------|-------|-------|
| `AUTH_SECRET` | (Generate: `openssl rand -base64 32`) | Run command in terminal, paste output |
| `NEXTAUTH_URL` | `http://localhost:3000` | **Update after first deploy** |
| `AUTH_GOOGLE_ID` | `xxxxx.apps.googleusercontent.com` | From Google OAuth Step 1.5 |
| `AUTH_GOOGLE_SECRET` | (from Google OAuth) | From Google OAuth Step 1.5 |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` | From Resend Step 2.2 |
| `EMAIL_FROM` | `onboarding@resend.dev` | Default sender (or custom if domain verified) |
| `NOUS_API_BASE_URL` | `https://api.nousresearch.com/v1` | Fixed value |
| `NOUS_API_KEY` | (from Nous Portal account) | Your Nous Research API key |
| `HERMES_MODEL` | `Hermes-4-405B` | Default model (or `Hermes-4-70B` for cheaper) |

**For each variable:**
1. Enter **Name** (left field)
2. Enter **Value** (right field)
3. Check **Production** checkbox (should be checked by default)
4. Optionally check **Preview** (for branch deployments)
5. Click small **Add** button

### Step 3.4: Deploy to Production

1. After all environment variables added, scroll to bottom
2. Click **Deploy** button
3. **Deployment in progress** page shows:
   - Building logs (real-time)
   - Progress indicators
4. Wait 2-5 minutes for build to complete
5. **Success page** shows:
   - 🎉 Congratulations message
   - Production URL (e.g., `https://buddha-bot-abc123.vercel.app`)
   - **Copy** production URL

### Step 3.5: Update NEXTAUTH_URL

1. **Copy your production URL** from deployment success page
2. Navigate to **Project Settings**:
   - Click project name (top-left breadcrumb) to return to project
   - Click **Settings** tab (top navigation)
3. In left sidebar, click **Environment Variables**
4. Find `NEXTAUTH_URL` variable → click **Edit** (pencil icon)
5. Update **Value** field: `https://your-actual-url.vercel.app`
6. Ensure **Production** is checked
7. Click **Save** button

### Step 3.6: Update Google OAuth Redirect URIs

1. Return to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your **OAuth 2.0 Client ID** name
3. **Authorized JavaScript origins:**
   - Click **+ ADD URI**
   - Add: `https://your-actual-url.vercel.app`
4. **Authorized redirect URIs:**
   - Click **+ ADD URI**
   - Add: `https://your-actual-url.vercel.app/api/auth/callback/google`
5. Click **SAVE** button

### Step 3.7: Redeploy with Updated Environment Variables

1. Return to Vercel project dashboard
2. Click **Deployments** tab (top navigation)
3. Find latest deployment (top of list)
4. Click **⋯** (three dots) menu → **Redeploy**
5. **Redeploy** popup appears:
   - Check **Use existing Build Cache** (optional - faster rebuild)
   - Click **Redeploy** button
6. Wait for new deployment to complete (1-2 minutes)

---

## Part 4: Production Testing (10 minutes)

### Step 4.1: Test Google OAuth Sign-In

1. Open production URL in **incognito/private browser window**
2. Should redirect to `/login` page
3. Click **"Sign in with Google"** button
4. **Google consent screen appears:**
   - May show "Google hasn't verified this app" warning (expected in Testing mode)
   - Click **Advanced** → **Go to BuddhaBot (unsafe)** (safe for your own app)
   - Select Google account
   - Click **Continue** through consent screens
5. **Success:** Redirected back to production site
6. Verify you're on main chat interface (`/` route)
7. Check **session cookie** in DevTools:
   - Open browser DevTools (F12)
   - Application/Storage tab → Cookies
   - Look for `authjs.session-token` cookie

### Step 4.2: Test Email Magic Link Sign-In

1. In same incognito window, **sign out** (if there's a sign-out button)
   - Or close incognito window and open new one
2. Navigate to production URL → redirected to `/login`
3. Enter your email address in email input
4. Click **"Sign in with Email"** button (or equivalent)
5. Check your email inbox
6. **Magic link email** should arrive within 60 seconds
   - From: `onboarding@resend.dev` (or your custom domain)
   - Subject: Similar to "Sign in to BuddhaBot"
7. Click magic link in email
8. **Success:** Redirected to production site with active session
9. Verify chat interface loads

### Step 4.3: Test Chat Streaming

1. While signed in, send test message: "Hello, can you introduce yourself?"
2. Verify:
   - ✅ Streaming response begins within 2 seconds
   - ✅ Panel format appears (3 spiritual teachers)
   - ✅ Response completes without errors
   - ✅ Quality matches expectations
3. Check browser console for errors (should be none)

### Step 4.4: Test Protected Routes

1. **Test without session:**
   - Sign out (or open new incognito window)
   - Navigate directly to production URL
   - **Expected:** Redirected to `/login`
2. **Test with session:**
   - Sign in (Google or email)
   - Navigate to `/`
   - **Expected:** Chat interface loads

### Step 4.5: Check Vercel Function Logs

1. Return to Vercel project dashboard
2. Click **Deployments** tab
3. Click latest deployment
4. Click **Functions** tab
5. Review logs for:
   - ✅ No red error messages
   - ✅ Successful `/api/chat` invocations
   - ✅ Execution times under 25s

---

## Part 5: Troubleshooting Common Issues

### Issue: "redirect_uri_mismatch" Error (Google OAuth)

**Cause:** Production callback URL not added to Google OAuth client

**Fix:**
1. Copy exact error URL from error message
2. Go to Google Cloud Console → Credentials → OAuth Client
3. Add exact URL to **Authorized redirect URIs**
4. Click **SAVE**
5. Try signing in again (no redeploy needed)

### Issue: "This app hasn't been verified by Google"

**Cause:** Expected in Testing mode for External apps

**Fix (Users can proceed):**
1. Click **Advanced** link on warning screen
2. Click **Go to BuddhaBot (unsafe)** link
3. Continue normal sign-in flow

**Alternative (Remove warning - requires verification):**
1. Google Cloud Console → OAuth consent screen
2. Click **PUBLISH APP** button
3. Submit for verification (takes days/weeks if using sensitive scopes)

### Issue: Magic Link Email Not Received

**Possible causes:**
- Resend API key invalid
- Email in spam folder
- Resend quota exceeded (100/day on free tier)

**Debug steps:**
1. Check spam/junk folder
2. Check Resend dashboard → **Emails** tab for delivery status
3. Verify `RESEND_API_KEY` in Vercel env vars
4. Check Vercel function logs for Resend API errors

### Issue: Chat Streaming Times Out (25s)

**Cause:** Vercel Edge Functions have 25s timeout for initial response

**Fix:**
- Ensure Nous API key is valid and has credits
- Consider using `Hermes-4-70B` (faster, cheaper model)
- Check Vercel function logs for upstream API errors
- Test Nous API directly: `curl https://api.nousresearch.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### Issue: "Unauthorized" Error in Chat

**Cause:** Session validation failing or `NEXTAUTH_URL` mismatch

**Debug steps:**
1. Verify `NEXTAUTH_URL` matches production URL exactly (including https://)
2. Verify `AUTH_SECRET` is set in Vercel
3. Check cookies in DevTools - `authjs.session-token` should exist
4. Redeploy after fixing env vars

### Issue: Build Fails on Vercel

**Common causes:**
- TypeScript errors
- Missing dependencies
- Environment variable issues during build

**Debug steps:**
1. Check Vercel build logs for specific error
2. Test local build: `npm run build`
3. Verify all dependencies in `package.json`
4. Check for `process.env` references to missing env vars

---

## Part 6: Post-Deployment Monitoring

### Daily Monitoring (First Week)

**Vercel Dashboard:**
- Check **Deployments** tab for failed builds
- Monitor **Functions** logs for errors
- Review execution times (should be <25s)

**Resend Dashboard:**
- Check **Emails** tab for delivery status
- Monitor quota usage (100/day limit on free tier)
- Check bounce/complaint rates

**User Feedback:**
- Ask initial users about sign-in experience
- Monitor for OAuth consent issues
- Collect feedback on response quality

### Known Limitations to Communicate

When sharing with friends/family, mention:
- ⏱️ Response timeout: 25s for streaming to start (Edge Functions limit)
- 📧 Email delays: Magic links may take 1-2 minutes to arrive
- 🚧 Testing mode: Google may show "unverified app" warning (safe to proceed)
- 💬 No history yet: Conversations not persisted (coming in future update)

---

## Next Steps

### Immediate Actions
- [ ] Share production URL with 3-5 trusted users
- [ ] Monitor Vercel logs for first 24 hours
- [ ] Document any issues or user feedback
- [ ] Address critical bugs if discovered

### Future Improvements (Post-MVP)
- **Epic 2:** Custom panel selection (choose specific teachers)
- **Epic 3:** Conversation history persistence (Vercel KV/Redis)
- **Epic 4:** UI polish, analytics, performance optimization
- **Production OAuth:** Submit for Google verification (if needed)

---

## Quick Reference: Dashboard URLs

| Service | Dashboard URL | Use Case |
|---------|--------------|----------|
| Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) | Deployments, logs, env vars |
| Google Cloud Console | [console.cloud.google.com](https://console.cloud.google.com) | OAuth credentials |
| Resend | [resend.com/emails](https://resend.com/emails) | Email delivery status |
| Nous Research | [portal.nousresearch.com](https://portal.nousresearch.com) | API credits, usage |

---

## Support & Resources

**Documentation:**
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- NextAuth v5: [authjs.dev](https://authjs.dev)
- Resend: [resend.com/docs](https://resend.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

**Need Help?**
- Check Vercel function logs first
- Review this guide's troubleshooting section
- Test each component independently (OAuth, email, chat API)

---

**Deployment Guide Version:** 1.0 (October 2025)
**Last Updated:** Based on current Vercel/Google/Resend UIs as of Oct 2025
