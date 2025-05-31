const getDatabase = require('@databases/pg-test').default;
const createDatabase = require('@databases/pg-test/jest/globalSetup').default;
const teardownDatabase = require('@databases/pg-test/jest/globalTeardown').default;
// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');
const { prisma } = require('../src/utils/prisma');

async function globalSetup() {
  await createDatabase();
  const { databaseURL } = await getDatabase();
  process.env.DATABASE_URL = databaseURL;
  process.env.DATABASE_DIRECT_URL = databaseURL;

  // push schema to db
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: databaseURL },
    stdio: 'inherit',
  });

  global.__DATABASE_URL__ = databaseURL;
  global.__PRISMA__ = prisma;
}

async function globalTeardown() {
  await prisma.$disconnect();
  await teardownDatabase();
}

function setupTestDB() {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
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

  afterAll(async () => {
    await prisma.$disconnect();
  });
}

module.exports = {
  globalSetup,
  globalTeardown,
  setupTestDB,
};
