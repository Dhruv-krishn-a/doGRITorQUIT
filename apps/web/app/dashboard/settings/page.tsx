import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClientPage from "./settings-client";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier,
  };

  return <SettingsClientPage user={userData} />;
}