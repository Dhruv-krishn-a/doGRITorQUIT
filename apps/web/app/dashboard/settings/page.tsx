import { getServerUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClientPage from "./settings-client";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true
    }
  });

  const userData = {
    id: user.id,
    email: user.email ?? "", 
    name: dbUser?.profile?.name ?? user.user_metadata?.full_name ?? "User",
    tier: dbUser?.tier ?? "Free", 
  };

  return <SettingsClientPage user={userData} />;
}