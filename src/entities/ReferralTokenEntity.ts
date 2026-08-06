import { EntitySchema } from '@mikro-orm/core';

export class ReferralTokenEntity {
  _id!: string;
  id!: string;
  code!: string;
  referrerId!: string;
  referrerUsername!: string;
  maxUses: number = 5;
  usesCount: number = 0;
  expiresAt!: string;
  createdAt: string = new Date().toISOString();
}

export const referralTokenSchema = new EntitySchema<ReferralTokenEntity>({
  class: ReferralTokenEntity,
  collection: 'referral_tokens',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    code: { type: 'string' },
    referrerId: { type: 'string' },
    referrerUsername: { type: 'string' },
    maxUses: { type: 'number', default: 5 },
    usesCount: { type: 'number', default: 0 },
    expiresAt: { type: 'string' },
    createdAt: { type: 'string' }
  }
});
