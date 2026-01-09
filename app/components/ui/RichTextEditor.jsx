"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

const MenuBar = ({ editor }) => {
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
      marginBottom: '0'
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
          color: editor.isActive('bold') ? 'var(--primary)' : 'var(--foreground)'
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
          color: editor.isActive('italic') ? 'var(--primary)' : 'var(--foreground)'
        }}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem' }}></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={{
          background: editor.isActive('bulletList') ? 'var(--secondary)' : 'transparent',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          color: editor.isActive('bulletList') ? 'var(--primary)' : 'var(--foreground)'
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
          color: editor.isActive('orderedList') ? 'var(--primary)' : 'var(--foreground)'
        }}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Write something..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
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
    immediatelyRender: false, // Fix hydration mismatch
  });

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '0.5rem',
      background: 'var(--card-bg)',
      overflow: 'hidden'
    }}>
      <MenuBar editor={editor} />
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
      `}</style>
    </div>
  );
}
