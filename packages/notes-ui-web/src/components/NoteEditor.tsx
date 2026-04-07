"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  PenTool,
  LayoutTemplate,
  Download,
  Eraser,
  Square,
  Circle,
  Minus,
  MousePointer2,
  Type,
  Grid3X3,
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

  const serializedInitialContent = useMemo(() => JSON.stringify(initialContent ?? null), [initialContent]);
  const initialDoc = useMemo(() => parseDocument(initialContent), [serializedInitialContent]);

  const [layoutMode, setLayoutMode] = useState<"continuous" | "paged">(initialDoc.layoutMode || "continuous");
  const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>(
    initialDoc.backgroundPattern || "blank"
  );
  const [page, setPage] = useState<PageSettings>(initialDoc.page);

  const [currentTool, setCurrentTool] = useState<ToolType>("pen");
  const [currentColor, setCurrentColor] = useState<string>("#0ea5e9");
  const [currentSize, setCurrentSize] = useState<number>(4);

  const editorRef = useRef<any>(null);
  const strokesRef = useRef<Stroke[]>(initialDoc.content.strokes || []);

  const titleRef = useRef(title);
  const onSaveRef = useRef(onSave);
  const lastSavedSnapshotRef = useRef("");

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
  }, [initialTitle, initialDoc]);

  const emitSave = useCallback(
    (isAutoSave: boolean, force = false) => {
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

      lastSavedSnapshotRef.current = snapshot;
      onSaveRef.current(titleRef.current, doc, isAutoSave);
    },
    [initialDoc.content.blocks, layoutMode, page, backgroundPattern]
  );

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        emitSave(true);
      }, autoSaveInterval),
    [emitSave, autoSaveInterval]
  );

  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedSave();
  };

  const handleDocumentChange = useCallback(
    (editor: any, strokes: Stroke[]) => {
      editorRef.current = editor;
      strokesRef.current = strokes;
      debouncedSave();
    },
    [debouncedSave]
  );

  const cycleBackground = () => {
    const patterns: BackgroundPattern[] = ["blank", "ruled", "grid", "dots"];
    const next = patterns[(patterns.indexOf(backgroundPattern) + 1) % patterns.length];
    setBackgroundPattern(next);
    debouncedSave();
  };

  const cycleLayout = () => {
    const next = layoutMode === "continuous" ? "paged" : "continuous";
    setLayoutMode(next);
    debouncedSave();
  };

  const applyPreset = (preset: PagePreset) => {
    const data = PAGE_PRESETS[preset];
    setPage((prev) => ({
      ...prev,
      preset,
      widthMm: data.widthMm,
      heightMm: data.heightMm,
    }));
    debouncedSave();
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

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-obsidian text-slate-200">
      <div
        className={`flex items-center justify-between border-b border-slate-800 bg-obsidian/80 backdrop-blur-md z-50 relative ${
          mode === "SPLIT" ? "px-3 py-3" : "px-4 py-4 md:px-6"
        }`}
      >
        <div className="flex items-center gap-4 overflow-hidden">
          {onBack && (
            <button
              onClick={() => {
                debouncedSave.flush();
                onBack();
              }}
              className="p-3 bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl hover:text-white hover:border-sky-focus transition-all shadow-sm shrink-0"
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
              className={`${mode === "SPLIT" ? "text-xl" : "text-4xl"} font-black italic uppercase bg-transparent border-none outline-none text-white placeholder:text-slate-700 w-full truncate tracking-tighter`}
            />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              {page.widthMm}x{page.heightMm} MM // {printableWidthMm}x{printableHeightMm} PRINTABLE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 select-none">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className={`flex items-center gap-2.5 ${mode === "SPLIT" ? "px-4 py-3" : "px-6 py-4"} bg-slate-800 text-slate-400 border border-slate-700 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all active:scale-95 disabled:opacity-50`}
            title="Export to PDF"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {mode === "FULL" && (isExporting ? "Exporting..." : "Export")}
          </button>

          <button
            onClick={cycleBackground}
            className={`flex items-center gap-2.5 ${mode === "SPLIT" ? "px-4 py-3" : "px-6 py-4"} bg-slate-800 text-slate-400 border border-slate-700 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all active:scale-95`}
            title="Toggle Background"
          >
            <Grid3X3 size={14} />
            {bgLabels[backgroundPattern]}
          </button>

          <button
            onClick={cycleLayout}
            className={`flex items-center gap-2.5 ${mode === "SPLIT" ? "px-4 py-3" : "px-6 py-4"} bg-slate-800 text-slate-400 border border-slate-700 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all active:scale-95`}
            title="Toggle Layout"
          >
            <LayoutTemplate size={14} />
            {layoutLabels[layoutMode]}
          </button>

          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`flex items-center gap-2.5 ${mode === "SPLIT" ? "px-4 py-3" : "px-6 py-4"} rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border ${
              isDrawingMode
                ? "bg-sky-focus/10 text-sky-focus border-sky-focus/30 shadow-inner"
                : "bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:border-slate-600"
            }`}
            title="Toggle Draw Mode"
          >
            <PenTool size={14} />
            {isDrawingMode ? "Drawing" : "Annotate"}
          </button>

          {onSync ? (
            <button
              onClick={() => void onSync()}
              disabled={isSyncing || isSaving}
              className={`flex items-center gap-2.5 ${mode === "SPLIT" ? "px-4 py-3" : "px-6 py-4"} bg-slate-800 text-slate-400 border border-slate-700 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:text-white transition-all active:scale-95 disabled:opacity-50`}
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync"}
            </button>
          ) : null}
          <button
            onClick={() => {
              debouncedSave.cancel();
              emitSave(false, true);
            }}
            disabled={isSaving}
            className={`flex items-center gap-2.5 ${mode === "SPLIT" ? "px-5 py-3" : "px-8 py-4"} bg-sky-focus text-obsidian rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin text-obsidian" /> : null}
            {isSaving ? "Saving..." : "Seal Archive"}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-800 bg-obsidian px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={page.preset}
            onChange={(e) => applyPreset(e.target.value as PagePreset)}
            className="h-10 rounded-xl border border-slate-800 bg-slate-900 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 focus:border-sky-focus/50 outline-none"
          >
            {Object.entries(PAGE_PRESETS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>

          {page.preset === "custom" && (
            <>
              <input
                type="number"
                value={page.widthMm}
                min={100}
                max={600}
                onChange={(e) => updatePageSetting("widthMm", Number(e.target.value))}
                className="h-10 w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-sky-focus/50"
                title="Width (mm)"
              />
              <input
                type="number"
                value={page.heightMm}
                min={100}
                max={800}
                onChange={(e) => updatePageSetting("heightMm", Number(e.target.value))}
                className="h-10 w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-sky-focus/50"
                title="Height (mm)"
              />
            </>
          )}

          <input
            type="number"
            value={page.marginMm}
            min={0}
            max={80}
            onChange={(e) => updatePageSetting("marginMm", Number(e.target.value))}
            className="h-10 w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-sky-focus/50"
            title="Margins (mm)"
          />
          <input
            type="number"
            value={page.headerMm}
            min={0}
            max={80}
            onChange={(e) => updatePageSetting("headerMm", Number(e.target.value))}
            className="h-10 w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-sky-focus/50"
            title="Header reserve (mm)"
          />
          <input
            type="number"
            value={page.footerMm}
            min={0}
            max={80}
            onChange={(e) => updatePageSetting("footerMm", Number(e.target.value))}
            className="h-10 w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-sky-focus/50"
            title="Footer reserve (mm)"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-24 bg-obsidian relative" id="editor-scroll-container">
        {isDrawingMode && (
          <div className="sticky top-6 z-50 flex justify-center mb-8 pointer-events-none">
            <div className="bg-slate-900 border border-slate-800 shadow-2xl p-2 rounded-2xl flex items-center gap-2 pointer-events-auto">
              <div className="flex bg-obsidian p-1 rounded-xl gap-1 border border-slate-800">
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
                      currentTool === t.id ? "bg-sky-focus text-obsidian shadow-lg" : "text-slate-500 hover:text-slate-300"
                    }`}
                    title={t.id}
                  >
                    {t.icon}
                  </button>
                ))}
              </div>
              <div className="w-px h-8 bg-slate-800 mx-2" />
              <div className="flex gap-1.5 px-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrentColor(c)}
                    className={`w-6 h-6 rounded-full transition-all border border-white/10 ${
                      currentColor === c ? "ring-2 ring-offset-2 ring-offset-obsidian ring-sky-focus scale-110" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="w-px h-8 bg-slate-800 mx-2" />
              <div className="flex gap-2 items-center px-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setCurrentSize(s)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                      currentSize === s ? "bg-sky-focus/20 text-sky-focus" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <div className="bg-current rounded-full" style={{ width: s, height: s }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 md:px-6 lg:px-10" style={{ minHeight: layoutMode === "continuous" ? `${page.heightMm * 1.3}mm` : `${page.heightMm}mm` }}>
          <PageEditor
            key={serializedInitialContent}
            blocks={initialDoc.content.blocks}
            strokes={initialDoc.content.strokes}
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
          color: #e2e8f0 !important;
        }

        .custom-blocknote-theme .bn-side-menu .bn-button {
          color: #64748b;
          border-radius: 8px;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .custom-blocknote-theme .bn-side-menu .bn-button:hover {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }

        .custom-blocknote-theme [data-content-type="paragraph"] {
          font-size: 16px;
          line-height: 1.625;
          color: #cbd5e1;
        }

        .mantine-FocusRing-auto {
          outline: none !important;
        }

        .mantine-Popover-dropdown {
          position: absolute !important;
          background: #151c2c !important;
          border: 1px solid #1e293b !important;
          color: #f8fafc !important;
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
