import { EntitySchema } from '@mikro-orm/core';
import { TeamMember } from '../types';

export class TeamEntity {
  _id!: string;
  id!: string;
  name!: string;
  slug!: string;
  descriptionMarkdown!: string;
  avatarUrl!: string;
  members: TeamMember[] = [];
  createdAt: string = new Date().toISOString();
}

export const teamSchema = new EntitySchema<TeamEntity>({
  class: TeamEntity,
  collection: 'teams',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    descriptionMarkdown: { type: 'string' },
    avatarUrl: { type: 'string' },
    members: { type: 'json' },
    createdAt: { type: 'string' }
  }
});
