"use client";

import { use } from "react";
import ChatInterface from "../../components/chat/ChatInterface";

export default function ChatRoomPage(props) {
    const params = use(props.params);
    return <ChatInterface roomId={params.roomId} basePath="/chat" />;
}
