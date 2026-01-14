// apps/web/app/dashboard/subscriptions/page.tsx
import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriptionClientPage, { Product, SubscriptionData } from "./subscription-client";
import { prisma } from "@/lib/prisma";

export default async function SubscriptionPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // ✅ SERVER SIDE DATA FETCHING (Parallel)
  const [products, subscriptionData] = await Promise.all([
    getProducts(),
    getSubscriptionData(user.id, user.aiUsageCount)
  ]);

  // ✅ RENDER UI
  return <SubscriptionClientPage products={products} data={subscriptionData} />;
}

// --- Data Fetching Helpers ---

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        key: true,
        price: true,
        description: true,
        currency: true
      }
    });
    // Ensure description is not null for frontend type compatibility
    return products.map(p => ({
      ...p,
      description: p.description || "" 
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

async function getSubscriptionData(userId: string, currentUsage: number): Promise<SubscriptionData> {
  try {
    const activeSub = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: { in: ["active", "trialing"] },
      },
      include: {
        product: true,
      },
      orderBy: {
        currentPeriodEnd: "desc",
      },
    });

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Determine limits based on plan
    let aiLimit = 5; // Default free
    if (activeSub?.product?.key === "PRO_MONTHLY") aiLimit = 50;
    if (activeSub?.product?.key === "PRO_YEARLY") aiLimit = 500;
    // Assuming a special key for unlimited, or high number
    const isUnlimited = activeSub?.product?.key === "ENTERPRISE"; 

    return {
      activeSubscription: activeSub ? {
        product: {
          id: activeSub.product.id,
          name: activeSub.product.name,
          key: activeSub.product.key,
        },
        currentPeriodEnd: activeSub.currentPeriodEnd?.toISOString(),
        status: activeSub.status,
      } : undefined,
      usage: {
        aiGenerated: currentUsage,
        aiLimit: isUnlimited ? null : aiLimit,
        remaining: isUnlimited ? null : Math.max(0, aiLimit - currentUsage),
      },
      history: orders.map(o => ({
        id: o.id,
        date: o.createdAt.toISOString(),
        amount: o.amount,
        status: o.status === "paid" ? "paid" : o.status === "failed" ? "failed" : "pending",
      }))
    };
  } catch (error) {
    console.error("Failed to fetch subscription data:", error);
    return { 
      usage: { aiGenerated: currentUsage, aiLimit: 5, remaining: Math.max(0, 5 - currentUsage) }, 
      history: [] 
    };
  }
}