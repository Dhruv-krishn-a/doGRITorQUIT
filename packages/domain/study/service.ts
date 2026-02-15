// packages/domain/study/service.ts
import { prisma } from '@planner/db'; // ⚠️ Check if your package is named '@repo/db' or '@planner/db'
import { YouTubeClient } from './youtube';

export const StudyService = {
  /**
   * Import a Single Video (Standalone)
   */
  async importVideo(userId: string, videoId: string) {
    // 1. Check if already exists (Using findFirst is safer for nullable fields than findUnique)
    const existing = await prisma.studyVideo.findFirst({
      where: {
        userId,
        youtubeId: videoId,
        playlistId: null // ✅ Correctly look for null (standalone)
      }
    });

    if (existing) return existing;

    // 2. Fetch Metadata
    const details = await YouTubeClient.getVideoDetails(videoId);
    if (!details) throw new Error("Video not found on YouTube");

    // 3. Create
    return prisma.studyVideo.create({
      data: {
        userId,
        youtubeId: details.id,
        title: details.title,
        description: details.description,
        thumbnailUrl: details.thumbnailUrl,
        channelName: details.channelTitle,
        durationSec: YouTubeClient.parseDuration(details.duration),
        status: 'not_started',
        playlistId: null // ✅ Explicitly set to null
      }
    });
  },

  /**
   * Import a Full Playlist
   */
  async importPlaylist(userId: string, playlistId: string) {
    const details = await YouTubeClient.getPlaylistDetails(playlistId);
    if (!details) throw new Error("Playlist not found");

    // 1. Upsert Playlist
    // We use upsert here because the composite key [userId, youtubeId] is fully defined
    const playlist = await prisma.studyPlaylist.upsert({
      where: { userId_youtubeId: { userId, youtubeId: details.id } },
      create: {
        userId,
        youtubeId: details.id,
        title: details.title,
        description: details.description,
        thumbnailUrl: details.thumbnailUrl,
        channelName: details.channelTitle,
        channelId: details.channelId,
        status: 'in_progress'
      },
      update: {}
    });

    // 2. Fetch Videos
    const videos = await YouTubeClient.getPlaylistItems(playlistId);

    // 3. Create Video Records
    if (videos.length > 0) {
      await prisma.$transaction(
        videos.map(v => 
            prisma.studyVideo.upsert({
                where: { 
                    // This unique key works because playlistId is a string here, not null
                    userId_youtubeId_playlistId: {
                        userId,
                        youtubeId: v.id,
                        playlistId: playlist.id
                    }
                },
                create: {
                    userId,
                    playlistId: playlist.id,
                    youtubeId: v.id,
                    title: v.title,
                    description: v.description,
                    thumbnailUrl: v.thumbnailUrl,
                    channelName: v.channelTitle,
                    position: v.position,
                    status: 'not_started'
                },
                update: {
                    position: v.position
                }
            })
        )
      );

      // Update count
      await prisma.studyPlaylist.update({
        where: { id: playlist.id },
        data: { totalVideos: videos.length }
      });
    }

    return playlist;
  },

  /**
   * Get User Library
   */
  async getLibrary(userId: string) {
    const [playlists, activeVideos] = await Promise.all([
      prisma.studyPlaylist.findMany({
        where: { userId, status: { not: 'archived' } },
        orderBy: { updatedAt: 'desc' },
        include: {
            videos: {
                take: 1,
                orderBy: { position: 'asc' },
                select: { thumbnailUrl: true, title: true, id: true }
            }
        }
      }),
      prisma.studyVideo.findMany({
        where: { 
          userId, 
          playlistId: null, // ✅ Get only standalone videos
          status: { not: 'archived' } 
        },
        orderBy: { updatedAt: 'desc' }
      })
    ]);
    
    return { playlists, activeVideos };
  }
};