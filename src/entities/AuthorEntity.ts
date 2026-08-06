import { EntitySchema } from '@mikro-orm/core';
import { AuthorIntegration, ContactMethod } from '../types';

export class AuthorEntity {
  _id!: string;
  id!: string;
  username!: string;
  displayName!: string;
  avatarUrl!: string;
  bioMarkdown!: string;
  role!: string;
  createdAt: string = new Date().toISOString();
  referredBy?: string;
  integrations: AuthorIntegration[] = [];
  contactMethods: ContactMethod[] = [];
}

export const authorSchema = new EntitySchema<AuthorEntity>({
  class: AuthorEntity,
  collection: 'authors',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    username: { type: 'string' },
    displayName: { type: 'string' },
    avatarUrl: { type: 'string' },
    bioMarkdown: { type: 'string' },
    role: { type: 'string' },
    createdAt: { type: 'string' },
    referredBy: { type: 'string', nullable: true },
    integrations: { type: 'json' },
    contactMethods: { type: 'json' }
  }
});
