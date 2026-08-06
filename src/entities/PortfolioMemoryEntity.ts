import { EntitySchema } from '@mikro-orm/core';

export class PortfolioMemoryEntity {
  _id!: string;
  id!: string;
  entityType!: string;
  authorId!: string;
  authorUsername!: string;
  title!: string;
  contentRaw!: string;
  extractedSkills!: any;
  conditions?: any;
  updatedAt: string = new Date().toISOString();
}

export const portfolioMemorySchema = new EntitySchema<PortfolioMemoryEntity>({
  class: PortfolioMemoryEntity,
  collection: 'portfolio_entities',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    entityType: { type: 'string' },
    authorId: { type: 'string' },
    authorUsername: { type: 'string' },
    title: { type: 'string' },
    contentRaw: { type: 'string' },
    extractedSkills: { type: 'json' },
    conditions: { type: 'json', nullable: true },
    updatedAt: { type: 'string' }
  }
});
