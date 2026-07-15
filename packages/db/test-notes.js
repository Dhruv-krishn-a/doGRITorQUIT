const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const notes = await prisma.note.findMany();
  console.log("Notes found:", notes.length);
  if (notes.length > 0) {
    console.log(notes.map(n => ({ id: n.id, title: n.title, userId: n.userId })));
  }
}
run();
