"use client";

import { useEffect, useState, use } from "react";
import NotesViewer from "../../components/notes/NotesViewer";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function NotePage(props) {
    // Handling params unwrapping safely for Next.js 15+
    const params = use(props.params);
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!params?.id) return;

        const fetchNote = async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*, profiles(full_name)')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error("Error fetching note:", error);
            } else {
                // Enhance note with HTML content wrapper if description is used as content
                // For now, we assume description IS the content or we need a content field.
                // The schema has 'description' and 'file_url'.
                // Let's use description as the text content.
                setNote({
                    ...data,
                    author: data.profiles?.full_name || 'Unknown',
                    content: <div dangerouslySetInnerHTML={{ __html: data.description || "<p>No content provided.</p>" }} />
                });
            }
            setLoading(false);
        };

        fetchNote();
    }, [params]);

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "10rem" }}><Loader2 className="animate-spin" /></div>;

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
