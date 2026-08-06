import { MikroORM, EntityManager } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import config from '../../mikro-orm.config';

let ormInstance: MikroORM<MongoDriver> | null = null;

export async function initMikroOrm(): Promise<MikroORM<MongoDriver>> {
  if (ormInstance) {
    console.log(`⚡ [MikroORM] Initializing Data Access Layer with MongoDB driver & IdentityMap L1 caching...`);
    ormInstance = await MikroORM.init<MongoDriver>(config);
  }

  return ormInstance;
}

export function getOrm(): MikroORM<MongoDriver> {
  if (!ormInstance) {
    throw new Error('MikroORM not initialized. Call initMikroOrm() first.');
  }
  return ormInstance;
}

export function getForkedEm(): EntityManager<MongoDriver> {
  return getOrm().em.fork();
}
