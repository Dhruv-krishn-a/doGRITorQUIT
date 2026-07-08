import { getServerUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClientPage from "./settings-client";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true
      }
    });
  } catch (err) {
    console.error("Error fetching dbUser in SettingsPage:", err);
  }

  const userData = {
    id: user.id,
    email: user.email ?? "", 
    name: dbUser?.profile?.name ?? (user as any).name ?? (user as any).user_metadata?.full_name ?? "User",
    bio: dbUser?.profile?.bio ?? "",
    timezone: dbUser?.profile?.timezone ?? "UTC",
    locale: dbUser?.profile?.locale ?? "en",
    tier: dbUser?.tier ?? "Free",
    avatarUrl: dbUser?.profile?.avatarUrl ?? dbUser?.image ?? "",
    // We pass the provider just for info, but we won't rely on it for password logic
    provider: (user as any).app_metadata?.provider || "email",
  };

  return <SettingsClientPage user={userData} />;
}