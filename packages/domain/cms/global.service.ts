import { prisma } from "@gritorquit/db";

export const globalSettings = {
  getSetting: async (key: string, defaultValue: any = null) => {
    const setting = await prisma.globalSetting.findUnique({ where: { key } });
    if (!setting) return defaultValue;
    return setting.value;
  },

  getAllSettings: async () => {
    return prisma.globalSetting.findMany();
  },

  setSetting: async (key: string, value: any, adminId?: string) => {
    return prisma.globalSetting.upsert({
      where: { key },
      create: { key, value, updatedBy: adminId },
      update: { value, updatedBy: adminId },
    });
  }
};
