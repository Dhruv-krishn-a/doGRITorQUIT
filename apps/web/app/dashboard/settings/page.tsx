import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // ✅ Import Prisma to get DB fields
import SettingsClientPage from "./settings-client";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  // ✅ Fetch DB record to get 'tier' and 'name'
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  // ✅ Construct the safe object matching 'UserSettings' interface
  const userData = {
    id: user.id,
    // Fix: Handle null/undefined email
    email: user.email ?? "", 
    // Fix: Try DB name first, then Auth metadata, then fallback
    name: dbUser?.name ?? user.user_metadata?.full_name ?? "User",
    // Fix: Get tier from DB, default to "Free"
    tier: dbUser?.tier ?? "Free", 
  };

  return <SettingsClientPage user={userData} />;
}