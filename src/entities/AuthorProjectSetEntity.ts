import { EntitySchema } from '@mikro-orm/core';

export class AuthorProjectSetEntity {
  _id!: string;
  id!: string;
  authorId!: string;
  authorUsername!: string;
  setName!: string;
  repoList: string[] = [];
  isPublic: boolean = false;
  createdAt: string = new Date().toISOString();
  updatedAt: string = new Date().toISOString();
}

export const authorProjectSetSchema = new EntitySchema<AuthorProjectSetEntity>({
  class: AuthorProjectSetEntity,
  collection: 'author_project_sets',
  properties: {
    _id: { type: 'string', primary: true },
    id: { type: 'string' },
    authorId: { type: 'string' },
    authorUsername: { type: 'string' },
    setName: { type: 'string' },
    repoList: { type: 'json' },
    isPublic: { type: 'boolean' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
});
