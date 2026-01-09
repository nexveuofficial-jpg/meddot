"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

const MenuBar = ({ editor, onImageUpload, isUploading }) => {
  if (!editor) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      padding: '0.5rem',
      borderBottom: '1px solid var(--border)',
      background: 'var(--muted)',
      borderRadius: '0.5rem 0.5rem 0 0',
      marginBottom: '0',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <button
        type="button" // Prevent form submission
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        style={{
          background: editor.isActive('bold') ? 'var(--secondary)' : 'transparent',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          color: editor.isActive('bold') ? 'var(--primary)' : 'var(--foreground)',
          border: 'none'
        }}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        style={{
          background: editor.isActive('italic') ? 'var(--secondary)' : 'transparent',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          color: editor.isActive('italic') ? 'var(--primary)' : 'var(--foreground)',
          border: 'none'
        }}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem', height: '1.5rem' }}></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={{
          background: editor.isActive('bulletList') ? 'var(--secondary)' : 'transparent',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          color: editor.isActive('bulletList') ? 'var(--primary)' : 'var(--foreground)',
          border: 'none'
        }}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        style={{
          background: editor.isActive('orderedList') ? 'var(--secondary)' : 'transparent',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          color: editor.isActive('orderedList') ? 'var(--primary)' : 'var(--foreground)',
          border: 'none'
        }}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      
      <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem', height: '1.5rem' }}></div>
      
      <label 
        style={{
            cursor: isUploading ? 'not-allowed' : 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--foreground)',
            opacity: isUploading ? 0.5 : 1
        }}
        title="Insert Image"
      >
        <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={onImageUpload}
            disabled={isUploading}
        />
        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
      </label>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Write something..." }) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        inline: true,
        allowBase64: true, 
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 150px; padding: 0.75rem; outline: none; line-height: 1.6;'
      },
    },
    immediatelyRender: false, 
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
    }

    setIsUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('answer_attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('answer_attachments')
            .getPublicUrl(filePath);

        if (editor) {
            editor.chain().focus().setImage({ src: publicUrl }).run();
        }

    } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
    } finally {
        setIsUploading(false);
        // Reset input value to allow same file selection again if needed
        e.target.value = ''; 
    }
  };

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '0.5rem',
      background: 'var(--card-bg)',
      overflow: 'hidden'
    }}>
      <MenuBar editor={editor} onImageUpload={handleImageUpload} isUploading={isUploading} />
      <EditorContent editor={editor} style={{ minHeight: '150px' }} />
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
        }
         .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
        }
        .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
