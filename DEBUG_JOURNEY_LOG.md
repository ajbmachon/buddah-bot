# Debug Journey Log: AssistantCloud Integration Issue

## Current Status: BLOCKED - Authorization Failed

**Date:** 2025-10-08
**Story:** 3.2 - Integrate AssistantCloud with Existing Chat Runtime
**Error:** "Authorization failed" when AssistantCloud tries to access threads

---

## Problem Statement

Chat messages are not persisting. AssistantCloud throws "Authorization failed" error when trying to list/initialize threads. The token generation endpoint exists but authentication is failing.

**Error Stack:**
```
Runtime Error: Authorization failed
at AssistantCloudAPI.makeRawRequest (AssistantCloudAPI.tsx:71:29)
at async AssistantCloudAPI.makeRequest (AssistantCloudAPI.tsx:118:22)
at async Object.list (cloud.tsx:79:27)
```

---

## Environment Configuration

### Verified Environment Variables
```bash
NEXT_PUBLIC_ASSISTANT_BASE_URL=https://proj-07vk51r3xtjc.assistant-api.com
ASSISTANT_API_KEY=sk_aui_proj_07vk51r3xtj... (redacted, confirmed present)
```

**Base URL format:** Correct (proj-* prefix is standard)
**API Key format:** Correct (sk_aui_proj_* is valid)

---

## Current Implementation

### File: `app/api/assistant-ui-token/route.ts`
```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AssistantCloud } from "assistant-cloud"; // Server-side SDK

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assistantCloud = new AssistantCloud({
      apiKey: process.env.ASSISTANT_API_KEY!,
      userId: session.user.email,
      workspaceId: session.user.email,
    });

    const { token } = await assistantCloud.auth.tokens.create();

    // Return raw token string (not JSON)
    return new Response(token, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[Token Endpoint] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
```

### File: `app/assistant.tsx` (lines 23-30)
```typescript
const cloud = new AssistantCloud({
  baseUrl: process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL!,
  authToken: async () => {
    const res = await fetch("/api/assistant-ui-token", { method: "POST" });
    if (!res.ok) return null;
    return res.text(); // Return raw token string
  },
});
```

---

## What We Tried (Chronologically)

### Attempt 1: Direct Email as authToken (FAILED)
**Approach:** Pass session email directly as authToken
**Why it failed:** AssistantCloud expects JWT token, not plain string
**Error:** `SyntaxError: Unexpected token 'r', "r" is not valid JSON`

### Attempt 2: Anonymous Mode Testing (SKIPPED)
**Reason:** Project requires authenticated mode with Auth.js integration per Epic 3 requirements

### Attempt 3: Manual API Call to /workspaces (FAILED)
**Approach:** Tried manual fetch to `${baseUrl}/workspaces` endpoint
**Why it failed:** Wrong pattern - must use AssistantCloud SDK, not manual API calls

### Attempt 4: Wrong SDK Import (FAILED)
**Issue:** Imported `AssistantCloud` from `@assistant-ui/react` (client-only)
**Fix:** Installed and imported from `assistant-cloud` package (server SDK)
**Result:** Still failing with authorization error

### Attempt 5: Response Format Issues (FIXED BUT INSUFFICIENT)
**Issue:** Returned `{ token }` JSON instead of raw string
**Fix:** Changed to `new Response(token, { headers: { "Content-Type": "text/plain" } })`
**Client fix:** Changed from `.json()` to `.text()`
**Result:** Token endpoint format corrected, but authorization still failing

### Attempt 6: Config Property Name (FIXED BUT INSUFFICIENT)
**Issue:** Tried using `tokenEndpoint` property (doesn't exist)
**Fix:** Changed to `authToken: async () => { ... }` function
**Result:** Correct API usage, but authorization still failing

---

## Critical Research Findings

### From Research Agent #1 (Authentication Flow)
- AssistantCloud uses workspace-scoped tokens with 5-minute TTL
- Token must be returned as **raw string**, not JSON object
- Client must call backend endpoint, never expose API key to frontend
- Three valid config patterns:
  1. `{ baseUrl, authToken: () => Promise<string> }` ← We're using this
  2. `{ apiKey, userId, workspaceId }` ← Server-side only
  3. `{ baseUrl, anonymous: true }` ← Not allowed per project requirements

### From Research Agent #2 (API Configuration)
- Base URL format `https://proj-*.assistant-api.com` is correct
- API key format `sk_aui_proj_*` is correct
- API key must NEVER be exposed to frontend (we're compliant)
- Anonymous mode was incorrectly suggested in early docs but project requires Auth.js

### From Research Agent #3 (Working Examples)
- Pattern matches official AssistantCloud documentation
- NextAuth integration follows standard token generation pattern
- No known breaking changes in current versions

---

## Package Versions

```json
{
  "@assistant-ui/react": "0.11.28",
  "@assistant-ui/react-ai-sdk": "1.1.5",
  "assistant-cloud": "latest",
  "next-auth": "5.0.0-beta",
  "next": "15.5.4"
}
```

---

## Diagnostic Questions (NEED ANSWERS)

### 1. Token Endpoint Logs
**Check terminal for:**
```
[Token Endpoint] Request received
[Token Endpoint] Session: { hasSession: ?, hasEmail: ?, email: ? }
[Token Endpoint] API Key present: true
[Token Endpoint] Creating token for user: <email>
[Token Endpoint] Token created successfully, length: <number>
```

**If token creation fails, error will show:**
```
[Token Endpoint] Error details: <actual error>
```

### 2. Network Tab Analysis
**In browser DevTools → Network:**
- Does `/api/assistant-ui-token` return 200 or 500?
- What is the response body (should be raw JWT string)?
- Are there requests to AssistantCloud API after token fetch?
- What status codes do AssistantCloud API requests return?

### 3. Browser Console
**Look for:**
- AssistantCloud initialization logs
- Token fetch errors
- "Authorization failed" error details

### 4. API Key Validation
**Verify in AssistantCloud dashboard:**
- API key is active (not revoked)
- API key has correct permissions
- Project `proj-07vk51r3xtjc` exists and is active

---

## Hypotheses for Authorization Failure

### Hypothesis 1: API Key Invalid/Expired
**Test:** Generate new API key in AssistantCloud dashboard, update `.env.local`
**Likelihood:** Medium - could be key issue or permission issue

### Hypothesis 2: Base URL Mismatch
**Test:** Verify exact baseUrl from AssistantCloud project settings
**Check:** Should it be `https://api.assistant-ui.com` instead of `proj-*.assistant-api.com`?
**Likelihood:** Medium - URL format might be wrong

### Hypothesis 3: Workspace Token Creation Failing
**Test:** Check server logs for token creation errors
**Look for:** Error in `assistantCloud.auth.tokens.create()` call
**Likelihood:** High - token endpoint might be failing silently

### Hypothesis 4: Token Not Reaching AssistantCloud API
**Test:** Log the actual token value (first 20 chars) before returning
**Check:** Is token being passed to AssistantCloud API requests?
**Likelihood:** Medium - token might not be used correctly by SDK

### Hypothesis 5: Missing BaseUrl in Server-Side SDK
**Test:** The server-side `AssistantCloud` instance might need baseUrl
**Current:** Only using `{ apiKey, userId, workspaceId }`
**Should try:** Adding `baseUrl` to server config?
**Likelihood:** Low - but worth testing

---

## Next Steps (Priority Order)

### STEP 1: Verify Token Endpoint Actually Works
```bash
# In browser console after logging in:
fetch('/api/assistant-ui-token', { method: 'POST' })
  .then(r => r.text())
  .then(token => console.log('Token:', token.substring(0, 50)))
```

**Expected:** Long JWT string starting with `eyJ...`
**If fails:** Check server logs for error details

### STEP 2: Test Anonymous Mode (Quick Validation)
Temporarily test if AssistantCloud connection itself works:

```typescript
// app/assistant.tsx (TEMPORARY TEST)
const cloud = new AssistantCloud({
  baseUrl: process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL!,
  anonymous: true, // TEMPORARY - just to test connection
});
```

**If anonymous works:** Problem is in token generation/auth flow
**If anonymous fails:** Problem is with AssistantCloud credentials/config

### STEP 3: Validate API Key Directly
Test if API key can create tokens at all:

```typescript
// app/api/test-token/route.ts (TEMPORARY)
import { AssistantCloud } from "assistant-cloud";

export async function GET() {
  try {
    const cloud = new AssistantCloud({
      apiKey: process.env.ASSISTANT_API_KEY!,
      userId: "test-user",
      workspaceId: "test-workspace",
    });

    const { token } = await cloud.auth.tokens.create();

    return Response.json({
      success: true,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20)
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error)
    });
  }
}
```

Visit `/api/test-token` - does it create a token successfully?

### STEP 4: Check AssistantCloud Dashboard
- Verify project `proj-07vk51r3xtjc` exists
- Check API usage/logs (if available)
- Regenerate API key if needed
- Confirm baseUrl from project settings

### STEP 5: Try Alternative Base URL Format
Some docs suggest different URL format:

```typescript
// Try this if current baseUrl fails
baseUrl: "https://api.assistant-ui.com"
// instead of
baseUrl: "https://proj-07vk51r3xtjc.assistant-api.com"
```

---

## Code Cleanup Needed After Fix

1. Remove debug `console.log` statements from `/api/assistant-ui-token/route.ts`
2. Delete `/api/test-token/route.ts` (if created)
3. Remove any temporary anonymous mode tests
4. Update README with working configuration
5. Mark Story 3.2 tasks as complete
6. Run manual persistence tests (Task 3-6)

---

## Files Modified in This Session

```
✓ app/api/assistant-ui-token/route.ts (created)
✓ app/assistant.tsx (modified - added cloud config)
✓ lib/assistantcloud-test.ts (deleted - temp file)
✓ README.md (updated with usage notes)
✓ package.json (added assistant-cloud dependency)
```

---

## Reference Documentation

**AssistantCloud Config Type (from node_modules/assistant-cloud/dist/AssistantCloudAPI.d.ts):**
```typescript
export type AssistantCloudConfig =
  | { baseUrl: string; authToken: () => Promise<string | null>; }
  | { apiKey: string; userId: string; workspaceId: string; }
  | { baseUrl: string; anonymous: true; };
```

**Key Insight:** Our client uses option 1, server uses option 2. Both should work independently.

---

## Success Criteria

When fixed, you should see:
- No "Authorization failed" errors
- Messages persist after page refresh
- Thread list loads in sidebar
- Network tab shows successful AssistantCloud API requests
- Console logs show successful token creation

---

## Claude 4 Prompting Best Practices Applied

- ✅ Clear problem statement upfront
- ✅ Chronological attempt history (what failed and why)
- ✅ Current implementation shown with context
- ✅ Specific hypotheses with test steps
- ✅ Prioritized next actions
- ✅ Environment details and versions
- ✅ Success criteria defined
- ✅ All relevant code snippets included
- ✅ Research findings summarized
- ✅ Files modified documented

---

**Last Working State:** Epic 2 (chat streaming) works perfectly. Epic 3 (persistence) blocked on this authorization issue.

**Project Context:** BuddahBot - spiritual wisdom chat app for friends/family. Uses Google OAuth (working), Hermes 4 AI (working), Assistance UI (working except persistence).

**Story Files:** See `docs/stories/3.2.integrate-assistantcloud-chat-runtime.md` for full acceptance criteria.
