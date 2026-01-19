import { prisma } from './index';

async function main() {
  await prisma.$connect();
  console.log('DB OK');
  await prisma.$disconnect();
}

main().catch(console.error)