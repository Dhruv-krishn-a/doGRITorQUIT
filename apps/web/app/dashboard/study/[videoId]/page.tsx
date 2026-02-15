// apps/web/app/(dashboard)/study/[videoId]/page.tsx

import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma'; // ✅ Ensure correct import for your project structure
import { redirect, notFound } from 'next/navigation';
import { StudyRoomClient } from '@/features/study/components/StudyRoomClient';

interface PageProps {
  params: {
    videoId: string;
  };
}

export default async function StudyVideoPage({ params }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const video = await prisma.studyVideo.findFirst({
    where: {
      id: params.videoId,
      userId: user.id
    }
  });

  if (!video) return notFound();

  return (
    <StudyRoomClient 
        video={{
            ...video,
            // Ensure data types are strictly compatible with Client Components
            notes: video.notes ?? null, 
            // ✅ FIX: Derive boolean from the Enum status
            isCompleted: video.status === 'completed', 
            timeSpentSec: video.timeSpentSec
        }} 
    />
  );
}