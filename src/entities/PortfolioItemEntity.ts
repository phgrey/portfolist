import { EntitySchema } from '@mikro-orm/core';
import { PlatformType } from '../types';

export class PortfolioItemEntity {
  _id!: string;
  id!: string;
  authorId!: string;
  authorUsername!: string;
  authorDisplayName!: string;
  authorAvatar!: string;
  sourcePlatform!: PlatformType;
  externalId!: string;
  title!: string;
  description!: string;
  url!: string;
  isFeatured: boolean = false;
  syncedAt: string = new Date().toISOString();
  tags: string[] = [];
  contentPayload?: Record<string, any>;
}

export const portfolioItemSchema = new EntitySchema<PortfolioItemEntity>({
  class: PortfolioItemEntity,
  collection: 'portfolio_items',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    authorId: { type: 'string' },
    authorUsername: { type: 'string' },
    authorDisplayName: { type: 'string' },
    authorAvatar: { type: 'string' },
    sourcePlatform: { type: 'string' },
    externalId: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    url: { type: 'string' },
    isFeatured: { type: 'boolean', default: false },
    syncedAt: { type: 'string' },
    tags: { type: 'json' },
    contentPayload: { type: 'json', nullable: true }
  }
});
