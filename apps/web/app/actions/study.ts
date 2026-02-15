'use server';

import { getServerUser } from "@/lib/auth-server";
import { StudyService } from "@domain/study"; 
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; 

export async function importYouTubeAction(url: string) {
  const user = await getServerUser();
  
  if (!user || !user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const urlObj = new URL(url);
    const v = urlObj.searchParams.get('v');
    const list = urlObj.searchParams.get('list');

    let result;
    
    // Logic: If it has a 'list' param, treat as playlist. Otherwise video.
    if (list) {
      result = await StudyService.importPlaylist(user.id, list);
    } else if (v) {
      result = await StudyService.importVideo(user.id, v);
    } else {
      // Handle "youtu.be" short links if needed
      if (url.includes('youtu.be/')) {
         const shortId = url.split('youtu.be/')[1]?.split('?')[0];
         if (shortId) result = await StudyService.importVideo(user.id, shortId);
      }
      
      if (!result) throw new Error("Invalid YouTube URL");
    }

    revalidatePath('/study');
    return { success: true };
    
  } catch (error: unknown) { 
    console.error("Import Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to import content";
    return { success: false, error: errorMessage };
  }
}

export async function saveStudyProgress(
  videoId: string, 
  notes: unknown, // ✅ Fixed: Changed 'any' to 'unknown' (compatible with Prisma JSON input)
  timeSpentAdded: number, 
  completed: boolean
) {
  const user = await getServerUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Check if the user owns this video record before updating (security check)
    const existing = await prisma.studyVideo.findFirst({
        where: { id: videoId, userId: user.id }
    });

    if (!existing) return { success: false, error: "Video not found" };

    await prisma.studyVideo.update({
      where: { id: videoId },
      data: {
        notes: notes as object, // Cast to object for Prisma Json compatibility
        isCompleted: completed,
        status: completed ? 'completed' : 'in_progress',
        timeSpentSec: { increment: timeSpentAdded }, 
        updatedAt: new Date()
      }
    });

    revalidatePath(`/study/${videoId}`);
    return { success: true };
  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: "Failed to save progress" };
  }
}