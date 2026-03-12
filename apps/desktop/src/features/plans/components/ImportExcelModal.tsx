//apps/web/features/plans/components/ImportExcelModal.tsx
"use client";
import React, { useRef, useState } from "react";
import { FileSpreadsheet, Download, AlertCircle, UploadCloud } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import * as XLSX from "xlsx";
import { useAuth } from "../../auth/hooks/useAuth";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport?: () => void;
};

export default function ImportExcelModal({ isOpen, onClose, onImport }: Props) {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    if (f && !planName) setPlanName(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDownloadTemplate = () => {
    const headers = ["Day", "Task Title", "Subtasks", "Priority", "Notes", "Expected Hours", "Tags"];
    // Updated data to use ;; as separator
    const data = [
      ["1", "Learn React Basics", "Components;; Props;; State", "High", "Focus on functional components", "2", "react;; frontend"],
      ["2", "Setup Database", "Install PostgreSQL;; Create Schema", "Medium", "Use Docker if possible", "3", "db;; sql"],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Plan_Import_Template.xlsx");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
        setError("Please select a file to import.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) throw new Error("No sheets found in the file.");

      const sheet = wb.Sheets[firstSheetName];
      if (!sheet) throw new Error("Sheet data not found.");

      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const startObj = new Date(startDate);

      const tasks = json.map((row) => {
        let dateVal = row["Date"] ?? row["date"] ?? "";
        
        // Robust Day Parsing: Handle "Day 1", "1", "Day: 1"
        if (!dateVal && (row["Day"] || row["day"])) {
            const rawDay = String(row["Day"] || row["day"]);
            const dayNum = parseInt(rawDay.replace(/\D/g, "") || "0"); 
            
            if (!isNaN(dayNum) && dayNum > 0) {
                const d = new Date(startObj);
                d.setDate(d.getDate() + (dayNum - 1));
                dateVal = d.toISOString();
            }
        }

        // Parse Subtasks - Updated to split ONLY by ;;
        const rawSubtasks = String(row["Subtasks"] ?? row["subtasks"] ?? "");
        const subtasksArray = rawSubtasks
          .split(";;")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        // Parse Tags - Updated to split ONLY by ;;
        const rawTags = String(row["Tags"] ?? row["tags"] ?? "");
        const tagsArray = rawTags
          .split(";;")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        // Normalize Priority
        const rawPriority = String(row["Priority"] ?? "").toLowerCase();

        return {
            Date: String(dateVal),
            "Task Title": String(row["Task Title"] ?? row["Task"] ?? row["Title"] ?? ""),
            Notes: String(row["Notes"] ?? row["Description"] ?? ""),
            Priority: rawPriority, 
            "Expected Hours": String(row["Expected Hours"] ?? row["Estimated Time (min)"] ?? ""),
            Subtasks: subtasksArray,
            Tags: tagsArray,
        };
      });

      if (tasks.length === 0) throw new Error("No valid tasks found in the file.");

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/plans/import-json`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ planName: planName || "Imported Plan", tasks }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || await res.text() || "Import failed");
      }

      onImport?.();
      onClose();
      setFile(null);
      setPlanName("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Import Plan" 
        panelClassName="!max-w-4xl" 
    >
      <div className="transform-gpu flex flex-col lg:flex-row gap-6 lg:gap-8 max-h-[80vh] overflow-y-auto pr-1">
        
        {/* Left Side: Form */}
        <div className="transform-gpu flex-1 order-1 space-y-5">
            <form onSubmit={handleSubmit} className="transform-gpu space-y-4">
                
                {/* Plan Name */}
                <div>
                <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
                <input
                    className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Full Stack Roadmap 2024"
                />
                </div>

                {/* Start Date */}
                <div>
                    <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">Start Date (Day 1)</label>
                    <input 
                        type="date" 
                        className="transform-gpu w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                {/* File Upload Area */}
                <div>
                <label className="transform-gpu block text-sm font-medium text-slate-700 mb-1">Upload File</label>
                <div 
                    onClick={() => fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group flex flex-col items-center justify-center text-center
                    ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}
                    `}
                >
                    <input 
                        ref={fileRef} 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        onChange={handleFileChange} 
                        className="transform-gpu hidden"
                    />
                    
                    {file ? (
                        <>
                            <div className="transform-gpu w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                                <FileSpreadsheet size={20} />
                            </div>
                            <p className="transform-gpu text-sm font-medium text-indigo-900 truncate max-w-50">{file.name}</p>
                            <p className="transform-gpu text-xs text-indigo-500 mt-1">Click to change</p>
                        </>
                    ) : (
                        <>
                            <div className="transform-gpu w-10 h-10 bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 rounded-full flex items-center justify-center mb-2 transition-colors">
                                <UploadCloud size={20} />
                            </div>
                            <p className="transform-gpu text-sm text-slate-600 font-medium">Click to upload or drag & drop</p>
                            <p className="transform-gpu text-xs text-slate-400 mt-1">.xlsx, .xls, or .csv</p>
                        </>
                    )}
                </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="transform-gpu p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="transform-gpu mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="transform-gpu flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading || !file} className="transform-gpu min-w-25">
                        {loading ? "Importing..." : "Import Plan"}
                    </Button>
                </div>
            </form>
        </div>

        {/* Right Side: Guide & Template */}
        <div className="transform-gpu w-full lg:w-72 xl:w-80 order-2 bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col">
            <h4 className="transform-gpu font-semibold text-slate-800 flex items-center gap-2 mb-3 shrink-0">
                <FileSpreadsheet size={16} className="transform-gpu text-indigo-500" />
                Format Guide
            </h4>
            
            <p className="transform-gpu text-xs text-slate-500 mb-4 leading-relaxed shrink-0">
                Supported columns (headers must match):
            </p>

            {/* Scrollable container for the list items */}
            <div className="transform-gpu space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                
                {/* 1. Day */}
                <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Day</span>
                        <span className="transform-gpu text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-medium">Required</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">&quot;1&quot; or &quot;Day 1&quot;. Determines the date.</p>
                </div>

                {/* 2. Task Title */}
                <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Task Title</span>
                        <span className="transform-gpu text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-medium">Required</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">The main goal of the task.</p>
                </div>

                {/* 3. Subtasks */}
                <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Subtasks</span>
                        <span className="transform-gpu text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-medium">Optional</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">Split by <b>;;</b> (e.g. &quot;Read;; Write&quot;)</p>
                </div>

                {/* 4. Priority */}
                <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Priority</span>
                        <span className="transform-gpu text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-medium">Optional</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">High, Medium, or Low.</p>
                </div>

                 {/* 5. Notes */}
                 <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Notes</span>
                        <span className="transform-gpu text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-medium">Optional</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">Any extra description or details.</p>
                </div>

                {/* 6. Expected Hours */}
                <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Expected Hours</span>
                        <span className="transform-gpu text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-medium">Optional</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">Number (e.g. &quot;2&quot; or &quot;2.5&quot;).</p>
                </div>

                 {/* 7. Tags */}
                 <div className="transform-gpu bg-white p-2.5 rounded border border-slate-200/60 shadow-xs">
                    <div className="transform-gpu flex items-center justify-between mb-1">
                        <span className="transform-gpu text-xs font-bold text-slate-700 uppercase tracking-wide">Tags</span>
                        <span className="transform-gpu text-[10px] bg-indigo-50 text-indigo-600 px-1.5 rounded font-medium">Optional</span>
                    </div>
                    <p className="transform-gpu text-[11px] text-slate-500 leading-tight">Split by <b>;;</b> (e.g. &quot;sql;; db&quot;).</p>
                </div>
            </div>

            <div className="transform-gpu mt-5 pt-4 border-t border-slate-200 shrink-0">
                <button 
                    onClick={handleDownloadTemplate}
                    className="transform-gpu w-full py-2 px-3 bg-white border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 text-xs font-medium rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 group"
                >
                    <Download size={14} className="transform-gpu text-slate-400 group-hover:text-indigo-500" />
                    Download Template
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
}