// apps/web/app/components/Plan/ImportExcelModal.tsx
"use client";
import React, { useRef, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import * as XLSX from "xlsx";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport?: () => void;
};

export default function ImportExcelModal({ isOpen, onClose, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [planName, setPlanName] = useState("");
  // Ensure we use substring to get a valid YYYY-MM-DD string
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !planName) setPlanName(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Select a file");

    setLoading(true);
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) throw new Error("No sheets found");

      const sheet = wb.Sheets[firstSheetName];
      if (!sheet) throw new Error("Sheet data not found");

      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const startObj = new Date(startDate);

      const tasks = json.map((row) => {
        let dateVal = row["Date"] ?? row["date"] ?? "";
        
        // Calculate date from "Day" column (e.g. Day 1 = startDate)
        if (!dateVal && (row["Day"] || row["day"])) {
            const dayNum = parseInt(String(row["Day"] || row["day"]));
            if (!isNaN(dayNum)) {
                const d = new Date(startObj);
                d.setDate(d.getDate() + (dayNum - 1));
                dateVal = d.toISOString();
            }
        }

        return {
            Date: String(dateVal),
            "Task Title": String(row["Task Title"] ?? row["Task"] ?? row["Title"] ?? ""),
            Notes: String(row["Notes"] ?? row["Description"] ?? ""),
            Priority: String(row["Priority"] ?? ""),
            "Expected Hours": String(row["Expected Hours"] ?? row["Estimated Time (min)"] ?? ""),
            Subtasks: String(row["Subtasks"] ?? ""),
            Tags: String(row["Tags"] ?? ""),
        };
      });

      const res = await fetch("/api/plans/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: planName || "Imported Plan", tasks }),
      });

      if (!res.ok) {
        // Try to parse JSON error message from server
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || await res.text() || "Import failed");
      }

      onImport?.();
      onClose();
      setFile(null);
      setPlanName("");
    } catch (err) {
      console.error(err);
      alert("Import failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Plan (CSV/Excel)">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-(--text-secondary) mb-1">Plan name</label>
          <input
            className="w-full bg-(--bg-secondary) border rounded px-3 py-2"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="My Learning Plan"
          />
        </div>

        <div>
            <label className="block text-sm text-(--text-secondary) mb-1">Start Date (Day 1)</label>
            <input 
                type="date" 
                className="w-full bg-(--bg-secondary) border rounded px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
        </div>

        <div>
          <label className="block text-sm text-(--text-secondary) mb-1">File</label>
          <input 
            ref={fileRef} 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !file}>
            {loading ? "Importing..." : "Import Plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}