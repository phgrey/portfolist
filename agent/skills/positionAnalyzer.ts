import { GoogleGenAI } from '@google/genai';
import { resolvePositionDocument } from '../../src/services/positionFetcher';

export interface PositionAnalysisResult {
  positionTitle: string;
  summary: string;
  requiredSkills: {
    primaryLanguages: string[];
    frameworksAndTools: string[];
    domainRequirements: string[];
  };
  positionConditions: {
    minExperienceYears?: number;
    requiredSeniority: string;
    workMode: 'remote' | 'hybrid' | 'onsite' | 'flexible';
    location?: string;
  };
}

/**
 * Skill 5: Analyze Position Description Document or Web URL
 * Extracts required tech stack, responsibilities, and role conditions
 */
export async function analyzePositionDocument(
  input: string,
  aiClient?: GoogleGenAI
): Promise<PositionAnalysisResult> {
  const resolvedText = await resolvePositionDocument(input);
  console.log(`📋 [Skill 5: analyze_position] Inspecting position specification...`);

  let positionTitle = 'Software Engineer / Architect Role';
  let summary = 'Target position requirements and role expectations.';
  let primaryLanguages = ['TypeScript', 'Python'];
  let frameworksAndTools = ['React', 'Node.js', 'Docker', 'CI/CD'];
  let domainRequirements = ['System Architecture', 'Cloud Deployment'];
  let minExperienceYears = 4;
  let requiredSeniority = 'Senior Engineer';
  let workMode: 'remote' | 'hybrid' | 'onsite' | 'flexible' = 'flexible';

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a Principal AI Architect and Technical Recruiter. Analyze this job description text and extract structured position data:

JOB SPECIFICATION:
${resolvedText}

---
Extract JSON:
{
  "positionTitle": string,
  "summary": string,
  "primaryLanguages": string[],
  "frameworksAndTools": string[],
  "domainRequirements": string[],
  "minExperienceYears": number,
  "requiredSeniority": string,
  "workMode": "remote" | "hybrid" | "onsite" | "flexible",
  "location": string
}`
      });

      if (response.text) {
        const text = response.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          positionTitle = parsed.positionTitle || positionTitle;
          summary = parsed.summary || summary;
          primaryLanguages = parsed.primaryLanguages || primaryLanguages;
          frameworksAndTools = parsed.frameworksAndTools || frameworksAndTools;
          domainRequirements = parsed.domainRequirements || domainRequirements;
          minExperienceYears = parsed.minExperienceYears || minExperienceYears;
          requiredSeniority = parsed.requiredSeniority || requiredSeniority;
          workMode = parsed.workMode || workMode;
        }
      }
    } catch (e: any) {
      console.warn(`⚠️ Warning during AI position analysis: ${e.message || String(e)}`);
    }
  } else {
    const lower = resolvedText.toLowerCase();
    if (lower.includes('remote')) workMode = 'remote';
    if (lower.includes('architect') || lower.includes('staff')) requiredSeniority = 'Staff / Architect';
  }

  return {
    positionTitle,
    summary,
    requiredSkills: {
      primaryLanguages: Array.from(new Set(primaryLanguages)),
      frameworksAndTools: Array.from(new Set(frameworksAndTools)),
      domainRequirements: Array.from(new Set(domainRequirements))
    },
    positionConditions: {
      minExperienceYears,
      requiredSeniority,
      workMode
    }
  };
}
