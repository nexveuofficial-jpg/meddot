"use client";

import { use } from "react";
import ChatInterface from "@/app/components/chat/ChatInterface";

export default function MessageRoomPage(props) {
    const params = use(props.params);
    return <ChatInterface roomId={params.roomId} basePath="/messages" />;
}
