import { MikroORM, EntityManager } from '@mikro-orm/core';
import config from '../../mikro-orm.config';

let ormInstance: MikroORM | null = null;

export async function initMikroOrm(customConfig?: any): Promise<MikroORM> {
  if (!ormInstance) {
    const finalConfig = customConfig || config;
    console.log(`⚡ [MikroORM] Initializing Data Access Layer...`);
    ormInstance = await MikroORM.init(finalConfig);
  }

  return ormInstance;
}

export function setOrmInstance(instance: MikroORM | null): void {
  ormInstance = instance;
}

export function getOrm(): MikroORM {
  if (!ormInstance) {
    throw new Error('MikroORM not initialized. Call initMikroOrm() first.');
  }
  return ormInstance;
}

export function getForkedEm(): EntityManager {
  return getOrm().em.fork();
}
