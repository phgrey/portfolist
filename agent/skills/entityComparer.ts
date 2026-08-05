import { GoogleGenAI } from '@google/genai';
import { PortfolioEntity, CachedEntityComparison } from '../../src/types';
import { getCachedComparison, saveCachedComparison, generateComparisonKey } from '../../src/services/entityMemory';
import { analyzeCV } from './cvAnalyzer';
import { analyzePositionDocument } from './positionAnalyzer';
import { analyzeRepo } from './repoAnalyzer';
import { analyzeAuthorRepos } from './authorProfiler';

export interface ComparableEntity {
  id: string;
  type?: 'repo' | 'cv' | 'position' | 'research' | string;
  entityType?: 'repo' | 'cv' | 'position' | 'research' | string;
  title?: string;
  authorUsername?: string;
  contentRaw?: string;
  content?: string;
}

export interface EntityComparisonMatrixResult {
  comparisonKey: string;
  entityATitle: string;
  entityBTitle: string;
  entityAType: string;
  entityBType: string;
  matchScore: number; // 0 to 100
  isSuitable: boolean;
  skillOverlap: string[];
  skillGaps: string[];
  conditionMatches: string[];
  conditionMismatches: string[];
  detailedRationale: string;
}

/**
 * Skill 6: Universal Cross-Entity Matrix Comparer
 * Compares ANY Entity A (CV, Repo, Candidate Profile) against ANY Entity B (Position, CV, Repo)
 * in terms of skills, technical stack, and working conditions.
 */
export async function compareEntities(
  entityA: ComparableEntity,
  entityB: ComparableEntity,
  aiClient?: GoogleGenAI,
  forceRefresh: boolean = false
): Promise<EntityComparisonMatrixResult> {
  const comparisonKey = generateComparisonKey(entityA.id, entityB.id);

  const typeA = entityA.entityType || entityA.type || 'cv';
  const typeB = entityB.entityType || entityB.type || 'position';
  const titleA = entityA.title || entityA.id;
  const titleB = entityB.title || entityB.id;

  // 1. Check L1 RAM + L2 Firestore Cache
  if (!forceRefresh) {
    const cached = await getCachedComparison(comparisonKey);
    if (cached) {
      console.log(`⚡ [entityComparer] Returning cached matrix evaluation for ${comparisonKey}`);
      return {
        comparisonKey,
        entityATitle: titleA,
        entityBTitle: titleB,
        entityAType: typeA,
        entityBType: typeB,
        matchScore: cached.matchScore,
        isSuitable: cached.matchScore >= 70,
        skillOverlap: cached.skillOverlap,
        skillGaps: cached.skillGaps,
        conditionMatches: cached.conditionMatches,
        conditionMismatches: cached.conditionMismatches,
        detailedRationale: cached.detailedRationale
      };
    }
  }

  console.log(`⚖️ [Skill 6: entity_comparer] Evaluating matrix comparison between "${entityA.id}" vs "${entityB.id}"...`);

  const contentA = entityA.contentRaw || entityA.content || '';
  const contentB = entityB.contentRaw || entityB.content || '';

  // 2. Resolve Entity A profile/skills
  let profileA: any;
  if (typeA === 'cv') {
    profileA = await analyzeCV(contentA, entityA.authorUsername || 'candidate', aiClient);
  } else if (typeA === 'repo') {
    profileA = await analyzeRepo(titleA, aiClient);
  } else {
    profileA = await analyzeAuthorRepos(entityA.authorUsername || entityA.id, aiClient);
  }

  // 3. Resolve Entity B profile/skills
  let profileB: any;
  if (typeB === 'position') {
    profileB = await analyzePositionDocument(contentB, aiClient);
  } else if (typeB === 'cv') {
    profileB = await analyzeCV(contentB, entityB.authorUsername || 'candidate', aiClient);
  } else {
    profileB = await analyzeRepo(titleB, aiClient);
  }

  // 4. Synthesize Cross-Entity Overlap & Conditions
  let matchScore = 80;
  let skillOverlap: string[] = [];
  let skillGaps: string[] = [];
  let conditionMatches: string[] = [];
  let conditionMismatches: string[] = [];
  let detailedRationale = `Comparison matrix between ${entityA.id} (${typeA}) and ${entityB.id} (${typeB}).`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a Senior Technical Recruiter and Principal System Architect. Perform a comprehensive matrix comparison between Entity A and Entity B:

ENTITY A (${typeA.toUpperCase()}):
${JSON.stringify(profileA)}

ENTITY B (${typeB.toUpperCase()}):
${JSON.stringify(profileB)}

---
Compare them in terms of:
1. Technical Skill Overlap (shared languages, frameworks, patterns)
2. Missing Gaps / Skill Requirements
3. Working Condition Alignment (Seniority level, remote/hybrid work mode, experience years)

Return JSON:
{
  "matchScore": number (0-100),
  "skillOverlap": string[],
  "skillGaps": string[],
  "conditionMatches": string[],
  "conditionMismatches": string[],
  "detailedRationale": string
}`
      });

      if (response.text) {
        const text = response.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          matchScore = Number(parsed.matchScore) || 75;
          skillOverlap = parsed.skillOverlap || [];
          skillGaps = parsed.skillGaps || [];
          conditionMatches = parsed.conditionMatches || [];
          conditionMismatches = parsed.conditionMismatches || [];
          detailedRationale = parsed.detailedRationale || text;
        }
      }
    } catch (e: any) {
      console.warn(`⚠️ Warning during AI cross-entity comparison: ${e.message || String(e)}`);
    }
  }

  const resultDoc: CachedEntityComparison = {
    id: comparisonKey,
    entityAId: entityA.id,
    entityBId: entityB.id,
    matchScore,
    skillOverlap,
    skillGaps,
    conditionMatches,
    conditionMismatches,
    detailedRationale,
    cachedAt: new Date().toISOString()
  };

  // 5. Persist to 2-tier Memory (L1 RAM + L2 Firestore)
  await saveCachedComparison(resultDoc);

  return {
    comparisonKey,
    entityATitle: titleA,
    entityBTitle: titleB,
    entityAType: typeA,
    entityBType: typeB,
    matchScore,
    isSuitable: matchScore >= 70,
    skillOverlap,
    skillGaps,
    conditionMatches,
    conditionMismatches,
    detailedRationale
  };
}
