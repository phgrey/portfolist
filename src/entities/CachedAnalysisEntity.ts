import { EntitySchema } from '@mikro-orm/core';

export class CachedAnalysisEntity {
  _id!: string;
  id!: string;
  cacheKey!: string;
  repoList: string[] = [];
  result!: any;
  cachedAt: string = new Date().toISOString();
}

export const cachedAnalysisSchema = new EntitySchema<CachedAnalysisEntity>({
  class: CachedAnalysisEntity,
  collection: 'cached_analyses',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    cacheKey: { type: 'string' },
    repoList: { type: 'json' },
    result: { type: 'json' },
    cachedAt: { type: 'string' }
  }
});
