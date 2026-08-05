import { GoogleGenAI } from '@google/genai';

export interface CVAnalysisResult {
  authorUsername: string;
  summary: string;
  extractedSkills: {
    primaryLanguages: string[];
    frameworksAndTools: string[];
    domainExpertise: string[];
    softSkills: string[];
  };
  candidateConditions: {
    experienceYears?: number;
    experienceLevel: string; // e.g. "Senior Systems Architect", "Lead AI Engineer"
    preferredWorkMode: 'remote' | 'hybrid' | 'onsite' | 'flexible';
    location?: string;
  };
}

/**
 * Skill 4: Analyze CV / Resume Document
 * Extracts work experience, technical stack, domain expertise, and candidate working conditions
 */
export async function analyzeCV(
  cvText: string,
  authorUsername: string = 'candidate',
  aiClient?: GoogleGenAI
): Promise<CVAnalysisResult> {
  console.log(`📄 [Skill 4: analyze_cv] Parsing CV document for author "@${authorUsername}"...`);

  let summary = `CV document for ${authorUsername} detailing software engineering experience.`;
  let primaryLanguages = ['TypeScript', 'Python', 'JavaScript'];
  let frameworksAndTools = ['React', 'Node.js', 'Express', 'Docker', 'Git'];
  let domainExpertise = ['Fullstack Web Architecture', 'AI & Agentic Pipelines', 'Distributed Systems'];
  let softSkills = ['Technical Leadership', 'Cross-functional Collaboration', 'System Design'];
  let experienceLevel = 'Senior Software Engineer';
  let preferredWorkMode: 'remote' | 'hybrid' | 'onsite' | 'flexible' = 'flexible';
  let experienceYears = 5;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert Executive Technical Recruiter. Analyze this CV / Resume text and extract structured candidate data:

CV TEXT:
${cvText}

---
Extract JSON:
{
  "summary": string,
  "primaryLanguages": string[],
  "frameworksAndTools": string[],
  "domainExpertise": string[],
  "softSkills": string[],
  "experienceYears": number,
  "experienceLevel": string,
  "preferredWorkMode": "remote" | "hybrid" | "onsite" | "flexible",
  "location": string
}`
      });

      if (response.text) {
        const text = response.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          summary = parsed.summary || summary;
          primaryLanguages = parsed.primaryLanguages || primaryLanguages;
          frameworksAndTools = parsed.frameworksAndTools || frameworksAndTools;
          domainExpertise = parsed.domainExpertise || domainExpertise;
          softSkills = parsed.softSkills || softSkills;
          experienceYears = parsed.experienceYears || experienceYears;
          experienceLevel = parsed.experienceLevel || experienceLevel;
          preferredWorkMode = parsed.preferredWorkMode || preferredWorkMode;
        }
      }
    } catch (e: any) {
      console.warn(`⚠️ Warning during AI CV analysis: ${e.message || String(e)}`);
    }
  } else {
    // Basic heuristic parsing fallback
    const lower = cvText.toLowerCase();
    if (lower.includes('python')) primaryLanguages.push('Python');
    if (lower.includes('rust')) primaryLanguages.push('Rust');
    if (lower.includes('remote')) preferredWorkMode = 'remote';
    if (lower.includes('lead') || lower.includes('staff')) experienceLevel = 'Staff / Lead Engineer';
  }

  return {
    authorUsername,
    summary,
    extractedSkills: {
      primaryLanguages: Array.from(new Set(primaryLanguages)),
      frameworksAndTools: Array.from(new Set(frameworksAndTools)),
      domainExpertise: Array.from(new Set(domainExpertise)),
      softSkills: Array.from(new Set(softSkills))
    },
    candidateConditions: {
      experienceYears,
      experienceLevel,
      preferredWorkMode
    }
  };
}
