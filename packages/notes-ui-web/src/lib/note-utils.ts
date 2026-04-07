import type { PartialBlock } from "@blocknote/core";
import type { Stroke } from "../components/InkOverlay";

export type LayoutMode = "continuous" | "paged";
export type PagePreset =
  | "a4-portrait"
  | "a4-landscape"
  | "letter-portrait"
  | "letter-landscape"
  | "custom";

export interface PageSettings {
  preset: PagePreset;
  widthMm: number;
  heightMm: number;
  marginMm: number;
  headerMm: number;
  footerMm: number;
}

export interface HybridDocumentContent {
  blocks: PartialBlock[];
  strokes: Stroke[];
}

export interface HybridDocument {
  hybrid: true;
  version: 3;
  layoutMode: LayoutMode;
  page: PageSettings;
  backgroundPattern: "blank" | "ruled" | "grid" | "dots";
  content: HybridDocumentContent;
}

const DEFAULT_PAGE: PageSettings = {
  preset: "a4-portrait",
  widthMm: 210,
  heightMm: 297,
  marginMm: 16,
  headerMm: 0,
  footerMm: 0,
};

const DEFAULT_DOC: HybridDocument = {
  hybrid: true,
  version: 3,
  layoutMode: "continuous",
  page: DEFAULT_PAGE,
  backgroundPattern: "blank",
  content: {
    blocks: [{ type: "paragraph" }],
    strokes: [],
  },
};

function mmToPx(mm: number) {
  return (mm * 96) / 25.4;
}

function toNonEmptyBlocks(blocks: unknown): PartialBlock[] {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return [{ type: "paragraph" }];
  }
  return blocks as PartialBlock[];
}

function toStrokes(value: unknown): Stroke[] {
  if (!Array.isArray(value)) return [];
  return value as Stroke[];
}

export function parseDocument(content: unknown): HybridDocument {
  if (!content) return DEFAULT_DOC;

  if (typeof content === "object" && (content as any).hybrid === true) {
    const data = content as any;
    if (data.version === 3 && data.content) {
      return {
        ...DEFAULT_DOC,
        ...data,
        page: {
          ...DEFAULT_PAGE,
          ...(data.page || {}),
        },
        content: {
          blocks: toNonEmptyBlocks(data.content?.blocks),
          strokes: toStrokes(data.content?.strokes),
        },
      };
    }

    if (data.version === 2 && Array.isArray(data.pages)) {
      const sourceLayout = data.layout as "infinite" | "a4-portrait" | "a4-landscape" | undefined;
      const pageFromLayout: PageSettings =
        sourceLayout === "a4-landscape"
          ? { ...DEFAULT_PAGE, preset: "a4-landscape", widthMm: 297, heightMm: 210 }
          : { ...DEFAULT_PAGE, preset: "a4-portrait", widthMm: 210, heightMm: 297 };

      const pageGapPx = 32;
      const oldPageHeightPx = mmToPx(pageFromLayout.heightMm);

      const mergedBlocks: PartialBlock[] = [];
      const mergedStrokes: Stroke[] = [];

      data.pages.forEach((page: any, index: number) => {
        const pageBlocks = toNonEmptyBlocks(page?.blocks);
        mergedBlocks.push(...pageBlocks);

        if (index < data.pages.length - 1) {
          mergedBlocks.push({ type: "paragraph", content: "" });
        }

        const yOffset = index * (oldPageHeightPx + pageGapPx);
        const pageStrokes = toStrokes(page?.strokes).map((stroke) => {
          const movedPoints =
            stroke.points?.map((pt: number[]) => [pt[0], pt[1] + yOffset, pt[2]]) ?? [];
          const movedStart = stroke.start
            ? { x: stroke.start.x, y: stroke.start.y + yOffset }
            : undefined;
          const movedEnd = stroke.end ? { x: stroke.end.x, y: stroke.end.y + yOffset } : undefined;
          return {
            ...stroke,
            points: movedPoints,
            start: movedStart,
            end: movedEnd,
          } as Stroke;
        });

        mergedStrokes.push(...pageStrokes);
      });

      return {
        ...DEFAULT_DOC,
        layoutMode: sourceLayout === "infinite" ? "continuous" : "paged",
        page: pageFromLayout,
        backgroundPattern: data.backgroundPattern || "blank",
        content: {
          blocks: toNonEmptyBlocks(mergedBlocks),
          strokes: mergedStrokes,
        },
      };
    }

    // V1 migration
    if (Array.isArray(data.blocks) || Array.isArray(data.strokes)) {
      return {
        ...DEFAULT_DOC,
        content: {
          blocks: toNonEmptyBlocks(data.blocks),
          strokes: toStrokes(data.strokes),
        },
      };
    }
  }

  // Pre-Hybrid (V0) Migration
  const blocks = parseInitialContent(content);
  if (blocks && blocks.length > 0) {
    return {
      ...DEFAULT_DOC,
      content: { blocks, strokes: [] },
    };
  }

  return DEFAULT_DOC;
}

export function parseInitialContent(content: unknown): PartialBlock[] | undefined {
  if (Array.isArray(content) && content.length > 0) {
    if ((content[0] as PartialBlock)?.type) return content as PartialBlock[];
  }

  if (typeof content === "string") {
    if (content.trim() === "") return undefined;
    return content.split("\n").map((line) => ({
      type: "paragraph",
      content: line,
    })) as PartialBlock[];
  }

  if (typeof content === "object" && content !== null) {
    const maybeDoc = content as { type?: string; content?: Array<{ content?: Array<{ text?: string }> }> };
    if (maybeDoc.type === "doc" && Array.isArray(maybeDoc.content)) {
      const parsedBlocks = maybeDoc.content.map((node) => {
        const text = Array.isArray(node.content)
          ? node.content.map((entry) => entry.text || "").join("")
          : "";

        return {
          type: "paragraph",
          content: text,
        };
      });

      return parsedBlocks.length > 0 ? (parsedBlocks as PartialBlock[]) : undefined;
    }
  }

  return undefined;
}

export function buildSaveSnapshot(title: string, content: unknown) {
  return JSON.stringify({
    title,
    content: content ?? [],
  });
}

export function isVisibleNote(
  note: { syncStatus?: string; category?: string },
  activeCategory: string
) {
  if (note.syncStatus === "DELETED") return false;
  if (activeCategory !== "ALL" && note.category !== activeCategory) return false;
  return true;
}

export function matchesNoteSearch(
  note: { title?: string | null; content?: unknown },
  query: string
) {
  const searchValue = query.trim().toLowerCase();
  if (!searchValue) return true;

  const title = note.title?.toLowerCase() || "";
  const content = JSON.stringify(note.content || "").toLowerCase();
  return title.includes(searchValue) || content.includes(searchValue);
}
