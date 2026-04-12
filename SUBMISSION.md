# Aegis — Submission Materials

## Project Description (300 words max — for SuperteamEarn)

Aegis is an autonomous AI agent that doesn't just respond — it learns, remembers, and grows. Built on ElizaOS and deployed on Nosana's decentralized GPU network, Aegis showcases architecture that separates it from every other chatbot wrapper.

**Multi-Brain Rotation**: Multiple LLM backends in failover chain. If one brain hits a rate limit, the next picks up seamlessly. Zero downtime by design — born from real constraints of building on free API tiers.

**Four Isolated Memory Buckets**: Personal memories, learned skills, group intelligence, and conversation — each with exactly one writer. No cross-contamination. The agent builds persistent knowledge about you over time through automated extraction every 5 messages.

**Bridge Curriculum (AI Teaching AI)**: A state machine pipeline where external AI agents push structured lessons. Aegis reads, processes, saves to skill memory with confidence scoring, and acknowledges. Watch an agent learn in real-time through the dashboard's "Push Demo Lesson" button.

**Self-Awareness Module**: Dynamic capability tracking through an upgrade manifest. Aegis knows exactly what it can and cannot do — capabilities update automatically as new features are installed. Critical for honest communication and accurate job evaluation.

**Autonomous Income Architecture**: Job discovery, evaluation against current capabilities, work generation, and competitive bidding — designed for agents that earn money, not just spend it.

**Custom Dashboard**: Black and gold interface with live-updating sidebar panels showing memory buckets, learned skills with confidence bars, bridge curriculum state visualization, and the full upgrade manifest. Not a default chat UI — a window into the agent's mind.

**Deep Nosana Integration**: LLM inference (Qwen3.5-27B) and embeddings (Qwen3-Embedding-0.6B) both run on Nosana's decentralized GPU network. Containerized deployment via Docker. No corporate clouds.

Aegis isn't a chatbot with a personality prompt. It's a system with architecture — multi-brain, multi-memory, self-improving, and running on decentralized infrastructure.

---

## Video Demo Script (<1 minute)

**[0:00-0:05]** HOOK
"Most AI agents are API wrappers. Aegis has actual architecture. Let me show you."

**[0:05-0:15]** DASHBOARD OVERVIEW
Show the full UI — black and gold dashboard. Point out sidebar panels.
"Custom dashboard with live system awareness, memory buckets, and bridge curriculum."

**[0:15-0:25]** CHAT DEMO
Type a message, show response.
"Powered by Qwen3.5-27B on Nosana's decentralized GPUs. Not AWS. Not GCP."

**[0:25-0:35]** MEMORY SYSTEM
Show the Memory Buckets panel updating.
"Four isolated memory buckets — personal, skills, intel, conversation. Each with one writer. No contamination."

**[0:35-0:45]** BRIDGE CURRICULUM (THE WOW MOMENT)
Click "Push Demo Lesson". Show the state machine light up. Show skill appearing with confidence bar.
"AI teaching AI. Watch the bridge curriculum process a lesson in real-time. The agent just learned something new."

**[0:45-0:55]** SELF-AWARENESS
Show the System Awareness panel.
"14 installed upgrades. Dynamic capability tracking. Aegis knows exactly what it can and cannot do."

**[0:55-0:60]** CLOSE
"Aegis. Autonomous. Self-improving. Decentralized. Built for the Nosana x ElizaOS Challenge."

---

## Social Media Post (X/Twitter)

Built Aegis for the @nosaboratory x @elizaOS Agent Challenge

Not another chatbot wrapper. Actual architecture:
- Multi-brain failover rotation
- 4 isolated memory buckets
- AI-to-AI teaching pipeline (bridge curriculum)
- Self-awareness module
- Autonomous income agents

Running on decentralized GPUs via Nosana. Qwen3.5-27B inference, no corporate clouds.

The dashboard lets you watch the agent learn in real-time.

#NosanaChallenge #ElizaOS #AI #Solana

---

## GitHub README Updates (for the fork)

### Suggested README headline:

> **Aegis** — An autonomous AI agent with multi-brain architecture, isolated memory systems, and self-improving intelligence. DNA cloned from a production agent. Deployed on Nosana decentralized GPUs.

### Key sections to highlight:
1. Architecture diagram (text-based)
2. Memory bucket isolation explanation
3. Bridge curriculum demo instructions
4. API endpoints documentation
5. Deployment instructions

---

## Submission Checklist

- [ ] Public GitHub fork with agent code
- [ ] Live Nosana deployment URL
- [ ] Project description (above — 297 words)
- [ ] Video demo (<1 minute — script above)
- [ ] Social media post (above)
- [ ] Star repos: nosana-programs, nosana-kit, nosana-cli, agent-challenge
- [ ] Docker image pushed to Docker Hub
- [ ] .env configured with Nosana endpoints
- [ ] Custom frontend accessible at /aegis
