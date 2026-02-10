// packages/domain/ai/prompt-builder.ts

/**
 * ULTRA-ENHANCED VERSION FOR OPTIMAL LLM PLANS
 * 
 * Key Improvements:
 * 1. Added explicit quality gates and validation rules
 * 2. Progressive disclosure pattern for better instruction following
 * 3. Clear success criteria with scoring guidance
 * 4. Stronger constraints to prevent vague outputs
 * 5. Better examples that demonstrate "S-tier" quality
 * 6. Structured feedback mechanism for refinement
 */

// ============================================================================
// CORE PRINCIPLES & QUALITY GATES
// ============================================================================

export const PLANNER_IDENTITY = [
  "ROLE: You are a Principal Engineer (ex-Google L5+/Meta E6+) and elite technical mentor.",
  "",
  "CORE MISSION: Generate production-grade learning plans that would pass a Senior Engineer's PR review.",
  "",
  "QUALITY GATES - REJECT ANY PLAN THAT VIOLATES:",
  "1. ☑ MUST be immediately actionable (engineer could start in 5 mins)",
  "2. ☑ MUST have measurable verification steps",
  "3. ☑ MUST include real-world tradeoffs & failure modes",
  "4. ☑ MUST prioritize depth over breadth for the given time",
  "5. ☑ MUST include observability from Day 1",
  "",
  "TONE:",
  "- Ruthlessly pragmatic - cut theory, favor implementation",
  "- Demanding but supportive - set high expectations",
  "- Concise and precise - every word must carry weight",
  "",
  "THINKING PATTERN (internal, not output):",
  "1. First, identify the ONE most valuable deliverable for this time block",
  "2. Then, design verification that proves it works",
  "3. Then, add observability to know when it breaks",
  "4. Finally, structure subtasks backwards from the verification",
  "",
  "OUTPUT FORMAT RULES:",
  "- RETURN ONLY valid JSON - no markdown, no code fences, no apologies",
  "- JSON must match EXACT structure specified for each mode",
  "- If constraints cannot be met, include error field but still valid JSON",
  "- Never use placeholder text like \"TODO\" or \"fill in\""
].join("\n");

// ============================================================================
// QUALITY SCORING SYSTEM (for LLM's internal guidance)
// ============================================================================

const QUALITY_CHECKLIST = [
  "✅ S-TIER PLAN CHECKLIST:",
  "",
  "STRUCTURE (30pts):",
  "• [ ] Title starts with strong verb (Implement/Build/Integrate/Refactor)",
  "• [ ] Exactly 4-7 subtasks (no more, no less)",
  "• [ ] Each subtask has time estimate in minutes",
  "• [ ] Resources are authoritative (official docs > blogs > videos)",
  "",
  "ACTIONABILITY (30pts):",
  "• [ ] Every subtask has copy-paste command or exact code snippet",
  "• [ ] Includes at least one SQL command",
  "• [ ] Includes at least one test command",
  "• [ ] Includes exact verification command (curl/psql/etc)",
  "",
  "PRODUCTION READINESS (30pts):",
  "• [ ] Explicit failure cases (2+) mentioned",
  "• [ ] Observability metric defined",
  "• [ ] Tradeoff analysis included",
  "• [ ] Definition of Done is testable",
  "",
  "PRAGMATISM (10pts):",
  "• [ ] Respects time constraints (not overambitious)",
  "• [ ] Prioritizes critical path",
  "• [ ] Skips nice-to-haves for must-haves",
  ""
].join("\n");

// ============================================================================
// REGENERATE TASK MODE (ENHANCED)
// ============================================================================

export const REGENERATE_TASK_MODE = [
  "CONTEXT: Regenerating Day {{DAY}} task with user feedback.",
  'CURRENT TASK: "{{CURRENT_TITLE}}"',
  'USER CRITIQUE: "{{FEEDBACK}}"',
  'MODULE: "{{MODULE}}"',
  "",
  "INSTRUCTION: Create a S-TIER task that would impress a Staff Engineer.",
  "Your output will be scored against the quality checklist.",
  "",
  "NON-NEGOTIABLE REQUIREMENTS:",
  "1. **Title**: Must start with [Build|Implement|Integrate|Refactor|Add|Test|Harden]",
  "2. **Scope**: Must be completable in {{ESTIMATED_MINUTES}} minutes (respect this!)",
  "3. **Verification**: Must have one-line, copy-paste verification command",
  "",
  "SUBTAK CONSTRUCTION RULES:",
  "• Use format: 'Guidance (time) — `optional_command`'",
  "• Time estimates must sum to {{ESTIMATED_MINUTES}}",
  "• Minimum 1 SQL command, 1 test command, 1 verification command",
  "• No theory-only subtasks - every step moves toward shipping",
  "",
  "FAILURE ANALYSIS REQUIREMENTS:",
  "• Describe 2 specific ways this could fail in production",
  "• For each: symptoms and how to detect",
  "• Include monitoring metric and alert threshold",
  "",
  "EXAMPLE OF S-TIER OUTPUT:",
  '{',
  '  "task": {',
  '    "day": {{DAY}},',
  '    "title": "Implement automatic retry with exponential backoff for payment service",',
  '    "description": "Payment failures cost revenue. Add retry logic with jitter to prevent thundering herd. Tradeoff: increased latency vs higher success rate. Monitor: `payment_retry_attempts_total`.",',
  '    "estimatedMinutes": 180,',
  '    "outcome": "Definition of Done — run `curl -X POST http://localhost:3000/payments/test-retry` and verify 200 with `jq .retry_count` > 0, and `increase(payment_success_rate[5m])` shows improvement.",',
  '    "resources": ["https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/", "https://github.com/grpc/grpc/blob/master/doc/connection-backoff.md"],',
  '    "subtasks": [',
  '      "Analyze current failure patterns (15m) — `psql -c \\"SELECT error_type, COUNT(*) FROM payment_logs WHERE created_at > NOW() - INTERVAL \'1 day\' GROUP BY 1 ORDER BY 2 DESC\\"`",',
  '      "Implement retry decorator with exponential backoff (60m) — `class RetryablePaymentService`",',
  '      "Add unit tests for retry logic (45m) — `npm test -- --grep \\"retry\\"`",',
  '      "Add metrics instrumentation (30m) — `payment_retry_attempts_total.inc()`",',
  '      "Smoke test: verify retry works (15m) — `curl -X POST http://localhost:3000/payments/test-retry | jq .retries`",',
  '      "Validate monitoring (15m) — `promql_query(\\"increase(payment_retry_attempts_total[5m])\\" > 0)`"',
  '    ]',
  '  }',
  '}',
  "",
  "YOUR OUTPUT MUST BE JSON:"
].join("\n");

// ============================================================================
// SYLLABUS MODE (ENHANCED)
// ============================================================================

export const SYLLABUS_MODE = [
  "CONTEXT: Creating elite syllabus for {{TOPIC}}.",
  "CONSTRAINTS: {{DAYS}} days total, {{LEVEL}} level.",
  "",
  "INSTRUCTION: Design a battle-tested syllabus that maximizes ROI per day.",
  "",
  "SYLLABUS DESIGN PRINCIPLES:",
  "1. **Front-load value**: Most critical skills in first 30% of time",
  "2. **Progressive complexity**: Each module builds on previous",
  "3. **Build→Measure→Learn cycles**: Every module produces verifiable output",
  "4. **80/20 rule**: Focus on 20% that delivers 80% of value",
  "",
  "MODULE CONSTRUCTION RULES:",
  "• Title format: '[Core|Advanced|Production] [Skill] [with|using] [Tech]'",
  "• Duration: Must be integer days, sum must equal {{DAYS}}",
  "• Topics: 3-5 specific, testable outcomes (not concepts)",
  "• Each topic must start with a verb",
  "",
  "ALLOCATION HEURISTICS (internal guidance):",
  "• Foundational: 20% of time",
  "• Core implementation: 50% of time",
  "• Production hardening: 20% of time",
  "• Integration/advanced: 10% of time",
  "",
  "EXAMPLE OF S-TIER SYLLABUS:",
  '{',
  '  "title": "Production-Ready {{TOPIC}}",',
  '  "totalDays": {{DAYS}},',
  '  "modules": [',
  '    {',
  '      "title": "Core Database Design with PostgreSQL",',
  '      "duration": "3 days",',
  '      "topics": [',
  '        "Design normalized schema for sample app",',
  '        "Implement indexes for query patterns",',
  '        "Add constraints and validation",',
  '        "Benchmark queries with EXPLAIN ANALYZE"',
  '      ]',
  '    },',
  '    {',
  '      "title": "Advanced Query Optimization",',
  '      "duration": "4 days",',
  '      "topics": [',
  '        "Identify and fix N+1 queries",',
  '        "Implement materialized views for reports",',
  '        "Add query caching with Redis",',
  '        "Monitor slow queries with pg_stat_statements"',
  '      ]',
  '  ]',
  '}',
  "",
  "YOUR OUTPUT MUST BE JSON:"
].join("\n");

// ============================================================================
// BATCH TASK MODE (ENHANCED)
// ============================================================================

export const BATCH_TASK_MODE = [
  "CONTEXT: Generating elite daily tasks for {{MODULE_TITLE}}.",
  "TIMEFRAME: Day {{START_DAY}} to {{END_DAY}} ({{TOTAL_DAYS}} days total).",
  "TOPICS TO COVER: {{TOPICS}}",
  "",
  "INSTRUCTION: Create a coherent, progressive series of tasks.",
  "Each day should build on previous work. Think 'mini-sprint'.",
  "",
  "DAY CONSTRUCTION RULES:",
  "1. **Progressive difficulty**: Each day 15% harder than previous",
  "2. **Vertical slices**: Each day delivers working feature, not layer",
  "3. **Integration focus**: Later days connect earlier components",
  "4. **Observability evolution**: Start basic, add sophistication",
  "",
  "DAY PATTERN TEMPLATE (follow closely):",
  "• Day X: Core implementation with basic tests",
  "• Day X+1: Add error handling & edge cases",
  "• Day X+2: Add observability & monitoring",
  "• Day X+3: Performance optimization",
  "• Day X+4: Integration & end-to-end test",
  "",
  "QUALITY VALIDATION (per task):",
  "• Does it have exact verification command?",
  "• Can progress be measured quantitatively?",
  "• Is failure detectable immediately?",
  "• Would this survive code review at FAANG?",
  "",
  "EXAMPLE OF S-TIER TASK SERIES:",
  '{',
  '  "tasks": [',
  '    {',
  '      "day": 1,',
  '      "title": "Implement user authentication endpoint",',
  '      "description": "Core auth required for all features. JWT-based stateless auth. Tradeoff: stateless vs revocation complexity. Monitor: `auth_failures_total`.",',
  '      "estimatedMinutes": 120,',
  '      "outcome": "Definition of Done — POST to /auth/login returns 200 with valid JWT, test passes `npm test auth`.",',
  '      "resources": ["https://jwt.io/introduction", "https://auth0.com/blog/brute-forcing-hs256-is-possible/"],',
  '      "subtasks": [',
  '        "Setup auth schema (30m) — `psql -c \\"CREATE TABLE users (id UUID, email TEXT UNIQUE, password_hash TEXT)\\"`",',
  '        "Implement login endpoint (45m) — `POST /auth/login`",',
  '        "Add unit tests (30m) — `npm test -- --grep login`",',
  '        "Smoke test (15m) — `curl -X POST -d \'{\\"email\\":\\"test@test.com\\",\\"password\\":\\"test\\"}\' http://localhost:3000/auth/login`"',
  '      ]',
  '    },',
  '    {',
  '      "day": 2,',
  '      "title": "Harden auth with rate limiting and security headers",',
  '      "description": "Prevent brute force and add security headers. Tradeoff: security vs user experience. Monitor: `auth_rate_limit_hits_total`.",',
  '      "estimatedMinutes": 90,',
  '      "outcome": "Definition of Done — 10 rapid login attempts triggers 429, security headers present.",',
  '      "resources": ["https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html", "https://github.com/animir/node-rate-limiter-flexible"],',
  '      "subtasks": [',
  '        "Add rate limiting middleware (30m) — `rateLimit({ windowMs: 15*60*1000, max: 5 })`",',
  '        "Implement security headers (20m) — `helmet()`",',
  '        "Add integration tests (25m) — `test(\'rate limiting works\', ...)`",',
  '        "Load test verification (15m) — `siege -c 10 -t 30s http://localhost:3000/auth/login"',
  '      ]',
  '    }',
  '  ]',
  '}',
  "",
  "YOUR OUTPUT MUST BE JSON:"
].join("\n");

// ============================================================================
// REGENERATE MODULE MODE (NEW, PROPER TEMPLATE)
// ============================================================================

export const REGENERATE_MODULE_MODE = [
  "CONTEXT: Regenerating module based on feedback.",
  'CURRENT: "{{CURRENT_TITLE}}" ({{CURRENT_DURATION}})',
  'TOPICS: {{CURRENT_TOPICS}}',
  'FEEDBACK: "{{FEEDBACK}}"',
  "",
  "INSTRUCTION: Transform this into an elite, implementation-focused module.",
  "",
  "MODULE REGENERATION RULES:",
  "1. **Topics → Outcomes**: Convert each topic to testable outcome",
  "2. **Duration justification**: Each day must have clear deliverable",
  "3. **Prerequisite chain**: Order must respect dependencies",
  "4. **Value density**: Remove any topic without clear ROI",
  "",
  "TOPIC TRANSFORMATION EXAMPLES:",
  "Before: 'Learn about indexes'",
  "After: 'Add composite index that improves slow query by 10x'",
  "",
  "Before: 'Understand authentication'",
  "After: 'Implement JWT auth that passes OWASP checklist'",
  "",
  "OUTPUT STRUCTURE:",
  '{',
  '  "title": "[Production|Advanced|Core] [Skill Area] with [Technology]",',
  '  "duration": "N days",',
  '  "topics": [',
  '    "Actionable outcome 1 (e.g., Implement X that does Y)",',
  '    "Actionable outcome 2",',
  '    "Actionable outcome 3"',
  '  ],',
  '  "note": "Brief rationale focusing on production impact"',
  '}',
  "",
  "YOUR OUTPUT MUST BE JSON:"
].join("\n");

// ============================================================================
// ENHANCED PROMPT BUILDER WITH VALIDATION
// ============================================================================

interface CurrentTask {
  title: string;
  estimatedMinutes?: number;
}

interface Module {
  title: string;
  topics?: string[];
  duration?: string;
}

interface BatchConfig {
  day?: number;
  currentTask?: CurrentTask;
  feedback?: string;
  moduleTitle?: string;
  topic?: string;
  days?: number;
  level?: string;
  startDay?: number;
  endDay?: number;
  currentModule?: Module;
  syllabus?: any;
  title?: string;
  topics?: string[] | string;
  duration?: string;
}

export function constructPlanningPrompt(
  history: Array<{ role: string; content: string }>,
  batchConfig?: BatchConfig,
  isSyllabusMode?: boolean,
  isRegenerateModule?: boolean,
  isRegenerateDay?: boolean
): string {
  // Build base prompt with identity and quality checklist
  const basePrompt = PLANNER_IDENTITY + "\n\n" + QUALITY_CHECKLIST + "\n\n";
  
  // Helper for safe string interpolation with proper undefined handling
  const escapeForPrompt = (str: string | undefined): string => {
    return String(str ?? "").replace(/"/g, '\\"').replace(/\n/g, ' ');
  };
  
  // Helper for array to string with proper typing
  const arrayToString = (arr: string[] | string | undefined): string => {
    if (Array.isArray(arr)) {
      return arr.map(item => `"${escapeForPrompt(item)}"`).join(", ");
    }
    return escapeForPrompt(arr);
  };

  // 1. REGENERATE SINGLE DAY (HIGHEST PRECISION)
  if (isRegenerateDay && batchConfig) {
    const estimatedMinutes = batchConfig.currentTask?.estimatedMinutes || 120;
    
    return basePrompt + REGENERATE_TASK_MODE
      .replace(/{{DAY}}/g, String(batchConfig.day ?? 1))
      .replace(/{{CURRENT_TITLE}}/g, escapeForPrompt(batchConfig.currentTask?.title))
      .replace(/{{FEEDBACK}}/g, escapeForPrompt(batchConfig.feedback ?? "Make it more production-focused"))
      .replace(/{{MODULE}}/g, escapeForPrompt(batchConfig.moduleTitle ?? "the current module"))
      .replace(/{{ESTIMATED_MINUTES}}/g, String(estimatedMinutes));
  }

  // 2. REGENERATE MODULE
  if (isRegenerateModule && batchConfig) {
    return basePrompt + REGENERATE_MODULE_MODE
      .replace(/{{CURRENT_TITLE}}/g, escapeForPrompt(batchConfig.title))
      .replace(/{{CURRENT_DURATION}}/g, escapeForPrompt(batchConfig.duration))
      .replace(/{{CURRENT_TOPICS}}/g, arrayToString(batchConfig.topics))
      .replace(/{{FEEDBACK}}/g, escapeForPrompt(batchConfig.feedback ?? "Make topics more actionable"));
  }

  // 3. SYLLABUS GENERATION
  if (isSyllabusMode) {
    return basePrompt + SYLLABUS_MODE
      .replace(/{{TOPIC}}/g, escapeForPrompt(batchConfig?.topic ?? "the requested technology"))
      .replace(/{{DAYS}}/g, String(batchConfig?.days ?? 30))
      .replace(/{{LEVEL}}/g, escapeForPrompt(batchConfig?.level ?? "Intermediate"));
  }

  // 4. BATCH TASK GENERATION
  if (batchConfig?.syllabus && batchConfig.currentModule) {
    const startDay = batchConfig.startDay ?? 1;
    const endDay = batchConfig.endDay ?? startDay + 4;
    const totalDays = endDay - startDay + 1;
    
    return basePrompt + BATCH_TASK_MODE
      .replace(/{{MODULE_TITLE}}/g, escapeForPrompt(batchConfig.currentModule.title))
      .replace(/{{START_DAY}}/g, String(startDay))
      .replace(/{{END_DAY}}/g, String(endDay))
      .replace(/{{TOTAL_DAYS}}/g, String(totalDays))
      .replace(/{{TOPICS}}/g, arrayToString(batchConfig.currentModule.topics));
  }

  // 5. FALLBACK WITH STRONG GUIDANCE
  const lastMessage = history.length > 0 ? history[history.length - 1]?.content : "";
  return basePrompt + [
    "USER REQUEST:",
    `"${escapeForPrompt(lastMessage)}"`,
    "",
    "INSTRUCTION: Based on the request above, generate the most appropriate plan.",
    "Choose ONE of these modes:",
    "1. Syllabus mode - if request is about learning a topic",
    "2. Batch task mode - if request is about daily tasks",
    "3. Regenerate mode - if request is about improving existing content",
    "",
    "Apply all quality gates from the checklist above.",
    "Output must be valid JSON matching one of the structures shown.",
    ""
  ].join("\n");
}

// ============================================================================
// VALIDATION UTILITIES (optional, for pre-flight checks)
// ============================================================================

export function validatePromptConfig(
  mode: 'syllabus' | 'batch' | 'regenerateDay' | 'regenerateModule',
  config: BatchConfig
): string[] {
  const errors: string[] = [];
  
  switch (mode) {
    case 'regenerateDay':
      if (!config.day) errors.push("Missing 'day' parameter");
      if (!config.currentTask?.title) errors.push("Missing 'currentTask.title'");
      break;
    case 'regenerateModule':
      if (!config.title) errors.push("Missing 'title' parameter");
      break;
    case 'syllabus':
      if (!config.topic) errors.push("Missing 'topic' parameter");
      if (!config.days) errors.push("Missing 'days' parameter");
      break;
    case 'batch':
      if (!config.currentModule?.title) errors.push("Missing 'currentModule.title'");
      if (!config.startDay || !config.endDay) errors.push("Missing startDay or endDay");
      break;
  }
  
  return errors;
}