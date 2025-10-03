# Testing Strategy

## Testing Pyramid

```
         E2E Tests
        /         \
   Integration Tests
   /              \
Frontend Unit    Backend Unit
```

**Distribution:**
- 70% Unit tests (components, utilities, API logic)
- 20% Integration tests (API routes, auth flows)
- 10% E2E tests (critical user journeys)

---

## Frontend Tests

**File:** `components/chat/__tests__/Thread.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { Thread } from '../Thread';
import { AssistantRuntimeProvider } from '@assistant-ui/react';

// Mock runtime
const mockRuntime = {
  messages: [],
  isRunning: false,
  append: vi.fn(),
};

describe('Thread Component', () => {
  it('renders empty state when no messages', () => {
    render(
      <AssistantRuntimeProvider runtime={mockRuntime as any}>
        <Thread />
      </AssistantRuntimeProvider>
    );

    expect(screen.getByText(/Ask a question to begin/i)).toBeInTheDocument();
  });

  it('renders messages when present', () => {
    const runtimeWithMessages = {
      ...mockRuntime,
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
    };

    render(
      <AssistantRuntimeProvider runtime={runtimeWithMessages as any}>
        <Thread />
      </AssistantRuntimeProvider>
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
});
```

---

## Backend Tests

**File:** `app/api/chat/__tests__/route.test.ts`

```typescript
import { POST } from '../route';
import { auth } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/prompts', () => ({
  getSystemPrompt: () => 'Test system prompt',
}));

describe('POST /api/chat', () => {
  it('returns 401 when not authenticated', async () => {
    (auth as any).mockResolvedValue(null);

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('unauthorized');
  });

  it('returns 422 for invalid input', async () => {
    (auth as any).mockResolvedValue({ user: { id: '123' } });

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }), // Empty messages
    });

    const response = await POST(request);

    expect(response.status).toBe(422);
  });

  it('streams response for valid request', async () => {
    (auth as any).mockResolvedValue({ user: { id: '123' } });

    // Mock Nous API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
          controller.close();
        },
      }),
    });

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
  });
});
```

---

## E2E Tests

**File:** `tests/e2e/auth-and-chat.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication and Chat Flow', () => {
  test('complete user journey: login → chat → signout', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');

    // 2. Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('BuddahBot')).toBeVisible();

    // 3. Click Google sign-in (mocked in test environment)
    await page.click('button:has-text("Sign in with Google")');

    // 4. After OAuth flow, should be on chat page
    await expect(page).toHaveURL('/');
    await expect(page.getByPlaceholder('Ask your question')).toBeVisible();

    // 5. Send a message
    const composer = page.getByPlaceholder('Ask your question');
    await composer.fill('What is the meaning of life?');
    await page.click('button:has-text("Send")');

    // 6. Wait for streaming response
    await expect(page.getByText(/Eckhart|Tara|Alan/i)).toBeVisible({ timeout: 5000 });

    // 7. Sign out
    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL('/login');
  });

  test('rejects unauthenticated chat requests', async ({ page }) => {
    // Try to access chat without logging in
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
```

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Test Commands

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Coverage report
npm test -- --coverage
```

**package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```
