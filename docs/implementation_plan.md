# Implementation Plan - 4-Layer System Architecture with Pluggable Analytics Spaces

Structure the codebase into a clean, decoupled **4-Layer Architecture**, with Layer 2 explicitly designed as **Pluggable Analytics Spaces**:

---

## 1. System Architecture Diagram

```mermaid
flowchart TD
    subgraph Layer0["Layer 0: Agent Input / Output Delivery Channels"]
        WebUIChannel["Web UI Chat Drawer\n(AgentChatDrawer.tsx / POST /api/chat)"]
        TelegramChannel["Telegram Bot Gateway\n(agent/telegramBot.ts)"]
        CLIChannel["CLI Interactive Runner\n(agent/candidateAgent.ts)"]
    end

    subgraph Layer3["Layer 3: Agent Core Engine & 2-Tier Memory"]
        AgentEngine["agentEngine.ts\n(Intent Classifier & Dialogue Synthesis)"]
        EntityMemory[("entityMemory.ts & agentMemory.ts\n(L1 Process RAM + L2 Cloud Firestore)")]
    end

    subgraph Layer1["Layer 1: Raw Data Provider Connectors (Tools)"]
        GithubProvider["GitHubAppProvider.ts\n(Fetches public & private repos via GitHub App)"]
        LinkedinProvider["LinkedInProvider.ts\n(Fetches profile & career history via LinkedIn API)"]
        GoogleDocsProvider["GoogleDocsProvider.ts\n(Fetches Google Docs specs & resumes)"]
    end

    subgraph Layer2["Layer 2: Pluggable Analytics Spaces (agent/skills/)"]
        subgraph FitSpace["Position-Match & Fit Analytics Space"]
            PositionMatcher["positionMatcher.ts"]
            EntityComparer["entityComparer.ts"]
        end

        subgraph CodeSpace["Code & Repo Quality Analytics Space"]
            RepoAnalyzer["repoAnalyzer.ts"]
        end

        subgraph TalentSpace["Talent Archetype & CV Analytics Space"]
            CvAnalyzer["cvAnalyzer.ts"]
            AuthorProfiler["authorProfiler.ts"]
        end

        subgraph FutureSpaces["Future Analytics Spaces (Pluggable)"]
            CompBenchmarking["Compensation & Salary Analytics Space"]
            TeamCulture["Team Compatibility Analytics Space"]
            PeerReview["Technical Depth & Code Review Analytics Space"]
        end
    end

    WebUIChannel & TelegramChannel & CLIChannel <-->|Unified Message Payload| AgentEngine
    AgentEngine <--> EntityMemory

    AgentEngine -->|Invoke Data Tool| Layer1
    Layer1 -->|Raw Text & Code| Layer2
    Layer2 -->|Analyzed Skills & Space Metrics| AgentEngine
```

---

## Proposed Changes

### Layer 1: Data Provider Connectors (`src/services/providers/`)

#### [NEW] [src/services/providers/BaseProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/BaseProvider.ts)
- Abstract interface `IDataProvider`:
  - `providerId: PlatformType`
  - `fetchRawUserData(username: string): Promise<RawUserData>`
  - `fetchRawRepositoryData(repoName: string): Promise<RawRepoData>`

#### [NEW] [src/services/providers/GitHubAppProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/GitHubAppProvider.ts)
- Implementation fetching raw repo code and metadata via GitHub App credentials.

#### [NEW] [src/services/providers/LinkedInProvider.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/providers/LinkedInProvider.ts)
- Pluggable provider fetching raw LinkedIn profile, work experience, and recommendations.

---

## Verification Plan

### Automated Verification
1. **Provider Abstraction Check**:
   - Verify `GitHubAppProvider` and `LinkedInProvider` implement `IDataProvider`.
2. **Channel & Space Routing Check**:
   - Verify Web UI and Telegram Bot route through `agentEngine.ts` to Layer 2 Analytics Spaces.
3. **Type Check & Build**:
   - Run `npx tsc --noEmit` and `npm run build`.
