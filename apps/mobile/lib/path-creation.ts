import { database } from '../db';
import StudyTrack from '../db/models/StudyTrack';
import StudyUnit from '../db/models/StudyUnit';
import { config } from '../config';
import { getStoredSession } from './nativeAuth';

export async function createManualPath(params: {
  title: string;
  type: 'COURSE' | 'PROJECT';
  phases?: string[];
}) {
  return await database.write(async () => {
    const track = await database.get<StudyTrack>('study_tracks').create(t => {
      t.title = params.title;
      t.type = params.type;
      t.status = 'ACTIVE';
      t.progressPercentage = 0;
      t.metadata = JSON.stringify({
        phases: params.phases || (params.type === 'PROJECT' ? ['Planning', 'Execution', 'Review'] : ['Introduction', 'Core Modules', 'Advanced']),
        createdAt: new Date().toISOString()
      });
    });
    return track;
  });
}

export async function ingestYoutubePlaylist(playlistUrl: string) {
  const session = await getStoredSession();
  if (!session) throw new Error("Authentication required");

  // Call the backend to perform the heavy lifting
  const response = await fetch(`${config.apiUrl}/api/study/tracks/import-playlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ playlistUrl })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to import playlist");

  // The backend created the track and units. 
  // We need to wait for the next sync to see them in WatermelonDB,
  // or we can manually return the expected object if needed.
  return data; 
}

export async function generateAIPath(prompt: string, type: string) {
  const session = await getStoredSession();
  if (!session) throw new Error("Authentication required");

  // We'll use the roadmap generation endpoint if it exists
  const response = await fetch(`${config.apiUrl}/api/plans/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ prompt, type })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to generate AI path");

  return data;
}
