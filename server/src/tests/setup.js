const getDatabase = require('@databases/pg-test').default;
const createDatabase = require('@databases/pg-test/jest/globalSetup').default;
const teardownDatabase = require('@databases/pg-test/jest/globalTeardown').default;
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

let prisma;

async function globalSetup() {
  await createDatabase();
  const { databaseURL } = await getDatabase();
  process.env.DATABASE_URL = databaseURL;

  prisma = new PrismaClient();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseURL },
  });

  global.__DATABASE_URL__ = databaseURL;
  global.__PRISMA__ = prisma;
}

async function globalTeardown() {
  await prisma.$disconnect();
  await teardownDatabase();
}

module.exports = {
  globalSetup,
  globalTeardown,
};
