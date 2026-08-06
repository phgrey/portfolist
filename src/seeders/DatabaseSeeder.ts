import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { authorSchema } from '../entities/AuthorEntity';
import { portfolioItemSchema } from '../entities/PortfolioItemEntity';
import { teamSchema } from '../entities/TeamEntity';
import { referralTokenSchema } from '../entities/ReferralTokenEntity';
import { getInitialDbState } from '../db/seed';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log(`🌱 [MikroORM DatabaseSeeder] Executing database seeder via MikroORM Seeder framework...`);
    const seed = getInitialDbState();

    const existingAuthorsCount = await em.count(authorSchema);
    if (existingAuthorsCount > 0) {
      console.log(`ℹ️ [MikroORM DatabaseSeeder] Database already populated (${existingAuthorsCount} authors found). Skipping seed insert.`);
      return;
    }

    for (const a of seed.authors) {
      const authorEnt = em.create(authorSchema, {
        _id: a.id,
        id: a.id,
        username: a.username,
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
        bioMarkdown: a.bioMarkdown,
        role: a.role,
        createdAt: a.createdAt,
        referredBy: a.referredBy,
        integrations: a.integrations,
        contactMethods: a.contactMethods
      });
      em.persist(authorEnt);
    }

    for (const item of seed.portfolioItems) {
      const itemEnt = em.create(portfolioItemSchema, {
        _id: item.id,
        id: item.id,
        authorId: item.authorId,
        authorUsername: item.authorUsername,
        authorDisplayName: item.authorDisplayName,
        authorAvatar: item.authorAvatar,
        sourcePlatform: item.sourcePlatform,
        externalId: item.externalId,
        title: item.title,
        description: item.description,
        url: item.url,
        isFeatured: item.isFeatured,
        syncedAt: item.syncedAt,
        tags: item.tags,
        contentPayload: item.contentPayload
      });
      em.persist(itemEnt);
    }

    for (const team of seed.teams) {
      const teamEnt = em.create(teamSchema, {
        _id: team.id,
        id: team.id,
        name: team.name,
        slug: team.slug,
        descriptionMarkdown: team.descriptionMarkdown,
        avatarUrl: team.avatarUrl,
        members: team.members,
        createdAt: team.createdAt
      });
      em.persist(teamEnt);
    }

    for (const token of seed.referralTokens) {
      const tokenEnt = em.create(referralTokenSchema, {
        _id: token.id,
        id: token.id,
        code: token.code,
        referrerId: token.referrerId,
        referrerUsername: token.referrerUsername,
        maxUses: token.maxUses,
        usesCount: token.usesCount,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt
      });
      em.persist(tokenEnt);
    }

    await em.flush();
    console.log(`✅ [MikroORM DatabaseSeeder] Successfully seeded database collections.`);
  }
}
