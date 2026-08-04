import { GoogleGenAI } from '@google/genai';
import { analyzeAuthorRepos, AuthorProfileResult } from './authorProfiler';

export interface PositionMatchResult {
  isSuitable: boolean;
  matchScore: number; // 0 to 100
  authorUsername: string;
  evaluatedPositionTitle: string;
  keyMatchingStrengths: string[];
  identifiedGaps: string[];
  detailedRationale: string;
}

/**
 * Skill 3: Compare an author (repos + optional CV) against a Position description
 */
export async function matchAuthorToPosition(
  authorReposOrUsername: string | string[],
  positionDescriptionText: string,
  cvText?: string,
  aiClient?: GoogleGenAI
): Promise<PositionMatchResult> {
  console.log(`\n🎯 [Skill 3: match_author_to_position] Matching candidate against position specification...`);

  // Step 1: Execute Skill 2 to get full author profile from repos
  const authorProfile: AuthorProfileResult = await analyzeAuthorRepos(authorReposOrUsername, aiClient);

  let isSuitable = false;
  let matchScore = 70;
  let keyMatchingStrengths: string[] = [...authorProfile.strengths];
  let identifiedGaps: string[] = [...authorProfile.weaknesses];
  let detailedRationale = `Candidate ${authorProfile.authorUsername} was evaluated against the position specification.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert Principal AI Architect and Technical Recruiter. Evaluate whether this candidate is SUITABLE for the specified position.

CANDIDATE REPO PROFILE:
- Author Username: ${authorProfile.authorUsername}
- Evaluated Repos: ${authorProfile.evaluatedReposCount}
- Primary Languages: ${authorProfile.primaryLanguages.join(', ')}
- Profile Synthesis: ${authorProfile.synthesis}
- Strengths: ${JSON.stringify(authorProfile.strengths)}
- Weaknesses: ${JSON.stringify(authorProfile.weaknesses)}

CANDIDATE CV (Optional):
${cvText || 'No separate CV provided; using GitHub repository evidence as primary proof of skills.'}

TARGET POSITION DESCRIPTION:
${positionDescriptionText}

---
Perform a thorough match evaluation and return JSON with:
{
  "isSuitable": boolean,
  "matchScore": number (0-100),
  "positionTitle": string,
  "keyMatchingStrengths": string[],
  "identifiedGaps": string[],
  "detailedRationale": string
}`
      });

      if (response.text) {
        const text = response.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          isSuitable = Boolean(parsed.isSuitable);
          matchScore = Number(parsed.matchScore) || 75;
          keyMatchingStrengths = parsed.keyMatchingStrengths || keyMatchingStrengths;
          identifiedGaps = parsed.identifiedGaps || identifiedGaps;
          detailedRationale = parsed.detailedRationale || text;
        } else {
          detailedRationale = text;
          isSuitable = matchScore >= 70;
        }
      }
    } catch (e: any) {
      console.warn(`⚠️ Warning during AI candidate matching: ${e.message || String(e)}`);
    }
  } else {
    // Rule-based fallback if no AI API key
    const jdLower = positionDescriptionText.toLowerCase();
    const matchesLang = authorProfile.primaryLanguages.some(l => jdLower.includes(l.toLowerCase()));
    matchScore = matchesLang ? 80 : 55;
    isSuitable = matchScore >= 70;
  }

  return {
    isSuitable,
    matchScore,
    authorUsername: authorProfile.authorUsername,
    evaluatedPositionTitle: 'Target Position',
    keyMatchingStrengths,
    identifiedGaps,
    detailedRationale
  };
}
