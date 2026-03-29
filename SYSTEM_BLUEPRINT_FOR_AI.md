# System Blueprint: WorkSync AI (v1.0)
### High-Precision Workspace Orchestration & Team Performance Intelligence

This document is a technical blueprint of the **WorkSync AI** platform, designed to provide a comprehensive knowledge base for AI agents or developers to understand the full system architecture, dependencies, and behavioral logic without ambiguity.

---

## 1. System Vision & Domain
**Objective**: Automate the administrative overhead of agile team management by synchronously capturing meeting intelligence and asynchronously verifying engineering output.
**Core Workflow**:
1.  **Capture**: Meeting $\rightarrow$ Transcription $\rightarrow$ Agentic Task Extraction.
2.  **Coordinate**: Task Assignment $\rightarrow$ Work Submission (GitHub).
3.  **Validate**: Agentic PR Review $\rightarrow$ Performance Scoring $\rightarrow$ Dashboard Transparency.
4.  **Enforce**: "Follow-up" Agents $\rightarrow$ Automated Nudges $\rightarrow$ Escalation Alerts.

---

## 2. Technical Infrastructure stack
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) using Turbopack for development.
- **Authentication**: [Clerk](https://clerk.com/) with custom Clerk Middleware to protect `/dashboard`, `/meeting`, `/tasks`, and `/api`.
- **Primary Database**: [Neon Serverless PostgreSQL](https://neon.tech/) accessible via direct `postgres.js` (for edge resilience) and `Prisma client`.
- **ORM**: [Prisma](https://www.prisma.io/) for schema definition and DB migrations.
- **AI Backend**: [Groq SDK](https://groq.com/) using **Llama 3.3 70B** models for JSON-intensive reasoning tasks.
- **Real-Time Audio/Video**: [LiveKit](https://livekit.io/) for room-based WebRTC signaling.
- **UI Architecture**: Tailwind CSS 4.0 (Pre-release) with `fluid-type` and `rich-animations` enabled.

---

## 3. Data Architecture (Prisma/SQL Models)

### Core Entities:
- **`User`**: Linked to Clerk `clerkId`. Has a `role` (`MANAGER` or `EMPLOYEE`) and belongs to one `Company`.
- **`Company`**: Tenants in the system. Identified by a unique `inviteCode`.
- **`Meeting`**: Stores `transcript` as a serialized string. Belongs to a `Company`.
- **`Task`**: The primary unit of work. Statuses: `todo`, `in_progress`, `submitted`, `needs_improvement`, `completed`.
- **`Evaluation`**: Result of an AI PR review. Contains `score` (0-100), `correctness`, `quality`, `completeness`, `verdict`, and `suggestions`.
- **`AgentDecisionLog`**: A high-fidelity audit trail for all agentic actions (logs `input`, `output`, `reasoning`, `confidence`, and `durationMs`).

---

## 4. Multi-Agent Ecosystem (Logic & Workflow)

WorkSync AI operates through specialized **Multi-Agent Pipelines** rather than monolithic LLM calls.

### A. The Meeting Intelligence Pipeline
- **Entry Point**: `src/app/api/meeting/extract/route.ts`
- **Agent 1: Transcript Analyzer**: Summarizes the unstructured meeting audio into a structured strategic narrative.
- **Agent 2: Task Orchestrator**: Identifies action items, deadlines (e.g., "by Monday"), and owners based on team context.
- **Agent 3: Validation Agent**: Verifies that the extracted tasks align with the transcript. If confidence is < 60%, it triggers a **Self-Correction Loop** by providing feedback to Agent 2.

### B. The Performance Verification Pipeline (PR Review)
- **Entry Point**: `src/app/api/tasks/submit/route.ts`
- **Agent 1: Code Review Agent**: Focuses strictly on code quality, security, and best practices.
- **Agent 2: Task Alignment Agent**: Checks if the submitted code actually solves the `Task` description and title.
- **Agent 3: Reconciliation Agent**: Merges the findings from Agent 1 and 2, calculates the final score, and produces the manager's "verdict".

### C. The Monitoring Layer
- **Velocity Analyzer**: Ran periodically via Cron to identify high-risk bottlenecks in the sprint.
- **Follow-Up Agent**: Evaluates overdue tasks and generates context-aware "AI Nudges" to be sent to developers.

---

## 5. Technical Resilience & Error Handling

### Database Robustness (Neon SQL Wrapper)
Implemented in `src/lib/core/neon.ts`. 
- **Pattern**: Exponential backoff retry logic.
- **Count**: 5 retries.
- **Target Errors**: `fetch failed`, `ConnectTimeoutError`, `UND_ERR_CONNECT_TIMEOUT`.
- **Reasoning**: Neon connections can occasionally timeout in cold-start serverless environments.

### Speech Recognition Resilience
Implemented in `src/app/meeting/[roomId]/page.tsx`.
- **Pattern**: Restart-lock mechanism (`isRestartingRef`).
- **Cooldown**: 1.5s mandatory delay before re-initializing recognition after an error.
- **Reasoning**: Prevents `InvalidStateError` and browser crash loops during network interruptions.

---

## 6. Integration Reference

### GitHub Pipeline
- Uses **Personal Access Tokens (PAT)** via `GITHUB_TOKEN`.
- Parser logic in `src/lib/integrations/github-parser.ts` handles:
    - Pull Request URLs (`/pull/123`)
    - Commit URLs (`/commit/abc`)
    - Repository Base URLs (diff-based analysis)

### LiveKit Token Generation
- Route: `/api/livekit/token`
- Generates scoped tokens for specific room names to prevent cross-room crosstalk.

---

## 7. Critical File Structure Map

| Location | Purpose |
| :--- | :--- |
| `src/app/api/` | All serverless entry points (Extract, Evaluate, Cron, Auth). |
| `src/lib/ai/` | Implementation of specialized AI Agents and Orchestrators. |
| `src/lib/core/` | Low-level database and AI driver wrappers (SQL, Groq). |
| `src/components/dashboard/` | High-fidelity UI for Managers/Employees (Tailwind v4). |
| `src/lib/integrations/` | External API drivers (GitHub, Clerk API). |

---
*End of Blueprint. This document should be considered the 'Source of Truth' for system-wide behavioral logic.*
