//apps/web/app/dashboard/study/page.tsx
import { getServerUser } from '@/lib/auth-server';
import { StudyService } from '@domain/study'; 
import { ImportInput } from '@/features/study/components/ImportInput';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, ListVideo, Clock } from 'lucide-react';

export const metadata = {
  title: "Study Room | Planner AI",
};

// Define types for the data we expect from the service
interface StudyPlaylistData {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  totalVideos: number;
  channelName: string | null;
}

interface StudyVideoData {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  durationSec: number;
  channelName: string | null;
}

export default async function StudyPage() {
  // 1. Auth Check
  const user = await getServerUser();
  if (!user) redirect('/login');

  // 2. Fetch Data
  const { playlists, activeVideos } = await StudyService.getLibrary(user.id);

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8">
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold bg-liner-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Study Room
        </h1>
        <p className="text-zinc-500">Track your tutorials, take notes, and focus.</p>
      </div>

      {/* Input Section */}
      <ImportInput />

      {/* Content Grid */}
      <div className="space-y-12 max-w-7xl mx-auto">
        
        {/* Playlists Section */}
        {playlists.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-zinc-100">
              <ListVideo className="w-5 h-5 text-blue-500" />
              <h2>Playlists</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist: StudyPlaylistData) => (
                <Link 
                  key={playlist.id} 
                  href={`/dashboard/study/playlist/${playlist.id}`}
                  className="group relative bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:scale-[1.01]"
                >
                  <div className="aspect-video bg-zinc-800 relative">
                    {playlist.thumbnailUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={playlist.thumbnailUrl} 
                        alt={playlist.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                      {playlist.totalVideos} Videos
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">{playlist.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{playlist.channelName}</p>
                    
                    {/* Progress Bar (Mock for now) */}
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[10%]" /> 
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Individual Videos Section */}
        {activeVideos.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-zinc-100">
              <PlayCircle className="w-5 h-5 text-green-500" />
              <h2>Standalone Videos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeVideos.map((video: StudyVideoData) => (
                <Link 
                  key={video.id} 
                  href={`/dashboard/study/${video.id}`} 
                  className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:scale-[1.01]"
                >
                  <div className="aspect-video bg-zinc-800 relative">
                     {video.thumbnailUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    )}
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(video.durationSec / 60)} min
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg line-clamp-2 group-hover:text-green-400 transition-colors">{video.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{video.channelName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Empty State */}
        {playlists.length === 0 && activeVideos.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <p>Your library is empty. Paste a link above to start learning.</p>
          </div>
        )}
      </div>
    </div>
  );
}