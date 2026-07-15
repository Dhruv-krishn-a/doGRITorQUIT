"use server";

import { globalSettings } from "@gritorquit/domain";
import { getAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveGlobalSettings(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Unauthorized");

  const syncEnabled = formData.get("syncEnabled") === "true";
  const offlineEnabled = formData.get("offlineEnabled") === "true";
  const maintenanceMode = formData.get("maintenanceMode") === "true";
  const defaultOfflineHours = Number(formData.get("defaultOfflineHours")) || 24;
  
  await globalSettings.setSetting("SYSTEM_MAINTENANCE", { enabled: maintenanceMode }, admin.id);
  await globalSettings.setSetting("SYNC_CONFIG", { enabled: syncEnabled }, admin.id);
  await globalSettings.setSetting("OFFLINE_CONFIG", { enabled: offlineEnabled, defaultMaxHours: defaultOfflineHours }, admin.id);

  revalidatePath("/settings");
}
