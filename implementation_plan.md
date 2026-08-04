# Implementation Plan - Author Project Set Skill Analysis & Firebase Agent Memory / Cache

Implement the ability for authors to define custom project sets in their portfolio, perform deep skill analysis across those custom project sets, and store agent memory / cached analysis results directly in **Cloud Firestore**.

---

## 1. DB Choice for Agent Memory & RAG Cache: Firebase Firestore vs DoltHub

> [!TIP]
> **Recommendation: Use Cloud Firestore (Already Deployed)**
> * **Zero Extra Infra**: You already have Cloud Firestore Enterprise running in your project.
> * **Vector Search & Document Storage**: Firestore Enterprise natively supports vector embeddings (`find_nearest`), document caching, and subcollection indexing.
> * **Token & Cost Optimization**: Caching analysis results in Firestore (`cached_analyses` collection) means repeat skill requests for the same repository or author project set return instantly in **<10ms** without re-querying Gemini API or `gh` CLI.
> * **DoltHub Comparison**: DoltHub is great for Git-style versioned relational databases, but for document memory, analysis caching, and portfolio state, Firestore is faster, zero-cost, and natively integrated.

---

## 2. Proposed Architecture & Workflow

```mermaid
flowchart TD
    Author["Author / User"] -->|Select Custom Project Set| ProjectSet["Project Set (e.g. ['phgrey/grafin', 'alexchen/ai-workflow'])"]
    ProjectSet -->|Trigger Analysis| Agent["Candidate / Skill Evaluator Agent"]
    
    Agent -->|1. Check Cache| FirestoreMemory[("Firebase Firestore\n(cached_analyses & project_sets)")]
    FirestoreMemory -->|Cache Hit (<10ms)| ReturnCached["Return Cached Skill Profile"]
    
    Agent -->|2. Cache Miss| SkillEngine["Skills Engine (repoAnalyzer & authorProfiler)"]
    SkillEngine -->|Run gh CLI & Gemini| Analysis["New Analysis Output"]
    Analysis -->|3. Store Memory| FirestoreMemory
```

---

## Proposed Changes

### Custom Project Set & Agent Memory Services

#### [NEW] [src/services/agentMemory.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/src/services/agentMemory.ts)
- **`saveProjectSet(authorId, setName, repoList)`**: Persist author's custom project set to Firestore `author_project_sets` collection.
- **`getCachedAnalysis(cacheKey)`**: Check Firestore `cached_analyses` collection by SHA/hash of repo names and pushed dates.
- **`saveCachedAnalysis(cacheKey, result)`**: Save analysis output into Firestore with TTL / timestamp.

#### [MODIFY] [agent/skills/authorProfiler.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/agent/skills/authorProfiler.ts)
- Add support for profiling custom project sets (`analyzeProjectSet(repoList)`).
- Integrate `agentMemory` caching layer to check for pre-analyzed repos before querying `gh` CLI.

#### [MODIFY] [server.ts](file:///Users/ssemenov/Documents/antigravity/portfolist.node.srv/server.ts)
- Expose REST endpoints for custom project sets:
  - `POST /api/authors/:username/project-sets` – Create/update custom project set.
  - `POST /api/authors/:username/project-sets/:setName/analyze` – Run skill analysis on custom project set (cached in Firestore).

---

## User Review Required

> [!IMPORTANT]
> **Questions for User Alignment:**
> 1. Should custom project sets be public on the author's portfolio page, allowing visitors to see the skill breakdown for specific project highlights?
> 2. Is Firestore caching acceptable as your primary Agent Memory engine?

---

## Verification Plan

### Automated / API Verification
- Create custom project set: `POST /api/authors/alex_chen/project-sets` with `["phgrey/grafin", "alexchen-ai/gemini-agentic-workflow"]`.
- Run project set analysis: `POST /api/authors/alex_chen/project-sets/ai-highlights/analyze`.
- Verify first run executes skills and caches result in Firestore (`cached_analyses` collection).
- Run the analysis a second time and verify response returns instantly from Firestore cache (<10ms).
