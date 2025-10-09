# BuddhaBot 🧘

A lightweight spiritual wisdom chat application powered by Hermes 4 AI, featuring a panel of spiritual teachers (Eckhart Tolle, Tara Brach, Alan Watts, and others).

**Purpose:** Provide friends and family with easy access to spiritual guidance through an accessible web interface.

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18.17+ (20.x recommended)
- npm or yarn
- Git

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/buddha-bot.git
   cd buddha-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and fill in your credentials (see [Environment Setup](#environment-setup) below).

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Environment Setup

### Required Credentials

You'll need accounts and API keys from:

1. **Google Cloud Console** (OAuth authentication)
2. **Resend** (Email magic links)
3. **Nous Research** (AI model API)

### Quick Setup Guide

#### 1. Google OAuth Setup (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Navigate to **APIs & Services** → **OAuth consent screen**
   - Choose "External" user type
   - Fill app name and support email
4. Navigate to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret** to `.env.local`

**Variables to set:**
```bash
AUTH_GOOGLE_ID=your_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_client_secret
```

#### 2. Resend Email Setup (3 minutes)

1. Sign up at [resend.com](https://resend.com)
2. Navigate to **API Keys** → **Create API Key**
   - Name: "BuddhaBot Development"
   - Permission: **Sending access**
3. Copy API key to `.env.local`

**Variables to set:**
```bash
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=onboarding@resend.dev  # Use default for testing
```

#### 3. Nous Research API (2 minutes)

1. Sign up at [portal.nousresearch.com](https://portal.nousresearch.com)
2. Navigate to API Keys section
3. Copy API key to `.env.local`

**Variables to set:**
```bash
NOUS_API_KEY=your_nous_api_key
HERMES_MODEL=Hermes-4-405B  # Or Hermes-4-70B for cheaper/faster
```

#### 4. AssistantCloud Setup (5 minutes)

AssistantCloud provides zero-config chat history persistence using Assistance UI's official cloud backend.

1. Go to [cloud.assistant-ui.com](https://cloud.assistant-ui.com)
2. Sign up for free account
3. Create new project named `buddhabot`
4. Copy **Frontend API URL** from dashboard (format: `https://api.assistant-ui.com/v1/<project-id>`)
5. Generate and copy **API Key** from dashboard

**Variables to set:**
```bash
NEXT_PUBLIC_ASSISTANT_BASE_URL=https://api.assistant-ui.com/v1/<your-project-id>
ASSISTANT_API_KEY=aui_<your_api_key>
```

**Why AssistantCloud:**
- Zero backend code for persistence
- Automatic thread management
- Built-in ThreadList component
- Works with existing OAuth authentication
- Can migrate to self-hosted later

**Authenticated Mode:**
- User IDs from OAuth sessions (Google/Email)
- History synced across all devices
- Full account-based persistence
- Same user = same threads everywhere

#### 5. Generate Auth Secret

```bash
# Run this command and copy output to .env.local
openssl rand -base64 32
```

**Variable to set:**
```bash
AUTH_SECRET=your_generated_secret
```

### Complete .env.local Template

See [`.env.local.example`](.env.local.example) for full template with all variables.

---

## Production Deployment

**Complete step-by-step guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Deploy to Vercel

1. **Prepare repository:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Add environment variables (see DEPLOYMENT.md for all variables)
   - Click "Deploy"

3. **Update production URLs:**
   - Copy Vercel production URL
   - Update `NEXTAUTH_URL` in Vercel environment variables
   - Add production callback URL to Google OAuth settings
   - Redeploy

4. **Test authentication:**
   - Test Google OAuth sign-in
   - Test email magic link sign-in
   - Test chat streaming

**Full deployment guide with current UI instructions:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Features

### Current (MVP)

- ✅ Google OAuth authentication
- ✅ Email magic link sign-in
- ✅ Streaming chat with Hermes 4 AI
- ✅ Panel mode (3 spiritual teachers respond)
- ✅ **Chat history persistence** (automatic, per-browser)
- ✅ Protected routes (authentication required)
- ✅ Mobile responsive design

### Coming Soon

- 🔄 Custom panel selection (choose specific teachers)
- 🔄 Thread list sidebar (view all conversations)
- 🔄 General wisdom mode (single-voice responses)
- 🔄 UI polish and animations

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.4 |
| Language | TypeScript | 5.9.3 |
| UI Library | Assistance UI | 0.11.10 |
| Styling | Tailwind CSS | 4.1.14 |
| Authentication | Auth.js (NextAuth v5) | 5.0.0-beta |
| Email Provider | Resend | Latest |
| AI Model | Hermes 4 (Nous Research) | 405B / 70B |
| Hosting | Vercel | - |

---

## Project Structure

```
buddha-bot/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   └── login/
│   ├── (chat)/            # Chat interface (protected)
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth handlers
│   │   └── chat/          # Chat streaming endpoint
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── assistant-ui/      # Assistance UI customizations
│   ├── ui/                # shadcn/ui primitives
│   └── auth/              # Auth components
├── lib/                   # Shared utilities
│   ├── auth.ts            # Auth.js configuration
│   ├── prompts.ts         # System prompts (DO NOT MODIFY)
│   └── types.ts           # TypeScript types
├── docs/                  # Project documentation
├── public/                # Static assets
├── middleware.ts          # Route protection
├── DEPLOYMENT.md          # Deployment guide
└── .env.local.example     # Environment variables template
```

---

## Development Scripts

```bash
npm run dev          # Start development server (with Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (when added)
```

---

## Authentication Flow

### Google OAuth
1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. User authorizes app
4. Redirected back to app with session
5. Session stored in JWT cookie

### Email Magic Link
1. User enters email address
2. Magic link sent via Resend
3. User clicks link in email
4. Redirected to app with session
5. Session stored in JWT cookie

### Session Management
- JWT-based sessions (no database required)
- Session expiry: 30 days
- Middleware protects all routes except `/login` and `/api/auth`

---

## API Endpoints

| Endpoint | Runtime | Purpose |
|----------|---------|---------|
| `/api/auth/*` | Node.js | NextAuth authentication handlers |
| `/api/chat` | Edge | Streaming chat completions (Hermes 4) |

---

## Known Limitations (MVP)

- ⏱️ Edge Function timeout: 25s for streaming to start, 300s max total
- 💬 **Chat history**: Full persistence across devices
  - Messages stored in AssistantCloud (persistent cloud storage)
  - User identity from OAuth session (email/user ID)
  - Same account = same history across all devices and browsers
  - Sign out and sign back in = full history restored
  - Threads tied to your authenticated account
- 📧 Email delivery may take 1-2 minutes
- 🚧 Google OAuth shows "unverified app" warning in Testing mode (safe to proceed)

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure Google OAuth callback URL matches exactly
- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.vercel.app/api/auth/callback/google`

### Magic Link Not Received
- Check spam/junk folder
- Verify Resend API key in `.env.local`
- Check Resend dashboard for delivery status

### Chat Streaming Timeout
- Ensure Nous API key is valid and has credits
- Consider using `Hermes-4-70B` (faster model)
- Check Vercel function logs for errors

### AssistantCloud Connection Issues
- Verify `NEXT_PUBLIC_ASSISTANT_BASE_URL` includes project ID in format: `https://api.assistant-ui.com/v1/<project-id>`
- Restart dev server after adding env vars (client-side vars require rebuild)
- Check browser localStorage is enabled (not in incognito mode)
- Verify project exists in AssistantCloud dashboard

### Build Errors
- Run `npm run build` locally to test
- Check for TypeScript errors
- Verify all dependencies installed

---

## Contributing

This is a personal project for friends and family. Not currently accepting external contributions.

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

Feel free to use, modify, and build upon this code for your own projects!

---

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. Review Vercel function logs
3. Test each component independently

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Assistance UI](https://github.com/Yonom/assistant-ui) - AI chat interface
- [Auth.js](https://authjs.dev/) - Authentication
- [Resend](https://resend.com/) - Email delivery
- [Nous Research](https://nousresearch.com/) - Hermes 4 AI model
- [Vercel](https://vercel.com/) - Hosting platform

---

**Made with ❤️ for spiritual seekers**
