"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  PenTool,
  LayoutTemplate,
  Download,
  Settings,
  Eraser,
  Square,
  Circle,
  Minus,
  MousePointer2,
  Type,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronDown,
} from "lucide-react";
import {
  buildSaveSnapshot,
  parseDocument,
  HybridDocument,
  PagePreset,
  PageSettings,
} from "../lib/note-utils";
import { PageEditor } from "./PageEditor";
import { ToolType, Stroke } from "./InkOverlay";
import jsPDF from "jspdf";

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: any;
  onSave: (title: string, content: any, isAutoSave?: boolean) => void;
  isSaving?: boolean;
  onSync?: () => void | Promise<void>;
  isSyncing?: boolean;
  onBack?: () => void;
  mode?: "FULL" | "SPLIT";
  autoSaveInterval?: number;
  onExportPdf?: (payload: {
    blob: Blob;
    suggestedFileName: string;
    mimeType: string;
  }) => Promise<boolean | void> | boolean | void;
}

type BackgroundPattern = "blank" | "ruled" | "grid" | "dots";

type ExportLine = {
  text: string;
  depth: number;
  variant: "paragraph" | "heading" | "quote" | "code" | "task";
};

const PAGE_PRESETS: Record<PagePreset, { label: string; widthMm: number; heightMm: number }> = {
  "a4-portrait": { label: "A4 Portrait", widthMm: 210, heightMm: 297 },
  "a4-landscape": { label: "A4 Landscape", widthMm: 297, heightMm: 210 },
  "letter-portrait": { label: "Letter Portrait", widthMm: 216, heightMm: 279 },
  "letter-landscape": { label: "Letter Landscape", widthMm: 279, heightMm: 216 },
  custom: { label: "Custom", widthMm: 210, heightMm: 297 },
};

function mmToPx(mm: number) {
  return (mm * 96) / 25.4;
}

function hexToRgb(color: string): { r: number; g: number; b: number } {
  const value = color.trim();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const r = parseInt(value[1] + value[1], 16);
    const g = parseInt(value[2] + value[2], 16);
    const b = parseInt(value[3] + value[3], 16);
    return { r, g, b };
  }
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    return { r, g, b };
  }
  const rgbMatch = value.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  return { r: 15, g: 23, b: 42 };
}

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) {
    return node
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.text) return item.text;
        if (item?.content) return extractText(item.content);
        return "";
      })
      .join("");
  }
  if (typeof node === "object" && node.text) return String(node.text);
  return "";
}

function flattenBlocks(blocks: any[], depth = 0): ExportLine[] {
  const lines: ExportLine[] = [];
  const numberedCounters = new Map<number, number>();

  for (const block of blocks || []) {
    const type = String(block?.type || "paragraph");
    const text = extractText(block?.content).trim();

    let variant: ExportLine["variant"] = "paragraph";
    if (type === "heading") variant = "heading";
    if (type === "quote") variant = "quote";
    if (type === "codeBlock") variant = "code";
    if (type === "checkListItem") variant = "task";

    let prefix = "";
    if (type === "bulletListItem") {
      prefix = "• ";
      numberedCounters.delete(depth);
    }
    if (type === "checkListItem") {
      const checked = Boolean(block?.props?.checked);
      prefix = checked ? "[x] " : "[ ] ";
      numberedCounters.delete(depth);
    }
    if (type === "numberedListItem") {
      const current = numberedCounters.get(depth) || 1;
      prefix = `${current}. `;
      numberedCounters.set(depth, current + 1);
    } else {
      numberedCounters.delete(depth);
    }

    lines.push({
      text: `${prefix}${text}`,
      depth,
      variant,
    });

    if (Array.isArray(block?.children) && block.children.length > 0) {
      lines.push(...flattenBlocks(block.children, depth + 1));
    }
  }

  if (lines.length === 0) {
    lines.push({ text: "", depth: 0, variant: "paragraph" });
  }

  return lines;
}

async function defaultBlobSave(blob: Blob, suggestedFileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderStrokeSegment(
  pdf: jsPDF,
  points: number[][],
  stroke: Stroke,
  mmPerPx: number,
  pageHeightMm: number,
  pageIndex: number
) {
  if (points.length < 2) return;

  const yOffsetMm = pageIndex * pageHeightMm;
  const color = hexToRgb(stroke.color || "#0ea5e9");
  const widthMm = Math.max(0.2, (stroke.size || 2) * mmPerPx * (stroke.type === "highlighter" ? 1.6 : 1));

  pdf.setDrawColor(color.r, color.g, color.b);
  pdf.setLineWidth(widthMm);

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const x1 = prev[0] * mmPerPx;
    const y1 = prev[1] * mmPerPx - yOffsetMm;
    const x2 = curr[0] * mmPerPx;
    const y2 = curr[1] * mmPerPx - yOffsetMm;
    pdf.line(x1, y1, x2, y2);
  }
}

function addStrokeLayers(pdf: jsPDF, strokes: Stroke[], page: PageSettings, pageCount: number) {
  if (!Array.isArray(strokes) || strokes.length === 0) return;

  const mmPerPx = page.widthMm / mmToPx(page.widthMm);
  const pageHeightPx = mmToPx(page.heightMm);

  for (const stroke of strokes) {
    if ((stroke.type === "pen" || stroke.type === "highlighter") && Array.isArray(stroke.points)) {
      const grouped = new Map<number, number[][]>();
      for (const point of stroke.points) {
        const pageIndex = Math.max(0, Math.floor(point[1] / pageHeightPx));
        if (!grouped.has(pageIndex)) grouped.set(pageIndex, []);
        grouped.get(pageIndex)!.push(point);
      }

      for (const [pageIndex, points] of grouped.entries()) {
        if (pageIndex >= pageCount || points.length < 2) continue;
        pdf.setPage(pageIndex + 1);
        renderStrokeSegment(pdf, points, stroke, mmPerPx, page.heightMm, pageIndex);
      }
      continue;
    }

    if (stroke.type === "text" && stroke.start && stroke.text) {
      const pageIndex = Math.max(0, Math.floor(stroke.start.y / pageHeightPx));
      if (pageIndex >= pageCount) continue;
      pdf.setPage(pageIndex + 1);

      const yOffsetMm = pageIndex * page.heightMm;
      const xMm = stroke.start.x * mmPerPx;
      const yMm = stroke.start.y * mmPerPx - yOffsetMm;
      const fontSize = Math.max(10, (stroke.size || 4) * 1.2);

      const color = hexToRgb(stroke.color || "#ffffff");
      pdf.setTextColor(color.r, color.g, color.b);
      pdf.setFontSize(fontSize);
      pdf.text(stroke.text, xMm, yMm);
      continue;
    }

    if ((stroke.type === "rect" || stroke.type === "circle" || stroke.type === "arrow") && stroke.start && stroke.end) {
      const pageIndex = Math.max(0, Math.floor(stroke.start.y / pageHeightPx));
      if (pageIndex >= pageCount) continue;
      pdf.setPage(pageIndex + 1);

      const yOffsetMm = pageIndex * page.heightMm;
      const x1 = stroke.start.x * mmPerPx;
      const y1 = stroke.start.y * mmPerPx - yOffsetMm;
      const x2 = stroke.end.x * mmPerPx;
      const y2 = stroke.end.y * mmPerPx - yOffsetMm;
      const color = hexToRgb(stroke.color || "#0ea5e9");

      pdf.setDrawColor(color.r, color.g, color.b);
      pdf.setLineWidth(Math.max(0.3, (stroke.size || 2) * mmPerPx));

      if (stroke.type === "rect") {
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        pdf.rect(Math.min(x1, x2), Math.min(y1, y2), w, h);
      } else if (stroke.type === "circle") {
        const rx = Math.abs(x2 - x1) / 2;
        const ry = Math.abs(y2 - y1) / 2;
        pdf.ellipse((x1 + x2) / 2, (y1 + y2) / 2, rx, ry);
      } else {
        pdf.line(x1, y1, x2, y2);
      }
    }
  }
}

async function buildDocumentPdf(blocks: any[], strokes: Stroke[], page: PageSettings): Promise<jsPDF> {
  const orientation = page.widthMm > page.heightMm ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: [page.widthMm, page.heightMm],
  });

  const leftMm = page.marginMm;
  const rightMm = page.widthMm - page.marginMm;
  const topMm = page.marginMm + page.headerMm;
  const bottomMm = page.heightMm - page.marginMm - page.footerMm;
  const lineWidthMm = rightMm - leftMm;

  const lines = flattenBlocks(blocks);

  let y = topMm + 4;
  let pageCount = 1;
  let lineCounter = 0;

  const yieldToUi = () =>
    new Promise<void>((resolve) => {
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => resolve());
      } else {
        setTimeout(() => resolve(), 0);
      }
    });

  for (const line of lines) {
    const isHeading = line.variant === "heading";
    const isQuote = line.variant === "quote";
    const isCode = line.variant === "code";
    const isTask = line.variant === "task";
    const fontSize = isHeading ? 16 : isCode ? 10 : isQuote ? 11 : 12;
    const lineHeight = isHeading ? 8 : isCode ? 5 : 6;
    const indent = Math.min(24, line.depth * 6 + (isQuote ? 3 : 0));

    const text = line.text || " ";

    pdf.setFont(isCode ? "courier" : "helvetica", isHeading ? "bold" : "normal");
    pdf.setFontSize(fontSize);
    if (isCode) {
      pdf.setTextColor(15, 23, 42);
    } else if (isTask) {
      pdf.setTextColor(51, 65, 85);
    } else {
      pdf.setTextColor(30, 41, 59);
    }

    const wrapped = pdf.splitTextToSize(text, Math.max(20, lineWidthMm - indent));
    const required = wrapped.length * lineHeight + (isHeading ? 2 : 1);

    if (y + required > bottomMm) {
      pdf.addPage([page.widthMm, page.heightMm], orientation);
      pageCount += 1;
      y = topMm + 4;
    }

    if (isQuote) {
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.5);
      pdf.line(leftMm + indent - 2, y - lineHeight + 1, leftMm + indent - 2, y + wrapped.length * lineHeight - 1);
    }
    if (isCode) {
      const height = wrapped.length * lineHeight + 2;
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(leftMm + indent - 1.5, y - lineHeight + 1, Math.max(20, lineWidthMm - indent + 3), height, 1.5, 1.5, "F");
    }

    for (const wrappedLine of wrapped) {
      pdf.text(String(wrappedLine), leftMm + indent, y);
      y += lineHeight;
    }

    y += isHeading ? 1.5 : 0.8;

    lineCounter += 1;
    if (lineCounter % 40 === 0) {
      // Keep long exports responsive by yielding periodically.
      // eslint-disable-next-line no-await-in-loop
      await yieldToUi();
    }
  }

  while (pdf.getNumberOfPages() < pageCount) {
    pdf.addPage([page.widthMm, page.heightMm], orientation);
  }

  addStrokeLayers(pdf, strokes, page, pdf.getNumberOfPages());

  return pdf;
}

export function NoteEditor({
  initialTitle = "",
  initialContent = "",
  onSave,
  isSaving = false,
  onSync,
  isSyncing = false,
  onBack,
  mode = "FULL",
  autoSaveInterval = 3000,
  onExportPdf,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(1);

  const serializedInitialContent = useMemo(() => {
    return JSON.stringify(initialContent ?? null);
  }, [initialContent]);
  const initialDoc = useMemo(() => parseDocument(initialContent), [serializedInitialContent]);

  const [layoutMode, setLayoutMode] = useState<"continuous" | "paged">(initialDoc.layoutMode || "continuous");
  const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>(
    initialDoc.backgroundPattern || "blank"
  );
  const [page, setPage] = useState<PageSettings>(initialDoc.page);

  const [currentTool, setCurrentTool] = useState<ToolType>("pen");
  const [currentColor, setCurrentColor] = useState<string>("#0ea5e9");
  const [currentSize, setCurrentSize] = useState<number>(4);
  const [isDirty, setIsDirty] = useState(false);

  const editorRef = useRef<any>(null);
  const strokesRef = useRef<Stroke[]>(initialDoc.content.strokes || []);

  const titleRef = useRef(title);
  const onSaveRef = useRef(onSave);
  const lastSavedSnapshotRef = useRef("");
  const lastSaveTimeRef = useRef(0);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    titleRef.current = title;
    onSaveRef.current = onSave;
  }, [title, onSave]);

  useEffect(() => {
    setTitle(initialTitle);
    setLayoutMode(initialDoc.layoutMode || "continuous");
    setBackgroundPattern(initialDoc.backgroundPattern || "blank");
    setPage(initialDoc.page);
    strokesRef.current = initialDoc.content.strokes || [];
    
    // CRITICAL: Initialize snapshot with the loaded content to prevent "empty clobbering"
    lastSavedSnapshotRef.current = buildSaveSnapshot(initialTitle, initialDoc);

    setIsDirty(false);
    setTimeout(() => { isInitialMountRef.current = false; }, 1500);
  }, [initialTitle, initialDoc]);

  const emitSave = useCallback(
    (isAutoSave: boolean, force = false) => {
      if (!isDirty && !force) return;

      const now = Date.now();
      if (!force && now - lastSaveTimeRef.current < 500) return;

      const blocks = editorRef.current?.document || initialDoc.content.blocks || [{ type: "paragraph" }];
      const doc: HybridDocument = {
        hybrid: true,
        version: 3,
        layoutMode,
        page,
        backgroundPattern,
        content: {
          blocks,
          strokes: strokesRef.current,
        },
      };

      const snapshot = buildSaveSnapshot(titleRef.current, doc);
      if (!force && snapshot === lastSavedSnapshotRef.current) return;

      lastSaveTimeRef.current = now;
      lastSavedSnapshotRef.current = snapshot;
      onSaveRef.current(titleRef.current, doc, isAutoSave);
      setIsDirty(false);
    },
    [initialDoc.content.blocks, layoutMode, page, backgroundPattern, isDirty]
  );

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        // Debounced save disabled to prevent accidental overwrites on mount
      }, autoSaveInterval),
    [emitSave, autoSaveInterval]
  );

  useEffect(() => {
    return () => {
      if (isDirty) emitSave(true, true);
      debouncedSave.flush();
    };
  }, [debouncedSave, isDirty, emitSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!isInitialMountRef.current) setIsDirty(true);
  };

  const handleDocumentChange = useCallback(
    (editor: any, strokes: Stroke[]) => {
      editorRef.current = editor;
      strokesRef.current = strokes;
      if (!isInitialMountRef.current) setIsDirty(true);
    },
    []
  );

  const handleDiscard = () => {
    setTitle(initialTitle);
    setLayoutMode(initialDoc.layoutMode || "continuous");
    setBackgroundPattern(initialDoc.backgroundPattern || "blank");
    setPage(initialDoc.page);
    strokesRef.current = initialDoc.content.strokes || [];
    setIsDirty(false);
    if (onBack) onBack(); // Re-mount to reset editor
  };

  const cycleBackground = () => {
    const patterns: BackgroundPattern[] = ["blank", "ruled", "grid", "dots"];
    const next = patterns[(patterns.indexOf(backgroundPattern) + 1) % patterns.length];
    setBackgroundPattern(next);
    if (!isInitialMountRef.current) setIsDirty(true);
  };

  const cycleLayout = () => {
    const next = layoutMode === "continuous" ? "paged" : "continuous";
    setLayoutMode(next);
    if (!isInitialMountRef.current) setIsDirty(true);
  };

  const applyPreset = (preset: PagePreset) => {
    const data = PAGE_PRESETS[preset];
    setPage((prev) => ({
      ...prev,
      preset,
      widthMm: data.widthMm,
      heightMm: data.heightMm,
    }));
    if (!isInitialMountRef.current) setIsDirty(true);
  };

  const fitToWidth = () => {
    const container = document.getElementById('editor-scroll-container');
    if (container) {
      const containerWidth = container.clientWidth - 80; // subtracting some padding
      const pageWidthPx = (page.widthMm * 96) / 25.4;
      const newZoom = containerWidth / pageWidthPx;
      setZoom(Math.min(2, Math.max(0.3, newZoom)));
    }
  };

  const updatePageSetting = (key: keyof PageSettings, value: number) => {
    const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
    setPage((prev) => ({ ...prev, [key]: safe }));
    debouncedSave();
  };

  const handleExportPdf = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const blocks = editorRef.current?.document || initialDoc.content.blocks || [{ type: "paragraph" }];
      const strokes = strokesRef.current || [];
      const pdf = await buildDocumentPdf(blocks, strokes, page);
      const blob = pdf.output("blob") as Blob;
      const suggestedFileName = `${title || "Notes"}.pdf`;

      if (onExportPdf) {
        const handled = await onExportPdf({
          blob,
          suggestedFileName,
          mimeType: "application/pdf",
        });
        if (handled !== false) return;
      }

      await defaultBlobSave(blob, suggestedFileName);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const layoutLabels = {
    continuous: "Flow",
    paged: "Paged",
  } as const;

  const bgLabels = {
    blank: "Blank",
    ruled: "Ruled",
    grid: "Grid",
    dots: "Dots",
  } as const;

  const colors = ["#0ea5e9", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ffffff"];
  const sizes = [2, 4, 8, 12, 16];

  const printableWidthMm = Math.max(0, page.widthMm - page.marginMm * 2);
  const printableHeightMm = Math.max(0, page.heightMm - page.marginMm * 2 - page.headerMm - page.footerMm);

  const [showPageSettings, setShowPageSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowPageSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div
        className={`flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md z-[100] relative ${
          mode === "SPLIT" ? "px-3 py-3" : "px-4 py-3 md:py-4 md:px-6"
        }`}
      >
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          {onBack && (
            <button
              onClick={() => {
                debouncedSave.flush();
                onBack();
              }}
              className="p-2.5 md:p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-2xl hover:text-[var(--text-primary)] hover:border-[var(--accent-color)] transition-all shadow-sm shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Archive Title..."
              className={`${mode === "SPLIT" ? "text-lg md:text-xl" : "text-xl md:text-4xl"} font-black italic uppercase bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/30 w-full truncate tracking-tighter`}
            />
            <span className="text-[8px] md:text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1 opacity-40">
              {page.widthMm}x{page.heightMm} MM // {printableWidthMm}x{printableHeightMm} PRINTABLE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0 select-none">
          <div className="hidden lg:flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.25rem] overflow-hidden">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all min-w-[50px] text-center"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))}
              className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={fitToWidth}
              className="p-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all border-l border-[var(--border-color)]"
              title="Fit to Width"
            >
              <Maximize size={14} />
            </button>
          </div>

          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`flex items-center justify-center gap-2.5 h-10 md:h-12 ${mode === "SPLIT" ? "w-10 md:w-auto md:px-4" : "w-10 md:w-auto md:px-6"} rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${
              isDrawingMode
                ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/30 shadow-inner"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]"
            }`}
            title="Toggle Draw Mode"
          >
            <PenTool size={14} />
            <span className="hidden md:inline">{isDrawingMode ? "Drawing" : "Annotate"}</span>
          </button>

          <button
            onClick={() => {
              console.log("Export button clicked");
              handleExportPdf();
            }}
            disabled={isExporting}
            className={`flex items-center justify-center gap-2.5 h-10 md:h-12 ${mode === "SPLIT" ? "w-10 md:w-auto md:px-4" : "w-10 md:w-auto md:px-6"} bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer`}
            title="Export to PDF"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden md:inline">{mode === "FULL" && (isExporting ? "Exporting..." : "Export")}</span>
          </button>

          {onSync ? (
            <button
              onClick={() => void onSync()}
              disabled={isSyncing || isSaving || isDirty}
              className={`flex items-center justify-center gap-2.5 h-10 md:h-12 ${mode === "SPLIT" ? "w-10 md:w-auto md:px-4" : "w-10 md:w-auto md:px-6"} bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all active:scale-95 disabled:opacity-50`}
              title="Sync (Disabled if unsaved changes exist)"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span className="hidden md:inline">Sync</span>
            </button>
          ) : null}

          {isDirty && (
            <button
              onClick={handleDiscard}
              className={`flex items-center justify-center gap-2.5 h-10 md:h-12 ${mode === "SPLIT" ? "w-10 md:w-auto md:px-4" : "w-10 md:w-auto md:px-6"} bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all active:scale-95`}
            >
              <span className="hidden md:inline">Discard</span>
            </button>
          )}

          <button
            onClick={() => {
              debouncedSave.cancel();
              emitSave(false, true);
            }}
            disabled={isSaving || (!isDirty && Boolean(initialTitle))}
            className={`flex items-center justify-center gap-2.5 h-10 md:h-12 ${mode === "SPLIT" ? "w-10 md:w-auto md:px-5" : "w-10 md:w-auto md:px-8"} ${isDirty ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-50'} rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                <RefreshCw size={14} className="md:hidden" />
                <span>{isDirty ? "Save Changes" : "Saved"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 md:px-6 relative z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <select
            value={page.preset}
            onChange={(e) => applyPreset(e.target.value as PagePreset)}
            className="h-8 md:h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] focus:border-[var(--accent-color)]/50 outline-none"
          >
            {Object.entries(PAGE_PRESETS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>

          <button
            onClick={cycleLayout}
            className="flex h-8 md:h-10 items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <LayoutTemplate size={14} />
            <span className="hidden sm:inline">{layoutMode}</span>
          </button>

          <button
            onClick={cycleBackground}
            className="flex h-8 md:h-10 items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          >
            <Grid3X3 size={14} />
            <span className="hidden sm:inline">{backgroundPattern}</span>
          </button>
        </div>

        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowPageSettings(!showPageSettings)}
            className={`flex h-8 md:h-10 items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 text-[10px] font-black uppercase tracking-widest transition-all ${showPageSettings ? 'text-[var(--accent-color)] border-[var(--accent-color)]/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Settings size={14} />
            <span className="hidden md:inline">Page Config</span>
            <ChevronDown size={12} className={`transition-transform duration-300 ${showPageSettings ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPageSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 md:w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-[110] p-4 flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex flex-col gap-1 mb-2">
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Format Engine</p>
                  <p className="text-[8px] font-bold text-[var(--text-secondary)]/50 uppercase tracking-widest">Adjust physical geometry</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Width (MM)</label>
                    <input
                      type="number"
                      value={page.widthMm}
                      min={100}
                      max={600}
                      onChange={(e) => updatePageSetting("widthMm", Number(e.target.value))}
                      className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Height (MM)</label>
                    <input
                      type="number"
                      value={page.heightMm}
                      min={100}
                      max={800}
                      onChange={(e) => updatePageSetting("heightMm", Number(e.target.value))}
                      className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]/50"
                    />
                  </div>
                </div>

                <div className="h-px bg-[var(--border-color)]/50" />

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Margin</label>
                    <input
                      type="number"
                      value={page.marginMm}
                      min={0}
                      max={80}
                      onChange={(e) => updatePageSetting("marginMm", Number(e.target.value))}
                      className="h-8 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Header</label>
                    <input
                      type="number"
                      value={page.headerMm}
                      min={0}
                      max={80}
                      onChange={(e) => updatePageSetting("headerMm", Number(e.target.value))}
                      className="h-8 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Footer</label>
                    <input
                      type="number"
                      value={page.footerMm}
                      min={0}
                      max={80}
                      onChange={(e) => updatePageSetting("footerMm", Number(e.target.value))}
                      className="h-8 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]/50"
                    />
                  </div>
                </div>
                
                <div className="flex lg:hidden flex-col gap-3 mt-2 pt-4 border-t border-[var(--border-color)]/50">
                   <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Visual Optics</p>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="flex-1 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ZoomOut size={16} /></button>
                      <button onClick={() => setZoom(1)} className="flex-1 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-black text-[var(--text-secondary)]">{Math.round(zoom * 100)}%</button>
                      <button onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))} className="flex-1 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><ZoomIn size={16} /></button>
                   </div>
                   <button onClick={fitToWidth} className="w-full h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center justify-center gap-2"><Maximize size={14} /> Fit To View</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[var(--bg-primary)] relative" id="editor-scroll-container">
        {isDrawingMode && (
          <div className="sticky top-6 z-50 flex justify-center mb-8 pointer-events-none">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl p-2 rounded-2xl flex items-center gap-2 pointer-events-auto">
              <div className="flex bg-[var(--bg-primary)] p-1 rounded-xl gap-1 border border-[var(--border-color)]">
                {[
                  { id: "pointer", icon: <MousePointer2 size={16} /> },
                  { id: "pen", icon: <PenTool size={16} /> },
                  { id: "highlighter", icon: <div className="w-4 h-4 border-b-4 border-current" /> },
                  { id: "eraser", icon: <Eraser size={16} /> },
                  { id: "text", icon: <Type size={16} /> },
                  { id: "rect", icon: <Square size={16} /> },
                  { id: "circle", icon: <Circle size={16} /> },
                  { id: "arrow", icon: <Minus size={16} /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTool(t.id as ToolType)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      currentTool === t.id ? "bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                    title={t.id}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
              <div className="w-px h-8 bg-[var(--border-color)] mx-2" />
              <div className="flex gap-1.5 px-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrentColor(c)}
                    className={`w-6 h-6 rounded-full transition-all border border-white/10 ${
                      currentColor === c ? "ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--accent-color)] scale-110" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="w-px h-8 bg-[var(--border-color)] mx-2" />
              <div className="flex gap-2 items-center px-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setCurrentSize(s)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                      currentSize === s ? "bg-[var(--accent-color)]/20 text-[var(--accent-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="bg-current rounded-full" style={{ width: s, height: s }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center pt-48 pb-32 min-h-full">
          <div 
            className="w-full flex flex-col items-center" 
            style={{ 
              zoom: zoom,
              transition: 'zoom 0.2s ease-out',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            <div className="w-full px-4 md:px-6 lg:px-10 flex flex-col items-center">
              <PageEditor
                key={serializedInitialContent}
                blocks={initialDoc.content.blocks}
                strokes={initialDoc.content.strokes}
                markdownString={typeof initialContent === "string" ? initialContent : undefined}
                isDrawingMode={isDrawingMode}
                backgroundPattern={backgroundPattern}
                pageWidthMm={page.widthMm}
                pageHeightMm={page.heightMm}
                marginMm={page.marginMm}
                headerMm={page.headerMm}
                footerMm={page.footerMm}
                onChange={handleDocumentChange}
                tool={currentTool}
                color={currentColor}
                size={currentSize}
              />
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-blocknote-theme .bn-container {
          font-family: inherit !important;
          background: transparent !important;
        }

        .custom-blocknote-theme .bn-editor {
          padding-left: 0 !important;
          padding-right: 0 !important;
          background: transparent !important;
        }

        .custom-blocknote-theme .bn-editor * {
          background-color: transparent !important;
          color: var(--text-primary) !important;
        }

        .custom-blocknote-theme .bn-side-menu .bn-button {
          color: var(--text-secondary);
          border-radius: 8px;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .custom-blocknote-theme .bn-side-menu .bn-button:hover {
          color: var(--accent-color);
          background: var(--hover-bg);
        }

        .custom-blocknote-theme [data-content-type="paragraph"] {
          font-size: 16px;
          line-height: 1.625;
          color: var(--text-primary);
        }

        .mantine-FocusRing-auto {
          outline: none !important;
        }

        .mantine-Popover-dropdown {
          position: absolute !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--border-color) !important;
          color: var(--text-primary) !important;
        }

        .bn-block-content {
          margin-bottom: 4px;
        }
      `,
        }}
      />
    </div>
  );
}
