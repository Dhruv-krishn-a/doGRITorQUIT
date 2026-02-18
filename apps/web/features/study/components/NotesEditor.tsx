"use client";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface NotesEditorProps {
  initialContent?: any;
  onSave: (json: any) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ initialContent, onSave }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Capture your insights..." })
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onSave(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[300px]',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 min-h-[400px]">
      <div className="flex gap-2 border-b border-slate-200 pb-2 mb-4">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}>I</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}>List</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
