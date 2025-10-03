# Coding Standards

## Critical Fullstack Rules

These rules prevent common mistakes and ensure consistency. Dev agents MUST follow these.

---

**1. Type Sharing:**
- All shared types live in `lib/types.ts`
- Import from single source: `import { ChatMessage } from '@/lib/types'`
- Never duplicate type definitions across frontend/backend

**2. API Calls:**
- Never make direct `fetch()` calls from components
- Use Assistance UI runtime for chat API (handles everything)
- For future endpoints: Create service layer in `lib/services/`

**3. Environment Variables:**
- Access via `process.env.VARIABLE_NAME` (never hardcode)
- Never use `NEXT_PUBLIC_` prefix for secrets
- Validate env vars at build time (use T3 Env pattern)

**4. Error Handling:**
- All API routes MUST use standard error format (see API Specification section)
- Never expose internal error details to client
- Log errors server-side: `console.error('Context:', error)`

**5. State Management:**
- Chat state: Managed by Assistance UI runtime (DO NOT create external state)
- Auth session: Use `useSession()` from next-auth/react
- Never use Redux/Zustand for this application

**6. System Prompts:**
- NEVER modify the panel prompt text (PRD requirement)
- Prompts live in `lib/prompts.ts` as constants
- Use `getSystemPrompt(mode)` function to retrieve

**7. Runtime Specification:**
- Chat streaming MUST use Edge runtime: `export const runtime = 'edge'`
- Auth routes default to Node runtime (no export needed)
- Never use Node.js APIs in Edge runtime (Buffer, fs, crypto)

**8. Session Validation:**
- All protected API routes MUST validate session first
- Use `const session = await auth()` at top of handler
- Return 401 immediately if session invalid

**9. Streaming Responses:**
- Never buffer entire stream in memory
- Pipe directly: `return new Response(upstreamResponse.body, { headers })`
- Set correct headers: `text/event-stream`, `no-cache`

**10. Authentication:**
- Use Auth.js helpers: `signIn()`, `signOut()`, `auth()`
- Never implement custom JWT logic
- Session cookies managed by Auth.js (do not modify)

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Components** | PascalCase | `Thread.tsx`, `UserMessage.tsx` |
| **Hooks** | camelCase with 'use' | `useThread.ts`, `useSession.ts` |
| **API Routes** | kebab-case folder | `/api/chat/`, `/api/auth/` |
| **Functions** | camelCase | `getSystemPrompt()`, `validateSession()` |
| **Constants** | SCREAMING_SNAKE_CASE | `SYSTEM_PROMPTS`, `MAX_MESSAGES` |
| **Types/Interfaces** | PascalCase | `ChatMessage`, `Session`, `APIError` |
| **Files (utils)** | kebab-case | `api-client.ts`, `rate-limit.ts` |

---

## Code Organization Rules

**Import Order:**
```typescript
// 1. External dependencies
import { useState } from 'react';
import { useSession } from 'next-auth/react';

// 2. Internal modules (absolute imports)
import { ChatMessage } from '@/lib/types';
import { getSystemPrompt } from '@/lib/prompts';

// 3. Relative imports (same directory)
import { Thread } from './Thread';
import styles from './Chat.module.css';
```

**File Structure (Components):**
```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces (if not in lib/types.ts)
interface ComponentProps {
  ...
}

// 3. Component
export function Component({ props }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState();
  const session = useSession();

  // Then functions
  const handleClick = () => {...};

  // Finally JSX
  return (...);
}
```

**File Structure (API Routes):**
```typescript
// 1. Imports
import { auth } from '@/lib/auth';

// 2. Runtime declaration
export const runtime = 'edge';
export const maxDuration = 25;

// 3. Validation schemas
const RequestSchema = z.object({...});

// 4. Handler
export async function POST(req: Request) {
  // Validate session
  // Validate input
  // Process request
  // Return response
}
```

---

## Anti-Patterns to Avoid

❌ **DON'T:**
```typescript
// Don't manage chat messages in external state
const [messages, setMessages] = useState([]);

// Don't make direct API calls from components
fetch('/api/chat', {...});

// Don't use dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: aiResponse }} />

// Don't buffer streams
const chunks = [];
for await (const chunk of stream) chunks.push(chunk);

// Don't modify system prompts
const prompt = SYSTEM_PROMPTS.panel + " extra instructions";
```

✅ **DO:**
```typescript
// Use Assistance UI runtime for chat state
const { messages } = useThread();

// Let Assistance UI handle API calls
const runtime = useDataStreamRuntime({ api: '/api/chat' });

// Render with safe components
<MessagePrimitive.Content />

// Pipe streams directly
return new Response(stream.body, { headers });

// Use prompts exactly as defined
const prompt = getSystemPrompt('panel');
```
