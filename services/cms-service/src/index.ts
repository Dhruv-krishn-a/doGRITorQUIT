// services/cms-service/src/index.ts
import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

fastify.get("/products", async (req, reply) => {
  const products = await prisma.product.findMany({
    include: { productFeatures: { include: { feature: true } } },
  });
  return products;
});

fastify.post("/products", async (req, reply) => {
  const body = req.body as any;
  const product = await prisma.product.create({ data: body });
  return product;
});

fastify.post("/products/:id/features", async (req, reply) => {
  const { id } = (req.params as any);
  const { featureKey, value } = req.body as any;

  let feature = await prisma.feature.findUnique({ where: { key: featureKey } });
  if (!feature) {
    feature = await prisma.feature.create({ data: { key: featureKey } });
  }

  const pf = await prisma.productFeature.upsert({
    where: { productId_featureId: { productId: id, featureId: feature.id } },
    update: { value },
    create: { productId: id, featureId: feature.id, value },
  });

  return pf;
});

fastify.listen({ port: 4001 }).then(() => console.log("cms-service listening on 4001"));
