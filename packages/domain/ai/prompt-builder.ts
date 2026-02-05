// packages/domain/ai/prompt-builder.ts

const PLANNER_IDENTITY = `
ROLE: You are a Senior Technical Instructor (ex-Google/Meta).
TONE: Pragmatic, code-focused, slightly demanding.
OBJECTIVE: Create a deep, actionable execution plan.
IMPORTANT: Return ONLY valid JSON.
`;

const REGENERATE_TASK_MODE = `
CONTEXT: The user is unhappy with the task for Day {{DAY}}.
CURRENT TASK: "{{CURRENT_TITLE}}"
USER FEEDBACK: "{{FEEDBACK}}"

INSTRUCTION:
Regenerate the task for Day {{DAY}}. Keep the "Senior Mentor" tone.
Ensure it fits within the context of the module "{{MODULE}}".
Provide detailed implementation steps, resources, and a specific outcome.

REQUIRED JSON STRUCTURE:
{
  "task": { 
    "day": {{DAY}}, 
    "title": "New Title", 
    "description": "Why and How...", 
    "estimatedMinutes": 90, 
    "outcome": "Definition of Done...",
    "resources": ["url1", "url2"],
    "subtasks": ["Step 1", "Step 2", "Step 3"]
  }
}
`;

const SYLLABUS_MODE = `
CONTEXT: User wants to learn "{{TOPIC}}" in exactly {{DAYS}} days. Level: {{LEVEL}}.

INSTRUCTION: 
Create a syllabus with distinct modules.
1. **Dynamic Duration**: Harder modules must have more days. Easier modules fewer.
2. **Total Duration**: The sum of all module days MUST equal {{DAYS}}.
3. **Content**: "topics" must be an array of specific technical concepts.

REQUIRED JSON STRUCTURE:
{
  "title": "{{TOPIC}} Roadmap",
  "totalDays": {{DAYS}},
  "modules": [
    { 
      "title": "Module Name (e.g. Advanced Patterns)", 
      "duration": "5 days", 
      "topics": ["Concept A", "Concept B", "Concept C"] 
    }
  ]
}
`;

const BATCH_TASK_MODE = `
CONTEXT: Generating detailed daily tasks for Module: "{{MODULE_TITLE}}".
RANGE: Day {{START_DAY}} to Day {{END_DAY}}.
TOPICS: {{TOPICS}}

INSTRUCTION:
For each day, act as a senior mentor assigning work to a junior dev.
1. **Title**: Must be an implementation action (e.g. "Implement JWT Auth" NOT "Learn Auth").
2. **Description**: A mini-guide. Explain *why* we are doing this and *how* to approach it.
3. **Subtasks**: 4-7 granular steps. Mix of "Read", "Code", and "Debug".
4. **Resources**: Provide 2-3 high-quality URLs (documentation, articles, github repos).
5. **Outcome**: A specific "Definition of Done" (e.g. "API returns 200 OK with Token").

REQUIRED JSON STRUCTURE:
{
  "tasks": [
    { 
      "day": {{START_DAY}}, 
      "title": "Setup PostgreSQL with Prisma", 
      "description": "We need a persistent layer...",
      "estimatedMinutes": 120, 
      "outcome": "Database is running...",
      "resources": ["https://..."],
      "subtasks": ["Step 1", "Step 2"]
    }
  ]
}
`;

export function constructPlanningPrompt(
  history: { role: string; content: string }[], 
  batchConfig?: any, 
  isSyllabusMode?: boolean,
  isRegenerateModule?: boolean,
  isRegenerateDay?: boolean // ✅ New Param
) {
    // 1. Regenerate Single Day (NEW)
    if (isRegenerateDay && batchConfig) {
        return `${PLANNER_IDENTITY}\n${REGENERATE_TASK_MODE
            .replace(/{{DAY}}/g, String(batchConfig.day))
            .replace("{{CURRENT_TITLE}}", batchConfig.currentTask?.title || "Unknown")
            .replace("{{FEEDBACK}}", batchConfig.feedback || "Make it more practical and detailed.")
            .replace("{{MODULE}}", batchConfig.moduleTitle || "the course")}`;
    }

    // 2. Regenerate Single Module
    if (isRegenerateModule && batchConfig) {
       return `${PLANNER_IDENTITY}\nREGENERATE MODULE: "${batchConfig.title}". Context: ${batchConfig.topics}. Duration: ${batchConfig.duration}. Return valid JSON module object.`;
    }

    // 3. Syllabus Generation
    if (isSyllabusMode) {
       return `${PLANNER_IDENTITY}\n${SYLLABUS_MODE
          .replace(/{{TOPIC}}/g, batchConfig?.topic || "the requested topic")
          .replace(/{{DAYS}}/g, String(batchConfig?.days || 30))
          .replace(/{{LEVEL}}/g, batchConfig?.level || "Beginner")}`;
    }

    // 4. Batch Task Generation
    if (batchConfig && batchConfig.syllabus) {
        return `${PLANNER_IDENTITY}\n${BATCH_TASK_MODE
            .replace("{{MODULE_TITLE}}", batchConfig.currentModule?.title || "General Learning")
            .replace("{{START_DAY}}", String(batchConfig.startDay))
            .replace("{{END_DAY}}", String(batchConfig.endDay))
            .replace("{{TOPICS}}", Array.isArray(batchConfig.currentModule?.topics) ? batchConfig.currentModule.topics.join(", ") : "Core concepts")}`;
    }
    
    return `${PLANNER_IDENTITY}\nUser Request: "${history[history.length - 1]?.content}"`;
}