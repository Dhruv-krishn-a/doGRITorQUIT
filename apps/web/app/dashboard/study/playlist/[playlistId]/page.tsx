//apps/web/app/dashboard/study/playlist/[playlistId]/page.tsx
import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma'; // ✅ Fixed import
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: {
    playlistId: string;
  };
}

export default async function PlaylistPage({ params }: PageProps) {
  const user = await getServerUser();
  if (!user) redirect('/login');

  // Fetch Playlist with Videos
  const playlist = await prisma.studyPlaylist.findFirst({
    where: {
      id: params.playlistId,
      userId: user.id
    },
    include: {
      videos: {
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!playlist) return notFound();

  // Calculate Stats
  const totalVideos = playlist.videos.length;
  const completedVideos = playlist.videos.filter(v => v.status === 'completed').length;
  const progress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  
  // Find next video to watch (first one that isn't completed)
  const nextVideo = playlist.videos.find(v => v.status !== 'completed') || playlist.videos[0];

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <Link href="/dashboard/study" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Thumbnail */}
          <div className="w-full md:w-80 aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative shrink-0">
             {playlist.thumbnailUrl && (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-full object-cover" />
             )}
             <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-2">{playlist.title}</h1>
            <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{playlist.description}</p>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-mono text-zinc-500 mb-2">
                <span>{progress}% COMPLETED</span>
                <span>{completedVideos}/{totalVideos} VIDEOS</span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            {/* Action Button */}
            {nextVideo && (
              <Link 
                href={`/dashboard/study/${nextVideo.id}`}
                className="w-fit flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                {progress === 0 ? 'Start Learning' : 'Continue Learning'}
              </Link>
            )}
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-1">
          {playlist.videos.map((video, index) => {
            const isCompleted = video.status === 'completed';
            const isActive = nextVideo?.id === video.id;

            return (
              <Link 
                key={video.id} 
                href={`/dashboard/study/${video.id}`}
                className={`group flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all ${
                   isActive 
                     ? 'bg-zinc-900 border-zinc-800' 
                     : 'hover:bg-zinc-900/50 hover:border-zinc-800/50'
                }`}
              >
                {/* Index / Status */}
                <div className="w-8 flex justify-center shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  ) : (
                    <span className="text-zinc-600 font-mono text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Thumbnail Tiny */}
                <div className="w-32 aspect-video bg-zinc-800 rounded-lg overflow-hidden shrink-0 hidden sm:block relative">
                   {video.thumbnailUrl && (
                     /* eslint-disable-next-line @next/next/no-img-element */
                     <img src={video.thumbnailUrl} alt="" className={`w-full h-full object-cover ${isCompleted ? 'opacity-50 grayscale' : ''}`} />
                   )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${isCompleted ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200'}`}>
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {Math.floor(video.durationSec / 60)} min
                    </span>
                    {video.timeSpentSec > 0 && (
                       <span className="text-blue-500/80">
                         {Math.floor(video.timeSpentSec / 60)}m studied
                       </span>
                    )}
                  </div>
                </div>

                {/* Hover Play Icon */}
                <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-5 h-5 text-zinc-400" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}