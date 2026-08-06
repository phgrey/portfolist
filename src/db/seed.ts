import { Author, ReferralToken, Team, PortfolioItem } from '../types';

export function getInitialDbState() {
  return {
    authors: [
      {
        id: 'usr_alex_chen',
        username: 'alex_chen',
        displayName: 'Alex Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bioMarkdown: `# Alex Chen — Lead AI Systems & Data Researcher

Building agentic intelligence pipelines, Gemini Notebook automation, and multi-tenant developer toolings.

### Core Focus
- **Agentic AI**: Gemini 2.5 Flash & Pro SDK integrations, tool calling, multi-modal pipelines.
- **Data Engineering**: Distributed ingestion, GraphQL endpoints, CLI automation.
- **Open Source**: Maintainer of \`gemini-agentic-workflow\` and contributor to collective developer tooling.

> "True craftsmanship in software is about simple, composable tools that empower collective teams."`,
        role: 'Staff AI Engineer',
        createdAt: '2026-01-15T10:00:00Z',
        integrations: [
          { provider: 'github', providerUserId: 'alexchen-ai', metadata: { username: 'alexchen-ai', orgs: ['quantum-guild', 'google-devs'] } },
          { provider: 'google', providerUserId: 'alex.chen@workspace.dev', metadata: { username: 'alex.chen', email: 'alex.chen@workspace.dev' } },
          { provider: 'youtube', providerUserId: 'UC_alex_chen_dev', metadata: { username: 'AlexChenTech', channelId: 'UC_alex_chen_dev' } },
          { provider: 'reddit', providerUserId: 'u/alex_chen_ai', metadata: { username: 'alex_chen_ai' } },
          { provider: 'discord', providerUserId: 'alex_chen#1337', metadata: { username: 'alex_chen#1337' } }
        ],
        contactMethods: [
          { platform: 'discord', value: 'alex_chen#1337', isPublic: true },
          { platform: 'x', value: '@alexchen_ai', isPublic: true },
          { platform: 'telegram', value: 't.me/alexchen_dev', isPublic: true },
          { platform: 'email', value: 'alex.chen@workspace.dev', isPublic: true }
        ]
      },
      {
        id: 'usr_sarah_dev',
        username: 'sarah_dev',
        displayName: 'Sarah Jenkins',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        bioMarkdown: `# Sarah Jenkins — Fullstack & Web3 Architect

Specializing in high-throughput Express/Vite fullstack setups, smart contract verification, and decentralized data sync.

- **Stack**: React 19, TypeScript, Tailwind v4, Express, Viem/Wagmi, PostgreSQL.
- **Passions**: Zero-knowledge proof proofs, Web3 identity matrix, invite-only referral cryptography.`,
        role: 'Lead Systems Architect',
        createdAt: '2026-02-01T14:30:00Z',
        integrations: [
          { provider: 'github', providerUserId: 'sarahj-dev', metadata: { username: 'sarahj-dev' } },
          { provider: 'metamask', providerUserId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', metadata: { walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' } },
          { provider: 'twitter', providerUserId: 'sarahj_web3', metadata: { username: 'sarahj_web3' } }
        ],
        contactMethods: [
          { platform: 'whatsapp', value: '+1 (555) 019-2834', isPublic: true },
          { platform: 'discord', value: 'sarah_j#2026', isPublic: true }
        ]
      },
      {
        id: 'usr_marco_design',
        username: 'marco_design',
        displayName: 'Marco Rossi',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bioMarkdown: `# Marco Rossi — Lead Design Engineer & UX Architect

Crafting precision human-computer interfaces, design token architectures, and Flickr visual set showcases.

- Design Systems
- Typography Ratios & Micro-interactions
- Visual Asset Curation`,
        role: 'Principal UX Designer',
        createdAt: '2026-02-10T09:15:00Z',
        integrations: [
          { provider: 'flickr', providerUserId: 'marcorossi_photos', metadata: { username: 'marcorossi_photos' } },
          { provider: 'github', providerUserId: 'marcorossi-ui', metadata: { username: 'marcorossi-ui' } }
        ],
        contactMethods: [
          { platform: 'email', value: 'marco@collectivefolio.dev', isPublic: true },
          { platform: 'x', value: '@marcorossi_ui', isPublic: true }
        ]
      }
    ] as Author[],

    referralTokens: [
      {
        id: 'ref_001',
        code: 'INVITE_ALEX_2026',
        referrerId: 'usr_alex_chen',
        referrerUsername: 'alex_chen',
        maxUses: 5,
        usesCount: 2,
        expiresAt: '2026-12-31T23:59:59Z',
        createdAt: '2026-02-01T00:00:00Z'
      },
      {
        id: 'ref_002',
        code: 'INVITE_SARAH_ALPHA',
        referrerId: 'usr_sarah_dev',
        referrerUsername: 'sarah_dev',
        maxUses: 10,
        usesCount: 1,
        expiresAt: '2026-12-31T23:59:59Z',
        createdAt: '2026-02-05T00:00:00Z'
      }
    ] as ReferralToken[],

    teams: [
      {
        id: 'team_quantum',
        name: 'Quantum AI Intelligence Guild',
        slug: 'quantum-ai-guild',
        descriptionMarkdown: `# Quantum AI Intelligence Guild

A collective of AI researchers, data engineers, and fullstack architects building agentic tools with Gemini and distributed systems.

### Collective Mission
1. Deliver open-source Gemini notebook benchmarks and agentic execution tools.
2. Maintain shared portfolio feeds for peer review and referral-gated membership.
3. Integrate Google Workspace, GitHub Orgs, and CLI ingestion pipelines.`,
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        members: [
          { authorId: 'usr_alex_chen', username: 'alex_chen', displayName: 'Alex Chen', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'owner' },
          { authorId: 'usr_sarah_dev', username: 'sarah_dev', displayName: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'member' }
        ],
        createdAt: '2026-02-01T12:00:00Z'
      },
      {
        id: 'team_web3_design',
        name: 'Creative Systems & Web3 Collective',
        slug: 'creative-web3-collective',
        descriptionMarkdown: `# Creative Systems & Web3 Collective

Merging luxury visual design systems with Web3 cryptographic verification and Flickr asset pipelines.`,
        avatarUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
        members: [
          { authorId: 'usr_sarah_dev', username: 'sarah_dev', displayName: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'owner' },
          { authorId: 'usr_marco_design', username: 'marco_design', displayName: 'Marco Rossi', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', role: 'member' }
        ],
        createdAt: '2026-02-08T16:00:00Z'
      }
    ] as Team[],

    portfolioItems: [
      {
        id: 'item_gemini_nb_01',
        authorId: 'usr_alex_chen',
        authorUsername: 'alex_chen',
        authorDisplayName: 'Alex Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'gemini',
        externalId: 'nb_gemini_vision_2026',
        title: 'Multi-Modal Gemini Vision & Embeddings Pipeline',
        description: 'Interactive Jupyter Notebook benchmarking Gemini 2.5 Flash multimodal embeddings and agentic tool-use routines.',
        url: 'https://colab.research.google.com/drive/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        isFeatured: true,
        syncedAt: '2026-08-01T10:00:00Z',
        tags: ['Gemini AI', 'Notebook', 'Python', 'Embeddings', 'Agentic'],
        contentPayload: {
          language: 'python',
          bodyMarkdown: 'Calculated 1,000 vector embeddings per second using @google/genai SDK in Gemini Notebook environment.',
          cells: [
            {
              cell_type: 'markdown',
              source: [
                '# Gemini 2.5 Multimodal Embeddings & Tool Calling Benchmark\n',
                'This notebook demonstrates initializing the `@google/genai` Python client, parsing multi-modal images and text documents, and executing function calling loops.'
              ]
            },
            {
              cell_type: 'code',
              execution_count: 1,
              source: [
                'import google.genai as genai\n',
                'from google.genai import types\n',
                'import os\n\n',
                'client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))\n',
                'response = client.models.generate_content(\n',
                '    model="gemini-2.5-flash",\n',
                '    contents="Analyze the architecture of a multi-tenant referral portfolio system."\n',
                ')\n',
                'print(f"Gemini Analysis Summary:\\n{response.text}")'
              ],
              outputs: [
                {
                  output_type: 'stream',
                  text: [
                    'Gemini Analysis Summary:\n',
                    'The architecture requires a referral verification middleware, PostgreSQL schema with JSONB payload storage, an Express endpoint for CLI ingestion, and interactive notebook rendering components.'
                  ]
                }
              ]
            },
            {
              cell_type: 'code',
              execution_count: 2,
              source: [
                '# Benchmark embedding calculation speed\n',
                'import time\n',
                't0 = time.time()\n',
                'embedding = client.models.embed_content(\n',
                '    model="text-embedding-004",\n',
                '    contents=["Referral-only user registration with cryptographic invite tokens"]\n',
                ')\n',
                'print(f"Embedding dimension: {len(embedding.embeddings[0].values)}, latency: {round((time.time() - t0)*1000, 2)}ms")'
              ],
              outputs: [
                {
                  output_type: 'stream',
                  text: [
                    'Embedding dimension: 768, latency: 42.15ms'
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        id: 'item_github_01',
        authorId: 'usr_alex_chen',
        authorUsername: 'alex_chen',
        authorDisplayName: 'Alex Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'github',
        externalId: 'repo_gemini_agentic_workflow',
        title: 'gemini-agentic-workflow',
        description: 'Autonomous agentic workflow engine built with Node.js, Express, and Google GenAI SDK for structured multi-step tasks.',
        url: 'https://github.com/alexchen-ai/gemini-agentic-workflow',
        isFeatured: true,
        syncedAt: '2026-08-02T11:20:00Z',
        tags: ['GitHub', 'TypeScript', 'Express', 'Gemini API', 'Open Source'],
        contentPayload: {
          stars: 428,
          forks: 64,
          topics: ['gemini-api', 'typescript', 'agentic-ai', 'express', 'automation'],
          bodyMarkdown: 'Full-stack framework for orchestration of Gemini models with streaming responses, tool calling, and background task scheduling.'
        }
      },
      {
        id: 'item_gdoc_01',
        authorId: 'usr_alex_chen',
        authorUsername: 'alex_chen',
        authorDisplayName: 'Alex Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'gdoc',
        externalId: 'doc_arch_proposal_2026',
        title: 'System Design: Referral-Gated Ingestion Framework',
        description: 'Google Drive Document outlining the zero-trust referral check, OAuth token refresh lifecycle, and CLI ingestion matrix.',
        url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
        isFeatured: false,
        syncedAt: '2026-08-03T08:15:00Z',
        tags: ['Google Docs', 'Architecture', 'System Design', 'Security'],
        contentPayload: {
          documentId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          wordCount: 1420,
          bodyMarkdown: `# Architectural Proposal: Referral-Gated Collective System\n\n## 1. Executive Summary\nThis document defines the zero-trust referral architecture for the Collective Portfolio System.\n\n## 2. Security Boundaries\n- **Public Visitors**: Unauthenticated visitors can view public author pages, team showcases, and social share intents.`
        }
      },
      {
        id: 'item_youtube_01',
        authorId: 'usr_alex_chen',
        authorUsername: 'alex_chen',
        authorDisplayName: 'Alex Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'youtube',
        externalId: 'yt_vid_gemini_25_guide',
        title: 'Building Agentic Workflows with Gemini 2.5 & Express',
        description: 'Comprehensive video breakdown of structuring Gemini API integrations in full-stack Node.js server architectures.',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isFeatured: true,
        syncedAt: '2026-07-28T16:00:00Z',
        tags: ['YouTube', 'Video Guide', 'Gemini 2.5', 'Tutorial'],
        contentPayload: {
          videoId: 'dQw4w9WgXcQ',
          duration: '18:42',
          views: 12450
        }
      },
      {
        id: 'item_reddit_01',
        authorId: 'usr_alex_chen',
        authorUsername: 'alex_chen',
        authorDisplayName: 'Alex Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'reddit',
        externalId: 'reddit_post_collective_arch',
        title: 'Architecture of an Invite-Only Collective Portfolio System on r/webdev',
        description: 'Reddit post discussing database schemas, multi-tenant team grouping, and Jupyter Notebook parsing algorithms.',
        url: 'https://reddit.com/r/webdev/comments/collective_portfolio_arch',
        isFeatured: false,
        syncedAt: '2026-07-30T19:22:00Z',
        tags: ['Reddit', 'r/webdev', 'Showcase', 'System Design'],
        contentPayload: {
          subreddit: 'r/webdev',
          upvotes: 382,
          commentsCount: 94
        }
      },
      {
        id: 'item_metamask_01',
        authorId: 'usr_sarah_dev',
        authorUsername: 'sarah_dev',
        authorDisplayName: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'metamask',
        externalId: 'nft_badge_proof_0x1337',
        title: 'Verified Senior Contributor Badge — Base Mainnet ERC-721',
        description: 'Cryptographic proof of authorship verified on Base Mainnet via SIWE / MetaMask wallet signature.',
        url: 'https://basescan.org/token/0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        isFeatured: true,
        syncedAt: '2026-08-01T09:10:00Z',
        tags: ['MetaMask', 'Web3', 'ERC-721', 'Base Chain', 'Proof of Work'],
        contentPayload: {
          contractAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          chain: 'Base Mainnet',
          nftImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'
        }
      },
      {
        id: 'item_flickr_01',
        authorId: 'usr_marco_design',
        authorUsername: 'marco_design',
        authorDisplayName: 'Marco Rossi',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        sourcePlatform: 'flickr',
        externalId: 'flickr_set_design_tokens',
        title: 'Design System Tokens & High-Res Micro-Interactions Album',
        description: 'Curated Flickr Photo Album featuring high-resolution UI component state breakdowns and layout grids.',
        url: 'https://flickr.com/photos/marcorossi_photos/sets/7215772026',
        isFeatured: true,
        syncedAt: '2026-08-02T15:40:00Z',
        tags: ['Flickr', 'Design Tokens', 'Photography', 'UI UX'],
        contentPayload: {
          photoCount: 18,
          images: [
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
          ]
        }
      }
    ] as PortfolioItem[]
  };
}
