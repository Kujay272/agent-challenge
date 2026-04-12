# Aegis — Autonomous AI Agent

> An autonomous AI agent with multi-brain architecture, isolated memory systems, and self-improving intelligence. DNA cloned from a production agent. Deployed on Nosana decentralized GPUs.

Built for the **Nosana x ElizaOS Agent Challenge**.

![ElizaOS](./assets/NosanaXEliza.jpg)

---

## Architecture

```
                          +------------------+
                          |   AEGIS CORE     |
                          +--------+---------+
                                   |
          +------------------------+------------------------+
          |            |           |           |            |
    +-----+----+ +----+----+ +----+----+ +----+----+ +-----+-----+
    |  MULTI   | | MEMORY  | | BRIDGE  | |  SELF   | | NOSANA    |
    |  BRAIN   | | BUCKETS | | CURRIC. | | AWARE   | | GPU       |
    | ROTATION | | (4x ISO)| | (AI->AI)| | MODULE  | | NETWORK   |
    +----------+ +---------+ +---------+ +---------+ +-----------+
```

### Multi-Brain Rotation
Multiple LLM backends in failover chain. If one brain hits a rate limit or goes down, the next picks up seamlessly. Zero downtime — born from real constraints.

### Four Isolated Memory Buckets

| Bucket | Writer | Purpose |
|--------|--------|---------|
| Personal | Memory Extractor | Facts about the user (auto-extracted every 5 messages) |
| Skills | Bridge Curriculum | Knowledge taught by other AI agents |
| Intel | Group Monitor | Summaries from monitored channels |
| Chat | ElizaOS Core | Rolling conversation window |

**Rule**: All systems can READ all buckets. Only the designated writer can WRITE. No cross-contamination.

### Bridge Curriculum — AI Teaching AI

A state machine pipeline for autonomous learning:

```
NEW --> DELIVERED --> READ --> ACKNOWLEDGED
 |                     |          |
 |                     v          v
 |              [Process]   [Save to Skill Memory]
 |                              + Confidence Score
 v
[External Teacher Pushes Lesson via REST API]
```

**Try it live**: Click "Push Demo Lesson" in the dashboard to watch a lesson flow through the pipeline in real-time.

### Self-Awareness Module

Dynamic capability tracking through an upgrade manifest (14 installed features). The agent knows exactly what it CAN and CANNOT do. Capabilities auto-update when new features are installed.

```
UPGRADE MANIFEST
  [CORE]        Multi-Brain v2.0, Thread Safety v1.0, Clock v1.0, System Awareness v1.0
  [MEMORY]      Memory Extraction v2.0, Four Memory Buckets v1.0
  [LEARNING]    Bridge Curriculum v2.0, Skill Memory v1.0
  [PERCEPTION]  Vision v1.0, Image Generation v1.0
  [INCOME]      Job Discovery v1.0, Job Bidding v1.0
  [INFRA]       Nosana Deployment v1.0
```

---

## Nosana Integration

- **LLM Inference**: Qwen3.5-27B-AWQ-4bit via Nosana decentralized GPU endpoint
- **Embeddings**: Qwen3-Embedding-0.6B (1024 dimensions) via Nosana
- **Deployment**: Docker container on Nosana GPU network
- **No corporate clouds**. Permissionless, decentralized compute on Solana.

---

## Custom Dashboard

Black and gold interface at `/aegis` with:

- **Chat** — Full conversation interface with typing indicators
- **System Awareness** — 14 upgrades with category-colored indicators
- **Memory Buckets** — Live-updating personal memories, skills, and intel
- **Learned Skills** — Visual confidence bars that grow as the agent learns
- **Bridge Curriculum** — State machine flow visualization with demo button
- **Architecture** — 6-pillar system breakdown

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/awareness` | Full system awareness — upgrades, capabilities, skills |
| `GET` | `/api/memories` | All 3 memory buckets (personal, skills, intel) |
| `POST` | `/api/bridge/push` | Push a lesson to the bridge curriculum |
| `GET` | `/api/bridge/status` | Bridge pipeline state counts |

### Push a Lesson

```bash
curl -X POST http://localhost:3000/api/bridge/push \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_id": "rust_001",
    "topic": "Rust Ownership",
    "content": "In Rust, each value has exactly one owner..."
  }'
```

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Build TypeScript
npx tsc

# Start the agent
pnpm start

# Open dashboard
# http://localhost:3000/aegis
```

## Docker

```bash
# Build
docker build -t aegis-agent .

# Run
docker run -p 3000:3000 --env-file .env aegis-agent
```

## Deploy to Nosana

1. Push Docker image: `docker push yourusername/nosana-eliza-agent:latest`
2. Update `nos_job_def/nosana_eliza_job_definition.json` with your image URL
3. Deploy via Nosana Dashboard or CLI

---

## Tech Stack

- **Framework**: ElizaOS v1.7.2
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3) with WAL mode
- **LLM**: Qwen3.5-27B on Nosana
- **Embeddings**: Qwen3-Embedding-0.6B on Nosana
- **Frontend**: Custom HTML/CSS/JS dashboard
- **Deployment**: Docker on Nosana GPU network

---

## What Makes This Different

Most challenge entries are personality prompts on top of the default ElizaOS client. Aegis has:

1. **Working memory isolation** — not described, implemented. SQLite-backed, WAL mode, single-writer per bucket
2. **Live bridge curriculum** — push a lesson, watch it process, see the skill appear with confidence scoring
3. **Memory extraction** — LLM-powered fact extraction from conversation, every 5 messages, saved to personal bucket
4. **REST API** — programmatic access to all agent internals (awareness, memories, bridge)
5. **Custom dashboard** — visual window into the agent's mind, not just a chat box
6. **Self-awareness that actually works** — dynamic capability tracking, limitations that shrink as features are installed

> "Most AI agents are tools. Aegis is a system with architecture."

---

*Built for the Nosana x ElizaOS Agent Challenge 2026*
