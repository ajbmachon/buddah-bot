import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";

// Edge runtime for low latency streaming (per coding-standards.md)
export const runtime = "edge";

/**
 * Chat completion endpoint with streaming support.
 * Requires valid authentication session.
 * Runs on Edge runtime for low latency.
 */
export async function POST(req: Request) {
  // Validate session FIRST (security-critical)
  const session = await auth();
  if (!session?.user) {
    return new Response(
      JSON.stringify({
        error: {
          code: "unauthorized",
          message: "Authentication required",
          statusCode: 401,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Parse request body
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Stream chat completion
  const result = streamText({
    model: openai("gpt-5-nano"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
