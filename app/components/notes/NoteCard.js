import { FileText, Bookmark, Eye, ShieldCheck, Clock, GraduationCap } from "lucide-react";
import Loader from "../ui/Loader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../../context/AuthContext";
import dynamic from "next/dynamic";

const SecurePDFReader = dynamic(() => import("./SecurePDFReader"), {
    ssr: false,
    loading: () => null
});

export default function NoteCard({ note, isBookmarked = false, onBookmarkToggle }) {
    const { user } = useAuth();
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [downloading, setDownloading] = useState(false);

    // Viewer State
    const [viewerOpen, setViewerOpen] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

    useEffect(() => {
        setBookmarked(isBookmarked);
    }, [isBookmarked]);

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert("Login to bookmark");

        const wasBookmarked = bookmarked;
        setBookmarked(!bookmarked); // Optimistic

        try {
            if (wasBookmarked) {
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("note_id", note.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("bookmarks")
                    .insert([{ user_id: user.id, note_id: note.id }]);
                if (error) throw error;
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            setBookmarked(wasBookmarked);
        }
    };

    const handleNoteClick = async () => {
        if (downloading) return;
        setDownloading(true);

        // Increment Views
        try {
            await supabase.rpc('increment_note_views', { note_id: note.id });
        } catch (err) {
            console.error("Failed to increment views:", err);
        }

        try {
            let signedUrl = null;

            if (note.file_path) {
                const { data, error } = await supabase.storage
                    .from('notes_documents')
                    .createSignedUrl(note.file_path, 60);

                if (!error && data?.signedUrl) signedUrl = data.signedUrl;
            }

            if (!signedUrl && note.file_url) signedUrl = note.file_url;
            if (!signedUrl) throw new Error("Could not resolve a document link.");

            const response = await fetch(signedUrl);
            if (!response.ok) throw new Error("Failed to fetch document content");

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            setPdfBlobUrl(blobUrl);
            setViewerOpen(true);

        } catch (error) {
            console.error("Viewer error:", error);
            alert(`Failed to open note: ${error.message}`);
        } finally {
            setDownloading(false);
        }
    };

    const handleCloseViewer = () => {
        setViewerOpen(false);
        if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
            setPdfBlobUrl(null);
        }
    };

    const isVerified = note.profiles?.role === 'admin' || note.profiles?.role === 'senior';

    return (
        <>
            <div 
                onClick={handleNoteClick}
                className={`
                    group relative p-6 rounded-2xl cursor-pointer
                    border border-white/5 bg-slate-900/40 backdrop-blur-md 
                    hover:border-cyan-500/20 transition-all duration-300 
                    hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10
                    overflow-hidden flex flex-col h-full
                    ${downloading ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>

                {/* Loading Shield */}
                {downloading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-cyan-400 font-semibold gap-2">
                        <Loader size={24} />
                        <span className="text-xs tracking-wider uppercase">Opening Securely...</span>
                    </div>
                )}

                {/* Header: Icon & Metadata */}
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center border
                        ${isVerified 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                    `}>
                        <FileText size={24} strokeWidth={1.5} />
                    </div>
                    
                    <button 
                        onClick={handleBookmark}
                        className={`p-2 rounded-full hover:bg-white/10 transition-colors z-20 ${bookmarked ? 'text-amber-400' : 'text-slate-500'}`}
                    >
                         <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                            {note.subject}
                        </span>
                        {isVerified && (
                             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                {note.profiles?.role === 'admin' ? 'Official' : 'Senior'} <ShieldCheck size={10} />
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2 leading-tight">
                        {note.title}
                    </h3>
                    
                    {note.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                            {note.description}
                        </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-500 transition-colors"></span>
                             <span>{new Date(note.created_at).getFullYear()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye size={12} />
                            <span>{note.views || 0}</span>
                        </div>
                        <div className="text-slate-400 ml-auto">
                             {note.profiles?.username}
                        </div>
                    </div>
                </div>
            </div>

            <SecurePDFReader
                isOpen={viewerOpen}
                onClose={handleCloseViewer}
                fileUrl={pdfBlobUrl}
                title={note.title}
                userEmail={user?.email}
            />
        </>
    );
}
