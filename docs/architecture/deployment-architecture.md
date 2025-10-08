# Deployment Architecture

## Deployment Strategy

**Platform:** Vercel (zero-config deployment)

**Philosophy:** Keep it simple. Push to main, Vercel deploys. No CI/CD needed for solo MVP.

**Deployment Triggers:**
- **Production:** Push to `main` branch → auto-deploy to production
- **Preview:** Push to any branch → auto-deploy to preview URL

---

## Setup (One-Time)

**1. Connect GitHub to Vercel:**
- Go to vercel.com → New Project
- Import your GitHub repo
- Vercel auto-detects Next.js
- Click Deploy

**2. Configure Environment Variables:**
- Vercel Dashboard → Settings → Environment Variables
- Add all required secrets (see PRD Section 6)
- Vercel auto-injects them at build/runtime

**3. (Optional) Custom Domain:**
- Vercel Dashboard → Settings → Domains
- Add `buddhabot.yourdomain.com`
- Follow DNS instructions (add A/CNAME)
- SSL certificate auto-provisioned

---

## How It Works

```
git push origin main
↓
Vercel detects push
↓
npm install && npm run build
↓
Deploy to production
↓
Live at buddhabot.vercel.app
```

**That's it.** No configuration files, no CI/CD pipelines, no deployment scripts.

---

## Environments

| Environment | URL Pattern | Purpose | Branch |
|-------------|------------|---------|--------|
| **Development** | http://localhost:3000 | Local dev | N/A |
| **Preview** | https://buddhabot-git-[branch].vercel.app | Feature testing | Any non-main |
| **Production** | https://buddhabot.vercel.app | Live users | main |

---

## Pre-Deploy Checklist (5 minutes)

**Before pushing to main:**
- [ ] Code works locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Environment variables updated in Vercel (if new ones added)

**After deploy (manual smoke test):**
- [ ] Login works (Google OAuth)
- [ ] Send message → receive streaming response
- [ ] Check Vercel logs for errors
- [ ] (Optional) Test on mobile

---

## Rollback Strategy

**If production breaks:**

**Option 1: Instant Rollback (Recommended)**
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → Promote to Production
4. Previous version live in ~10 seconds

**Option 2: Git Revert**
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version
```

---

## Performance Optimization (Automatic)

**Vercel handles:**
- Edge runtime for `/api/chat` (global distribution)
- CDN for static assets
- Automatic code splitting
- Image optimization
- HTTPS/SSL
- Caching headers

**You handle:**
- Nothing! It's automatic.

---

## Future: CI/CD Pipeline

**Add CI/CD when:**
- Multiple developers join
- Automated tests are written
- Need to enforce checks before deploy

**Recommended setup:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run type-check
      - run: npm test
      # Vercel still handles deployment
```

**For MVP:** Skip CI/CD. Vercel auto-deploy + manual testing is sufficient.
