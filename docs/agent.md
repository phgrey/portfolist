# Walkthrough - 4-Layer System Architecture & Pluggable Analytics Spaces

Refactored the system into a **4-Layer Architecture** featuring decoupled **Layer 1 Raw Data Provider Connectors**, **Layer 2 Pluggable Analytics Spaces**, **Layer 3 Agent Core & 2-Tier Memory**, and **Layer 0 Delivery Channels** (Telegram Bot & Web UI).

---

## Architecture Overview & Implemented Components

### 1. Layer 1: Raw Data Provider Connectors (`src/services/providers/`)
- **[BaseProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/BaseProvider.ts)**: Abstract `IDataProvider` interface defining standard raw user & repository data contracts.
- **[GitHubAppProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/GitHubAppProvider.ts)**: Fetches raw public and private repository code files, metadata, and workflow definitions via GitHub App tokens & CLI.
- **[LinkedInProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/LinkedInProvider.ts)**: Pluggable connector fetching raw career history, skills, and recommendations.
- **[GoogleDocsProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/GoogleDocsProvider.ts)**: Pluggable connector reading raw Google Docs specifications.

---

### 2. Layer 2: Pluggable Analytics Spaces (`agent/skills/`)
Structured as independent, extensible analytics spaces:
1. **Position-Match & Fit Analytics Space**: `positionMatcher.ts`, `entityComparer.ts` (Calculates fit score 0-100, skill gaps, condition alignment).
2. **Code & Repository Quality Analytics Space**: `repoAnalyzer.ts` (Production readiness, CI/CD, staleness).
3. **Talent Archetype & Skill Analytics Space**: `cvAnalyzer.ts`, `authorProfiler.ts` (Candidate archetype, career trajectory).
4. **Pluggable Future Spaces**: Pluggable slots for Compensation Benchmarking, Team Culture, and Technical Code Review.

---

### 3. Layer 0: Communication Delivery Channels (`agent/channels/` & `src/components/`)
- **Telegram Bot Gateway (`agent/telegramBot.ts`)** and **Web UI Chat Drawer (`AgentChatDrawer.tsx`)**: Act strictly as I/O delivery channels. They accept user messages, forward them to `agentEngine.ts`, and render markdown answers.

---

## Verification Results

### Automated & Integration Testing

1. **Type Check (`npx tsc --noEmit`)**: Clean exit code 0.
2. **Production Bundle (`npm run build`)**: Successfully compiled Vite bundle & `dist/server.cjs`.
3. **4-Layer Integration Testing**:
   - `GitHubAppProvider`, `LinkedInProvider`, and `GoogleDocsProvider` verified.
   - Routing from Layer 0 Delivery Channels (Web UI & Telegram) through Layer 3 Engine into Layer 2 Analytics Spaces verified.
