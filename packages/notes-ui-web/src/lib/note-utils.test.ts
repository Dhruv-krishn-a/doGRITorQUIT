import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSaveSnapshot,
  isVisibleNote,
  matchesNoteSearch,
  parseInitialContent,
} from "./note-utils.ts";

test("parseInitialContent converts plain text into paragraph blocks", () => {
  assert.deepEqual(parseInitialContent("alpha\nbeta"), [
    { type: "paragraph", content: "alpha" },
    { type: "paragraph", content: "beta" },
  ]);
});

test("parseInitialContent converts legacy doc JSON into paragraph blocks", () => {
  assert.deepEqual(
    parseInitialContent({
      type: "doc",
      content: [
        { content: [{ text: "hello" }] },
        { content: [{ text: "world" }] },
      ],
    }),
    [
      { type: "paragraph", content: "hello" },
      { type: "paragraph", content: "world" },
    ]
  );
});

test("buildSaveSnapshot is stable for equivalent data", () => {
  const snapshotA = buildSaveSnapshot("Title", [{ type: "paragraph", content: "body" }]);
  const snapshotB = buildSaveSnapshot("Title", [{ type: "paragraph", content: "body" }]);
  assert.equal(snapshotA, snapshotB);
});

test("matchesNoteSearch checks both title and content", () => {
  assert.equal(matchesNoteSearch({ title: "Physics", content: [{ text: "velocity" }] }, "phys"), true);
  assert.equal(matchesNoteSearch({ title: "Physics", content: [{ text: "velocity" }] }, "velo"), true);
  assert.equal(matchesNoteSearch({ title: "Physics", content: [{ text: "velocity" }] }, "chem"), false);
});

test("isVisibleNote excludes deleted and mismatched categories", () => {
  assert.equal(isVisibleNote({ syncStatus: "DELETED", category: "GENERAL" }, "ALL"), false);
  assert.equal(isVisibleNote({ syncStatus: "SYNCED", category: "GENERAL" }, "PROJECT"), false);
  assert.equal(isVisibleNote({ syncStatus: "SYNCED", category: "GENERAL" }, "ALL"), true);
});
