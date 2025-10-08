import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@/lib/auth";

// Edge runtime for low latency streaming (per coding-standards.md)
export const runtime = "edge";

// Max duration for Edge runtime (Vercel limit)
export const maxDuration = 25;

/**
 * Chat completion endpoint with streaming support.
 * Requires valid authentication session.
 * Runs on Edge runtime for low latency.
 *
 * Note: Uses UIMessage format from Assistance UI with parts arrays.
 * convertToModelMessages() transforms UIMessages to ModelMessages for AI SDK.
 */
export async function POST(req: Request) {
  // Generate request ID for logging
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Chat request received`);

  try {
    // Validate session FIRST (security-critical)
    const session = await auth();
    if (!session?.user) {
      console.log(`[${requestId}] Unauthorized: No valid session`);
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

    console.log(`[${requestId}] User authenticated: ${session.user.email}`);

    // Parse request body (Assistance UI sends UIMessage[] format)
    const body = await req.json();

    // Basic validation
    if (!body.messages || !Array.isArray(body.messages)) {
      console.log(`[${requestId}] Invalid request: missing messages array`);
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: "Invalid request format: messages array required",
            statusCode: 400,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { messages }: { messages: UIMessage[] } = body;

    // Validate message count
    if (messages.length === 0 || messages.length > 20) {
      console.log(`[${requestId}] Invalid message count: ${messages.length}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: `Message count must be between 1 and 20 (received ${messages.length})`,
            statusCode: 422,
          },
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[${requestId}] Processing ${messages.length} message(s)`
    );

    // Stream chat completion (placeholder model for Story 2.1)
    // convertToModelMessages transforms UIMessage (with parts) to ModelMessage (with content)
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: convertToModelMessages(messages),
    });

    console.log(`[${requestId}] Streaming response initiated`);

    // Return UIMessage stream format (required by AssistantChatTransport)
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(`[${requestId}] Internal error:`, error);
    return new Response(
      JSON.stringify({
        error: {
          code: "internal_error",
          message: "An unexpected error occurred",
          statusCode: 500,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
