const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const product = await prisma.product.findFirst({
    where: { key: { equals: "FREE", mode: "insensitive" } },
    include: { productFeatures: { include: { feature: true } } }
  });
  console.log("Product:", product ? product.name : "Not found");
  if (product) {
    product.productFeatures.forEach(pf => console.log(pf.feature.key, pf.value));
  }
}
run();
