"use client";
import React, { useRef, useState } from "react";
import { FileSpreadsheet, Download, AlertCircle, UploadCloud } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import * as XLSX from "xlsx";
import { useAuth } from "../../auth/hooks/useAuth";
import { api } from "../../../services/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport?: () => void;
};

export default function ImportExcelModal({ isOpen, onClose, onImport }: Props) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    if (f && !planName) setPlanName(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDownloadTemplate = () => {
    const headers = ["Day", "Task Title", "Subtasks", "Priority", "Notes", "Expected Hours", "Tags"];
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
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const startObj = new Date(startDate);

      const tasks = json.map((row) => {
        let dateVal = row["Date"] ?? row["date"] ?? "";
        if (!dateVal && (row["Day"] || row["day"])) {
            const rawDay = String(row["Day"] || row["day"]);
            const dayNum = parseInt(rawDay.replace(/\D/g, "") || "0"); 
            if (!isNaN(dayNum) && dayNum > 0) {
                const d = new Date(startObj);
                d.setDate(d.getDate() + (dayNum - 1));
                dateVal = d.toISOString();
            }
        }

        const rawSubtasks = String(row["Subtasks"] ?? row["subtasks"] ?? "");
        const subtasksArray = rawSubtasks.split(";;").map((s) => s.trim()).filter((s) => s.length > 0);
        const rawTags = String(row["Tags"] ?? row["tags"] ?? "");
        const tagsArray = rawTags.split(";;").map((s) => s.trim()).filter((s) => s.length > 0);

        return {
            Date: String(dateVal),
            "Task Title": String(row["Task Title"] ?? row["Task"] ?? row["Title"] ?? ""),
            Notes: String(row["Notes"] ?? row["Description"] ?? ""),
            Priority: String(row["Priority"] ?? "").toLowerCase(), 
            "Expected Hours": String(row["Expected Hours"] ?? row["Estimated Time (min)"] ?? ""),
            Subtasks: subtasksArray,
            Tags: tagsArray,
        };
      });

      await api.post("/api/plans/import-json", { planName: planName || "Imported Plan", tasks });

      onImport?.();
      onClose();
    } catch (err) {
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
        panelClassName="!max-w-5xl" 
    >
      <div className="transform-gpu flex flex-col lg:flex-row gap-8 max-h-[80vh] italic text-left">
        
        {/* Left Side: Form */}
        <div className="transform-gpu flex-1 order-1 space-y-8">
            <form onSubmit={handleSubmit} className="transform-gpu space-y-6">
                
                <div className="space-y-6">
                    <div>
                        <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Plan Name</label>
                        <input
                            className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-sm italic uppercase"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            placeholder="e.g. Full Stack Roadmap 2024"
                        />
                    </div>

                    <div>
                        <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Start Date (Day 1)</label>
                        <input 
                            type="date" 
                            className="transform-gpu w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-6 py-4 font-black text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none transition-all text-sm italic"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="transform-gpu block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 ml-1 italic opacity-40">Upload File</label>
                        <div 
                            onClick={() => fileRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-[2.5rem] p-10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center
                            ${file ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:border-[var(--accent-color)]/30'}
                            `}
                        >
                            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                            
                            {file ? (
                                <>
                                    <div className="w-14 h-14 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-[var(--accent-color)]/20">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <p className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tighter truncate max-w-xs">{file.name}</p>
                                    <p className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mt-2">Click to replace</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:text-[var(--accent-color)] group-hover:border-[var(--accent-color)]/50">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed italic opacity-60">Click to upload or drag & drop<br/>.xlsx, .xls, or .csv</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="transform-gpu p-4 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 italic">
                        <AlertCircle size={16} className="transform-gpu shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="transform-gpu flex justify-end gap-4 pt-6 border-t border-[var(--border-color)]">
                    <button type="button" onClick={onClose} disabled={loading} className="transform-gpu px-8 py-3.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] font-black text-[10px] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all active:scale-95 italic">Cancel</button>
                    <button type="submit" disabled={loading || !file} className="transform-gpu px-10 py-3.5 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--accent-color)]/20 transition-all active:scale-95 italic">
                        {loading ? "Importing..." : "Import Plan"}
                    </button>
                </div>
            </form>
        </div>

        {/* Right Side: Guide */}
        <div className="transform-gpu w-full lg:w-80 xl:w-96 order-2 bg-[var(--bg-secondary)]/50 rounded-[2.5rem] p-8 border border-[var(--border-color)] flex flex-col relative overflow-hidden">
            <h4 className="transform-gpu font-black text-[var(--text-primary)] uppercase tracking-tighter italic flex items-center gap-3 mb-6 shrink-0">
                <FileSpreadsheet size={20} className="text-[var(--accent-color)]" />
                Format Guide
            </h4>
            
            <div className="transform-gpu space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {[
                    { h: "Day", d: "Determines the date. '1' or 'Day 1'", r: true },
                    { h: "Task Title", d: "The primary objective", r: true },
                    { h: "Subtasks", d: "Split tasks by ';;'", r: false },
                    { h: "Priority", d: "High, Medium, or Low", r: false },
                    { h: "Notes", d: "Additional context", r: false },
                    { h: "Expected Hours", d: "Duration (e.g. 2.5)", r: false }
                ].map((item, idx) => (
                    <div key={idx} className="bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">{item.h}</span>
                            {item.r && <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">Req</span>}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-tight opacity-60 italic">{item.d}</p>
                    </div>
                ))}
            </div>

            <div className="transform-gpu mt-8 pt-6 border-t border-[var(--border-color)] shrink-0">
                <button 
                    onClick={handleDownloadTemplate}
                    className="transform-gpu w-full py-4 px-6 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 text-[var(--text-secondary)] hover:text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95 italic"
                >
                    <Download size={16} />
                    Download Template
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
}
