# NichePulse – AI Niche Intelligence Agent

NichePulse is an autonomous market research and intelligence agent submitted under **PS-01 — Autonomous Agents for Everyday Apps** for the *BuildFastWithAI AI Build Challenge 2026*.

It automates end-to-end niche market discovery by harvesting public discussions from Reddit and YouTube, deduplicating multi-source evidence, synthesizing grounded intelligence reports using Anthropic's Claude AI, enforcing programmatic verification and failure recovery, and executing human-approved external actions (GitHub Issue creation & verification).

---

## 📌 Problem Statement & Context

Conducting market research for new product ideas, niche SaaS tools, or content strategies manually is fragmented and time-consuming:
1. **Manual Search Burden:** Founders and researchers spend hours searching Reddit threads and YouTube video comments to find genuine consumer pain points.
2. **Noise & Duplication:** Discussions across social platforms contain heavy duplication, marketing noise, and irrelevant commentary.
3. **Fabrication & Hallucination Risks:** Using ungrounded LLMs for research risks hallucinated statistics, invented URLs, and unverified market claims.
4. **Lack of Verification & Safety:** Raw AI outputs often lack structured validation, and executing unvetted external actions (e.g., filing GitHub issues or notifying teams) risks publishing false or sensitive information.

**How NichePulse Solves This:**
NichePulse provides a fully autonomous research loop governed by deterministic planning, strict evidence grounding, programmatic 6-check verification, bounded failure recovery, an explicit **Human Approval Gate**, and verified external action execution.

---

## 🤖 End-to-End Agent Architecture

```
Research Goal
    │
    ▼
1. AI Planner (generatePlan & validatePlan)
    │
    ▼
2. Evidence Harvesting (Reddit API + YouTube Data API)
    │
    ▼
3. Deduplication (Exact ID + URL Normalization + Jaccard Title Similarity)
    │
    ▼
4. Intelligence Synthesis (Anthropic Claude 3.5 Sonnet / Grounded System Prompt)
    │
    ▼
5. Programmatic Verification (6 Deterministic Structural & Integrity Checks)
    │
    ├──────── [Verification Passed] ────────┐
    │                                       │
    ▼ [If Task / Verification Failed]       │
6. Bounded Recovery Loop (Max 2 Retries)   │
    │                                       │
    └───────────────────┬───────────────────┘
                        │
                        ▼
            7. Structured Report & Trace
                        │
                        ▼
            8. Human Approval Gate (approved: true required)
                        │
                        ▼
            9. External Action (GitHub Issue Creation)
                        │
                        ▼
            10. Action Verification (Remote Issue Check)
```

---

## 📁 Project Structure

```
nichepulse/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── planner.js      # AI Task Planner & Plan Schema Validator
│   │   │   ├── reddit.js       # Reddit Data Service & Fixture Fallback
│   │   │   ├── youtube.js      # YouTube Data API v3 Service & Fixture Fallback
│   │   │   ├── dedupe.js       # Multi-source Content Deduplication Service
│   │   │   ├── claude.js       # Anthropic Claude Intelligence Synthesis Service
│   │   │   ├── verifier.js     # Programmatic 6-Check Verification Service
│   │   │   ├── executor.js     # Tool Execution Engine & Demo Failure Injector
│   │   │   ├── orchestrator.js # Agent State Manager & Bounded Recovery Loop
│   │   │   └── github.js       # GitHub External Action & Verification Service
│   │   ├── routes/
│   │   │   ├── analyze.js      # Phase 2 & 3 Research Route
│   │   │   └── agent.js        # Phase 4 & 5A Autonomous Agent Routes (/run, /action)
│   │   ├── fixtures/
│   │   │   ├── mockData.js     # Labeled Hackathon Demo Fixtures
│   │   │   └── evaluationSet.js # Phase 5B 10-Goal Benchmark Evaluation Dataset
│   │   └── server.js           # Express API Server Gateway
│   ├── tests/
│   │   ├── analyze.test.js     # Endpoint & Fixture Metadata Tests
│   │   ├── claude.test.js      # Claude Grounding & Failure Mode Tests
│   │   ├── agent.test.js       # Agent Orchestration & Recovery Tests
│   │   └── action.test.js      # Human Approval Gate & GitHub Action Tests
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ReportDashboard.jsx  # Interactive Agent Dashboard Component
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ⚡ Capabilities (Phases 1–5A)

1. **AI Task Planning (Phase 4):** Generates a bounded, validated JSON execution plan (`reddit_search`, `youtube_search`, `dedupe`, `analysis`, `verification`).
2. **Multi-Source Evidence Harvesting (Phase 2):** Queries Reddit subreddits and YouTube video metadata concurrently.
3. **Smart Content Deduplication (Phase 2):** Eliminates duplicate discussions using exact ID matching, URL normalization, and Jaccard title similarity (`threshold: 0.75`).
4. **Claude Intelligence Synthesis (Phase 3):** Uses Anthropic Claude 3.5 Sonnet to synthesize evidence into structured JSON (`topTopics`, `emergingTrends`, `recurringProblems`, `aiInsights`, `opportunities`, `sourceLinks`).
5. **Deterministic Programmatic Verification (Phase 4):** Validates 6 rules programmatically:
   - Report object existence
   - Category array types
   - Non-emptiness (total item count > 0)
   - Evidence ID traceability
   - Source URL integrity (no hallucinated URLs)
   - Fixture vs Live metadata accuracy
6. **Bounded Failure Recovery (Phase 4):** Automatically retries failed tool calls or rate-limited APIs with controlled fallbacks (max 2 attempts) and records recovery actions in the trace log.
7. **Execution Trace Logging (Phase 4):** Captures timestamped state steps (`planning`, `harvesting`, `recovery`, `verification`, `completed`).
8. **Human Approval Gate (Phase 5A):** Enforces explicit `approved: true` state on backend and UI before unlocking external actions.
9. **GitHub External Action & Remote Verification (Phase 5A):** Creates a formatted GitHub issue detailing research opportunities and verified source links, then remotely verifies issue existence on GitHub.
10. **Demo Fixture / Fallback Mode:** Operates reliably during hackathon demonstrations even if third-party credentials are rate-limited or missing, explicitly labeling mock data as `sourceType: "fixture"`.

---

## 🛠️ Environment Configuration & Setup

### Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and configure the following variable names:

```ini
# Server Port
PORT=5000

# Anthropic Claude API Key (Required for live Claude synthesis)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Reddit Credentials (Optional; falls back to demo fixtures if missing)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=nichepulse-agent/1.0

# YouTube Data API Key (Optional; falls back to demo fixtures if missing)
YOUTUBE_API_KEY=your_youtube_api_key

# GitHub External Action Integration (Optional; returns action_unavailable if missing)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO=owner/repo_name
```

> **Security Note:** Never commit `.env` files or expose API tokens in frontend code. Credentials remain strictly backend-only.

---

## 🚀 Running NichePulse Locally

### System Requirements
- Node.js `v20.0.0` or higher (Tested on Node `v24.14.1`)
- npm `v10.0.0` or higher

### 1. Start Backend Server
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` (proxies `/api` to port 5000).*

### 3. Run Automated Test Suite
Execute the 24 Node native tests across all service layers:
```bash
cd backend
node --test tests/*.test.js
```

### 4. Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## 🧪 Demonstration Walkthrough

### Demonstrating Autonomous Agent Execution & Trace
1. Open `http://localhost:5173`.
2. Enter a research goal (e.g. *"Sustainable fashion ecommerce sizing challenges"*).
3. Click **Start Autonomous Agent**.
4. Observe the AI Plan generation, step-by-step Execution Trace, 6-Check Programmatic Verification, and Synthesized Report.

### Demonstrating Bounded Recovery
- If external Reddit/YouTube APIs encounter network errors or rate limits, the agent automatically activates its recovery loop, switches to labeled demo fixtures, logs the recovery in the trace, and completes successfully.

### Demonstrating Human Approval & GitHub Action
1. Scroll to the **Human Approval Gate** section after report generation.
2. Note that the **Create & Verify GitHub Issue** button is disabled while approval is pending (`approved: false`).
3. Click **Approve Report for Export** to set `approved: true`.
4. Click **Create & Verify GitHub Issue**. The backend creates the issue and remotely verifies its existence, displaying `action_succeeded` and `action_verified` alongside the verified issue link.

---

## 📊 Evaluation Benchmark & Baseline

### Benchmark Dataset (`backend/src/fixtures/evaluationSet.js`)
NichePulse includes a 10-goal evaluation benchmark across diverse market domains (Sustainable Fashion, Student AI Tools, Budget Fitness Apps, Indoor Gardening, Creator Tools, Pet Care, Travel Planning, Food Delivery Packaging, Small Business Automation).

### Baseline Comparison

| Feature / Step | Manual Research Workflow | NichePulse Autonomous Agent |
| :--- | :--- | :--- |
| **Search & Discovery** | Manual browsing of Reddit subreddits & YouTube videos | Automated multi-source parallel API harvesting |
| **Deduplication** | Manual reading and mental filtering | Algorithmic exact ID + Jaccard title similarity deduplication |
| **Synthesis** | Ad-hoc manual note-taking | Claude 3.5 Sonnet grounded JSON intelligence synthesis |
| **Source Traceability** | Risk of lost or unverified links | Strict evidence ID mapping & source URL preservation |
| **Verification** | Human memory / manual link checking | Programmatic 6-check schema & URL integrity validation |
| **Failure Recovery** | Process halts on network/API failure | Bounded recovery loop with explicit retry logging |
| **Action Execution** | Manual copy-pasting into project tools | Human-approved automated GitHub issue creation & verification |

---

## 🛡️ Security & Integrity Controls

- **Backend-Only Credentials:** External tokens (`ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, etc.) are never exposed in API responses or sent to the frontend.
- **Explicit Approval Gate:** External API mutations (GitHub Issue creation) strictly require explicit `approved: true` confirmation.
- **No LLM Single-Point Verification:** Report correctness is verified programmatically via non-LLM Javascript validation rules.
- **No Hallucinated URLs:** Source links are checked against raw harvested evidence items before inclusion in final output.

---

## ℹ️ AI Tools Disclosure

In accordance with competition guidelines, AI coding assistance tools (Antigravity AI / Gemini 3.8 Flash) were utilized during development for code generation, refactoring, test script creation, and documentation synthesis.
