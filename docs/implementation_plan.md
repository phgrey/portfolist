# Implementation Plan - Author Project Set Skill Analysis & 2-Tier Agent Memory (L1 Memory + L2 Firestore)

Implement custom project sets for authors, deep skill analysis across custom project sets, and a **2-Tier Agent Memory & Caching System** (L1 Process RAM + L2 Cloud Firestore).

---

## 1. Multi-Tier Caching & Storage Architecture

* **L1 In-Memory Cache (RAM)**: In-memory `Map` / object cache inside `agentMemory.ts`. Cache hits complete in **<1ms** with zero network roundtrips or Firestore reads.
* **L2 Cloud Firestore Persistence**: Persistent memory collection (`cached_analyses` & `author_project_sets`). Loaded into L1 on startup / miss, and persisted via write-behind queueing (`queueDocumentWrite`).
* **Visibility**: Custom project sets default to **`isPublic: false`** (private to author) until portfolio UI components are built.

```mermaid
flowchart TD
    Author["Author / User"] -->|Select Custom Project Set| ProjectSet["Project Set (e.g. ['phgrey/grafin', 'alexchen/ai-workflow'])"]
    ProjectSet -->|Trigger Analysis| Agent["Skill Evaluator Agent"]
    
    Agent -->|1. Check L1 Memory| L1Cache["L1 In-Memory RAM Cache (<1ms)"]
    L1Cache -->|L1 Hit| ReturnL1["Return Instant Skill Profile"]
    
    L1Cache -->|L1 Miss| L2Firestore[("L2 Cloud Firestore\n(cached_analyses & author_project_sets)")]
    L2Firestore -->|L2 Hit (<10ms)| WarmL1["Populate L1 & Return Result"]
    
    L2Firestore -->|L2 Miss| SkillEngine["Skills Engine (repoAnalyzer & authorProfiler)"]
    SkillEngine -->|Run gh CLI & Gemini| Analysis["New Analysis Output"]
    Analysis -->|Save Memory| L1Cache & L2Firestore
```

---

## Proposed Changes

### Custom Project Set & Agent Memory Services

#### [MODIFY] [src/types.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/types.ts)
- Add `AuthorProjectSet` interface (`id`, `authorId`, `setName`, `repoList`, `isPublic: false`, `createdAt`).
- Add `CachedAnalysis` interface (`cacheKey`, `repoList`, `result`, `cachedAt`).

#### [NEW] [src/services/agentMemory.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/agentMemory.ts)
- Maintain L1 in-memory `Map<string, CachedAnalysis>` and `Map<string, AuthorProjectSet[]>`.
- **`saveProjectSet(authorId, setName, repoList, isPublic = false)`**: Save to L1 cache and queue write-behind to Firestore `author_project_sets` collection.
- **`getProjectSets(authorId)`**: Return project sets from L1 cache (falling back to Firestore if missing).
- **`getCachedAnalysis(cacheKey)`**: Check L1 memory first, then L2 Firestore.
- **`saveCachedAnalysis(cacheKey, repoList, result)`**: Save to L1 memory and queue to L2 Firestore.

#### [MODIFY] [agent/skills/authorProfiler.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/agent/skills/authorProfiler.ts)
- Add `analyzeProjectSet(repoList, aiClient)` to profile arbitrary repo sets.
- Check `agentMemory` (L1 & L2) before invoking `gh` CLI or Gemini API.

#### [MODIFY] [server.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/server.ts)
- Add REST endpoints:
  - `GET /api/authors/:username/project-sets`
  - `POST /api/authors/:username/project-sets` (creates/updates set with `isPublic: false`)
  - `POST /api/authors/:username/project-sets/:setName/analyze` (runs analysis using 2-tier cache)

---

## Verification Plan

### Automated / API Verification
- Create custom project set: `POST /api/authors/alex_chen/project-sets` (`{"setName": "ai-highlights", "repoList": ["phgrey/grafin", "alexchen-ai/gemini-agentic-workflow"]}`).
- Retrieve project sets: `GET /api/authors/alex_chen/project-sets` (verify `isPublic` is `false`).
- Run project set analysis: `POST /api/authors/alex_chen/project-sets/ai-highlights/analyze`.
- Verify 1st call executes analysis and populates L1 + L2 memory.
- Run analysis 2nd time: verify instant <1ms response served directly from L1 in-memory cache.
