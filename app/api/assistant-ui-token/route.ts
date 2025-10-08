import { auth } from "@/lib/auth";
import { AssistantCloud } from "@assistant-ui/react";

export const runtime = "nodejs";

// Sanitize email to be URL-safe (no @ or special chars)
function sanitizeUserId(email: string): string {
  return email.replace(/[^a-zA-Z0-9-_]/g, "-");
}

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // CRITICAL: userId/workspaceId cannot contain @ or special characters!
    const userId = sanitizeUserId(session.user.email);
    const workspaceId = userId; // One workspace per user

    const assistantCloud = new AssistantCloud({
      apiKey: process.env.ASSISTANT_API_KEY!,
      userId,
      workspaceId,
    });

    const { token } = await assistantCloud.auth.tokens.create();

    // Return plain text token
    return new Response(token);
  } catch (error) {
    console.error("[Token Error]", error);
    return new Response("Failed to generate token", { status: 500 });
  }
}
