import { EntitySchema } from '@mikro-orm/core';

export class ComparisonMatrixEntity {
  _id!: string; // Key format: cmp_<entityAId>__vs__<entityBId>
  id!: string;
  entityAId!: string;
  entityBId!: string;
  matchScore!: number;
  skillOverlap: string[] = [];
  skillGaps: string[] = [];
  conditionMatches: string[] = [];
  conditionMismatches: string[] = [];
  detailedRationale!: string;
  cachedAt: string = new Date().toISOString();
}

export const comparisonMatrixSchema = new EntitySchema<ComparisonMatrixEntity>({
  class: ComparisonMatrixEntity,
  collection: 'comparison_matrices',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    entityAId: { type: 'string' },
    entityBId: { type: 'string' },
    matchScore: { type: 'number' },
    skillOverlap: { type: 'json' },
    skillGaps: { type: 'json' },
    conditionMatches: { type: 'json' },
    conditionMismatches: { type: 'json' },
    detailedRationale: { type: 'string' },
    cachedAt: { type: 'string' }
  }
});
