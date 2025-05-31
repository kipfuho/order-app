// tests/test-setup.ts
import { PrismaClient } from '@prisma/client';

// eslint-disable-next-line import/no-mutable-exports
let prisma;

beforeEach(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: global.__DATABASE_URL__,
      },
    },
  });

  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  // eslint-disable-next-line no-restricted-syntax
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      // eslint-disable-next-line no-await-in-loop
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
});

afterEach(async () => {
  await prisma.$disconnect();
});

export default prisma;
