// scripts/backfill-study-to-tracks.ts
import { prisma } from '../packages/db/index';
import * as fs from 'fs';
import { Prisma, TrackType, TrackStatus, UnitType, UnitStatus } from '@prisma/client';

const DRY_RUN = process.env.BACKFILL_DRY_RUN !== 'false';

async function main() {
  console.log(`Starting backfill... ${DRY_RUN ? '(DRY RUN)' : '(LIVE MODE)'}`);

  const playlists = await prisma.studyPlaylist.findMany({
    include: {
      videos: {
        include: {
          resources: true,
        },
      },
    },
  });

  console.log(`Found ${playlists.length} playlists to migrate.`);

  const log: any[] = [];

  for (const playlist of playlists) {
    console.log(`Migrating playlist: ${playlist.title}`);

    const trackData: Prisma.TrackUncheckedCreateInput = {
      userId: playlist.userId,
      type: 'PLAYLIST',
      title: playlist.title,
      description: playlist.description,
      status: playlist.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
      progressPercentage: playlist.totalVideos > 0 
        ? (playlist.completedVideos / playlist.totalVideos) * 100 
        : 0,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    };

    let track;
    if (!DRY_RUN) {
      track = await prisma.track.create({
        data: trackData,
      });
    } else {
      track = { id: `DRY_RUN_${playlist.id}`, ...trackData };
    }

    const unitIds: string[] = [];
    let totalTime = 0;

    for (const video of playlist.videos) {
      const unitData: Prisma.UnitUncheckedCreateInput = {
        trackId: track.id,
        title: video.title,
        description: video.description,
        type: 'VIDEO',
        orderIndex: video.position,
        durationMinutes: Math.ceil(video.durationSec / 60),
        actualTimeSpentMinutes: Math.ceil(video.timeSpentSec / 60),
        status: video.status === 'completed' ? 'DONE' : video.status === 'in_progress' ? 'IN_PROGRESS' : 'BACKLOG',
        lastCompletedAt: video.status === 'completed' ? video.updatedAt : null,
        metadata: {
          youtubeId: video.youtubeId,
          thumbnailUrl: video.thumbnailUrl,
          channelName: video.channelName,
          notes: video.notes,
        },
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      };

      totalTime += unitData.actualTimeSpentMinutes || 0;

      if (!DRY_RUN) {
        const unit = await prisma.unit.create({
          data: unitData,
        });
        unitIds.push(unit.id);
      } else {
        unitIds.push(`DRY_RUN_UNIT_${video.id}`);
      }
    }

    if (!DRY_RUN) {
      await prisma.track.update({
        where: { id: track.id },
        data: { totalTimeMinutes: totalTime },
      });
    }

    log.push({
      oldPlaylistId: playlist.id,
      newTrackId: track.id,
      unitCount: unitIds.length,
    });
  }

  // Standalone videos
  const standaloneVideos = await prisma.studyVideo.findMany({
    where: { playlistId: null },
  });

  console.log(`Found ${standaloneVideos.length} standalone videos to migrate.`);

  for (const video of standaloneVideos) {
    const trackData: Prisma.TrackUncheckedCreateInput = {
      userId: video.userId,
      type: 'PLAYLIST',
      title: video.title,
      description: video.description,
      status: video.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
      progressPercentage: video.status === 'completed' ? 100 : 0,
      totalTimeMinutes: Math.ceil(video.timeSpentSec / 60),
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };

    let track;
    if (!DRY_RUN) {
      track = await prisma.track.create({
        data: trackData,
      });
    } else {
      track = { id: `DRY_RUN_STANDALONE_${video.id}`, ...trackData };
    }

    const unitData: Prisma.UnitUncheckedCreateInput = {
      trackId: track.id,
      title: video.title,
      description: video.description,
      type: 'VIDEO',
      orderIndex: 0,
      durationMinutes: Math.ceil(video.durationSec / 60),
      actualTimeSpentMinutes: Math.ceil(video.timeSpentSec / 60),
      status: video.status === 'completed' ? 'DONE' : video.status === 'in_progress' ? 'IN_PROGRESS' : 'BACKLOG',
      lastCompletedAt: video.status === 'completed' ? video.updatedAt : null,
      metadata: {
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl,
        channelName: video.channelName,
        notes: video.notes,
      },
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    };

    if (!DRY_RUN) {
      await prisma.unit.create({
        data: unitData,
      });
    }

    log.push({
      oldVideoId: video.id,
      newTrackId: track.id,
      unitCount: 1,
    });
  }

  fs.writeFileSync('backfill-log.json', JSON.stringify(log, null, 2));
  console.log('Backfill complete. Log saved to backfill-log.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
