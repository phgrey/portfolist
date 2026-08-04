import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Author, AiTeamCombination, Team } from '../types';
import { 
  Sparkles, 
  Users, 
  Target, 
  ShieldCheck, 
  Zap, 
  Check, 
  Plus, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Briefcase, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';

interface AiTeamCombinerProps {
  allAuthors: Author[];
  currentUser: Author | null;
  onRefreshTeams: () => void;
  onOpenTeamSlug?: (slug: string) => void;
}

export const AiTeamCombiner: React.FC<AiTeamCombinerProps> = ({
  allAuthors,
  currentUser,
  onRefreshTeams,
  onOpenTeamSlug
}) => {
  const [mode, setMode] = useState<'project' | 'permanent'>('project');
  const [projectRequirements, setProjectRequirements] = useState<string>(
    'Build an agentic Gemini 2.5 Flash pipeline with Web3 SIWE verification and luxury design tokens.'
  );
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>(
    allAuthors.map(a => a.username)
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiTeamCombination | null>(null);
  const [savedSuccessSlug, setSavedSuccessSlug] = useState<string | null>(null);

  const presets = [
    {
      title: 'Agentic AI & Web3 Verification',
      prompt: 'Build an autonomous Gemini 2.5 Flash agentic workflow paired with Web3 Base Mainnet SIWE proof signatures.'
    },
    {
      title: 'Full-Stack Express & CLI Ingestion',
      prompt: 'Deploy high-throughput Node.js/Express server routes, referral-gated registration, and CLI automation sync.'
    },
    {
      title: 'Design System & Flickr Media Pipeline',
      prompt: 'Architect precision typography ratios, micro-interactions, and Flickr high-resolution photo set showcases.'
    }
  ];

  const handleToggleAuthor = (username: string) => {
    setSelectedUsernames(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const handleSynthesize = async () => {
    setIsLoading(true);
    setSavedSuccessSlug(null);

    try {
      const res = await fetch('/api/ai/combine-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          projectRequirements,
          selectedAuthorUsernames: selectedUsernames
        })
      });

      const data = await res.json();
      setAiResult(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error synthesizing AI team:', err);
      setIsLoading(false);
    }
  };

  const handleSaveAsPermanentTeam = async () => {
    if (!aiResult || !currentUser) return;

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: aiResult.teamName,
          descriptionMarkdown: `# ${aiResult.teamName}\n\n${aiResult.rationale}\n\n### AI Recommended Roles\n${aiResult.roles.map(r => `- **@${r.authorUsername}**: ${r.recommendedRole} — *${r.contributionSummary}*`).join('\n')}`,
          ownerUsername: currentUser.username
        })
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccessSlug(data.team.slug);
        onRefreshTeams();
        if (onOpenTeamSlug) {
          onOpenTeamSlug(data.team.slug);
        }
      }
    } catch (err) {
      console.error('Error saving team:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[11px] font-mono font-bold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>GEMINI AI TEAM SYNTHESIZER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            AI Squad & Guild Combining Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyze author skill matrices, verified source portfolios, and integration capabilities to synthesize high-performance cross-functional teams.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('project')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'project'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Per Project Squad</span>
          </button>
          <button
            onClick={() => setMode('permanent')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'permanent'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Permanent Guild</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Brief / Goal Form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
              {mode === 'project' ? 'Project Requirements / Brief' : 'Guild Mission & Capabilities Focus'}
            </label>
            <textarea
              rows={3}
              value={projectRequirements}
              onChange={e => setProjectRequirements(e.target.value)}
              placeholder="Describe the target project goals or skill requirements..."
              className="w-full p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
            />
          </div>

          {/* Presets Row */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block mb-2 font-bold uppercase">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setProjectRequirements(p.prompt)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Author Selection Column */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <span>AVAILABLE AUTHORS ({selectedUsernames.length}/{allAuthors.length})</span>
            <button
              onClick={() => setSelectedUsernames(allAuthors.map(a => a.username))}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Select All
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {allAuthors.map(author => {
              const isSelected = selectedUsernames.includes(author.username);
              return (
                <div
                  key={author.id}
                  onClick={() => handleToggleAuthor(author.username)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-blue-500 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={author.avatarUrl}
                      alt={author.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-semibold block leading-none">{author.displayName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">@{author.username}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Synthesize Button */}
      <div className="pt-2">
        <button
          onClick={handleSynthesize}
          disabled={isLoading || selectedUsernames.length === 0}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
              <span>Analyzing Author Portfolios & Synthesizing Team...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Synthesize AI Team & Role Assignments</span>
            </>
          )}
        </button>
      </div>

      {/* AI Synthesis Result Card */}
      {aiResult && (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-fadeIn">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 dark:text-blue-600 mb-1">
                <span>AI SYNTHESIS COMPLETE</span>
                <span>•</span>
                <span className="uppercase font-semibold">{aiResult.mode} MODE</span>
              </div>
              <h3 className="text-xl font-bold font-mono">{aiResult.teamName}</h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-center font-mono">
                <div className="text-2xl font-bold text-emerald-400 dark:text-emerald-600">{aiResult.synergyScore}%</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600">Synergy Score</div>
              </div>

              {currentUser && (
                <button
                  onClick={handleSaveAsPermanentTeam}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Form Permanent Team Group</span>
                </button>
              )}
            </div>
          </div>

          {savedSuccessSlug && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center justify-between">
              <span>✔ Successfully formed permanent team group: /team/{savedSuccessSlug}</span>
            </div>
          )}

          {/* Rationale Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <h4 className="text-xs font-bold font-mono uppercase text-slate-400 dark:text-slate-400 tracking-wider">
              AI Team Rationale & Compatibility
            </h4>
            <div className="prose dark:prose-invert max-w-none text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiResult.rationale}
              </ReactMarkdown>
            </div>
          </div>

          {/* Assigned Roles Grid */}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-4">
              Recommended Role Assignments ({aiResult.roles.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiResult.roles.map((r, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatarUrl}
                      alt={r.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.displayName}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">@{r.authorUsername}</span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold">
                    {r.recommendedRole}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {r.contributionSummary}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {r.keySkills.map((sk, skIdx) => (
                      <span
                        key={skIdx}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Milestones */}
          {aiResult.suggestedMilestones && aiResult.suggestedMilestones.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-400 dark:text-slate-400 tracking-wider mb-2">
                Suggested Squad Execution Milestones
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                {aiResult.suggestedMilestones.map((m, mIdx) => (
                  <li key={mIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
