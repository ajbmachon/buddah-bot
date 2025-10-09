# 5) Authentication (Simple & Flexible)

**Primary: Google OAuth**

Fast, zero friction, no password handling.

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Secondary: Email**

Option A - **Magic Link** (recommended):
- User enters email → receives verification link
- Click link → signed in
- No passwords, no database

```env
EMAIL_FROM=buddhabot@yourdomain.com
RESEND_API_KEY=...  # or SMTP config
```

Option B - **Email + Password with Verification**:
- User signs up with email/password
- Receive verification email
- Click to verify → can sign in
- Requires database (Postgres + Prisma)

**MVP Decision:** Google OAuth + Email Magic Link. No passwords unless explicitly needed.

**Session Strategy:** JWT (no database needed)

---
