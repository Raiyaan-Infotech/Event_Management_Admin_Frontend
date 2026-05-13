"use client";

import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export default function AdminCommunicationChatPage() {
  return (
    <ChatWorkspace
      portalType="admin"
      title="Chat"
      subtitle="Chat with vendors and their clients in real time."
    />
  );
}
