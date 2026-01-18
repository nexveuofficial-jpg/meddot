import MessagesLayoutClient from "./MessagesLayoutClient";

export const dynamic = "force-dynamic";

export default function MessagesLayout({ children }) {
    return <MessagesLayoutClient>{children}</MessagesLayoutClient>;
}
