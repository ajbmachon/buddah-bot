# Development Workflow

## Prerequisites

```bash
# Node.js 18.17+ or 20+ (Next.js 15 requirement)
node --version  # Should be >= 18.17

# npm 9+ (comes with Node 18+)
npm --version

# Git
git --version
```

---

## Initial Setup

```bash
# 1. Clone repository (if not already done)
git clone <repository-url>
cd buddha-bot

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Configure environment variables
# Edit .env.local with your keys:
# - NOUS_API_KEY (from portal.nousresearch.com)
# - AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET (from Google Console)
# - AUTH_RESEND_KEY (from resend.com)
# - AUTH_SECRET (generate with: openssl rand -base64 32)

# 5. Initialize Tailwind CSS (if not done)
npx tailwindcss init -p

# 6. (Optional) Setup Git hooks
# Create .husky/ directory for pre-commit hooks
```

---

## Development Commands

```bash
# Start dev server (with Turbopack)
npm run dev
# Opens at http://localhost:3000

# Start dev server (without Turbopack - fallback)
npm run dev:webpack

# Build for production
npm run build

# Start production server (locally)
npm run start

# Lint code
npm run lint

# Lint and fix
npm run lint:fix

# Type check
npm run type-check

# Run tests (unit + integration)
npm test

# Run tests in watch mode
npm test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

---

## Environment Configuration

### Required Environment Variables

**Development (`.env.local`):**
```bash
# Nous API
NOUS_API_KEY=sk_nous_your_key_here
NOUS_API_BASE_URL=https://api.nousresearch.com/v1
HERMES_MODEL=Hermes-4-405B

# Mode Selection
BUDDHABOT_MODE=panel

# Auth - Google OAuth
AUTH_GOOGLE_ID=your-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-your-secret

# Auth - Email Magic Link
EMAIL_FROM=noreply@yourdomain.com
AUTH_RESEND_KEY=re_your_resend_key

# Auth.js
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_URL=http://localhost:3000

# App
NODE_ENV=development
```

**Production (Vercel Environment Variables):**
```bash
# Same as above, but:
AUTH_URL=https://buddhabot.yourdomain.com
NODE_ENV=production

# Vercel automatically provides:
# VERCEL=1
# VERCEL_ENV=production
# VERCEL_URL=buddhabot.vercel.app
```

---

## Development Workflow Best Practices

1. **Branch Strategy:**
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   git add .
   git commit -m "feat: add feature description"
   git push origin feature/your-feature-name
   # Create PR on GitHub
   ```

2. **Code Quality Checks:**
   ```bash
   # Before committing
   npm run lint
   npm run type-check
   npm test
   ```

3. **Local Testing:**
   ```bash
   # Test build locally before deploying
   npm run build
   npm run start
   # Visit http://localhost:3000
   ```

4. **Environment Sync:**
   - Keep `.env.local.example` updated with new variables
   - Never commit `.env.local` to Git
   - Update Vercel env vars when adding new variables

5. **Hot Reload:**
   - Next.js dev server auto-reloads on file changes
   - Turbopack provides faster HMR (3.78x faster)
   - If HMR breaks, restart dev server
