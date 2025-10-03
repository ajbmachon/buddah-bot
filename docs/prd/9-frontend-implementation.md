# 9) Frontend Implementation

**Main Chat Page:**
```tsx
// app/page.tsx
'use client'

import { useAssistant } from '@assistant-ui/react'
import { AssistantRuntimeProvider, Thread } from '@assistant-ui/react'

export default function ChatPage() {
  const runtime = useAssistant({
    api: '/api/chat'
  })

  return (
    <main className="h-screen">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>
    </main>
  )
}
```

**That's it.** Assistance UI handles everything else.

**Login Page:**
```tsx
// app/login/page.tsx
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="login-container">
      <h1>BuddahBot</h1>
      <button onClick={() => signIn('google')}>
        Sign in with Google
      </button>
      <button onClick={() => signIn('email')}>
        Sign in with Email
      </button>
    </div>
  )
}
```

---
