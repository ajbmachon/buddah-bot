"use client";

import { AssistantRuntimeProvider, AssistantCloud } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { useSession, signOut } from "next-auth/react";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const Assistant = () => {
  const { data: session, status } = useSession();

  // AssistantCloud with authenticated mode for permanent cross-device persistence
  const cloud = new AssistantCloud({
    baseUrl: process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL!,
    authToken: () =>
      fetch("/api/assistant-ui-token", { method: "POST" })
        .then((r) => r.text()),
  });

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    cloud,
  });

  // Loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Handle unauthenticated state (shouldn't happen due to middleware, but defensive)
  if (!session) {
    return null;
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex flex-1 items-center justify-between">
                <h1 className="text-lg font-semibold text-primary">BuddhaBot</h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
