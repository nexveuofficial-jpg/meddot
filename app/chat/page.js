export default function ChatPage() {
    return (
        <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            flexDirection: "column",
            gap: "1rem"
        }}>
            <div style={{ padding: "2rem", background: "var(--accent)", borderRadius: "50%" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <p style={{ fontSize: "1.2rem", fontWeight: 500 }}>Select a room to start chatting</p>
        </div>
    );
}
