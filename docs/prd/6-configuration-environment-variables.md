# 6) Configuration & Environment Variables

```bash
# Nous API
NOUS_API_KEY=...
NOUS_API_BASE_URL=https://api.nousresearch.com  # verify from Nous Portal docs
HERMES_MODEL=Hermes-4-405B  # or Hermes-4-70B

# Mode Selection (MVP)
BUDDHABOT_MODE=panel  # default | custom | wisdom

# Auth - Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Auth - Email Magic Link
EMAIL_FROM=buddhabot@yourdomain.com
RESEND_API_KEY=...

# NextAuth
NEXTAUTH_URL=https://buddhabot.yourdomain.com
NEXTAUTH_SECRET=...  # generate with: openssl rand -base64 32

# App
NODE_ENV=production
```

All secrets in Vercel Project Settings → Environment Variables. Never commit to git.

---
