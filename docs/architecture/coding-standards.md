# Coding Standards

## Philosophy

Follow your global clean code rules (`@rules/clean-code.md`) with these BuddhaBot-specific requirements.

**Remember:** Solo developer, 2-day MVP. Keep it simple.

---

## Critical Rules (Must Follow)

### 1. System Prompts: Never Modify
```typescript
// ✅ DO: Use exact prompt from lib/prompts.ts
const prompt = getSystemPrompt('panel');

// ❌ DON'T: Modify or enhance prompts
const prompt = SYSTEM_PROMPTS.panel + " extra instructions";
```

**Why:** PRD explicitly requires exact prompt text (proven to work).

---

### 2. Streaming: Use Edge Runtime
```typescript
// ✅ DO: Edge runtime for streaming
export const runtime = 'edge';

export async function POST(req: Request) {
  // Pipe directly, never buffer
  return new Response(upstreamResponse.body, { headers });
}

// ❌ DON'T: Buffer entire stream
const chunks = [];
for await (const chunk of stream) chunks.push(chunk);
```

**Why:** Edge = low latency, global distribution. Buffering = memory issues.

---

### 3. Auth: Validate Sessions First
```typescript
// ✅ DO: Check session at top of protected routes
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... rest of handler
}

// ❌ DON'T: Skip session validation
export async function POST(req: Request) {
  const { messages } = await req.json();
  // Forgot to check session!
}
```

**Why:** Security. All protected routes must validate authentication.

---

### 4. State: Let Assistance UI Handle Chat
```typescript
// ✅ DO: Use Assistance UI runtime
const runtime = useDataStreamRuntime({ api: '/api/chat' });
const { messages } = useThread();

// ❌ DON'T: Manage chat state manually
const [messages, setMessages] = useState([]);
fetch('/api/chat', {...});
```

**Why:** Assistance UI handles everything (streaming, state, UI). Don't reinvent.

---

## Naming Conventions (Keep Simple)

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `Thread.tsx`, `Composer.tsx` |
| Hooks | camelCase with 'use' | `useThread`, `useSession` |
| API Routes | lowercase | `/api/chat`, `/api/auth` |
| Functions | camelCase | `getSystemPrompt()` |
| Constants | SCREAMING_SNAKE | `SYSTEM_PROMPTS` |
| Types | PascalCase | `ChatMessage`, `Session` |

---

## File Organization (Basic)

```typescript
// 1. Imports (external → internal)
import { useState } from 'react';
import { ChatMessage } from '@/lib/types';

// 2. Component
export function Component() {
  // Hooks first
  const [state, setState] = useState();

  // Functions second
  const handleClick = () => {...};

  // JSX last
  return (...);
}
```

---

## Common Mistakes to Avoid

❌ **Don't modify system prompts**
❌ **Don't manage chat messages in useState**
❌ **Don't buffer streams**
❌ **Don't skip session validation**
❌ **Don't use Node.js APIs in Edge runtime** (Buffer, fs, etc.)

---

## When In Doubt

**Ask yourself:**
- Does this follow global clean code rules?
- Does this violate one of the 4 critical rules?
- Am I overengineering this?

**Keep it simple.** This is a 2-day MVP for friends/family.
