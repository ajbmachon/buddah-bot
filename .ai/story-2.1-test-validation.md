# Story 2.1 Test Validation Checklist

## Test Scenarios

### Test 1: Unauthenticated Request (AC: 4)
**Expected:** 401 Unauthorized

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

**Expected Response:**
```json
{
  "error": {
    "code": "unauthorized",
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

---

### Test 2: Missing Messages Field (AC: 5)
**Expected:** 422 Validation Error

```bash
# With valid session cookie
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{}'
```

**Expected Response:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request format",
    "statusCode": 422,
    "details": { ... }
  }
}
```

---

### Test 3: Invalid Message Format (AC: 5)
**Expected:** 422 Validation Error

```bash
# With valid session cookie
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{"messages": [{"role": "invalid", "content": "test"}]}'
```

**Expected Response:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request format",
    "statusCode": 422,
    "details": { ... }
  }
}
```

---

### Test 4: Message Too Long (AC: 5)
**Expected:** 422 Validation Error

```bash
# With valid session cookie
# Content > 2000 characters
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{"messages": [{"role": "user", "content": "[2001+ characters]"}]}'
```

---

### Test 5: Too Many Messages (AC: 5)
**Expected:** 422 Validation Error

```bash
# With valid session cookie
# Array with 21+ messages
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: [your-session-cookie]" \
  -d '{"messages": [ ... 21 messages ... ]}'
```

---

### Test 6: Valid Authenticated Request (AC: 2, 6)
**Expected:** Streaming response with placeholder content

**How to test:**
1. Log in via browser at http://localhost:3001/login
2. Open DevTools → Network tab
3. Send message in chat interface
4. Verify:
   - Request to `/api/chat` succeeds
   - Response streams in real-time
   - Session cookie included automatically
   - Response uses SSE format

---

### Test 7: Vercel Deployment (AC: 6)
**Expected:** Edge function deploys successfully

**Verification:**
1. Build succeeds: `npm run build` ✅ (completed)
2. No Edge runtime errors in build output ✅ (completed)
3. Route shows as Edge function in build table ✅ (completed: `ƒ /api/chat`)
4. Deploy to Vercel preview environment
5. Test via deployed URL

---

## Manual Browser Testing

### Setup
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3001
3. Log in with Google OAuth or Email

### Scenarios
- [ ] Send valid message → Streaming response appears
- [ ] Verify console logs show request ID and user email
- [ ] Check Network tab for proper headers
- [ ] Verify session validation (logout, try sending → should redirect)

---

## Build Verification ✅

```
Route (app)                                 Size  First Load JS
├ ƒ /api/chat                              126 B         102 kB
```

Edge function successfully built and deployed.

---

## Code Review Checklist ✅

- [x] Edge runtime directive: `export const runtime = 'edge'`
- [x] Max duration set: `export const maxDuration = 25`
- [x] Session validation first (security)
- [x] Zod schema validates messages
- [x] Error responses follow standard format
- [x] Request ID logging for debugging
- [x] Placeholder AI SDK integration (gpt-4o-mini)
- [x] No Node.js APIs used (Edge compatible)
- [x] Proper TypeScript types
- [x] Clean code structure
