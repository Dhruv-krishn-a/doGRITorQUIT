//packages/domain/study/youtube.ts
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YTVideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string; // ISO 8601 format (e.g., PT15M33S)
}

export interface YTPlaylistDetails {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
}

export const YouTubeClient = {
  async getVideoDetails(videoId: string): Promise<YTVideoDetails | null> {
    const details = await this.getVideosDetails([videoId]);
    return details[0] || null;
  },

  async getVideosDetails(videoIds: string[]): Promise<YTVideoDetails[]> {
    if (!YOUTUBE_API_KEY) throw new Error("Missing YOUTUBE_API_KEY");
    if (videoIds.length === 0) return [];

    // Batch requests in chunks of 50
    const chunks = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      chunks.push(videoIds.slice(i, i + 50));
    }

    const allDetails: YTVideoDetails[] = [];

    for (const chunk of chunks) {
      const res = await fetch(
        `${BASE_URL}/videos?part=snippet,contentDetails&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`YouTube API error (${res.status}): ${errorData.error?.message || res.statusText}`);
      }
      const data = await res.json();
      
      if (data.items) {
        const mapped = data.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          channelTitle: item.snippet.channelTitle,
          duration: item.contentDetails.duration,
        }));
        allDetails.push(...mapped);
      }
    }
    return allDetails;
  },

  async getPlaylistDetails(playlistId: string): Promise<YTPlaylistDetails | null> {
    if (!YOUTUBE_API_KEY) throw new Error("Missing YOUTUBE_API_KEY");

    const res = await fetch(
      `${BASE_URL}/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`YouTube API error (${res.status}): ${errorData.error?.message || res.statusText}`);
    }
    const data = await res.json();
    if (!data.items?.length) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
    };
  },

  async getPlaylistItems(playlistId: string) {
    if (!YOUTUBE_API_KEY) throw new Error("Missing YOUTUBE_API_KEY");

    let videos: any[] = [];
    let nextPageToken = '';
    
    // Fetch first page (max 50) - In v2, handle pagination loop
    const res = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`YouTube API error (${res.status}): ${errorData.error?.message || res.statusText}`);
    }
    const data = await res.json();
    
    if (data.items) {
      videos = data.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channelTitle: item.snippet.channelTitle,
        position: item.snippet.position
      }));
    }
    return videos;
  },
  
  parseDuration(duration: string): number {
    if(!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1] || '0')) * 3600;
    const minutes = (parseInt(match[2] || '0')) * 60;
    const seconds = parseInt(match[3] || '0');
    return hours + minutes + seconds;
  }
};
