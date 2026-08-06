import { Author, PortfolioEntity, CachedEntityComparison } from '../types';
import { getForkedEm } from './mikroDb';
import { authorSchema } from '../entities/AuthorEntity';
import { portfolioMemorySchema } from '../entities/PortfolioMemoryEntity';
import { comparisonMatrixSchema } from '../entities/ComparisonMatrixEntity';

/**
 * Finds an Author profile using MikroORM EntityManager (em) and IdentityMap L1 cache.
 * Resolves by exact username match or contact methods / integration email match using native em queries.
 */
export async function findAuthorByUsernameOrEmail(username?: string, email?: string): Promise<Author | undefined> {
  const safeUser = username?.trim().toLowerCase();
  const safeEmail = email?.trim().toLowerCase();

  if (!safeUser && !safeEmail) {
    return undefined;
  }

  try {
    const em = getForkedEm();
    const isMongo = em.getDriver()?.constructor?.name?.includes('Mongo') ?? false;

    if (isMongo) {
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const ciFilter = (val: string) => new RegExp(`^${escapeRegex(val)}$`, 'i');
      const queryFilters: any[] = [];

      if (safeUser) {
        queryFilters.push({ username: ciFilter(safeUser) });
      }

      if (safeEmail) {
        queryFilters.push({
          contactMethods: {
            $elemMatch: {
              platform: 'email',
              value: ciFilter(safeEmail)
            }
          }
        });
        queryFilters.push({
          integrations: {
            $elemMatch: {
              'metadata.email': ciFilter(safeEmail)
            }
          }
        });
      }

      const author = await em.findOne(authorSchema, { $or: queryFilters });
      if (author) return author as Author;
    } else {
      // SQL / SQLite Driver
      const authors = await em.find(authorSchema, {});
      const matched = authors.find(a => {
        if (safeUser && a.username.toLowerCase() === safeUser) return true;
        if (safeEmail) {
          const hasEmailInContact = a.contactMethods?.some(c => c.value?.toLowerCase() === safeEmail);
          if (hasEmailInContact) return true;
          const hasEmailInIntegration = a.integrations?.some(i => i.metadata?.email?.toLowerCase() === safeEmail);
          if (hasEmailInIntegration) return true;
        }
        return false;
      });

      if (matched) return matched as Author;
    }
  } catch (err) {
    console.warn('ℹ️ [MikroORM] em.findOne query info:', err);
  }

  return undefined;
}

/**
 * Upserts an Author account from GitHub OAuth callback payload.
 * Creates a new author if non-existent, or links/updates GitHub integration if matching author is found.
 */
export async function upsertAuthorFromGithubOAuth(
  githubUser: { login?: string; name?: string; avatar_url?: string; email?: string },
  accessToken: string
): Promise<{ author: Author; isNewUser: boolean }> {
  const userEmail = githubUser.email;
  const safeUsername = (githubUser.login || 'alex_chen').toLowerCase().replace(/[^a-z0-9_]/g, '');
  let isNewUser = false;

  const em = getForkedEm();
  let existingAuthor = await findAuthorByUsernameOrEmail(safeUsername, userEmail);

  if (!existingAuthor) {
    isNewUser = true;
    existingAuthor = {
      id: `usr_${safeUsername}`,
      username: safeUsername,
      displayName: githubUser.name || safeUsername,
      avatarUrl: githubUser.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bioMarkdown: `# ${githubUser.name || safeUsername}\n\nAuthenticated via **Direct GitHub OAuth 2.0**.`,
      role: 'Verified Author',
      createdAt: new Date().toISOString(),
      integrations: [
        { provider: 'github', providerUserId: safeUsername, metadata: { username: safeUsername, email: userEmail, accessToken } }
      ],
      contactMethods: [
        { platform: 'email', value: userEmail || `${safeUsername}@workspace.dev`, isPublic: true }
      ]
    };

    const authorEnt = em.create(authorSchema, { ...existingAuthor, _id: existingAuthor.id });
    em.persist(authorEnt);
    await em.flush();

    console.log(`👤 [OAuth Callback] Created NEW author account "@${safeUsername}" (${userEmail || 'no email'}).`);
  } else {
    console.log(`🔗 [OAuth Callback] Matched EXISTING author "@${existingAuthor.username}" via email/username (${userEmail || safeUsername}). Linking GitHub provider...`);
    const existingIntegration = existingAuthor.integrations.find(i => i.provider === 'github');
    if (!existingIntegration) {
      existingAuthor.integrations.push({
        provider: 'github',
        providerUserId: safeUsername,
        metadata: { username: safeUsername, email: userEmail, accessToken }
      });
    } else {
      existingIntegration.metadata = { ...existingIntegration.metadata, accessToken, email: userEmail };
    }
    await em.flush();
  }

  return { author: existingAuthor, isNewUser };
}

/**
 * Generate deterministic, commutative comparison key
 */
export function generateComparisonKey(entityAId: string, entityBId: string): string {
  const sorted = [entityAId.trim(), entityBId.trim()].sort();
  return `cmp_${sorted[0]}__vs__${sorted[1]}`;
}

/**
 * Save or update a Portfolio Entity directly in MikroORM DB
 */
export async function savePortfolioEntity(entity: PortfolioEntity): Promise<PortfolioEntity> {
  const entityId = entity.id;
  const now = new Date().toISOString();
  const updatedEntity: PortfolioEntity = {
    ...entity,
    updatedAt: now
  };

  try {
    const em = getForkedEm();
    const existing = await em.findOne(portfolioMemorySchema, { _id: entityId });
    if (existing) {
      em.assign(existing, updatedEntity as any);
    } else {
      const ent = em.create(portfolioMemorySchema, { ...updatedEntity, _id: entityId } as any);
      em.persist(ent);
    }
    await em.flush();
  } catch (err) {
    console.warn(`ℹ️ [EntityMemory] MikroORM persist notice for ${entityId}:`, err);
  }

  console.log(`💾 [EntityMemory MikroORM] Saved entity "${entity.title}" (${entity.entityType}) for @${entity.authorUsername}`);
  return updatedEntity;
}

/**
 * Retrieve a Portfolio Entity directly from MikroORM DB
 */
export async function getPortfolioEntity(entityId: string): Promise<PortfolioEntity | null> {
  try {
    const em = getForkedEm();
    const hit = await em.findOne(portfolioMemorySchema, { _id: entityId });
    if (hit) {
      return hit as any;
    }
  } catch (err) {}

  return null;
}

/**
 * Retrieve all Portfolio Entities for an author directly from MikroORM DB
 */
export async function getPortfolioEntitiesByAuthor(authorIdOrUsername: string): Promise<PortfolioEntity[]> {
  try {
    const em = getForkedEm();
    const byId = await em.find(portfolioMemorySchema, { authorId: authorIdOrUsername });
    if (byId.length > 0) return byId as any[];
    const byUser = await em.find(portfolioMemorySchema, { authorUsername: authorIdOrUsername });
    return byUser as any[];
  } catch (err) {
    return [];
  }
}

/**
 * Retrieve cached entity comparison matrix directly from MikroORM DB
 */
export async function getCachedComparison(keyOrIdA: string, idB?: string): Promise<CachedEntityComparison | null> {
  const comparisonKey = idB ? generateComparisonKey(keyOrIdA, idB) : keyOrIdA;

  try {
    const em = getForkedEm();
    const hit = await em.findOne(comparisonMatrixSchema, { _id: comparisonKey });
    if (hit) {
      return hit as any;
    }
  } catch (err) {}

  return null;
}

/**
 * Save cross-entity comparison matrix directly to MikroORM DB
 */
export async function saveCachedComparison(doc: CachedEntityComparison): Promise<CachedEntityComparison> {
  const comparisonKey = doc.id;

  try {
    const em = getForkedEm();
    const existing = await em.findOne(comparisonMatrixSchema, { _id: comparisonKey });
    if (existing) {
      em.assign(existing, doc as any);
    } else {
      const ent = em.create(comparisonMatrixSchema, { ...doc, _id: comparisonKey } as any);
      em.persist(ent);
    }
    await em.flush();
  } catch (err) {
    console.warn(`ℹ️ [EntityMemory] MikroORM persist notice for matrix ${comparisonKey}:`, err);
  }

  console.log(`💾 [EntityMemory MikroORM] Saved comparison matrix between ${doc.entityAId} vs ${doc.entityBId} (Score: ${doc.matchScore}/100)`);
  return doc;
}
