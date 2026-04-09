"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { SideMenuExtension } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import {
  useCreateBlockNote,
  SideMenuController,
  DragHandleButton,
  AddBlockButton,
  SideMenu,
  useExtensionState,
} from "@blocknote/react";
import { Undo2, Redo2 } from "lucide-react";
import { InkOverlay, Stroke, ToolType } from "./InkOverlay";

export interface HybridPage {
  id: string;
  blocks: any[];
  strokes: Stroke[];
}

interface PageEditorProps {
  blocks: any[];
  strokes: Stroke[];
  isDrawingMode: boolean;
  backgroundPattern?: "blank" | "ruled" | "grid" | "dots";
  pageWidthMm: number;
  pageHeightMm: number;
  marginMm: number;
  headerMm: number;
  footerMm: number;
  onChange: (editor: BlockNoteEditor<any, any, any>, strokes: Stroke[]) => void;
  tool: ToolType;
  color: string;
  size: number;
}

function DesktopDragHandleButton(props: any) {
  const block = useExtensionState(SideMenuExtension, {
    selector: (state) => state?.block,
  });

  if (!block) return null;
  return <DragHandleButton {...props} />;
}

function patternStyle(pattern: "blank" | "ruled" | "grid" | "dots") {
  switch (pattern) {
    case "ruled":
      return {
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 31px, var(--border-color) 31px, var(--border-color) 32px)",
      };
    case "grid":
      return {
        backgroundSize: "20px 20px",
        backgroundImage:
          "linear-gradient(to right, var(--border-color) 1px, transparent 1px), linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)",
      };
    case "dots":
      return {
        backgroundImage: "radial-gradient(var(--text-secondary) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      };
    default:
      return {};
  }
}

export const PageEditor = React.forwardRef<HTMLDivElement, PageEditorProps>(
  (
    {
      blocks,
      strokes: externalStrokes,
      isDrawingMode,
      backgroundPattern = "blank",
      pageWidthMm,
      pageHeightMm,
      marginMm,
      headerMm,
      footerMm,
      onChange,
      tool,
      color,
      size,
    },
    ref
  ) => {
    const [history, setHistory] = useState<Stroke[][]>([externalStrokes || []]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const strokes = history[historyIndex] || [];

    useEffect(() => {
      setHistory([externalStrokes || []]);
      setHistoryIndex(0);
    }, [externalStrokes]);

    const fallbackInitialBlocks = useMemo<PartialBlock[]>(() => [{ type: "paragraph" }], []);
    const initialBlocks = blocks && blocks.length > 0 ? blocks : fallbackInitialBlocks;

    const editor = useCreateBlockNote(
      {
        initialContent: initialBlocks as any,
      },
      []
    );

    useEffect(() => {
      if (editor) onChange(editor, strokes);
    }, [editor, strokes, onChange]);

    const handleStrokesChange = useCallback(
      (newStrokes: Stroke[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newStrokes);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      },
      [history, historyIndex]
    );

    const undo = () => {
      if (historyIndex > 0) setHistoryIndex((i) => i - 1);
    };

    const redo = () => {
      if (historyIndex < history.length - 1) setHistoryIndex((i) => i + 1);
    };

    const clearAll = () => {
      if (strokes.length === 0) return;
      if (confirm("Clear all drawings?")) {
        handleStrokesChange([]);
      }
    };

    return (
      <div className="relative mb-16 w-full flex justify-center overflow-x-auto py-10 no-scrollbar">
        {isDrawingMode && (
          <div className="fixed right-10 top-32 z-50 flex flex-col gap-2 opacity-60 hover:opacity-100 transition-opacity ui-hide-on-export bg-[var(--bg-card)] p-2 rounded-2xl shadow-xl border border-[var(--border-color)]">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-3 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--hover-bg)] transition-all"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-3 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] text-[var(--text-secondary)] disabled:opacity-30 hover:bg-[var(--hover-bg)] transition-all"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
            <button
              onClick={clearAll}
              disabled={strokes.length === 0}
              className="p-3 bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] text-rose-500 disabled:opacity-30 hover:bg-rose-500/10 transition-all"
              title="Clear All"
            >
              <span className="text-[10px] font-bold">CLEAR</span>
            </button>
          </div>
        )}

        <div
          id="document-editor-surface"
          className="relative bg-[var(--bg-paper)] shadow-2xl shadow-black/10 ring-1 ring-[var(--border-color)] page-editor-container flex-shrink-0"
          ref={ref}
          style={{
            ...patternStyle(backgroundPattern),
            width: `${pageWidthMm}mm`,
            minHeight: `${pageHeightMm}mm`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none ui-hide-export-guides"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent calc(var(--page-height) - 1px), rgba(100,116,139,0.2) calc(var(--page-height) - 1px), rgba(100,116,139,0.2) var(--page-height))",
              backgroundSize: "100% var(--page-height)",
              ["--page-height" as string]: `${pageHeightMm}mm`,
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none ui-hide-export-guides"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(148,163,184,0.05) 0, rgba(148,163,184,0.05) var(--header), transparent var(--header), transparent calc(var(--page-height) - var(--footer)), rgba(148,163,184,0.05) calc(var(--page-height) - var(--footer)), rgba(148,163,184,0.05) var(--page-height))",
              backgroundSize: "100% var(--page-height)",
              ["--page-height" as string]: `${pageHeightMm}mm`,
              ["--header" as string]: `${headerMm}mm`,
              ["--footer" as string]: `${footerMm}mm`,
            }}
          />

          <div className="absolute inset-0 z-30 pointer-events-none">
            <InkOverlay
              isDrawingMode={isDrawingMode}
              strokes={strokes}
              onStrokesChange={handleStrokesChange}
              tool={tool}
              color={color}
              size={size}
            />
          </div>

          <div
            className="w-full custom-blocknote-theme relative z-10"
            style={{
              paddingLeft: `${marginMm}mm`,
              paddingRight: `${marginMm}mm`,
              paddingTop: `${Math.max(8, marginMm + headerMm)}mm`,
              paddingBottom: `${Math.max(8, marginMm + footerMm)}mm`,
            }}
          >
            <BlockNoteView
              editor={editor}
              theme="light"
              onChange={() => {
                onChange(editor, strokes);
              }}
              sideMenu={false}
            >
              <SideMenuController
                sideMenu={(props) => (
                  <SideMenu {...props}>
                    <AddBlockButton />
                    <DesktopDragHandleButton {...props} />
                  </SideMenu>
                )}
              />
            </BlockNoteView>
          </div>
        </div>
      </div>
    );
  }
);

PageEditor.displayName = "PageEditor";
