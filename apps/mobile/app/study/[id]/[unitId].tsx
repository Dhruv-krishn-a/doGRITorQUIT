import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions, AppState, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../../db';
import StudyTrack from '../../../db/models/StudyTrack';
import StudyUnit from '../../../db/models/StudyUnit';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import YoutubePlayer from 'react-native-youtube-iframe';
import { updateUnitNotes, toggleUnitCompletion, logUnitSession } from '../../../lib/study-logic';
import { sendImmediateNotification } from '../../../lib/notifications';
import { map } from 'rxjs/operators';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface UnitSessionProps {
  track: StudyTrack;
  unit: StudyUnit;
}

interface Question {
  id: string;
  type: string;
  content: string;
  timestampSeconds: number;
}

const UnitSession: React.FC<UnitSessionProps> = ({ track, unit }) => {
  const router = useRouter();
  const { colors } = useTheme();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'NOTES' | 'QUESTIONS' | 'RESOURCES'>('NOTES');
  
  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDeepWork, setIsDeepWork] = useState(false);

  // Notes State
  const [freeformNotes, setFreeformNotes] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");

  // Youtube Player
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

  const youtubeId = useMemo(() => {
    try {
      const meta = typeof unit.metadata === "string" ? JSON.parse(unit.metadata) : unit.metadata as any;
      console.log(`[Neural Handshake] Sector Metadata:`, meta);
      // Fallback chain for various ingestion formats
      return meta?.videoId || meta?.youtubeId || meta?.id || (typeof unit.metadata === 'string' && unit.metadata.length < 15 ? unit.metadata : null);
    } catch {
      return null;
    }
  }, [unit.metadata]);

  // Initial Data Load
  useEffect(() => {
    if (unit?.metadata) {
      try {
        const meta = typeof unit.metadata === 'string' ? JSON.parse(unit.metadata) : unit.metadata;
        if (meta?.notes) {
          const parsed = typeof meta.notes === 'string' ? JSON.parse(meta.notes) : meta.notes;
          if (parsed && typeof parsed === 'object') {
            setFreeformNotes(parsed.freeform || "");
            setQuestions(parsed.questions || []);
          }
        }
      } catch (e) {
        console.warn("Failed to parse unit metadata", e);
      }
    }
  }, [unit?.id]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Video Progress Tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playerReady) {
      interval = setInterval(async () => {
        if (playerRef.current) {
          try {
            const currentTime = await playerRef.current.getCurrentTime();
            setVideoProgress(currentTime);
          } catch(e) {}
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playerReady]);

  const handleSaveNotes = async () => {
    try {
      await updateUnitNotes(unit.id, JSON.stringify({ freeform: freeformNotes, questions }));
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  };

  // Auto-save every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveNotes();
    }, 15000);
    return () => clearInterval(interval);
  }, [freeformNotes, questions]);

  // AppState Listener for Background Saving
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        handleSaveNotes();
      }
    });
    return () => subscription.remove();
  }, [freeformNotes, questions]);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const q: Question = {
      id: Date.now().toString(),
      type: 'QUESTION',
      content: newQuestion.trim(),
      timestampSeconds: videoProgress || 0
    };
    setQuestions(prev => [...prev, q]);
    setNewQuestion("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSaveNotes();
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (isDeepWork) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 justify-center">
          {youtubeId ? (
            <YoutubePlayer
              ref={playerRef}
              height={SCREEN_WIDTH * (9/16)}
              play={isPlaying}
              videoId={youtubeId}
              onReady={() => setPlayerReady(true)}
              onChangeState={(state) => setIsPlaying(state === "playing")}
              onError={(e) => console.error("YT Player Error:", e)}
            />
          ) : (
            <View className="items-center justify-center p-10">
              <Ionicons name="videocam-off-outline" size={48} color="#333" />
              <Text className="text-[10px] font-black uppercase tracking-widest text-[#555] mt-4 italic">No media stream</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => setIsDeepWork(false)}
          className="absolute top-12 right-6 p-4 bg-white/10 rounded-full border border-white/20"
        >
          <Ionicons name="contract" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* Fixed Video Player Header */}
      <View className="bg-black aspect-video w-full z-20 relative">
        {youtubeId ? (
          <YoutubePlayer
            ref={playerRef}
            height={SCREEN_WIDTH * (9/16)}
            play={isPlaying}
            videoId={youtubeId}
            onReady={() => {
               setPlayerReady(true);
               console.log("[Neural Link] Sector Stream Ready.");
            }}
            onChangeState={(state: any) => setIsPlaying(state === "playing")}
            onError={(e: any) => console.error("YT Player Error:", e)}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-black border-b border-[var(--border-color)]">
            <View className="w-40 h-40 rounded-full border-[8px] border-[var(--accent-color)]/20 items-center justify-center relative  [var(--accent-color)]/10">
               <View className="absolute inset-0 rounded-full border-[8px] border-transparent border-t-[var(--accent-color)]" style={{ transform: [{ rotate: `${(seconds % 60) * 6}deg` }] }} />
               <Ionicons name="time" size={32} color={colors.accent} className="mb-2" />
               <Text className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic">{formatTime(seconds)}</Text>
            </View>
            <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.3em] mt-8 italic opacity-80">Deep Work Protocol</Text>
          </View>
        )}
        
        {/* Top Control Overlay */}
        <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-30">
          <TouchableOpacity 
            onPress={() => { handleSaveNotes(); router.back(); }}
            className="w-10 h-10 bg-black/60 rounded-xl items-center justify-center border border-white/10"
          >
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
               Haptics.selectionAsync();
               setIsDeepWork(true);
            }}
            className="w-10 h-10 bg-amber-500/60 border border-amber-500/20 rounded-xl items-center justify-center"
          >
            <Ionicons name="expand" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Main Controls & Content */}
        <View className="flex-1">
          <View className="px-8 py-8 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex-row items-center justify-between ">
            <View className="flex-1 text-left">
              <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] italic mb-2 text-left">Sector Timeline</Text>
              <Text className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none text-left" numberOfLines={1}>{formatTime(seconds)}</Text>
            </View>
            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => {
                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                   setIsPaused(!isPaused);
                }}
                className={`w-14 h-14 rounded-2xl items-center justify-center ${isPaused ? 'bg-[var(--accent-color)]  [var(--accent-color)]/30' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
              >
                <Ionicons name={isPaused ? "play" : "pause"} size={26} color={isPaused ? "white" : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  await handleSaveNotes();
                  await toggleUnitCompletion(unit.id);
                  const startedAt = Date.now() - (seconds * 1000);
                  await logUnitSession(unit.id, 'default', startedAt, seconds);
                  sendImmediateNotification("Sector Resolved 🏁", `Node "${unit.title}" has been committed to history.`);
                  router.back();
                }}
                className="h-14 px-8 bg-[var(--text-primary)] rounded-2xl items-center justify-center  "
              >
                <Text className="text-[11px] font-black text-[var(--bg-primary)] uppercase tracking-widest italic">Resolve Node</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1">
            <View className="flex-row px-8 py-5 bg-[var(--bg-card)] border-b border-[var(--border-color)] gap-8">
              {(['NOTES', 'QUESTIONS', 'RESOURCES'] as const).map(tab => (
                <TouchableOpacity 
                  key={tab} 
                  onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                  className={`pb-3 border-b-2 ${activeTab === tab ? 'border-[var(--accent-color)]' : 'border-transparent'}`}
                >
                  <Text className={`text-[10px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-40'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
              {activeTab === 'NOTES' && (
                <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 min-h-[500px] ">
                  <TextInput
                    multiline
                    placeholder="Capture neural insights and session breakthroughs..."
                    placeholderTextColor={`${colors.textSecondary}40`}
                    value={freeformNotes}
                    onChangeText={setFreeformNotes}
                    className="flex-1 w-full text-lg font-black italic text-[var(--text-primary)] uppercase tracking-tighter text-left"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>
              )}
              
              {activeTab === 'QUESTIONS' && (
                <View className="flex-1 space-y-6">
                  {questions.length === 0 && (
                    <View className="py-20 items-center justify-center opacity-20">
                       <Ionicons name="help-buoy-outline" size={48} color={colors.textSecondary} />
                       <Text className="text-[10px] font-black uppercase tracking-widest mt-6">No queries logged</Text>
                    </View>
                  )}
                  {questions.map(q => (
                    <View key={q.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-[3rem]  text-left">
                      <View className="flex-row justify-between items-start mb-6">
                        <View className="bg-[var(--accent-color)]/10 px-4 py-2 rounded-xl border border-[var(--accent-color)]/20">
                          <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] italic">
                            {formatTime(q.timestampSeconds)}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => { if (playerRef.current) playerRef.current.seekTo(q.timestampSeconds, true); }}
                          className="flex-row items-center gap-2 bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-color)]"
                        >
                          <Ionicons name="play" size={14} color={colors.accent} />
                          <Text className="text-[11px] font-black text-[var(--text-primary)] uppercase italic">Jump to Stream</Text>
                        </TouchableOpacity>
                      </View>
                      <Text className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight italic leading-relaxed text-left">{q.content}</Text>
                    </View>
                  ))}

                  <View className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] p-6 flex-row items-center mt-8 ">
                    <TextInput
                      value={newQuestion}
                      onChangeText={setNewQuestion}
                      placeholder="Input neural query..."
                      placeholderTextColor={`${colors.textSecondary}40`}
                      className="flex-1 text-base font-black text-[var(--text-primary)] uppercase tracking-widest italic text-left"
                      onSubmitEditing={handleAddQuestion}
                    />
                    <TouchableOpacity onPress={handleAddQuestion} className="w-14 h-14 bg-[var(--accent-color)] rounded-2xl items-center justify-center active:scale-90 transition-all  [var(--accent-color)]/20 ml-4">
                      <Ionicons name="arrow-up" size={28} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {activeTab === 'RESOURCES' && (
                <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-12 items-center justify-center opacity-70 min-h-[400px] ">
                   <View className="w-24 h-24 bg-[var(--bg-secondary)] rounded-[3rem] items-center justify-center mb-10 border border-[var(--border-color)] ">
                      <Ionicons name="link-outline" size={48} color={colors.textSecondary} />
                   </View>
                   <Text className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-widest italic text-center">Node Resources Empty</Text>
                   <Text className="text-[12px] font-bold text-[var(--text-secondary)] text-center mt-6 leading-relaxed tracking-widest uppercase opacity-60">
                     Attach external neural links, documentation, or technical assets from the Desktop OS for mobile accessibility.
                   </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const EnhancedUnitSession = withObservables(['id', 'unitId'], ({ id, unitId }) => ({
  track: database.get<StudyTrack>('study_tracks').query(Q.where('id', id)).observe().pipe(map(rows => rows[0] || null)),
  unit: database.get<StudyUnit>('study_units').query(Q.where('id', unitId)).observe().pipe(map(rows => rows[0] || null)),
}))(({ track, unit }: { track: StudyTrack | null, unit: StudyUnit | null }) => {
  const { colors } = useTheme();
  const router = useRouter();

  if (!track || !unit) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
        <ActivityIndicator color={colors.accent} />
        <Text className="text-white font-black italic uppercase mt-6 tracking-widest opacity-40 text-center">Neural handshake in progress...{'\n'}Synchronizing sector data</Text>
      </View>
    );
  }

  return <UnitSession track={track} unit={unit} />;
});

export default function UnitPage() {
  const { id, unitId } = useLocalSearchParams<{ id: string; unitId: string }>();
  if (!id || !unitId) return null;
  return <EnhancedUnitSession id={id} unitId={unitId} />;
}
