import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Team, PortfolioItem, Author } from '../types';
import { PortfolioCard } from './PortfolioCard';
import { Users, Plus, UserPlus, Sparkles, Shield, ArrowRight, Check } from 'lucide-react';

interface TeamShowcaseProps {
  teams: Team[];
  portfolioItems: PortfolioItem[];
  currentUser: Author | null;
  onRefreshTeams: () => void;
  onOpenNotebook?: (item: PortfolioItem) => void;
  onOpenGDoc?: (item: PortfolioItem) => void;
  onOpenAuthor?: (username: string) => void;
}

export const TeamShowcase: React.FC<TeamShowcaseProps> = ({
  teams,
  portfolioItems,
  currentUser,
  onRefreshTeams,
  onOpenNotebook,
  onOpenGDoc,
  onOpenAuthor
}) => {
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string>(teams[0]?.slug || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

  const selectedTeam = teams.find(t => t.slug === selectedTeamSlug) || teams[0];

  const memberUsernames = selectedTeam?.members.map(m => m.username.toLowerCase()) || [];
  const teamItems = portfolioItems.filter(i => memberUsernames.includes(i.authorUsername.toLowerCase()));

  const isMember = selectedTeam?.members.some(m => m.username.toLowerCase() === currentUser?.username.toLowerCase());

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !currentUser) return;

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName.trim(),
          descriptionMarkdown: newTeamDescription.trim() || `# ${newTeamName}\n\nCollective portfolio feed for ${newTeamName}.`,
          ownerUsername: currentUser.username
        })
      });

      const data = await res.json();
      if (data.success) {
        onRefreshTeams();
        setSelectedTeamSlug(data.team.slug);
        setShowCreateModal(false);
        setNewTeamName('');
        setNewTeamDescription('');
      }
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  const handleJoinTeam = async () => {
    if (!currentUser || !selectedTeam) return;

    try {
      const res = await fetch(`/api/teams/${selectedTeam.slug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });

      const data = await res.json();
      if (data.success) {
        onRefreshTeams();
      }
    } catch (err) {
      console.error('Error joining team:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Team Selector Strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          {teams.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamSlug(t.slug)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTeamSlug === t.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.name}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${selectedTeamSlug === t.slug ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {t.members.length}
              </span>
            </button>
          ))}
        </div>

        {currentUser && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Form New Team Group</span>
          </button>
        )}
      </div>

      {/* Active Team Header */}
      {selectedTeam && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTeam.name}</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Slug: /team/{selectedTeam.slug}</p>
              </div>
            </div>

            {/* Members Roster Stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {selectedTeam.members.map((m, mIdx) => (
                  <img
                    key={mIdx}
                    src={m.avatarUrl}
                    alt={m.displayName}
                    title={`${m.displayName} (${m.role})`}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white border border-slate-200"
                  />
                ))}
              </div>

              {currentUser && !isMember && (
                <button
                  onClick={handleJoinTeam}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Team</span>
                </button>
              )}

              {isMember && (
                <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Joined</span>
                </span>
              )}
            </div>
          </div>

          {/* Team Markdown Description */}
          <div className="prose max-w-none bg-slate-50 p-5 rounded-lg border border-slate-200 text-xs text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selectedTeam.descriptionMarkdown}
            </ReactMarkdown>
          </div>

        </div>
      )}

      {/* Aggregated Team Feed */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>AGGREGATED TEAM SHOWCASE FEED ({teamItems.length})</span>
        </h3>

        {teamItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs shadow-sm">
            No portfolio items imported from team members yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamItems.map(item => (
              <PortfolioCard
                key={item.id}
                item={item}
                onOpenNotebook={onOpenNotebook}
                onOpenGDoc={onOpenGDoc}
                onOpenAuthor={onOpenAuthor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Form New Team Collective</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI Agents Guild"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description (Markdown)</label>
                <textarea
                  rows={4}
                  placeholder="# Guild Description..."
                  value={newTeamDescription}
                  onChange={e => setNewTeamDescription(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
