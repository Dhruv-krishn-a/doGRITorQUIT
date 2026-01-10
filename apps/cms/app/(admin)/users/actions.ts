// apps/cms/app/(admin)/users/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";

export async function updateUserLimit(formData: FormData) {
  // 1. Security Check
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const userId = String(formData.get("userId"));
  const rawLimit = formData.get("limit");

  // 2. Logic: If empty string, set to null (which resets to Plan Default)
  const customAiLimit = rawLimit === "" ? null : Number(rawLimit);

  await prisma.user.update({
    where: { id: userId },
    data: { customAiLimit },
  });

  revalidatePath("/users");
}