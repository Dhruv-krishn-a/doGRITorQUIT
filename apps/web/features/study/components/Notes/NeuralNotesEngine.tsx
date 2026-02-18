"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  GripVertical, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Terminal,
  Quote,
  Image as ImageIcon,
  Activity,
  Type,
  X,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type BlockType = 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'code' | 'quote' | 'callout' | 'divider';

interface NoteBlock {
  id: string;
  type: BlockType;
  content: any; // TipTap JSON
  parentId: string | null;
  isCollapsed: boolean;
}

interface NeuralNotesEngineProps {
  initialData: any;
  onSave: (json: any) => void;
  onWordCountChange: (count: number) => void;
}

export const NeuralNotesEngine: React.FC<NeuralNotesEngineProps> = ({ initialData, onSave, onWordCountChange }) => {
  const [blocks, setBlocks] = useState<NoteBlock[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from props
  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      setBlocks(initialData);
    } else {
      setBlocks([{ 
        id: 'initial', 
        type: 'text', 
        content: { type: 'doc', content: [] }, 
        parentId: null, 
        isCollapsed: false 
      }]);
    }
  }, [initialData]);

  const triggerSave = useCallback((updatedBlocks: NoteBlock[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      onSave(updatedBlocks);
      let count = 0;
      updatedBlocks.forEach(b => {
        const text = b.content?.content?.[0]?.content?.[0]?.text || '';
        count += text.split(/\s+/).filter((w: string) => w.length > 0).length;
      });
      onWordCountChange(count);
    }, 2000);
  }, [onSave, onWordCountChange]);

  const addBlock = (afterId: string, type: BlockType = 'text') => {
    const newBlock: NoteBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: { type: 'doc', content: [] },
      parentId: null,
      isCollapsed: false
    };
    
    const index = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    triggerSave(newBlocks);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    triggerSave(newBlocks);
  };

  const updateBlockContent = (id: string, content: any) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, content } : b);
    setBlocks(newBlocks);
    triggerSave(newBlocks);
  };

  const updateBlockType = (id: string, type: BlockType) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, type } : b);
    setBlocks(newBlocks);
    triggerSave(newBlocks);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newBlocks = Array.from(blocks);
    const [reorderedItem] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedItem);
    setBlocks(newBlocks);
    triggerSave(newBlocks);
  };

  return (
    <div className="neural-notes-engine">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
              {blocks.map((block, index) => (
                <BlockItem 
                  key={block.id} 
                  block={block} 
                  index={index}
                  onAdd={addBlock}
                  onDelete={deleteBlock}
                  onUpdate={updateBlockContent}
                  onTypeChange={updateBlockType}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <button 
        onClick={() => addBlock(blocks[blocks.length - 1].id)}
        className="mt-8 flex items-center gap-2 text-slate-300 hover:text-rose-500 transition-colors py-4 px-10 group"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="text-sm font-black uppercase tracking-widest">New Node</span>
      </button>
    </div>
  );
};

interface BlockItemProps {
  block: NoteBlock;
  index: number;
  onAdd: (afterId: string, type?: BlockType) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: any) => void;
  onTypeChange: (id: string, type: BlockType) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ 
  block, 
  index, 
  onAdd, 
  onDelete, 
  onUpdate, 
  onTypeChange
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showCommands, setShowCommands] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ 
        placeholder: block.type === 'h1' ? 'Major Topic' : 
                     block.type === 'h2' ? 'Sub Topic' : 
                     "Type '/' for commands..." 
      }),
    ],
    content: block.content,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onUpdate(block.id, json);
      const text = editor.getText();
      setShowCommands(text.endsWith('/'));
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      setIsFocused(false);
      setTimeout(() => setShowCommands(false), 200);
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !showCommands) {
          event.preventDefault();
          onAdd(block.id, 'text');
          return true;
        }
        if (event.key === 'Backspace' && editor?.isEmpty) {
          event.preventDefault();
          onDelete(block.id);
          return true;
        }
        return false;
      }
    }
  });

  const getBlockStyle = () => {
    switch (block.type) {
      case 'h1': return 'text-4xl font-black text-slate-900 tracking-tight mb-4 mt-8';
      case 'h2': return 'text-2xl font-black text-slate-800 tracking-tight mt-10 mb-2';
      case 'h3': return 'text-xl font-bold text-slate-700 tracking-tight mt-6 mb-1';
      case 'bullet': return 'list-disc list-outside ml-6 text-slate-600';
      case 'number': return 'list-decimal list-outside ml-6 text-slate-600';
      case 'code': return 'font-mono bg-slate-950 text-emerald-400 p-8 rounded-3xl border border-white/5 my-4';
      case 'quote': return 'border-l-4 border-rose-500 pl-8 italic text-slate-600 text-xl my-6 bg-rose-50/30 py-4 pr-4 rounded-r-2xl';
      case 'callout': return 'bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-rose-900 font-medium my-6 shadow-sm shadow-rose-100/20';
      case 'divider': return 'h-px bg-slate-100 w-full my-10';
      default: return 'text-slate-600 leading-relaxed text-lg';
    }
  };

  if (block.type === 'divider') {
    return (
      <Draggable draggableId={block.id} index={index}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.draggableProps} className="group flex items-center gap-2">
            <div {...provided.dragHandleProps} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-200"><GripVertical size={16} /></div>
            <div className="flex-1 h-px bg-slate-100 my-8" />
            <button onClick={() => onDelete(block.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-200 hover:text-rose-500"><X size={14} /></button>
          </div>
        )}
      </Draggable>
    );
  }

  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group flex items-start gap-2 py-1 rounded-xl transition-all ${
            snapshot.isDragging ? 'bg-white shadow-2xl ring-2 ring-rose-100 z-50' : ''
          }`}
        >
          <div 
            {...provided.dragHandleProps} 
            className={`p-2 mt-1.5 cursor-grab active:cursor-grabbing text-slate-200 group-hover:text-slate-400 transition-colors ${
              isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <GripVertical size={16} />
          </div>

          <div className="flex-1 min-w-0 relative">
            <div className={getBlockStyle()}>
              <EditorContent editor={editor} className="outline-none" />
            </div>

            <AnimatePresence>
              {showCommands && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] p-3 overflow-hidden ring-8 ring-slate-900/5"
                >
                  <div className="p-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 mb-2">
                    Engine Blocks
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <CommandItem icon={Type} label="Text" desc="Plain knowledge node" onClick={() => onTypeChange(block.id, 'text')} />
                    <CommandItem icon={Type} label="Heading 1" desc="Major concepts" onClick={() => onTypeChange(block.id, 'h1')} size="text-xl" />
                    <CommandItem icon={Type} label="Heading 2" desc="Sub-concepts" onClick={() => onTypeChange(block.id, 'h2')} size="text-lg" />
                    <CommandItem icon={LayoutList} label="Bullet List" desc="Quick points" onClick={() => onTypeChange(block.id, 'bullet')} />
                    <CommandItem icon={Terminal} label="Code Block" desc="Technical documentation" onClick={() => onTypeChange(block.id, 'code')} />
                    <CommandItem icon={Quote} label="Quote" desc="Key insights" onClick={() => onTypeChange(block.id, 'quote')} />
                    <CommandItem icon={Activity} label="Callout" desc="High importance info" onClick={() => onTypeChange(block.id, 'callout')} />
                    <CommandItem icon={ImageIcon} label="Divider" desc="Visual separation" onClick={() => onTypeChange(block.id, 'divider')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const CommandItem = ({ icon: Icon, label, desc, onClick, size = "text-sm" }: any) => (
  <button 
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all text-left group"
  >
    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all text-slate-400 group-hover:text-rose-500">
      <Icon size={16} />
    </div>
    <div>
      <p className={`${size} font-bold text-slate-800`}>{label}</p>
      <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
    </div>
  </button>
);
