"use client";

import { useEffect, useState, use } from "react";
import NotesViewer from "../../components/notes/NotesViewer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Loader from "../../components/ui/Loader";

export default function NotePage(props) {
    // Handling params unwrapping safely for Next.js 15+
    const params = use(props.params);
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!params?.id) return;

        const fetchNote = async () => {
            try {
                const { data, error } = await supabase
                    .from("notes")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (data) {
                    setNote({
                        ...data,
                        author: data.author_name || 'Unknown', // Use denormalized name
                        content: <div dangerouslySetInnerHTML={{ __html: data.description || "<p>No content provided.</p>" }} />
                    });
                } else {
                    console.error("Note not found");
                }
            } catch (error) {
                console.error("Error fetching note:", error);
            }
            setLoading(false);
        };

        fetchNote();
    }, [params]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "10rem" }}><Loader /></div>;

    if (!note) {
        return (
            <div style={{ textAlign: "center", padding: "4rem" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Note not found</h1>
                <p style={{ marginBottom: "2rem", color: "var(--muted-foreground)" }}>The note you are looking for does not exist.</p>
                <button
                    onClick={() => router.push("/notes")}
                    style={{
                        color: "white",
                        background: "var(--primary)",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "0.5rem",
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Return to Library
                </button>
            </div>
        );
    }

    return <NotesViewer note={note} />;
}
