# Error Handling Strategy

## Philosophy

**Keep it simple.** Three main error types, friendly messages, log for debugging.

---

## Three Error Types

### 1. Authentication Errors (401)
**What:** Session missing or expired
**User sees:** "Please sign in again"
**Action:** Redirect to `/login`

### 2. Input Errors (422)
**What:** Invalid message format
**User sees:** "Please check your message and try again"
**Action:** Show inline error, let user fix

### 3. Service Errors (500)
**What:** Nous API down, network issues, unexpected errors
**User sees:** "Something went wrong. Please try again."
**Action:** Show retry button

**That's it.** Three errors cover 99% of cases.

---

## Error Response Format

**Standard format for all API errors:**
```json
{
  "error": {
    "code": "unauthorized" | "validation_error" | "service_error",
    "message": "Human-readable message"
  }
}
```

---

## Backend Implementation

**Simple error helper:**
```typescript
// app/api/chat/route.ts
function errorResponse(code: string, message: string, status: number) {
  return new Response(
    JSON.stringify({ error: { code, message } }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(req: Request) {
  // 1. Check auth
  const session = await auth();
  if (!session?.user) {
    return errorResponse('unauthorized', 'Please sign in again', 401);
  }

  try {
    // 2. Parse input
    const { messages } = await req.json();
    if (!messages?.length) {
      return errorResponse('validation_error', 'Please check your message', 422);
    }

    // 3. Call Nous API
    const response = await fetch(nousApiUrl, {...});
    if (!response.ok) {
      console.error('Nous API error:', response.status);
      return errorResponse('service_error', 'AI service unavailable', 500);
    }

    // 4. Stream response
    return new Response(response.body, { headers });

  } catch (error) {
    console.error('Chat error:', error);
    return errorResponse('service_error', 'Something went wrong', 500);
  }
}
```

---

## Frontend Implementation

**Assistance UI displays errors automatically:**
```typescript
// components/chat/Thread.tsx
"use client";

import { useThread } from "@assistant-ui/react";

export function Thread() {
  const { error } = useThread();

  return (
    <div>
      {error && (
        <div className="error-banner">
          {error.message || "Something went wrong. Please try again."}
        </div>
      )}
      <ThreadPrimitive.Messages />
      <Composer />
    </div>
  );
}
```

**That's it.** Assistance UI handles the rest.

---

## User-Facing Messages

```typescript
// Keep messages friendly and actionable
const messages = {
  unauthorized: "Your session expired. Please sign in again.",
  validation_error: "Please check your message and try again.",
  service_error: "Our AI service is temporarily unavailable. Please try again in a moment.",
};
```

---

## Logging for Debugging

**Always log errors with context:**
```typescript
console.error('Chat request failed', {
  timestamp: new Date().toISOString(),
  userId: session?.user?.id,
  error: error.message,
  stack: error.stack,
});
```

**View logs:** Vercel Dashboard → Functions → Logs

---

## Future: Advanced Error Handling

**Add later if needed:**
- Rate limiting errors (429)
- Timeout errors (504)
- Network retry logic
- Error tracking service (Sentry)

**For MVP:** Three error types are sufficient. Focus on shipping.
