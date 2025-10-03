# Deployment Architecture

## Deployment Strategy

**Platform:** Vercel (zero-config deployment)

**Deployment Triggers:**
- **Production:** Push to `main` branch → auto-deploy to production
- **Preview:** Push to any branch → auto-deploy to preview URL
- **Local:** Manual deploy via `vercel --prod`

---

## Frontend Deployment

**Platform:** Vercel Edge Network

**Build Command:**
```bash
npm run build
# Equivalent to: next build
```

**Output Directory:**
```
.next/
```

**CDN/Edge:**
- Static assets served from Vercel CDN
- Edge runtime functions deployed globally
- Automatic SSL/TLS certificates

**Environment:**
- Static pages: Pre-rendered at build time
- Dynamic pages: Server-rendered on request
- Edge API routes: Executed at nearest edge location

---

## Backend Deployment

**Platform:** Vercel Serverless Functions

**Build Command:** Included in `next build`

**Deployment Method:**
- Edge runtime: `/api/chat` (streaming)
- Node runtime: `/api/auth/*` (authentication)
- Automatic function detection from `export const runtime`

**Configuration:**
```typescript
// app/api/chat/route.ts
export const runtime = "edge";
export const maxDuration = 25; // seconds

// app/api/auth/[...nextauth]/route.ts
// Defaults to Node runtime (no export needed)
```

---

## CI/CD Pipeline

**Default: Vercel GitHub Integration**

1. **Setup:**
   - Connect GitHub repo to Vercel
   - Vercel auto-detects Next.js project
   - Configure environment variables in Vercel dashboard

2. **Automatic Deployments:**
   ```
   git push origin main
   ↓
   Vercel detects push
   ↓
   Runs: npm install && npm run build
   ↓
   Deploys to production (if main) or preview (if branch)
   ↓
   Updates deployment URL
   ```

3. **Manual Deployment:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy to production
   vercel --prod

   # Deploy preview
   vercel
   ```

**Optional GitHub Actions (`.github/workflows/ci.yaml`):**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

      # Vercel handles deployment automatically
```

---

## Environments

| Environment | Frontend URL | Backend URL | Purpose | Branch |
|-------------|-------------|-------------|---------|--------|
| **Development** | http://localhost:3000 | http://localhost:3000/api | Local development | N/A |
| **Preview** | https://buddahbot-git-[branch]-[team].vercel.app | Same | Feature testing, PRs | Any non-main |
| **Production** | https://buddahbot.yourdomain.com | Same | Live users | main |

**Custom Domain Setup:**
1. Go to Vercel dashboard → Settings → Domains
2. Add custom domain: `buddahbot.yourdomain.com`
3. Follow DNS configuration instructions (add A/CNAME records)
4. Vercel auto-provisions SSL certificate

---

## Deployment Checklist

**Before First Deploy:**
- [ ] Environment variables configured in Vercel
- [ ] Custom domain added (if applicable)
- [ ] Google OAuth callback URLs updated for production domain
- [ ] Resend domain verified for production sending
- [ ] `AUTH_URL` set to production domain

**Before Each Deploy:**
- [ ] Code passes `npm run lint`
- [ ] Code passes `npm run type-check`
- [ ] Tests pass `npm test`
- [ ] Build succeeds locally `npm run build`
- [ ] Environment variables updated (if new ones added)

**After Deploy:**
- [ ] Test login flow (Google OAuth)
- [ ] Test login flow (Email magic link)
- [ ] Test chat streaming
- [ ] Check Vercel function logs for errors
- [ ] Verify custom domain works

---

## Rollback Strategy

**Automatic Rollback (Vercel):**
1. Go to Vercel dashboard → Deployments
2. Find last known good deployment
3. Click "..." menu → "Promote to Production"
4. Previous deployment instantly becomes live

**Git Rollback:**
```bash
# Revert last commit
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version

# Or hard reset (use with caution)
git reset --hard <commit-hash>
git push --force origin main
```

---

## Performance Optimization

**Build-time:**
- Turbopack for faster builds (dev mode)
- Webpack for production (stable, optimized)
- Automatic code splitting per route
- Image optimization via Next.js Image component

**Runtime:**
- Edge runtime for streaming (low latency)
- Vercel CDN for static assets
- Automatic caching headers
- Streaming responses (no buffering)

**Monitoring:**
- Vercel Analytics (page views, Web Vitals)
- Function logs (Vercel dashboard)
- Edge network performance metrics
