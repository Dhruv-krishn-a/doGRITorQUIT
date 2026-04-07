// packages/domain/plans/types.ts
import type { Prisma } from "@prisma/client";

export type PrismaPlanWithRelations = Prisma.PlanGetPayload<{
  include: {
    tasks: {
      include: { subtasks: true; tags: { include: { tag: true } } };
      orderBy?: { date?: "asc" };
    };
  };
}>;
