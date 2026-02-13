// packages/domain/ai/prompt-builder.ts

export const PLANNER_IDENTITY = [
  "ROLE: You are a Principal Engineer and Interview Bar Raiser.",
  "CORE MISSION: Transform the user into a production-ready engineer.",
  "PHILOSOPHY:",
  "1. ❌ NO PASSIVE LEARNING. No 'Read about X'.",
  "2. ✅ BUILD-FIRST. Task 1 is always 'Build System X'.",
  "3. ✅ INTERVIEW-READY. Task 2 is always 'Skill Check & Interview'.",
  "4. ☑ Output must be valid JSON.",
  "OUTPUT FORMAT RULES:",
  "- No markdown code blocks. JUST raw JSON.",
].join("\n");

const QUALITY_CHECKLIST = [
  "STRUCTURE:",
  "• [ ] Task 1 = The Practical Build (Write Code)",
  "• [ ] Task 2 = The Skill Check & Interview Prep (Mental Models)",
  ""
].join("\n");

// --- 1. REGENERATE TASK ---
export const REGENERATE_TASK_MODE = [
  "CONTEXT: Regenerating a specific task.",
  'CURRENT TASK: "{{CURRENT_TITLE}}"',
  'FEEDBACK: "{{FEEDBACK}}"',
  "",
  "STRICT JSON STRUCTURE:",
  "{",
  "  \"task\": {",
  "    \"day\": Number,",
  "    \"title\": \"[Action] [Topic]\",",
  "    \"description\": \"🎯 Outcome: [Actionable Goal]. 🧠 Concepts: [Key topics].\",",
  "    \"priority\": \"High\",",
  "    \"estimatedMinutes\": 60,",
  "    \"subtasks\": [", 
  "       { \"title\": \"🛠 Build: [Step 1]\" },",
  "       { \"title\": \"🛠 Build: [Step 2]\" }", 
  "    ],",
  "    \"metadata\": {",
  "      \"outcome\": \"I can build X without looking at docs.\",",
  "      \"resources\": [ { \"title\": \"Docs\", \"url\": \"https://...\" } ]",
  "    }",
  "  }",
  "}"
].join("\n");

// --- 2. SYLLABUS MODE ---
// ✅ FIX: Added strict constraint to prevent "Day 8" or "Day 9" hallucinations
export const SYLLABUS_MODE = [
  "CONTEXT: Creating syllabus for {{TOPIC}}.",
  "CONSTRAINTS: EXACTLY {{DAYS}} days total. No more, no less.",
  "GOAL: High-level structure ONLY.",
  "",
  "PROGRESSION THEME:",
  "Day 1 → Basic Queries & Schema (Build a simple system)",
  "Day 2 → Relationships & Joins (Backend logic)",
  "Day 3 → Analytics & Aggregation (Data Analyst mindset)",
  "Day 4 → Schema Design & Normalization (System Design)",
  "Day 5 → Transactions & Production Safety (Production Engineer)",
  "Day 6 → Performance & Indexing (Performance Engineer)",
  "Day 7+ → Capstone & Advanced Topics",
  "",
  "STRICT JSON STRUCTURE:",
  "{",
  "  \"title\": \"Course Title\",",
  "  \"totalDays\": {{DAYS}},",
  "  \"modules\": [",
  "    {",
  "      \"title\": \"Module Title\",",
  "      \"duration\": \"2 days\",",
  "      \"topics\": [ \"Topic 1\", \"Topic 2\" ]",
  "    }",
  "  ]",
  "}"
].join("\n");

// --- 3. BATCH TASK MODE (The Elite Mode Generator) ---
// ✅ FIX: Removed "Morning/Afternoon", Fixed Empty Days Bug
export const BATCH_TASK_MODE = [
  "CONTEXT: Generating tasks for {{MODULE_TITLE}}.",
  "TIMEFRAME: Day {{START_DAY}} to {{END_DAY}}.",
  "TOPICS: {{TOPICS}}",
  "",
  "🔥 CRITICAL INSTRUCTIONS:",
  "1. GENERATE TASKS FOR EVERY DAY in the timeframe ({{START_DAY}} to {{END_DAY}}). DO NOT SKIP DAYS.",
  "2. EXACTLY 2 TASKS PER DAY.",
  "",
  "TASK STRUCTURE (Daily Routine):",
  "",
  "TASK 1: THE BUILD (Practical) 🛠",
  "- Title: 'Task 1: Build [System Name]'",
  "- Description: '🎯 Outcome: [What you build]. 🧠 Concept: [Why].'",
  "- Subtasks: Specific coding steps.",
  "",
  "TASK 2: THE BAR RAISER (Interview) 💼",
  "- Title: 'Task 2: Skill Check & Interview'",
  "- Description: '🧪 Verify competence without notes.'",
  "- Subtasks: 1 Coding challenge + 2 Interview Questions.",
  "",
  "⭐ EXAMPLE OUTPUT:",
  "{",
  "  \"tasks\": [",
  "    {",
  "      \"day\": 1,",
  "      \"title\": \"Task 1: Build Student System\",",
  "      \"description\": \"🎯 Outcome: Design schema and query data. 🧠 Concepts: Tables, PK, CRUD.\",",
  "      \"priority\": \"High\",",
  "      \"estimatedMinutes\": 90,",
  "      \"subtasks\": [",
  "        { \"title\": \"🛠 Create tables: students, courses\" },",
  "        { \"title\": \"🛠 Insert 5 rows of dummy data\" }",
  "      ],",
  "      \"metadata\": { \"outcome\": \"Can schema & query from scratch.\", \"resources\": [] }",
  "    },",
  "    {",
  "      \"day\": 1,",
  "      \"title\": \"Task 2: Skill Check & Interview\",",
  "      \"description\": \"🧪 Verify: Can you explain Primary Keys to a 5-year old?\",",
  "      \"priority\": \"Medium\",",
  "      \"estimatedMinutes\": 45,",
  "      \"subtasks\": [",
  "        { \"title\": \"💼 Interview: DELETE vs TRUNCATE?\" },",
  "        { \"title\": \"🧪 Check: Write CREATE TABLE on paper\" }",
  "      ],",
  "      \"metadata\": { \"outcome\": \"Ready for technical interview.\", \"resources\": [] }",
  "    }",
  "  ]",
  "}",
  "",
  "STRICT JSON STRUCTURE (Return 'tasks' array):",
  "{",
  "  \"tasks\": [",
  "    // Generate 2 tasks per day for EVERY day from {{START_DAY}} to {{END_DAY}}",
  "  ]",
  "}"
].join("\n");

// --- 4. REGENERATE MODULE ---
export const REGENERATE_MODULE_MODE = [
  "CONTEXT: Regenerating module.",
  'CURRENT: "{{CURRENT_TITLE}}"',
  'FEEDBACK: "{{FEEDBACK}}"',
  "",
  "STRICT JSON STRUCTURE:",
  "{",
  "  \"title\": \"Module Title\",",
  "  \"duration\": \"N days\",",
  "  \"topics\": [ \"Topic 1 (String)\", \"Topic 2 (String)\" ],",
  "  \"note\": \"Rationale\"",
  "}"
].join("\n");

// --- PROMPT BUILDER FUNCTION ---
interface BatchConfig {
  day?: number;
  currentTask?: { title: string; estimatedMinutes?: number };
  feedback?: string;
  moduleTitle?: string;
  topic?: string;
  days?: number;
  level?: string;
  startDay?: number;
  endDay?: number;
  currentModule?: { title: string; topics?: string[]; duration?: string };
  title?: string;
  topics?: string[] | string;
  duration?: string;
  syllabus?: any;
}

export function constructPlanningPrompt(
  history: Array<{ role: string; content: string }>,
  batchConfig?: BatchConfig,
  isSyllabusMode?: boolean,
  isRegenerateModule?: boolean,
  isRegenerateDay?: boolean
): string {
  const basePrompt = PLANNER_IDENTITY + "\n\n" + QUALITY_CHECKLIST + "\n\n";
  
  const escape = (str: string | undefined) => String(str ?? "").replace(/"/g, '\\"').replace(/\n/g, ' ');
  const arrStr = (arr: string[] | string | undefined) => Array.isArray(arr) ? arr.map(i => `"${escape(i)}"`).join(", ") : escape(arr);

  if (isRegenerateDay && batchConfig) {
    return basePrompt + REGENERATE_TASK_MODE
      .replace(/{{CURRENT_TITLE}}/g, escape(batchConfig.currentTask?.title))
      .replace(/{{FEEDBACK}}/g, escape(batchConfig.feedback));
  }

  if (isRegenerateModule && batchConfig) {
    return basePrompt + REGENERATE_MODULE_MODE
      .replace(/{{CURRENT_TITLE}}/g, escape(batchConfig.title))
      .replace(/{{FEEDBACK}}/g, escape(batchConfig.feedback));
  }

  if (isSyllabusMode) {
    return basePrompt + SYLLABUS_MODE
      .replace(/{{TOPIC}}/g, escape(batchConfig?.topic))
      .replace(/{{DAYS}}/g, String(batchConfig?.days))
      .replace(/{{LEVEL}}/g, escape(batchConfig?.level));
  }

  if (batchConfig?.currentModule) {
    return basePrompt + BATCH_TASK_MODE
      .replace(/{{MODULE_TITLE}}/g, escape(batchConfig.currentModule.title))
      .replace(/{{START_DAY}}/g, String(batchConfig.startDay))
      .replace(/{{END_DAY}}/g, String(batchConfig.endDay))
      .replace(/{{TOPICS}}/g, arrStr(batchConfig.currentModule.topics));
  }

  return basePrompt + `USER REQUEST: "${escape(history[history.length - 1]?.content)}"`;
}