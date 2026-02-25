//packages/domain/study/service.ts
import { prisma } from '@planner/db';
import { YouTubeClient } from './youtube';
import { 
  TrackType, 
  UnitType, 
  UnitStatus, 
  Prisma,
  Track,
  Unit,
  Effort,
  EnergyLevel,
  DailySession
} from '@prisma/client';

export const StudyService = {
  /**
   * Tracks
   */
  async createTrack(userId: string, data: {
    type: TrackType;
    title: string;
    description?: string;
    targetDate?: Date;
    priority?: number;
    dailyAllocationMinutes?: number;
    link?: string;
  }) {
    return prisma.track.create({
      data: {
        userId,
        ...data,
        status: 'ACTIVE',
      },
    });
  },

  async importPlaylist(userId: string, playlistUrl: string, targetDate?: string) {
    const playlistId = this.extractPlaylistId(playlistUrl);
    if (!playlistId) throw new Error("Invalid YouTube Playlist URL");

    // Check if already imported
    const existing = await prisma.track.findFirst({
      where: { userId, link: playlistUrl }
    });
    
    if (existing) {
      // Automatically trigger a sync if it already exists
      return this.syncPlaylist(userId, existing.id);
    }

    const details = await YouTubeClient.getPlaylistDetails(playlistId);
    if (!details) throw new Error("Playlist not found");

    const playlistItems = await YouTubeClient.getPlaylistItems(playlistId);
    const videoIds = playlistItems.map(v => v.id);
    const videoDetails = await YouTubeClient.getVideosDetails(videoIds);
    const detailsMap = new Map(videoDetails.map(d => [d.id, d]));

    let totalDurationSeconds = 0;
    const unitsData = playlistItems.map((v) => {
      const detail = detailsMap.get(v.id);
      const durationSec = detail ? YouTubeClient.parseDuration(detail.duration) : 0;
      totalDurationSeconds += durationSec;

      return {
        title: v.title,
        description: v.description,
        type: 'VIDEO' as UnitType,
        orderIndex: v.position,
        durationSeconds: durationSec,
        durationMinutes: Math.ceil(durationSec / 60),
        status: 'BACKLOG' as UnitStatus,
        metadata: {
          youtubeId: v.id,
          thumbnailUrl: v.thumbnailUrl,
          channelName: v.channelTitle,
          originalDuration: detail?.duration
        } as Prisma.InputJsonValue,
      };
    });

    const track = await prisma.track.create({
      data: {
        userId,
        type: 'PLAYLIST',
        title: details.title,
        description: details.description,
        link: playlistUrl,
        status: 'ACTIVE',
        targetDate: targetDate ? new Date(targetDate) : null,
        totalDurationMinutes: Math.ceil(totalDurationSeconds / 60),
        remainingMinutes: Math.ceil(totalDurationSeconds / 60),
        units: {
          create: unitsData
        }
      },
    });

    return prisma.track.findFirst({
      where: { id: track.id },
      include: { _count: { select: { units: true } } },
    });
  },

  async syncPlaylist(userId: string, trackId: string) {
    const track = await prisma.track.findFirst({
      where: { id: trackId, userId },
      include: { units: true }
    });
    if (!track || !track.link) throw new Error("Track not found or not a playlist");

    const playlistId = this.extractPlaylistId(track.link);
    if (!playlistId) throw new Error("Invalid playlist link");

    const playlistItems = await YouTubeClient.getPlaylistItems(playlistId);
    
    // Identify new videos
    const existingVideoIds = new Set(track.units.map(u => (u.metadata as any)?.youtubeId).filter(Boolean));
    const newItems = playlistItems.filter(item => !existingVideoIds.has(item.id));

    if (newItems.length === 0) return { added: 0 };

    const videoIds = newItems.map(v => v.id);
    const videoDetails = await YouTubeClient.getVideosDetails(videoIds);
    const detailsMap = new Map(videoDetails.map(d => [d.id, d]));

    let addedDurationSeconds = 0;
    const newUnitsData = newItems.map((v) => {
      const detail = detailsMap.get(v.id);
      const durationSec = detail ? YouTubeClient.parseDuration(detail.duration) : 0;
      addedDurationSeconds += durationSec;

      return {
        trackId,
        title: v.title,
        description: v.description,
        type: 'VIDEO' as UnitType,
        orderIndex: v.position,
        durationSeconds: durationSec,
        durationMinutes: Math.ceil(durationSec / 60),
        status: 'BACKLOG' as UnitStatus,
        metadata: {
          youtubeId: v.id,
          thumbnailUrl: v.thumbnailUrl,
          channelName: v.channelTitle,
          originalDuration: detail?.duration
        } as Prisma.InputJsonValue,
      };
    });

    await prisma.unit.createMany({ data: newUnitsData });
    await this.recalculateTrackStats(trackId);

    return { added: newItems.length };
  },

  async commitTrack(userId: string, trackId: string, data: { dailyAllocationMinutes: number, targetDate?: string }) {
    const track = await prisma.track.findFirst({ where: { id: trackId, userId } });
    if (!track) throw new Error("Track not found");

    const updatedTrack = await prisma.track.update({
      where: { id: trackId },
      data: {
        dailyAllocationMinutes: data.dailyAllocationMinutes,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      }
    });

    await this.recalculateTrackStats(trackId);
    await this.planToday(userId, trackId);

    return updatedTrack;
  },

  async planToday(userId: string, trackId: string, energyLevel: EnergyLevel = 'MEDIUM') {
    const track = await prisma.track.findFirst({
      where: { id: trackId, userId },
      include: { units: true }
    });
    if (!track) throw new Error("Track not found");

    const dailyAllocation = track.dailyAllocationMinutes || 30;
    const modifier = energyLevel === 'LOW' ? 0.6 : energyLevel === 'HIGH' ? 1.5 : 1.0;
    let totalBudget = Math.floor(dailyAllocation * modifier);

    // 0. Reset all existing today goals for this track to start fresh
    await prisma.unit.updateMany({
      where: { trackId },
      data: { todayGoalMinutes: null }
    });

    // 1. Identify existing commitment in TODAY
    const existingToday = await prisma.unit.findMany({
      where: { trackId, status: 'TODAY' }
    });
    
    // Calculate how much time is already "booked" by incomplete TODAY items
    // For partially watched videos, we only count the remaining time
    const existingCommitment = existingToday.reduce((sum, u) => {
      const remaining = (u.durationMinutes || 0) - Math.floor((u.totalWatchedSeconds || 0) / 60);
      return sum + Math.max(0, remaining);
    }, 0);
    
    // If we already have enough on our plate, don't add more.
    if (existingCommitment >= totalBudget) {
      await this.recalculateTrackStats(trackId);
      return { plannedUnitIds: existingToday.map(u => u.id), totalMinutes: existingCommitment };
    }

    // 2. Adjust budget: What's left to plan?
    let remainingBudget = totalBudget - existingCommitment;

    // 3. Find Candidates: Prioritize IN_PROGRESS (unfinished work), then THIS_WEEK, then BACKLOG
    const candidates = await prisma.unit.findMany({
      where: { 
        trackId, 
        status: { in: ['IN_PROGRESS', 'THIS_WEEK', 'BACKLOG'] } 
      }
    });

    // Custom sort to ensure strict priority: IN_PROGRESS -> THIS_WEEK -> BACKLOG
    const sortedCandidates = candidates.sort((a, b) => {
      const priority = { 'IN_PROGRESS': 3, 'THIS_WEEK': 2, 'BACKLOG': 1 };
      const aP = priority[a.status as keyof typeof priority] || 0;
      const bP = priority[b.status as keyof typeof priority] || 0;
      if (aP !== bP) return bP - aP;
      return a.orderIndex - b.orderIndex;
    });

    const unitsToUpdate: { id: string, status: UnitStatus, goal?: number }[] = [];
    let addedMinutes = 0;

    for (const unit of sortedCandidates) {
      if (remainingBudget <= 0) break;

      const totalDuration = unit.durationMinutes || 10;
      const watchedMinutes = Math.floor((unit.totalWatchedSeconds || 0) / 60);
      const remainingInUnit = Math.max(0, totalDuration - watchedMinutes);

      if (remainingInUnit <= 0) continue;

      if (remainingInUnit <= remainingBudget) {
        // Can fit the whole remaining part of this unit
        unitsToUpdate.push({ id: unit.id, status: 'TODAY', goal: totalDuration });
        addedMinutes += remainingInUnit;
        remainingBudget -= remainingInUnit;
      } else {
        // Partial fit: This unit is larger than the remaining budget
        const partialGoal = watchedMinutes + remainingBudget;
        unitsToUpdate.push({ id: unit.id, status: 'TODAY', goal: partialGoal });
        addedMinutes += remainingBudget;
        remainingBudget = 0; // Budget exhausted
      }
    }

    // Apply updates
    for (const update of unitsToUpdate) {
      await prisma.unit.update({
        where: { id: update.id },
        data: { 
          status: update.status,
          todayGoalMinutes: update.goal
        }
      });
    }

    // 4. Weekly Rebalancing (maintain buffer in THIS_WEEK)
    const weeklyTarget = dailyAllocation * 7;
    const activePipelineUnits = await prisma.unit.findMany({
      where: { trackId, status: { in: ['TODAY', 'THIS_WEEK'] } }
    });
    const currentPipelineLoad = activePipelineUnits.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
    
    if (currentPipelineLoad < weeklyTarget) {
      const needed = weeklyTarget - currentPipelineLoad;
      const backlogToPull = await prisma.unit.findMany({
        where: { trackId, status: 'BACKLOG' },
        orderBy: { orderIndex: 'asc' },
        take: 30
      });

      let pulled = 0;
      const idsToPromote: string[] = [];
      for (const unit of backlogToPull) {
        if (pulled < needed) {
          idsToPromote.push(unit.id);
          pulled += (unit.durationMinutes || 0);
        } else break;
      }

      if (idsToPromote.length > 0) {
        await prisma.unit.updateMany({
          where: { id: { in: idsToPromote } },
          data: { status: 'THIS_WEEK' }
        });
      }
    }

    await this.recalculateTrackStats(trackId);
    return { plannedUnitIds: unitsToUpdate.map(u => u.id), totalMinutes: addedMinutes + existingCommitment };
  },

  async getTrackSummary(userId: string, trackId: string) {
    const track = await prisma.track.findFirst({
      where: { id: trackId, userId },
      include: {
        units: {
          orderBy: { orderIndex: 'asc' }
        },
        user: {
          include: {
            dailySessions: {
              where: { date: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    });

    if (!track) throw new Error("Track not found");

    // Velocity Intelligence
    const sessions = track.user.dailySessions;
    const avgMinsPerDay = sessions.length > 0 
      ? sessions.reduce((acc, s) => acc + s.totalTimeMinutes, 0) / 14 
      : (track.dailyAllocationMinutes || 30);

    const remaining = track.remainingMinutes;
    const daysToFinish = avgMinsPerDay > 0 ? Math.ceil(remaining / avgMinsPerDay) : 0;
    const estCompletionDate = new Date();
    estCompletionDate.setHours(0,0,0,0);
    estCompletionDate.setDate(estCompletionDate.getDate() + daysToFinish);

    // Ahead/Behind Logic (Corrected: Compare Expected Finish vs Planned Target)
    let status: 'AHEAD' | 'BEHIND' | 'ON_TRACK' = 'ON_TRACK';
    let daysDiff = 0;

    if (track.targetDate) {
      const plannedDate = new Date(track.targetDate);
      plannedDate.setHours(0,0,0,0);
      
      const diffTime = plannedDate.getTime() - estCompletionDate.getTime();
      daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) status = 'AHEAD';
      else if (daysDiff < 0) {
        status = 'BEHIND';
        daysDiff = Math.abs(daysDiff);
      }
    } else {
      // Legacy fallback if no target date
      const startDate = track.createdAt;
      const daysSinceStart = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
      const expectedProgressMins = daysSinceStart * (track.dailyAllocationMinutes || 30);
      const actualProgressMins = (track.totalDurationMinutes - track.remainingMinutes);
      const diffMins = actualProgressMins - expectedProgressMins;
      status = diffMins > 30 ? 'AHEAD' : diffMins < -30 ? 'BEHIND' : 'ON_TRACK';
      daysDiff = Math.abs(Math.floor(diffMins / (track.dailyAllocationMinutes || 30)));
    }

    const todayUnits = track.units.filter(u => u.status === 'TODAY');
    const todayTargetMins = todayUnits.reduce((acc, u) => {
      if (u.todayGoalMinutes) {
        // If there's a specific goal for today, use the delta from current watched
        const currentWatchedMins = Math.floor((u.totalWatchedSeconds || 0) / 60);
        const goalDelta = u.todayGoalMinutes - currentWatchedMins;
        return acc + Math.max(0, goalDelta);
      }
      return acc + (u.durationMinutes || 0);
    }, 0);

    const masteredContentMinutes = track.units.reduce((acc, u) => {
      const percent = u.watchPercentage || 0;
      const duration = u.durationMinutes || 0;
      return acc + (duration * (percent / 100));
    }, 0);

    const totalInvestmentMinutes = track.units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0);

    const weeklyVelocityMins = avgMinsPerDay * 7;
    const averageWeeklyProgress = track.totalDurationMinutes > 0 ? (weeklyVelocityMins / track.totalDurationMinutes) * 100 : 0;

    return {
      track,
      stats: {
        avgMinsPerDay,
        estCompletionDate,
        status,
        daysDiff,
        todayTargetMins,
        todayTargetVideos: todayUnits.length,
        completedVideos: track.units.filter(u => u.status === 'DONE').length,
        totalVideos: track.units.length,
        masteredContentMinutes: Math.round(masteredContentMinutes),
        totalInvestmentMinutes,
        averageWeeklyProgress: parseFloat(averageWeeklyProgress.toFixed(1))
      }
    };
  },

  async startUnitSession(userId: string, unitId: string) {
    return prisma.unitSession.create({
      data: { userId, unitId, startedAt: new Date() }
    });
  },

  async endUnitSession(userId: string, sessionId: string, data: { watchedSeconds: number }) {
    const session = await prisma.unitSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date(), watchedSeconds: data.watchedSeconds },
      include: { unit: true }
    });

    const unit = session.unit;
    const newTotalWatched = (unit.totalWatchedSeconds || 0) + data.watchedSeconds;
    const duration = unit.durationSeconds || 1; 
    const percentage = Math.min((newTotalWatched / duration) * 100, 100);

    const updatedUnit = await prisma.unit.update({
      where: { id: unit.id },
      data: {
        totalWatchedSeconds: newTotalWatched,
        watchPercentage: percentage,
        lastWatchedAt: new Date(),
        status: percentage >= 95 ? 'IN_PROGRESS' : 'IN_PROGRESS'
      }
    });

    await this.updateDailySession(userId, Math.ceil(data.watchedSeconds / 60), 0, 0);
    await this.recalculateTrackStats(unit.trackId);

    return updatedUnit;
  },

  async recalculateTrackStats(trackId: string, userId?: string) {
    const track = await prisma.track.findFirst({ 
      where: { id: trackId, userId },
      include: { units: true }
    });
    if (!track) return;

    const units = track.units;
    const totalDuration = units.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);
    
    let remainingMinutes = 0;
    for (const u of units) {
      if (u.status === 'DONE') continue;
      const watched = (u.totalWatchedSeconds || 0) / 60;
      const dur = u.durationMinutes || 0;
      remainingMinutes += Math.max(0, dur - watched);
    }

    const completedUnits = units.filter(u => u.status === 'DONE');
    const progress = units.length > 0 ? (completedUnits.length / units.length) * 100 : 0;

    // Dynamic Daily Allocation: If targetDate exists, recalculate allocation to meet it
    let dailyAllocation = track.dailyAllocationMinutes;
    if (track.targetDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const target = new Date(track.targetDate);
      target.setHours(0,0,0,0);
      
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      // Calculate how many minutes per day are needed to finish on time
      dailyAllocation = Math.ceil(remainingMinutes / diffDays);
    }

    await prisma.track.update({
      where: { id: trackId },
      data: {
        totalDurationMinutes: totalDuration,
        remainingMinutes: Math.ceil(remainingMinutes),
        progressPercentage: progress,
        dailyAllocationMinutes: dailyAllocation
      }
    });
  },

  extractPlaylistId(url: string): string | null {
    const match = url.match(/[&?]list=([^&]+)/);
    return match ? match[1] : null;
  },

  async listTracks(userId: string) {
    return prisma.track.findMany({
      where: { userId },
      include: {
        units: {
          select: { 
            id: true, 
            trackId: true,
            title: true, 
            status: true, 
            type: true,
            orderIndex: true,
            actualTimeSpentMinutes: true, 
            watchPercentage: true,
            durationMinutes: true,
            todayGoalMinutes: true 
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  },

  async getTrack(userId: string, trackId: string) {
    return prisma.track.findFirst({
      where: { id: trackId, userId },
      include: { 
        units: { 
          orderBy: { orderIndex: 'asc' },
          include: {
            sessions: {
              orderBy: { startedAt: 'desc' },
              take: 20
            }
          }
        } 
      }
    });
  },

  async getUnit(userId: string, unitId: string) {
    return prisma.unit.findFirst({
      where: { id: unitId, track: { userId } },
      include: { track: true }
    });
  },

  async updateTrack(userId: string, trackId: string, updates: Partial<Prisma.TrackUpdateInput>) {
    // First verify ownership
    const track = await prisma.track.findFirst({ where: { id: trackId, userId } });
    if (!track) throw new Error("Track not found");

    return prisma.track.update({
      where: { id: trackId },
      data: updates,
    });
  },

  async deleteTrack(userId: string, trackId: string) {
    const track = await prisma.track.findFirst({ where: { id: trackId, userId } });
    if (!track) throw new Error("Track not found");

    const units = await prisma.unit.findMany({ where: { trackId } });
    const unitIds = units.map(u => u.id);

    if (unitIds.length > 0) {
      await prisma.unitSession.deleteMany({ where: { unitId: { in: unitIds } } });
      await prisma.revisionSchedule.deleteMany({ where: { unitId: { in: unitIds } } });
    }

    return prisma.track.delete({ where: { id: trackId } });
  },

  /**
   * Units
   */
  async createUnit(userId: string, data: {
    trackId: string;
    title: string;
    type: UnitType;
    estimatedEffort?: Effort;
    durationMinutes?: number;
    orderIndex?: number;
  }) {
    const track = await prisma.track.findFirst({
      where: { id: data.trackId, userId },
    });
    if (!track) throw new Error("Track not found");

    const unit = await prisma.unit.create({
      data: {
        ...data,
        status: 'BACKLOG',
      },
    });

    await this.recalculateTrackStats(data.trackId);
    return unit;
  },

  async updateUnit(userId: string, unitId: string, updates: Partial<Prisma.UnitUpdateInput>) {
    const unit = await prisma.unit.findFirst({ 
      where: { id: unitId, track: { userId } }, 
      include: { track: true } 
    });
    if (!unit) throw new Error("Unit not found");

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: updates,
    });

    if (updates.durationMinutes || updates.status === 'DONE') {
      await this.recalculateTrackStats(unit.trackId);
    }

    return updatedUnit;
  },

  async completeUnit(userId: string, unitId: string, data: { 
    confidence: number; 
    difficulty: number; 
    takeaways: string[];
    minutesSpent: number;
    watchPercentage: number;
  }) {
    const unit = await prisma.unit.findFirst({ 
      where: { id: unitId, track: { userId } }, 
      include: { track: true } 
    });
    if (!unit) throw new Error("Unit not found");

    const isFullyDone = data.watchPercentage >= 99;

    // Create session for the final effort
    if (data.minutesSpent > 0) {
      await prisma.unitSession.create({
        data: {
          userId,
          unitId,
          startedAt: new Date(Date.now() - data.minutesSpent * 60000),
          endedAt: new Date(),
          watchedSeconds: data.minutesSpent * 60
        }
      });
    }

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        status: isFullyDone ? 'DONE' : 'IN_PROGRESS',
        confidenceRating: data.confidence,
        difficultyRating: data.difficulty,
        takeaways: data.takeaways,
        lastCompletedAt: isFullyDone ? new Date() : unit.lastCompletedAt,
        watchPercentage: Math.max(unit.watchPercentage || 0, data.watchPercentage),
        actualTimeSpentMinutes: { increment: data.minutesSpent },
        lastWatchedAt: new Date()
      }
    });

    await this.recalculateTrackStats(unit.trackId);
    
    if (isFullyDone) {
      await this.scheduleRevisions(unitId);
    }
    
    // Track study load regardless of completion
    await this.updateDailySession(userId, data.minutesSpent, isFullyDone ? 1 : 0, this.calculateUnitWeight(updatedUnit)); 

    return updatedUnit;
  },

  async updateUnitProgress(userId: string, unitId: string, data: { secondsSpent: number; watchPercentage: number }) {
    const unit = await prisma.unit.findFirst({ 
      where: { id: unitId, track: { userId } }, 
      include: { track: true } 
    });
    if (!unit) throw new Error("Unit not found");

    if (data.secondsSpent > 0) {
      await prisma.unitSession.create({
        data: {
          userId,
          unitId,
          startedAt: new Date(Date.now() - data.secondsSpent * 1000),
          endedAt: new Date(),
          watchedSeconds: data.secondsSpent
        }
      });
    }

    const minutesSpent = Math.max(1, Math.round(data.secondsSpent / 60));

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        actualTimeSpentMinutes: { increment: minutesSpent },
        watchPercentage: Math.max(unit.watchPercentage || 0, data.watchPercentage),
        status: data.watchPercentage >= 95 ? 'DONE' : 'IN_PROGRESS',
        lastWatchedAt: new Date()
      }
    });

    await this.updateDailySession(userId, minutesSpent, 0, 0);
    await this.recalculateTrackStats(unit.trackId);
    return updatedUnit;
  },

  async scheduleRevisions(unitId: string) { 
    const intervals = [1, 3, 7];
    await prisma.revisionSchedule.createMany({
      data: intervals.map((d, i) => ({ unitId, nextRevisionAt: new Date(Date.now() + d*86400000), intervalLevel: i }))
    });
  },
  
  async updateDailySession(userId: string, timeSpent: number, completedCount: number, weight: number) { 
    const today = new Date(); today.setHours(0,0,0,0);
    const session = await prisma.dailySession.findFirst({ where: { userId, date: today } });
    if (session) {
      await prisma.dailySession.update({ where: { id: session.id }, data: { totalTimeMinutes: { increment: timeSpent }, tasksCompleted: { increment: completedCount }, cognitiveLoadScore: { increment: weight } } });
    } else {
      await prisma.dailySession.create({ data: { userId, date: today, energyLevel: 'MEDIUM', totalTimeMinutes: timeSpent, tasksCompleted: completedCount, cognitiveLoadScore: weight } });
    }
  },

  calculateUnitWeight(unit: Unit): number {
    let weight = 0;
    switch (unit.estimatedEffort) {
      case 'LOW': weight = 1; break;
      case 'MEDIUM': weight = 2; break;
      case 'HIGH': weight = 3; break;
      default: weight = 2;
    }

    if (unit.durationMinutes && unit.durationMinutes > 60) weight += 1;
    if (unit.difficultyRating && unit.difficultyRating >= 4) weight += 1;
    if (unit.confidenceRating && unit.confidenceRating <= 2 && unit.status === 'DONE') weight += 1;
    
    // Percentage Factor: If watched only 50%, load is less (but not 0, mental context switching costs)
    const percentage = unit.watchPercentage ?? 100;
    if (percentage < 100) {
      weight = Math.max(0.5, weight * (percentage / 100));
    }

    if (unit.type === 'REVISION') weight *= 0.75;

    return parseFloat(weight.toFixed(1));
  },

  async getDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [activeTracks, sessions, todayUnits, dueRevisions, globalNextUnit, lastReflection] = await Promise.all([
      prisma.track.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { units: { where: { status: 'TODAY' } } },
      }),
      prisma.dailySession.findMany({
        where: { userId, date: { gte: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000) } },
        orderBy: { date: 'desc' },
      }),
      prisma.unit.findMany({
        where: { track: { userId }, status: 'TODAY' },
        include: { track: true }
      }),
      prisma.revisionSchedule.findMany({
        where: { 
          unit: { track: { userId } }, 
          nextRevisionAt: { lte: tomorrow } 
        },
        include: { unit: { include: { track: true } } },
        orderBy: { nextRevisionAt: 'asc' },
        take: 5
      }),
      prisma.unit.findFirst({
        where: { 
          track: { userId, status: 'ACTIVE' }, 
          status: { in: ['TODAY', 'THIS_WEEK'] } 
        },
        orderBy: [
          { status: 'desc' }, // TODAY > THIS_WEEK
          { track: { priority: 'desc' } }, // High priority tracks first
          { orderIndex: 'asc' }
        ],
        include: { track: true }
      }),
      prisma.weeklyReflection.findFirst({
        where: { userId },
        orderBy: { weekStart: 'desc' }
      })
    ]);

    const plannedLoad = todayUnits.reduce((acc, u) => acc + this.calculateUnitWeight(u), 0);
    
    const activeSessionsCount = sessions.filter(s => s.cognitiveLoadScore > 0).length;
    let baselineCapacity = 3;
    if (activeSessionsCount >= 7) {
      baselineCapacity = sessions.reduce((acc, s) => acc + s.cognitiveLoadScore, 0) / sessions.length;
    }

    const maxNeuralCapacity = baselineCapacity * 1.5;
    const dailyLoadPercentage = Math.min(100, (plannedLoad / maxNeuralCapacity) * 100);

    const totalXP = sessions.reduce((acc, s) => acc + (s.cognitiveLoadScore * 100), 0);
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)); // Simple RPG curve: XP = 100 * level^2

    const overloadRisk = plannedLoad > baselineCapacity * 1.25;
    const recommendedReduction = overloadRisk ? Math.ceil((plannedLoad - baselineCapacity) / 2) : 0;

    const fatigueScore = this.calculateFatigueScore(sessions);
    let fatigueLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    let fatigueReason = "Optimal recovery detected.";
    
    if (fatigueScore > 6) {
      fatigueLevel = 'HIGH';
      fatigueReason = "Persistent high load without breaks.";
    } else if (fatigueScore > 3) {
      fatigueLevel = 'MODERATE';
      fatigueReason = "Moderate strain accumulated.";
    }

    const burnoutRisk = this.checkBurnoutRisk(sessions, fatigueLevel);
    const contextSwitchRisk = activeTracks.length > 4;

    const driftingTracks = activeTracks
      .filter(t => t.lastActiveAt && (today.getTime() - t.lastActiveAt.getTime()) > 7 * 24 * 60 * 60 * 1000)
      .map(t => ({ trackId: t.id, title: t.title, daysInactive: Math.floor((today.getTime() - (t.lastActiveAt?.getTime() || 0)) / (24 * 60 * 60 * 1000)) }));

    return {
      activeTracksCount: activeTracks.length,
      weeklyTimeMinutes: sessions.reduce((acc, s) => acc + s.totalTimeMinutes, 0),
      streak: this.calculateStreak(sessions),
      recommendedTodayUnits: todayUnits,
      overloadRisk,
      recommendedReduction,
      fatigueLevel,
      burnoutRisk,
      contextSwitchRisk,
      driftingTracks,
      suggestedMode: fatigueLevel === 'HIGH' ? 'LIGHT' : overloadRisk ? 'NORMAL' : 'FOCUS',
      dueRevisions: dueRevisions.map(r => r.unit),
      globalNextUnit,
      dailyLoadPercentage,
      maxNeuralCapacity,
      lastReflectedAt: lastReflection?.createdAt || null,
      loadBreakdown: {
        plannedLoad: parseFloat(plannedLoad.toFixed(1)),
        capacity: parseFloat(maxNeuralCapacity.toFixed(1)),
        highEffortUnits: todayUnits.filter(u => u.estimatedEffort === 'HIGH' || (u.durationMinutes || 0) > 45).length,
        contextSwitches: activeTracks.length
      },
      fatigueDetails: {
        score: fatigueScore,
        reason: fatigueReason,
        isBurnoutRisk: burnoutRisk
      },
      stats: {
        totalXP,
        currentLevel,
        nextLevelXP: 100 * Math.pow(currentLevel + 1, 2)
      }
    };
  },

  async saveWeeklyReflection(userId: string, data: { answers: any; moodScore: number; stressLevel: number }) {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    return prisma.weeklyReflection.create({
      data: {
        userId,
        weekStart,
        answers: data.answers,
        moodScore: data.moodScore,
        stressLevel: data.stressLevel
      }
    });
  },

  calculateFatigueScore(sessions: DailySession[]): number {
    let score = 0;
    const last7Days = sessions.slice(0, 7);
    const missedDays = 7 - last7Days.length;
    score += missedDays * 1.5;

    let streak = 0;
    for (const s of last7Days) {
      if (s.cognitiveLoadScore > 5) streak++;
      else break;
    }
    score += streak * 2;

    return score;
  },

  checkBurnoutRisk(sessions: DailySession[], fatigueLevel: string): boolean {
    if (fatigueLevel === 'HIGH') return true;
    const recentOverloads = sessions.slice(0, 10).filter(s => s.cognitiveLoadScore > 7).length;
    if (recentOverloads > 3) return true;
    return false;
  },

  calculateStreak(sessions: DailySession[]): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && sessionDate.getTime() < expectedDate.getTime()) {
        continue; 
      } else {
        break;
      }
    }
    return streak;
  }
};
