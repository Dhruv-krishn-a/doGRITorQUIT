import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriptionClientPage, { 
  Product, 
  SubscriptionData 
} from "./subscription-client";
import { prisma } from "@/lib/prisma";

// --- Helpers ---
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

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

    // Default Limits
    let aiLimit = 5; 
    let isUnlimited = false;

    if (activeSub?.product) {
      // Safe cast to access potential CMS fields
      const productData = activeSub.product as unknown as { aiLimit?: number };
      
      if (typeof productData.aiLimit === 'number') {
         aiLimit = productData.aiLimit;
         if (aiLimit === -1) isUnlimited = true;
      } 
      // Fallback hardcoded logic if DB field is missing
      else {
         if (activeSub.product.key === "PRO_MONTHLY") aiLimit = 50;
         if (activeSub.product.key === "PRO_YEARLY") aiLimit = 500;
         if (activeSub.product.key === "ENTERPRISE") isUnlimited = true;
      }
    }

    return {
      activeSubscription: activeSub ? {
        product: {
          id: activeSub.product.id,
          name: activeSub.product.name,
          key: activeSub.product.key,
        },
        currentPeriodEnd: activeSub.currentPeriodEnd?.toISOString(),
        formattedRenewsAt: activeSub.currentPeriodEnd ? dateFormatter.format(activeSub.currentPeriodEnd) : undefined,
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
        formattedDate: dateFormatter.format(o.createdAt),
        amount: o.amount,
        status: o.status === "paid" ? "paid" : o.status === "failed" ? "failed" : "pending",
      }))
    };
  } catch (error) {
    console.error("Failed to fetch subscription data:", error);
    // Return safe default if error
    return { 
      usage: { aiGenerated: currentUsage, aiLimit: 5, remaining: Math.max(0, 5 - currentUsage) }, 
      history: [] 
    };
  }
}

export default async function SubscriptionPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const [products, subscriptionData] = await Promise.all([
    getProducts(),
    getSubscriptionData(user.id, user.aiUsageCount)
  ]);

  return <SubscriptionClientPage products={products} data={subscriptionData} />;
}