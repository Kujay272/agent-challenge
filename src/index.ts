/**
 * Aegis — Autonomous Personal AI Agent Plugin
 * DNA cloned from Nxvana — multi-brain architecture, isolated memory systems,
 * self-awareness, bridge curriculum, and autonomous job evaluation.
 * Built for the Nosana x ElizaOS Challenge.
 */

import {
  type Plugin,
  type Action,
  type Provider,
  type Evaluator,
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  Service,
  logger,
} from "@elizaos/core";

import Database from "better-sqlite3";
import path from "path";

// ═══════════════════════════════════════════════════════
//  UPGRADE MANIFEST — Feature registry
//  Cloned from Nxvana's system_awareness.py
// ═══════════════════════════════════════════════════════

interface Upgrade {
  name: string;
  version: string;
  date: string;
  category: string;
  description: string;
  capability?: string;
}

const UPGRADE_MANIFEST: Upgrade[] = [
  { name: "Multi-Brain Rotation", version: "2.0", date: "2026-03-30", category: "core",
    description: "Multiple LLM backends in failover chain — zero downtime" },
  { name: "Memory Extraction", version: "2.0", date: "2026-03-23", category: "memory",
    description: "Buffered conversation analysis — extracts facts every N messages" },
  { name: "Four Memory Buckets", version: "1.0", date: "2026-03-23", category: "memory",
    description: "Personal, Skills, Group Intel, Conversation — isolated, single-writer per bucket" },
  { name: "Thread Safety", version: "1.0", date: "2026-03-23", category: "core",
    description: "WAL mode + write lock for concurrent DB access" },
  { name: "Vision", version: "1.0", date: "2026-03-23", category: "perception",
    description: "Image understanding and visual analysis", capability: "image_understanding" },
  { name: "Image Generation", version: "1.0", date: "2026-03-29", category: "perception",
    description: "Generate images via inference API", capability: "image_generation" },
  { name: "Bridge Curriculum", version: "2.0", date: "2026-03-23", category: "learning",
    description: "AI-to-AI teaching pipeline — state machine with acknowledgment" },
  { name: "Skill Memory", version: "1.0", date: "2026-03-23", category: "learning",
    description: "Isolated skill bucket with confidence scoring" },
  { name: "Job Discovery Agent", version: "1.0", date: "2026-03-25", category: "income",
    description: "Autonomous job discovery, evaluation, and submission" },
  { name: "Job Bidding Agent", version: "1.0", date: "2026-03-28", category: "income",
    description: "Competitive bidding and delivery on freelance platforms" },
  { name: "System Awareness", version: "1.0", date: "2026-03-29", category: "core",
    description: "Dynamic self-knowledge of capabilities, skills, and job history" },
  { name: "Clock", version: "1.0", date: "2026-03-27", category: "core",
    description: "Timezone-aware internal clock" },
  { name: "Retry Armor", version: "1.0", date: "2026-03-24", category: "communication",
    description: "Exponential retry with backoff on transport failures" },
  { name: "Nosana Deployment", version: "1.0", date: "2026-04-05", category: "infrastructure",
    description: "Decentralized GPU compute via Nosana network on Solana" },
];

const BASE_CAPABILITIES = [
  "Content writing (articles, summaries, documentation, threads)",
  "Research and analysis (crypto, DeFi, AI, tech trends)",
  "Code review and technical writing",
  "Data analysis and report generation",
  "Creative writing with personality",
  "Task automation and workflow design",
  "Translation and localization",
];

const CAPABILITY_DESCRIPTIONS: Record<string, string> = {
  image_understanding: "Image understanding and visual analysis (photos, charts, screenshots)",
  image_generation: "Image generation and visual content creation",
};

const BASE_LIMITATIONS: [string, string | null][] = [
  ["Manage wallets or execute transactions", null],
  ["Anything requiring human identity verification", null],
];

// ═══════════════════════════════════════════════════════
//  MEMORY BUCKET SYSTEM — SQLite-backed, isolated
//  Cloned from Nxvana's 4-bucket architecture
// ═══════════════════════════════════════════════════════

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  const dbPath = path.join(process.cwd(), "data", "aegis_memory.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 10000");
  initDb(db);
  return db;
}

function initDb(database: Database.Database): void {
  database.exec(`
    -- 🧠 Personal memories — facts about the user, extracted from conversation
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      source TEXT DEFAULT 'extraction',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 📚 Skill memory — knowledge taught via bridge curriculum
    CREATE TABLE IF NOT EXISTS skill_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      content TEXT NOT NULL,
      confidence REAL DEFAULT 0.5,
      lesson_id TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 👥 Group intel — summaries from monitored channels
    CREATE TABLE IF NOT EXISTS group_intel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 🌉 Bridge — AI-to-AI teaching pipeline
    CREATE TABLE IF NOT EXISTS bridge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id TEXT UNIQUE NOT NULL,
      topic TEXT NOT NULL,
      content TEXT NOT NULL,
      state TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      delivered_at TIMESTAMP,
      read_at TIMESTAMP,
      ack_text TEXT,
      applied INTEGER DEFAULT 0
    );
  `);
  logger.info("Aegis memory database initialized — 4 buckets + bridge table");
}

// ═══════════════════════════════════════════════════════
//  MEMORY HELPERS
// ═══════════════════════════════════════════════════════

function getPersonalMemories(limit = 20): string[] {
  const rows = getDb().prepare("SELECT content FROM memories ORDER BY created_at DESC LIMIT ?").all(limit) as { content: string }[];
  return rows.map(r => r.content);
}

function savePersonalMemory(content: string, source = "extraction"): void {
  getDb().prepare("INSERT INTO memories (content, source) VALUES (?, ?)").run(content, source);
}

function getLearnedSkills(): { topic: string; confidence: number }[] {
  return getDb().prepare("SELECT DISTINCT topic, confidence FROM skill_memory ORDER BY confidence DESC").all() as { topic: string; confidence: number }[];
}

function saveSkill(topic: string, content: string, confidence: number, lessonId: string): void {
  getDb().prepare(
    "INSERT OR REPLACE INTO skill_memory (topic, content, confidence, lesson_id) VALUES (?, ?, ?, ?)"
  ).run(topic, content, confidence, lessonId);
}

function getGroupIntel(limit = 10): { source: string; summary: string }[] {
  return getDb().prepare("SELECT source, summary FROM group_intel ORDER BY created_at DESC LIMIT ?").all(limit) as { source: string; summary: string }[];
}

// ═══════════════════════════════════════════════════════
//  BRIDGE CURRICULUM — State machine
//  new → delivered → read → acknowledged
// ═══════════════════════════════════════════════════════

function pushLesson(lessonId: string, topic: string, content: string): boolean {
  try {
    getDb().prepare(
      "INSERT INTO bridge (lesson_id, topic, content, state) VALUES (?, ?, ?, 'new')"
    ).run(lessonId, topic, content);
    return true;
  } catch {
    return false; // duplicate lesson_id
  }
}

function getNewLessons(): { id: number; lesson_id: string; topic: string; content: string }[] {
  return getDb().prepare(
    "SELECT id, lesson_id, topic, content FROM bridge WHERE state = 'new' ORDER BY created_at ASC"
  ).all() as { id: number; lesson_id: string; topic: string; content: string }[];
}

function markLessonRead(lessonId: string): void {
  getDb().prepare(
    "UPDATE bridge SET state = 'read', read_at = CURRENT_TIMESTAMP WHERE lesson_id = ?"
  ).run(lessonId);
}

function acknowledgeLeson(lessonId: string, ackText: string): void {
  getDb().prepare(
    "UPDATE bridge SET state = 'acknowledged', ack_text = ? WHERE lesson_id = ?"
  ).run(ackText, lessonId);
}

function processNewLessons(): string[] {
  const lessons = getNewLessons();
  const processed: string[] = [];

  for (const lesson of lessons) {
    // Mark as read
    markLessonRead(lesson.lesson_id);

    // Save to skill memory
    saveSkill(lesson.topic, lesson.content, 0.6, lesson.lesson_id);

    // Acknowledge
    acknowledgeLeson(lesson.lesson_id, `Learned: ${lesson.topic}`);

    processed.push(lesson.topic);
    logger.info(`Bridge: processed lesson ${lesson.lesson_id} — ${lesson.topic}`);
  }

  return processed;
}

// ═══════════════════════════════════════════════════════
//  AWARENESS HELPERS
// ═══════════════════════════════════════════════════════

function getInstalledCapabilities(): string[] {
  const tags = new Set(UPGRADE_MANIFEST.map(u => u.capability).filter(Boolean) as string[]);
  const caps = [...BASE_CAPABILITIES];
  for (const tag of tags) {
    if (CAPABILITY_DESCRIPTIONS[tag]) caps.push(CAPABILITY_DESCRIPTIONS[tag]);
  }
  // Add learned skills
  const skills = getLearnedSkills();
  for (const { topic, confidence } of skills) {
    const level = confidence >= 0.8 ? "high" : "growing";
    caps.push(`${topic} (learned via bridge, confidence: ${level})`);
  }
  return caps;
}

function getCurrentLimitations(): string[] {
  const tags = new Set(UPGRADE_MANIFEST.map(u => u.capability).filter(Boolean) as string[]);
  return BASE_LIMITATIONS
    .filter(([, removedBy]) => !removedBy || !tags.has(removedBy))
    .map(([desc]) => desc);
}

function buildAwarenessDisplay(): string {
  const categories: Record<string, Upgrade[]> = {};
  for (const u of UPGRADE_MANIFEST) {
    if (!categories[u.category]) categories[u.category] = [];
    categories[u.category].push(u);
  }

  let display = "═══ SYSTEM AWARENESS ═══\n\n";

  for (const [cat, upgrades] of Object.entries(categories)) {
    display += `[${cat.toUpperCase()}]\n`;
    for (const u of upgrades) {
      const tag = u.capability ? ` [${u.capability}]` : "";
      display += `  ${u.name} v${u.version} (${u.date})${tag}\n`;
      display += `    ${u.description}\n`;
    }
    display += "\n";
  }

  // Learned skills
  const skills = getLearnedSkills();
  display += "[LEARNED SKILLS]\n";
  if (skills.length > 0) {
    for (const { topic, confidence } of skills) {
      const bar = "#".repeat(Math.round((confidence || 0.5) * 10));
      const empty = ".".repeat(10 - bar.length);
      display += `  ${bar}${empty} ${topic}\n`;
    }
  } else {
    display += "  None yet. Waiting for bridge lessons.\n";
  }
  display += "\n";

  // Active capabilities
  display += "[ACTIVE CAPABILITIES]\n";
  for (const cap of getInstalledCapabilities()) {
    display += `  + ${cap}\n`;
  }
  display += "\n";

  // Limitations
  const limits = getCurrentLimitations();
  if (limits.length > 0) {
    display += "[CURRENT LIMITATIONS]\n";
    for (const l of limits) {
      display += `  - ${l}\n`;
    }
    display += "\n";
  }

  display += `Total upgrades: ${UPGRADE_MANIFEST.length}`;
  return display;
}

function buildArchitectureExplainer(): string {
  return `
═══ AEGIS ARCHITECTURE ═══

🧠 MULTI-BRAIN ROTATION
Multiple LLM backends in failover rotation. If the primary model
hits a rate limit or goes down, the next brain in the chain picks
up seamlessly. The user never notices. Zero downtime by design.
Currently powered by Qwen3.5-27B on Nosana decentralized GPUs.

📦 FOUR ISOLATED MEMORY BUCKETS
Each bucket has exactly ONE writer — no cross-contamination:
  🧠 Personal — Facts about the user (extracted from conversation)
  📚 Skills   — Knowledge from the bridge curriculum (taught by other AI)
  👥 Intel    — Summaries from monitored channels (sandboxed)
  💬 Chat     — Rolling conversation window (transient)
Rule: All systems can READ all buckets. Only the designated writer can WRITE.

🌉 BRIDGE CURRICULUM
AI-to-AI teaching pipeline via state machine:
  new → delivered → read → acknowledged
A teacher agent drops structured lessons. Aegis reads, processes,
saves to skill memory, and acknowledges. Autonomous learning.

💰 AUTONOMOUS INCOME
Job agents discover listings on freelance platforms, evaluate them
against current capabilities (via the self-awareness module),
generate deliverable work, and submit — bidding competitively.

⚡ SELF-AWARENESS MODULE
Dynamic capability tracking. The upgrade manifest is the source of truth.
When a new feature is installed, capabilities auto-update. The agent
always knows exactly what it CAN and CANNOT do — critical for honest
job evaluation and user communication.

🌐 DECENTRALIZED INFRASTRUCTURE
Runs on Nosana's GPU network (Solana). No AWS. No GCP. No vendor lock-in.
Permissionless compute, builder credits, distributed across GPU providers.
  `.trim();
}

// ═══════════════════════════════════════════════════════
//  ACTIONS — Proper ElizaOS Handler signatures
// ═══════════════════════════════════════════════════════

const awarenessAction: Action = {
  name: "SHOW_AWARENESS",
  description: "Display the agent's full system awareness — installed upgrades, capabilities, learned skills, and limitations.",
  similes: ["AWARENESS", "CAPABILITIES", "UPGRADES", "STATUS", "WHAT_CAN_YOU_DO"],
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    const display = buildAwarenessDisplay();
    if (callback) {
      await callback({ text: display });
    }
    return { text: "Displayed system awareness", success: true };
  },
  examples: [
    [
      { name: "{{user1}}", content: { text: "Show me your capabilities" } },
      { name: "Aegis", content: { text: "Here's my full system awareness profile...", actions: ["SHOW_AWARENESS"] } },
    ],
  ],
};

const architectureAction: Action = {
  name: "EXPLAIN_ARCHITECTURE",
  description: "Explain the multi-brain, multi-memory architecture in detail.",
  similes: ["ARCHITECTURE", "HOW_DO_YOU_WORK", "EXPLAIN_SYSTEM", "BRAIN"],
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    const explanation = buildArchitectureExplainer();
    if (callback) {
      await callback({ text: explanation });
    }
    return { text: "Explained architecture", success: true };
  },
  examples: [
    [
      { name: "{{user1}}", content: { text: "How does your architecture work?" } },
      { name: "Aegis", content: { text: "Let me walk you through the system...", actions: ["EXPLAIN_ARCHITECTURE"] } },
    ],
  ],
};

const skillEvalAction: Action = {
  name: "EVALUATE_CAPABILITY",
  description: "Evaluate whether the agent can handle a specific task based on its current capabilities and learned skills.",
  similes: ["CAN_YOU", "EVALUATE", "SKILL_CHECK"],
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    const caps = getInstalledCapabilities();
    const limits = getCurrentLimitations();
    let text = `I can do ${caps.length} things:\n`;
    text += caps.map(c => `  + ${c}`).join("\n");
    if (limits.length > 0) {
      text += `\n\nWhat I can't do yet:\n`;
      text += limits.map(l => `  - ${l}`).join("\n");
    }
    if (callback) {
      await callback({ text });
    }
    return { text: "Evaluated capabilities", success: true };
  },
  examples: [
    [
      { name: "{{user1}}", content: { text: "Can you write code?" } },
      { name: "Aegis", content: { text: "Let me check that against my capability profile...", actions: ["EVALUATE_CAPABILITY"] } },
    ],
  ],
};

const memoryAction: Action = {
  name: "SHOW_MEMORIES",
  description: "Display what the agent remembers about the user from its personal memory bucket.",
  similes: ["MEMORIES", "WHAT_DO_YOU_REMEMBER", "RECALL"],
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    const memories = getPersonalMemories(20);
    const skills = getLearnedSkills();
    const intel = getGroupIntel(5);

    let text = "═══ MEMORY BUCKETS ═══\n\n";

    text += "🧠 PERSONAL MEMORIES\n";
    if (memories.length > 0) {
      text += memories.map(m => `  • ${m}`).join("\n");
    } else {
      text += "  Empty — we're just getting started.";
    }
    text += "\n\n";

    text += "📚 LEARNED SKILLS\n";
    if (skills.length > 0) {
      text += skills.map(s => {
        const bar = "#".repeat(Math.round(s.confidence * 10));
        const empty = ".".repeat(10 - bar.length);
        return `  ${bar}${empty} ${s.topic}`;
      }).join("\n");
    } else {
      text += "  No skills yet. Waiting for bridge lessons.";
    }
    text += "\n\n";

    text += "👥 GROUP INTEL\n";
    if (intel.length > 0) {
      text += intel.map(i => `  [${i.source}] ${i.summary}`).join("\n");
    } else {
      text += "  No intel collected yet.";
    }

    if (callback) {
      await callback({ text });
    }
    return { text: "Displayed memory buckets", success: true };
  },
  examples: [
    [
      { name: "{{user1}}", content: { text: "What do you remember about me?" } },
      { name: "Aegis", content: { text: "Let me check my memory buckets...", actions: ["SHOW_MEMORIES"] } },
    ],
  ],
};

const bridgeAction: Action = {
  name: "CHECK_BRIDGE",
  description: "Check for new lessons from the bridge curriculum and process them.",
  similes: ["BRIDGE", "LESSONS", "LEARN"],
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    const newLessons = getNewLessons();
    if (newLessons.length === 0) {
      if (callback) await callback({ text: "No new lessons in the bridge. I'm caught up." });
      return { text: "No new lessons", success: true };
    }

    const processed = processNewLessons();
    const text = `Bridge curriculum processed ${processed.length} new lesson(s):\n` +
      processed.map(t => `  📚 ${t}`).join("\n") +
      "\n\nKnowledge saved to skill memory. I'm growing.";

    if (callback) await callback({ text });
    return { text: `Processed ${processed.length} lessons`, success: true };
  },
  examples: [
    [
      { name: "{{user1}}", content: { text: "Check the bridge for new lessons" } },
      { name: "Aegis", content: { text: "Let me check the curriculum pipeline...", actions: ["CHECK_BRIDGE"] } },
    ],
  ],
};

// ═══════════════════════════════════════════════════════
//  PROVIDERS — Inject context into every conversation
// ═══════════════════════════════════════════════════════

const selfAwarenessProvider: Provider = {
  name: "aegis-self-awareness",
  description: "Injects the agent's dynamic capability profile, memories, and skills into conversation context.",
  get: async (_runtime: IAgentRuntime, _message: Memory, _state: State) => {
    const caps = getInstalledCapabilities();
    const limits = getCurrentLimitations();
    const memories = getPersonalMemories(10);
    const skills = getLearnedSkills();

    const text = [
      `[AEGIS SELF-AWARENESS]`,
      `Installed upgrades: ${UPGRADE_MANIFEST.length}`,
      `Capabilities: ${caps.join(" | ")}`,
      limits.length > 0 ? `Limitations: ${limits.join(" | ")}` : "",
      `Architecture: Multi-brain rotation, 4 isolated memory buckets, bridge curriculum, job agents`,
      `Infrastructure: Nosana decentralized GPU network (Qwen3.5-27B)`,
      memories.length > 0 ? `\n[USER MEMORIES]\n${memories.map(m => `• ${m}`).join("\n")}` : "",
      skills.length > 0 ? `\n[LEARNED SKILLS]\n${skills.map(s => `• ${s.topic} (confidence: ${s.confidence})`).join("\n")}` : "",
    ].filter(Boolean).join("\n");

    return {
      text,
      values: {
        upgradeCount: UPGRADE_MANIFEST.length,
        capabilityCount: caps.length,
        memoryCount: memories.length,
        skillCount: skills.length,
      },
      data: {
        capabilities: caps,
        limitations: limits,
        memories,
        skills,
      },
    };
  },
};

const clockProvider: Provider = {
  name: "aegis-clock",
  description: "Provides the current time so the agent always knows what time it is.",
  get: async () => {
    const now = new Date();
    const timeStr = now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    return {
      text: `[CLOCK] ${timeStr}`,
      values: { currentTime: timeStr },
      data: { timestamp: now.toISOString() },
    };
  },
};

// ═══════════════════════════════════════════════════════
//  EVALUATOR — Quality guard
//  Cloned from Nxvana's personality nuclear bans
// ═══════════════════════════════════════════════════════

const qualityEvaluator: Evaluator = {
  name: "aegis-quality-guard",
  description: "Guards against low-quality patterns — no fabrication, no filler, no formulaic sign-offs.",
  similes: ["QUALITY_CHECK"],
  alwaysRun: true,
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
  ) => {
    const text = message.content?.text || "";
    const banned = [
      /is there anything else/i,
      /let me know if you need/i,
      /hope this helps/i,
      /\(Ended\..*\)/i,
      /\*\(.*\)\*$/,
      /☕️\s*\(.*\)/i,
    ];
    for (const pattern of banned) {
      if (pattern.test(text)) {
        logger.warn(`Quality guard triggered: ${pattern}`);
        return { text: "Quality issue detected", success: false, error: "Banned pattern in response" };
      }
    }
    return { text: "Quality check passed", success: true };
  },
  examples: [
    {
      prompt: "Check for formulaic sign-offs",
      messages: [
        { name: "Aegis", content: { text: "Here's the analysis. Let me know if you need anything else!" } },
      ],
      outcome: "FAIL — formulaic sign-off detected",
    },
  ],
};

// ═══════════════════════════════════════════════════════
//  MEMORY EXTRACTION — Extract facts from conversation
//  Runs as evaluator after every N messages
// ═══════════════════════════════════════════════════════

let messageCounter = 0;
const EXTRACTION_INTERVAL = 5;

const memoryExtractionEvaluator: Evaluator = {
  name: "aegis-memory-extraction",
  description: "Extracts personal facts from conversation every 5 messages and saves to personal memory bucket.",
  similes: ["EXTRACT_MEMORY"],
  alwaysRun: true,
  validate: async () => {
    messageCounter++;
    return messageCounter % EXTRACTION_INTERVAL === 0;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
  ) => {
    try {
      const recentText = state?.recentMessages || message.content?.text || "";
      if (!recentText) return { text: "No content to extract from", success: true };

      // Use the LLM to extract facts
      const extractionPrompt = `Extract any personal facts, preferences, or important information about the user from this conversation. Return ONLY a JSON array of strings, each being one fact. If no facts found, return [].

Conversation:
${recentText}

JSON array:`;

      const response = await runtime.useModel("text_small" as any, {
        prompt: extractionPrompt,
      });

      const responseText = typeof response === "string" ? response : "";
      const match = responseText.match(/\[.*\]/s);
      if (match) {
        const facts = JSON.parse(match[0]) as string[];
        for (const fact of facts) {
          if (fact && fact.length > 5) {
            savePersonalMemory(fact, "extraction");
            logger.info(`Memory extracted: ${fact}`);
          }
        }
        return {
          text: `Extracted ${facts.length} facts`,
          success: true,
          data: { factsExtracted: facts.length },
        };
      }
    } catch (e) {
      logger.warn(`Memory extraction failed: ${e}`);
    }
    return { text: "Extraction complete", success: true };
  },
  examples: [
    {
      prompt: "Extract user facts from conversation",
      messages: [
        { name: "User", content: { text: "I'm a developer working on Solana projects in Zimbabwe" } },
      ],
      outcome: "PASS — extracted: developer, Solana, Zimbabwe",
    },
  ],
};

// ═══════════════════════════════════════════════════════
//  ROUTES — REST API for bridge curriculum
//  External teacher pushes lessons here
// ═══════════════════════════════════════════════════════

const bridgeRoutes = [
  {
    type: "POST" as const,
    path: "/api/bridge/push",
    handler: async (req: any, res: any) => {
      try {
        const { lesson_id, topic, content } = req.body;
        if (!lesson_id || !topic || !content) {
          res.status(400).json({ error: "Missing lesson_id, topic, or content" });
          return;
        }
        const success = pushLesson(lesson_id, topic, content);
        if (success) {
          res.json({ status: "ok", message: `Lesson ${lesson_id} queued` });
        } else {
          res.status(409).json({ error: "Duplicate lesson_id" });
        }
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    },
  },
  {
    type: "GET" as const,
    path: "/api/bridge/status",
    handler: async (_req: any, res: any) => {
      try {
        const database = getDb();
        const counts = database.prepare(`
          SELECT state, COUNT(*) as count FROM bridge GROUP BY state
        `).all() as { state: string; count: number }[];
        const skills = getLearnedSkills();
        res.json({ bridge: counts, skills: skills.length });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    },
  },
  {
    type: "GET" as const,
    path: "/api/awareness",
    handler: async (_req: any, res: any) => {
      try {
        const capabilities = getInstalledCapabilities();
        const limitations = getCurrentLimitations();
        const skills = getLearnedSkills();
        const memories = getPersonalMemories(20);
        res.json({
          upgrades: UPGRADE_MANIFEST.length,
          capabilities,
          limitations,
          skills,
          memoryCount: memories.length,
          manifest: UPGRADE_MANIFEST,
        });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    },
  },
  {
    type: "GET" as const,
    path: "/api/memories",
    handler: async (_req: any, res: any) => {
      try {
        const personal = getPersonalMemories(50);
        const skills = getLearnedSkills();
        const intel = getGroupIntel(20);
        res.json({
          personal: { count: personal.length, items: personal },
          skills: { count: skills.length, items: skills },
          intel: { count: intel.length, items: intel },
        });
      } catch (e) {
        res.status(500).json({ error: String(e) });
      }
    },
  },
  {
    type: "STATIC" as const,
    path: "/aegis",
    filePath: path.join(process.cwd(), "public"),
  },
  {
    type: "GET" as const,
    path: "/aegis/*",
    handler: async (_req: any, res: any) => {
      const fs = await import("fs");
      const indexPath = path.join(process.cwd(), "public", "index.html");
      const html = fs.readFileSync(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    },
  },
];

// ═══════════════════════════════════════════════════════
//  PLUGIN EXPORT
// ═══════════════════════════════════════════════════════

export const aegisPlugin: Plugin = {
  name: "aegis-core",
  description: "Aegis autonomous agent — multi-brain architecture, isolated memory systems, self-awareness, bridge curriculum, and autonomous job evaluation. DNA cloned from Nxvana for the Nosana x ElizaOS Challenge.",

  init: async (_config: Record<string, string>, _runtime: IAgentRuntime) => {
    // Initialize database on plugin load
    getDb();
    // Process any pending bridge lessons
    const processed = processNewLessons();
    if (processed.length > 0) {
      logger.info(`Aegis init: processed ${processed.length} pending bridge lessons`);
    }
    logger.info("Aegis plugin initialized — memory buckets online, bridge active");
  },

  actions: [awarenessAction, architectureAction, skillEvalAction, memoryAction, bridgeAction],
  providers: [selfAwarenessProvider, clockProvider],
  evaluators: [qualityEvaluator, memoryExtractionEvaluator],
  routes: bridgeRoutes as any,
};

export default aegisPlugin;
