import React, { useState } from 'react';
import { Author, Team, PortfolioItem } from '../types';
import { 
  Edit3, 
  Check, 
  Eye, 
  Share2, 
  ExternalLink, 
  Github, 
  FileCode, 
  FileText, 
  Youtube, 
  MessageSquare, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Send, 
  Copy, 
  X, 
  ChevronRight,
  Sliders
} from 'lucide-react';

interface PromoWhitePageProps {
  allAuthors: Author[];
  allTeams: Team[];
  allPortfolioItems: PortfolioItem[];
  onBackToApp?: () => void;
}

export const PromoWhitePage: React.FC<PromoWhitePageProps> = ({
  allAuthors,
  allTeams,
  allPortfolioItems,
  onBackToApp
}) => {
  // Selected entity to promote (Author or Team)
  const [targetType, setTargetType] = useState<'author' | 'team'>('author');
  const [selectedAuthorUsername, setSelectedAuthorUsername] = useState<string>(
    allAuthors[0]?.username || 'alex_chen'
  );
  const [selectedTeamSlug, setSelectedTeamSlug] = useState<string>(
    allTeams[0]?.slug || 'ai-agent-squad'
  );

  // Editable Page Configuration
  const [editMode, setEditMode] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Customizable Titles & Footers
  const [brandLogoText, setBrandLogoText] = useState<string>('ALEX CHEN & SQUAD');
  const [heroBadgeText, setHeroBadgeText] = useState<string>('PORTFOLIO & SPECIALTY SHOWCASE');
  const [heroTitle, setHeroTitle] = useState<string>('Autonomous AI Architect & Full-Stack Systems Engineer');
  const [heroSubtitle, setHeroSubtitle] = useState<string>(
    'Pioneering agentic workflows, Gemini multimodal notebook integrations, and high-assurance verifiable Web3 architectures.'
  );
  
  const [aboutSectionTitle, setAboutSectionTitle] = useState<string>('Engineering Philosophy & Expertise');
  const [aboutSectionBody, setAboutSectionBody] = useState<string>(
    'Dedicated to engineering robust, performant software systems that bridge cutting-edge artificial intelligence models with zero-trust backend infrastructure and refined user experiences.'
  );

  const [portfolioSectionTitle, setPortfolioSectionTitle] = useState<string>('Verified Work & Key Artifacts');
  const [portfolioSectionSubtitle, setPortfolioSectionSubtitle] = useState<string>(
    'A curated selection of live production codebases, research notebooks, and architectural design docs.'
  );

  const [contactSectionTitle, setContactSectionTitle] = useState<string>('Direct Inquiries & Collaboration');
  const [contactCtaButtonText, setContactCtaButtonText] = useState<string>('Request Technical Consultation');
  const [contactEmail, setContactEmail] = useState<string>('contact@alexchen-ai.dev');

  const [footerTitle, setFooterTitle] = useState<string>('ALEX CHEN ENGINEERING LABS');
  const [footerCopyright, setFooterCopyright] = useState<string>(
    '© 2026 Alex Chen. All rights reserved. Independent publication.'
  );
  const [footerSubtext, setFooterSubtext] = useState<string>(
    'Built with high-precision design standards and verified open technology.'
  );

  // Get active target data
  const currentAuthor = allAuthors.find(a => a.username === selectedAuthorUsername) || allAuthors[0];
  const currentTeam = allTeams.find(t => t.slug === selectedTeamSlug) || allTeams[0];

  const promotedItems = targetType === 'author'
    ? allPortfolioItems.filter(item => item.authorUsername === currentAuthor?.username)
    : allPortfolioItems;

  const handleCopyPromoUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white transition-colors">
      
      {/* Floating Toolbar for Editing vs Pure Presentation Mode */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900/95 text-white p-2 rounded-full shadow-2xl border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
            editMode ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {editMode ? <Sliders className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{editMode ? 'Customize Page Settings' : 'Live Preview View'}</span>
        </button>

        <button
          onClick={handleCopyPromoUrl}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Share Promo Page Link"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="px-3.5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Exit Promo</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Editor Panel Drawer (When Edit Mode is Active) */}
      {editMode && (
        <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8 animate-fadeIn">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">
                  White Page Editor & Content Customizer
                </h3>
              </div>
              <button
                onClick={() => setEditMode(false)}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer font-mono"
              >
                Hide Customizer & View Clean Page →
              </button>
            </div>

            {/* Target Entity Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 mb-1">
                  Promote Target Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTargetType('author')}
                    className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer ${
                      targetType === 'author' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Individual Author
                  </button>
                  <button
                    onClick={() => setTargetType('team')}
                    className={`px-3 py-1.5 rounded text-xs font-bold cursor-pointer ${
                      targetType === 'team' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Team / Squad Group
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 mb-1">
                  {targetType === 'author' ? 'Select Featured Author' : 'Select Featured Team'}
                </label>
                {targetType === 'author' ? (
                  <select
                    value={selectedAuthorUsername}
                    onChange={e => setSelectedAuthorUsername(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                  >
                    {allAuthors.map(a => (
                      <option key={a.id} value={a.username}>
                        {a.displayName} (@{a.username}) — {a.role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedTeamSlug}
                    onChange={e => setSelectedTeamSlug(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                  >
                    {allTeams.map(t => (
                      <option key={t.id} value={t.slug}>
                        {t.name} (Owned by @{t.ownerUsername})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Field Editing Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Brand Logo Header</label>
                <input
                  type="text"
                  value={brandLogoText}
                  onChange={e => setBrandLogoText(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Hero Eyebrow Badge</label>
                <input
                  type="text"
                  value={heroBadgeText}
                  onChange={e => setHeroBadgeText(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Hero Headline Title</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={e => setHeroTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={e => setHeroSubtitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={contactCtaButtonText}
                  onChange={e => setContactCtaButtonText(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Footer Brand Title</label>
                <input
                  type="text"
                  value={footerTitle}
                  onChange={e => setFooterTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={e => setFooterCopyright(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STANDALONE PRISTINE WHITE PAGE PRESENTATION VIEW */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-16 space-y-20">

        {/* Header Navigation Bar (Zero Portal Mentions) */}
        <header className="flex items-center justify-between pb-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center">
              {brandLogoText.charAt(0) || 'A'}
            </div>
            <span className="font-mono font-bold text-sm tracking-tight text-slate-900">
              {brandLogoText}
            </span>
          </div>

          <nav className="flex items-center gap-6 text-xs font-mono text-slate-600">
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#work" className="hover:text-slate-900 transition-colors">Artifacts</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{heroBadgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] font-sans">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-3xl">
            {heroSubtitle}
          </p>

          {/* Featured Target Info Badge */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {targetType === 'author' && currentAuthor && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <img
                  src={currentAuthor.avatarUrl}
                  alt={currentAuthor.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-300"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{currentAuthor.displayName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{currentAuthor.role}</p>
                </div>
              </div>
            )}

            {targetType === 'team' && currentTeam && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-mono text-slate-500 font-bold uppercase">FEATURED TEAM SQUAD</div>
                <h3 className="text-base font-bold text-slate-900">{currentTeam.name}</h3>
              </div>
            )}

            <a
              href="#contact"
              className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide shadow-md transition-all flex items-center gap-2"
            >
              <span>{contactCtaButtonText}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Philosophy & Overview Section */}
        <section id="about" className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              {aboutSectionTitle}
            </h2>
          </div>
          <div className="md:col-span-2 space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>{aboutSectionBody}</p>
            {targetType === 'author' && currentAuthor?.bioMarkdown && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                {currentAuthor.bioMarkdown}
              </div>
            )}
          </div>
        </section>

        {/* Featured Portfolio Artifacts Grid */}
        <section id="work" className="space-y-8 pt-8 border-t border-slate-100">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">
              {portfolioSectionTitle}
            </h2>
            <p className="text-sm text-slate-600 font-sans">
              {portfolioSectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotedItems.map(item => (
              <div
                key={item.id}
                className="p-6 rounded-xl border border-slate-200 hover:border-slate-400 bg-white shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="uppercase font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      {item.sourcePlatform}
                    </span>
                    {item.isAuthorOwner && (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Owner
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tg, idx) => (
                      <span key={idx} className="text-[10px] text-slate-500">#{tg}</span>
                    ))}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA Block */}
        <section id="contact" className="p-8 sm:p-12 rounded-2xl bg-slate-900 text-white space-y-6 shadow-xl">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight">
              {contactSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Available for high-stakes technical advisory, autonomous agent design, and full-stack software architecture engagements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <a
              href={`mailto:${contactEmail}`}
              className="px-6 py-3 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>{contactEmail}</span>
            </a>

            <span className="text-xs font-mono text-slate-400">
              Response SLA: Under 24 Business Hours
            </span>
          </div>
        </section>

        {/* Footer (Zero Portal Mentions, Completely Customizable) */}
        <footer className="pt-12 border-t border-slate-200 space-y-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
            <div>
              <span className="font-bold text-slate-900 block">{footerTitle}</span>
              <span>{footerCopyright}</span>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-400">{footerSubtext}</p>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};
