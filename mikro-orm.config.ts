import { defineConfig } from '@mikro-orm/mongodb';
import { SeedManager } from '@mikro-orm/seeder';
import { appConfig } from './src/config/AppConfig';
import { authorSchema } from './src/entities/AuthorEntity';
import { portfolioItemSchema } from './src/entities/PortfolioItemEntity';
import { teamSchema } from './src/entities/TeamEntity';
import { referralTokenSchema } from './src/entities/ReferralTokenEntity';
import { portfolioMemorySchema } from './src/entities/PortfolioMemoryEntity';
import { comparisonMatrixSchema } from './src/entities/ComparisonMatrixEntity';
import { authorProjectSetSchema } from './src/entities/AuthorProjectSetEntity';
import { cachedAnalysisSchema } from './src/entities/CachedAnalysisEntity';

const dbConfig = appConfig.getDbConfig();

export default defineConfig({
  clientUrl: dbConfig.url,
  dbName: dbConfig.name,
  entities: [
    authorSchema,
    portfolioItemSchema,
    teamSchema,
    referralTokenSchema,
    portfolioMemorySchema,
    comparisonMatrixSchema,
    authorProjectSetSchema,
    cachedAnalysisSchema
  ],
  extensions: [SeedManager],
  seeder: {
    path: './src/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts'
  },
  debug: false
});
