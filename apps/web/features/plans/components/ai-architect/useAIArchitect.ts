import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanBlueprintData, SyllabusData, SyllabusModule, TaskBlueprint } from "@/types/plan";
import { generateICS, downloadFile } from "@/lib/ics-generator"; // ✅ Import

export type Message = {
  role: "user" | "assistant";
  content: string;
};

// ... (Normalizers - keeping them consistent)
type RawModule = Record<string, unknown>;

function normalizeModule(mod: unknown): SyllabusModule {
  const m = mod as RawModule; 
  const title = (m.title || m.name || m.moduleName || "Untitled Module") as string;
  let topics: string[] = ["General Review"];
  if (Array.isArray(m.topics)) {
    topics = m.topics.map(t => String(t));
  } else if (typeof m.topics === 'string') {
    topics = m.topics.split(',');
  }
  const durationVal = m.duration;
  const duration = typeof durationVal === 'number' 
    ? `${durationVal} days` 
    : (String(durationVal || "1 day"));
  return { title, topics, duration };
}

function normalizeSyllabus(raw: unknown, requestedDays: number): SyllabusData {
  let modules: unknown[] = [];
  const r = raw as Record<string, unknown>;
  
  if (Array.isArray(raw)) {
    modules = raw;
  } else if (r && typeof r === 'object') {
    if (Array.isArray(r.modules)) modules = r.modules;
    else if (Array.isArray(r.syllabus)) modules = r.syllabus;
    else if (Array.isArray(r.plan)) modules = r.plan;
    else if (Array.isArray(r.phases)) modules = r.phases;
  }

  const cleanModules = modules.map(normalizeModule);

  if (cleanModules.length === 0) {
    cleanModules.push({
      title: "Core Fundamentals",
      duration: `${Math.floor(requestedDays / 2)} days`,
      topics: ["Basics", "Setup", "Hello World"]
    });
    cleanModules.push({
      title: "Advanced Concepts",
      duration: `${Math.ceil(requestedDays / 2)} days`,
      topics: ["Deep Dive", "Project", "Deployment"]
    });
  }

  const title = (r?.title as string) || "Custom Learning Plan";

  return {
    title,
    totalDays: requestedDays,
    modules: cleanModules
  };
}

interface AIResponseTask {
  title?: string;
  description?: string;
  estimatedMinutes?: number;
  subtasks?: string[];
  resources?: string[];
  outcome?: string;
  [key: string]: unknown;
}

// --- MAIN HOOK ---

export const useAIArchitect = (setOpen: (open: boolean) => void) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentSyllabus, setCurrentSyllabus] = useState<SyllabusData | null>(null);
  const [currentBlueprint, setCurrentBlueprint] = useState<PlanBlueprintData | null>(null);

  const parseInputIntent = (input: string) => {
    const daysMatch = input.match(/(\d+)\s*[-]?\s*day/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 30;
    return { days, topic: input };
  };

  const callAI = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Generation Failed");
    return res.json();
  };

  const handleSend = async (input: string) => {
    const { days, topic } = parseInputIntent(input);
    const config = { topic, days, level: "Beginner" }; 

    const newMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);
    setLoadingStep("Drafting Structure...");

    try {
      const data = await callAI({ 
         messages: [...messages, newMsg], 
         isSyllabusMode: true,
         batchConfig: config 
      });

      if (data.syllabusData) {
        const normalized = normalizeSyllabus(data.syllabusData, days);
        setCurrentSyllabus(normalized);
        setMessages(prev => [...prev, { role: "assistant", content: "I've drafted a structured plan. Review the phases below." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error generating syllabus. Please try again." }]);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const generateInBatches = async (syllabus: SyllabusData) => {
    setLoading(true);
    setCurrentSyllabus(null); 
    
    // Initialize Empty Blueprint for Live Stream
    setCurrentBlueprint({
        title: syllabus.title,
        description: "Initializing construction sequence...",
        tasks: []
    });

    const totalDays = syllabus.modules.reduce((acc, mod) => {
        const dStr = String(mod.duration);
        const match = dStr.match(/\d+/);
        return acc + (match ? parseInt(match[0]) : 1);
    }, 0);

    const accumulatedTasks: TaskBlueprint[] = [];
    
    let currentDayPointer = 1;
    const dayToModuleMap: Record<number, SyllabusModule> = {};
    
    syllabus.modules.forEach(mod => {
        const dStr = String(mod.duration);
        const days = parseInt(dStr.match(/\d+/)?.[0] || "1");
        for(let i=0; i<days; i++) {
            dayToModuleMap[currentDayPointer + i] = mod;
        }
        currentDayPointer += days;
    });

    const BATCH_SIZE = 5; 

    try {
        for (let startDay = 1; startDay <= totalDays; startDay += BATCH_SIZE) {
            const endDay = Math.min(startDay + BATCH_SIZE - 1, totalDays);
            
            setLoadingStep(`Architecting Days ${startDay}-${endDay}...`);
            
            const currentModule = dayToModuleMap[startDay] || syllabus.modules[0];
            let chunkTasks: AIResponseTask[] = [];
            let attempts = 0;

            while (attempts < 2 && chunkTasks.length === 0) {
                const data = await callAI({
                    messages: [], 
                    isSyllabusMode: false,
                    batchConfig: { 
                        syllabus, 
                        startDay, 
                        endDay, 
                        currentModule 
                    }
                });
                
                if (data.planData) {
                     if (Array.isArray(data.planData)) {
                        chunkTasks = data.planData as AIResponseTask[];
                     }
                     else if (data.planData.tasks && Array.isArray(data.planData.tasks)) {
                        chunkTasks = data.planData.tasks as AIResponseTask[];
                     }
                }
                attempts++;
            }

            if (chunkTasks.length > 0) {
                const fixedTasks = chunkTasks.map((t, i) => ({
                    id: `gen-${startDay+i}`,
                    day: startDay + i,
                    title: t.title || "Daily Task",
                    description: t.description || `Focus on ${currentModule.title}`,
                    estimatedMinutes: t.estimatedMinutes || 60,
                    subtasks: t.subtasks || [],
                    resources: t.resources || [],
                    outcome: t.outcome || ""
                }));

                // Add to local accumulator
                accumulatedTasks.push(...(fixedTasks as unknown as TaskBlueprint[]));

                // Live Update
                setCurrentBlueprint({
                    title: syllabus.title,
                    description: `Building in progress... (${accumulatedTasks.length} / ${totalDays} days generated)`,
                    tasks: [...accumulatedTasks] 
                });
            }
        }
        
        if (accumulatedTasks.length === 0) throw new Error("AI returned empty tasks");

        setCurrentBlueprint({
            title: syllabus.title,
            description: `Comprehensive ${totalDays}-day plan for ${syllabus.title}.`,
            tasks: accumulatedTasks
        });
        setMessages(prev => [...prev, { role: "assistant", content: "Plan generated successfully!" }]);

    } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { role: "assistant", content: "Generation failed." }]);
        if (accumulatedTasks.length === 0) {
            setCurrentBlueprint(null);
            setCurrentSyllabus(syllabus);
        }
    } finally {
        setLoading(false);
        setLoadingStep("");
    }
  };

  const approveSyllabus = async (finalSyllabus: SyllabusData) => {
    setCurrentSyllabus(finalSyllabus);
    await generateInBatches(finalSyllabus);
  };

  const regenerateSingleModule = async (index: number, module: SyllabusModule): Promise<SyllabusModule> => {
    const data = await callAI({ messages: [], isRegenerateModule: true, batchConfig: module });
    const rawModule = (data.planData || module) as unknown; 
    return normalizeModule(rawModule); 
  };
  
  const regenerateDay = async (dayIndex: number, currentTask: TaskBlueprint, feedback?: string) => {
    setLoading(true);
    setLoadingStep(`Refining Day ${currentTask.day}...`);

    try {
        const data = await callAI({
            messages: [],
            isRegenerateDay: true,
            batchConfig: {
                day: currentTask.day,
                currentTask: currentTask,
                feedback: feedback || "Make it more technical and detailed.",
                moduleTitle: "Current Module" 
            }
        });

        const rawTask = data.planData as AIResponseTask;
        
        const newTask: TaskBlueprint = {
            id: currentTask.id, 
            day: currentTask.day,
            title: (rawTask.title as string) || "Updated Task",
            description: (rawTask.description as string) || "",
            estimatedMinutes: (rawTask.estimatedMinutes as number) || 60,
            subtasks: (rawTask.subtasks as string[]) || [],
            resources: (rawTask.resources as string[]) || [],
            outcome: (rawTask.outcome as string) || ""
        };

        if (currentBlueprint) {
            const newTasks = [...currentBlueprint.tasks];
            newTasks[dayIndex] = newTask;
            setCurrentBlueprint({ ...currentBlueprint, tasks: newTasks });
        }

    } catch (e) {
        console.error("Failed to regenerate day", e);
    } finally {
        setLoading(false);
        setLoadingStep("");
    }
  };

  const updatePlanTask = (
    dayIndex: number, 
    taskId: string, 
    field: string, 
    value: string | number | string[]
  ) => {
     if (!currentBlueprint) return;
     const newTasks = [...currentBlueprint.tasks];
     if (dayIndex >= 0 && dayIndex < newTasks.length) {
        const task = newTasks[dayIndex] as unknown as Record<string, unknown>;
        task[field] = value;
        setCurrentBlueprint({ ...currentBlueprint, tasks: newTasks });
     }
  };

  const startPlan = async (startDate: string) => {
     if (!currentBlueprint || !currentBlueprint.tasks || currentBlueprint.tasks.length === 0) return;
     setIsSaving(true);
     try {
        const importPayload = {
            planName: currentBlueprint.title,
            startDate: startDate, 
            isAI: true,
            tasks: currentBlueprint.tasks.map((t) => ({
              "Day": t.day,
              "Task Title": t.title,
              "Estimated Time (min)": t.estimatedMinutes,
              "Description": t.description || `Part of ${currentBlueprint.title}`,
              "Priority": "Medium",
              "Subtasks": t.subtasks || [],
              "Resources": t.resources, 
              "Outcome": t.outcome
            }))
        };

        const res = await fetch("/api/plans/import-json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(importPayload)
        });

        if (res.ok) { 
           const newPlan = await res.json();
           setOpen(false); 
           router.push(`/dashboard/plans/${newPlan.id}`);
           router.refresh();
        } else {
           throw new Error("Failed to save plan");
        }
     } catch (e) { 
        console.error(e);
        alert("Error saving plan. Please try again."); 
     } finally { 
        setIsSaving(false); 
     }
  };

  // ✅ NEW: Download ICS Function
  const downloadICS = (startDate: string, skipWeekends: boolean) => {
    if (!currentBlueprint || !currentBlueprint.tasks) return;

    try {
        const icsContent = generateICS(
            currentBlueprint.title,
            currentBlueprint.tasks,
            startDate,
            skipWeekends // ✅ Pass preference
        );
        
        const safeTitle = currentBlueprint.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}_plan.ics`;
        
        downloadFile(filename, icsContent);
    } catch (e) {
        console.error("Failed to generate ICS", e);
    }
  };

  return { 
    messages, 
    loading, 
    loadingStep, 
    isSaving, 
    currentSyllabus, 
    currentBlueprint, 
    handleSend, 
    approveSyllabus, 
    regenerateSingleModule, 
    updatePlanTask, 
    startPlan, 
    setMessages,
    regenerateDay,
    downloadICS, // ✅ Exported
    reorderTasks: () => {}, 
    handleImport: () => {}, 
    regeneratingDay: null 
  };
};