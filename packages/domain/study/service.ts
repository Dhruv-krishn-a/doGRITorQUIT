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
  EnergyLevel
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

  async importPlaylist(userId: string, playlistUrl: string) {
    const playlistId = this.extractPlaylistId(playlistUrl);
    if (!playlistId) throw new Error("Invalid YouTube Playlist URL");

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
        status: 'ACTIVE',
        totalDurationMinutes: Math.ceil(totalDurationSeconds / 60),
        remainingMinutes: Math.ceil(totalDurationSeconds / 60),
        units: {
          create: unitsData
        }
      },
    });

    return prisma.track.findUnique({
      where: { id: track.id },
      include: { _count: { select: { units: true } } },
    });
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
    const track = await prisma.track.findUnique({
      where: { id: trackId, userId },
      include: { units: true }
    });
    if (!track) throw new Error("Track not found");

    const dailyAllocation = track.dailyAllocationMinutes || 30;
    const modifier = energyLevel === 'LOW' ? 0.6 : energyLevel === 'HIGH' ? 1.5 : 1.0;
    let budgetMinutes = Math.floor(dailyAllocation * modifier);

    const candidates = await prisma.unit.findMany({
      where: { 
        trackId, 
        status: { in: ['THIS_WEEK', 'BACKLOG', 'TODAY'] } 
      },
      orderBy: [
        { status: 'desc' }, // TODAY first (to keep them), then THIS_WEEK, then BACKLOG
        { orderIndex: 'asc' }
      ]
    });

    const plannedUnitIds: string[] = [];
    let plannedMinutes = 0;

    for (const unit of candidates) {
      if (plannedMinutes >= budgetMinutes) break;
      const dur = unit.durationMinutes || 10;
      plannedUnitIds.push(unit.id);
      plannedMinutes += dur;
    }

    if (plannedUnitIds.length > 0) {
      await prisma.unit.updateMany({
        where: { trackId, status: 'TODAY' },
        data: { status: 'THIS_WEEK' }
      });

      await prisma.unit.updateMany({
        where: { id: { in: plannedUnitIds } },
        data: { status: 'TODAY' }
      });
    }

    // Weekly rebalancing
    const weeklyBudget = dailyAllocation * 7;
    const backlogUnits = await prisma.unit.findMany({
      where: { trackId, status: { in: ['BACKLOG', 'THIS_WEEK'] }, id: { notIn: plannedUnitIds } },
      orderBy: { orderIndex: 'asc' },
      take: 50 
    });

    let currentWeeklySum = 0;
    const thisWeekIds: string[] = [];
    for (const unit of backlogUnits) {
      if (currentWeeklySum + (unit.durationMinutes || 0) <= weeklyBudget) {
        thisWeekIds.push(unit.id);
        currentWeeklySum += (unit.durationMinutes || 0);
      } else {
        break;
      }
    }

    if (thisWeekIds.length > 0) {
      await prisma.unit.updateMany({
        where: { id: { in: thisWeekIds } },
        data: { status: 'THIS_WEEK' }
      });
    }

    return { plannedUnitIds, totalMinutes: plannedMinutes };
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
    estCompletionDate.setDate(estCompletionDate.getDate() + daysToFinish);

    // Ahead/Behind Logic
    const startDate = track.createdAt;
    const daysSinceStart = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
    const expectedProgressMins = daysSinceStart * (track.dailyAllocationMinutes || 30);
    const actualProgressMins = (track.totalDurationMinutes - track.remainingMinutes);
    
    const diffMins = actualProgressMins - expectedProgressMins;
    const status = diffMins > 30 ? 'AHEAD' : diffMins < -30 ? 'BEHIND' : 'ON_TRACK';
    const daysDiff = Math.abs(Math.floor(diffMins / (track.dailyAllocationMinutes || 30)));

    const todayUnits = track.units.filter(u => u.status === 'TODAY');
    const todayTargetMins = todayUnits.reduce((acc, u) => acc + (u.durationMinutes || 0), 0);

    const masteredContentMinutes = track.units.reduce((acc, u) => {
      const percent = u.watchPercentage || 0;
      const duration = u.durationMinutes || 0;
      return acc + (duration * (percent / 100));
    }, 0);

    const totalInvestmentMinutes = track.units.reduce((acc, u) => acc + (u.actualTimeSpentMinutes || 0), 0);

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
        totalInvestmentMinutes
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

  async recalculateTrackStats(trackId: string) {
    const units = await prisma.unit.findMany({ where: { trackId } });
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

    await prisma.track.update({
      where: { id: trackId },
      data: {
        totalDurationMinutes: totalDuration,
        remainingMinutes: Math.ceil(remainingMinutes),
        progressPercentage: progress
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
      orderBy: { updatedAt: 'desc' }
    });
  },

  async getTrack(userId: string, trackId: string) {
    return prisma.track.findFirst({
      where: { id: trackId, userId },
      include: { units: { orderBy: { orderIndex: 'asc' } } }
    });
  },

  async getUnit(userId: string, unitId: string) {
    return prisma.unit.findFirst({
      where: { id: unitId, track: { userId } },
      include: { track: true }
    });
  },

  async updateTrack(userId: string, trackId: string, updates: Partial<Prisma.TrackUpdateInput>) {
    return prisma.track.update({
      where: { id: trackId, userId },
      data: updates,
    });
  },

  async deleteTrack(userId: string, trackId: string) {
    const units = await prisma.unit.findMany({ where: { trackId, track: { userId } } });
    const unitIds = units.map(u => u.id);

    if (unitIds.length > 0) {
      await prisma.unitSession.deleteMany({ where: { unitId: { in: unitIds } } });
      await prisma.revisionSchedule.deleteMany({ where: { unitId: { in: unitIds } } });
    }

    return prisma.track.delete({ where: { id: trackId, userId } });
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
    const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { track: true } });
    if (!unit || unit.track.userId !== userId) throw new Error("Unit not found");

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
    const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { track: true } });
    if (!unit || unit.track.userId !== userId) throw new Error("Unit not found");

    const isFullyDone = data.watchPercentage >= 99;

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        status: isFullyDone ? 'DONE' : 'IN_PROGRESS',
        confidenceRating: data.confidence,
        difficultyRating: data.difficulty,
        takeaways: data.takeaways,
        lastCompletedAt: isFullyDone ? new Date() : unit.lastCompletedAt,
        watchPercentage: data.watchPercentage,
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

  async updateUnitProgress(userId: string, unitId: string, data: { minutesSpent: number; watchPercentage: number }) {
    const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { track: true } });
    if (!unit || unit.track.userId !== userId) throw new Error("Unit not found");

    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        actualTimeSpentMinutes: { increment: data.minutesSpent },
        watchPercentage: data.watchPercentage,
        status: data.watchPercentage >= 95 ? 'DONE' : 'IN_PROGRESS',
        lastWatchedAt: new Date()
      }
    });

    await this.updateDailySession(userId, data.minutesSpent, 0, 0);
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

  calculateUnitWeight(unit: any): number {
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

    const [activeTracks, sessions, todayUnits, dueRevisions, globalNextUnit] = await Promise.all([
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
      })
    ]);

    const plannedLoad = todayUnits.reduce((acc, u) => acc + this.calculateUnitWeight(u), 0);
    
    const activeSessions = sessions.filter(s => s.cognitiveLoadScore > 0);
    let baselineCapacity = 3;
    if (activeSessions.length >= 7) {
      baselineCapacity = activeSessions.reduce((acc, s) => acc + s.cognitiveLoadScore, 0) / activeSessions.length;
    }

    const maxNeuralCapacity = baselineCapacity * 1.5;
    const dailyLoadPercentage = Math.min(100, (plannedLoad / maxNeuralCapacity) * 100);

    const totalXP = sessions.reduce((acc, s) => acc + (s.cognitiveLoadScore * 100), 0);
    const currentLevel = Math.floor(Math.sqrt(totalXP / 100)); // Simple RPG curve: XP = 100 * level^2

    const overloadRisk = plannedLoad > baselineCapacity * 1.25;
    const recommendedReduction = overloadRisk ? Math.ceil((plannedLoad - baselineCapacity) / 2) : 0;

    const fatigueScore = this.calculateFatigueScore(sessions);
    let fatigueLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    if (fatigueScore > 6) fatigueLevel = 'HIGH';
    else if (fatigueScore > 3) fatigueLevel = 'MODERATE';

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
      stats: {
        totalXP,
        currentLevel,
        nextLevelXP: 100 * Math.pow(currentLevel + 1, 2)
      }
    };
  },

  calculateFatigueScore(sessions: any[]): number {
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

  checkBurnoutRisk(sessions: any[], fatigueLevel: string): boolean {
    if (fatigueLevel === 'HIGH') return true;
    const recentOverloads = sessions.slice(0, 10).filter(s => s.cognitiveLoadScore > 7).length;
    if (recentOverloads > 3) return true;
    return false;
  },

  calculateStreak(sessions: any[]): number {
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
