import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { getSystemPrompt } from "@/lib/prompts";

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

    // Create custom Nous provider (OpenAI-compatible)
    const nous = createOpenAI({
      baseURL: process.env.NOUS_API_BASE_URL || 'https://inference-api.nousresearch.com/v1',
      apiKey: process.env.NOUS_API_KEY,
    });

    // Get system prompt for panel mode
    const mode = (process.env.BUDDHABOT_MODE || 'panel') as 'panel';
    const systemPrompt = getSystemPrompt(mode);
    const model = process.env.HERMES_MODEL || 'Hermes-4-405B';

    console.log(`[${requestId}] Nous AI SDK configured`, {
      provider: 'Nous Research',
      model,
      systemPromptMode: mode,
      systemPromptLength: systemPrompt.length,
    });

    // Stream chat completion with Nous Hermes 4
    // IMPORTANT: Use .chat() to force /chat/completions endpoint (not /responses)
    // convertToModelMessages transforms UIMessage (with parts) to ModelMessage (with content)
    const result = streamText({
      model: nous.chat(model),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      temperature: 0.8,
      // @ts-ignore - repetition_penalty may not be in type definitions but Nous may support it
      repetition_penalty: 0.9,
    });

    console.log(`[${requestId}] Streaming response initiated`);

    // Return UIMessage stream format (required by AssistantChatTransport)
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(`[${requestId}] Error occurred:`, error);

    // Map AI SDK errors to user-friendly messages
    let userMessage = 'Unable to generate response. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();

      // API key errors
      if (errorMsg.includes('api key') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
        userMessage = 'AI service authentication failed';
        statusCode = 401;
        console.error(`[${requestId}] Invalid API key`);
      }
      // Rate limit errors
      else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        userMessage = 'Service temporarily busy. Please wait and try again.';
        statusCode = 429;
        console.error(`[${requestId}] Rate limit exceeded`);
      }
      // Network/service errors
      else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('503') || errorMsg.includes('502')) {
        userMessage = 'AI service temporarily unavailable';
        statusCode = 503;
        console.error(`[${requestId}] Network/service error`);
      }
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "upstream_error",
          message: userMessage,
          statusCode,
          requestId, // Include for debugging
        },
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
