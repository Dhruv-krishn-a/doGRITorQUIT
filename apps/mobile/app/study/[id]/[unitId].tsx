import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
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
import { PerspectiveWrapper } from '../../(drawer)/_layout';
import { updateUnitNotes, toggleUnitCompletion } from '../../../lib/study-logic';

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
  const [activeTab, setActiveTab] = useState<'NOTES' | 'QUESTIONS'>('NOTES');
  
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

  const youtubeId = useMemo(() => {
    try {
      const meta = typeof unit.metadata === "string" ? JSON.parse(unit.metadata) : unit.metadata as any;
      return meta?.youtubeId || null;
    } catch {
      return null;
    }
  }, [unit]);

  useEffect(() => {
    if (unit?.notes) {
      try {
        const parsed = typeof unit.notes === 'string' ? JSON.parse(unit.notes) : unit.notes;
        if (Array.isArray(parsed)) {
          const qs = parsed.filter((n: any) => n.type === 'QUESTION');
          const others = parsed.filter((n: any) => n.type !== 'QUESTION').map((n: any) => n.content).join('\n\n');
          setQuestions(qs);
          setFreeformNotes(others);
        } else if (parsed && typeof parsed === 'object') {
          setFreeformNotes(parsed.freeform || "");
          setQuestions(parsed.questions || []);
        }
      } catch {
        if (typeof unit.notes === 'string') {
          setFreeformNotes(unit.notes);
        }
      }
    }
  }, [unit?.notes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        if (playerRef.current) {
          const currentTime = await playerRef.current.getCurrentTime();
          setVideoProgress(currentTime);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSaveNotes = async () => {
    try {
      await updateUnitNotes(unit.id, JSON.stringify({ freeform: freeformNotes, questions }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

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
    handleSaveNotes(); // Auto-save
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
              height={300}
              play={isPlaying}
              videoId={youtubeId}
              onChangeState={(state) => setIsPlaying(state === "playing")}
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
    <PerspectiveWrapper>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 bg-[var(--bg-primary)]">
          {/* Header */}
          <View className="pt-16 px-6 pb-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex-row items-center justify-between shadow-sm z-10 relative">
            <TouchableOpacity 
              onPress={() => { handleSaveNotes(); router.back(); }}
              className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl items-center justify-center active:scale-95 transition-all shadow-sm"
            >
              <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <View className="flex-1 px-4 text-center items-center">
              <Text className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] italic mb-1 opacity-80">Studying Vector</Text>
              <Text className="text-base font-black text-[var(--text-primary)] italic tracking-tighter uppercase leading-tight" numberOfLines={1}>{unit.title}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setIsDeepWork(true)}
              className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl items-center justify-center active:scale-95 transition-all shadow-sm"
            >
              <Ionicons name="flash" size={20} color="#f59e0b" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Video Player Section */}
            <View className="bg-black aspect-video w-full z-0 relative">
              {youtubeId ? (
                <YoutubePlayer
                  ref={playerRef}
                  height={240}
                  play={isPlaying}
                  videoId={youtubeId}
                  onChangeState={(state) => setIsPlaying(state === "playing")}
                />
              ) : (
                <View className="flex-1 items-center justify-center bg-[var(--bg-card)] border-b border-[var(--border-color)]">
                  <Ionicons name="videocam-off-outline" size={48} color={colors.border} />
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-4 italic opacity-40">Stream Unavailable</Text>
                </View>
              )}
            </View>

            {/* Timer & Controls */}
            <View className="px-6 py-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 bg-[var(--accent-color)]/10 rounded-2xl items-center justify-center border border-[var(--accent-color)]/20 shadow-sm">
                    <Ionicons name="timer-outline" size={24} color={colors.accent} />
                  </View>
                  <View className="text-left">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] italic opacity-40">Session Clock</Text>
                    <Text className="text-3xl font-black text-[var(--text-primary)] font-mono italic tracking-tighter leading-none">{formatTime(seconds)}</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => setIsPaused(!isPaused)}
                    className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm active:scale-95 transition-all ${isPaused ? 'bg-[var(--accent-color)] border border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                  >
                    <Ionicons name={isPaused ? "play" : "pause"} size={20} color={isPaused ? "white" : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setSeconds(0)}
                    className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)] shadow-sm active:scale-95 transition-all"
                  >
                    <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Notes & Questions Tabs */}
            <View className="px-6 pt-6 flex-1">
              <View className="flex-row gap-4 mb-6">
                {(['NOTES', 'QUESTIONS'] as const).map(tab => (
                  <TouchableOpacity 
                    key={tab} 
                    onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                    className={`px-6 py-3 rounded-full border shadow-sm transition-all ${activeTab === tab ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}
                  >
                    <Text className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${activeTab === tab ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] opacity-60'}`}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {activeTab === 'NOTES' ? (
                <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 shadow-sm min-h-[300px]">
                  <TextInput
                    multiline
                    placeholder="Capture neural insights..."
                    placeholderTextColor={`${colors.textSecondary}40`}
                    value={freeformNotes}
                    onChangeText={setFreeformNotes}
                    onEndEditing={handleSaveNotes}
                    className="flex-1 w-full text-base font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
                    style={{ textAlignVertical: 'top', minHeight: 250 }}
                  />
                </View>
              ) : (
                <View className="flex-1 space-y-4">
                  {questions.map(q => (
                    <View key={q.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm text-left">
                      <View className="flex-row justify-between items-start mb-3">
                        <Text className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-md italic border border-[var(--accent-color)]/20 shadow-sm">
                          Timestamp: {formatTime(q.timestampSeconds)}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => {
                            if (playerRef.current) playerRef.current.seekTo(q.timestampSeconds, true);
                          }}
                          className="flex-row items-center gap-1.5"
                        >
                          <Ionicons name="play-circle" size={14} color={colors.accent} />
                          <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest italic">Jump</Text>
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">{q.content}</Text>
                    </View>
                  ))}

                  <View className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex-row items-center mt-4 shadow-inner">
                    <TextInput
                      value={newQuestion}
                      onChangeText={setNewQuestion}
                      placeholder="Ask query..."
                      placeholderTextColor={`${colors.textSecondary}40`}
                      className="flex-1 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest italic"
                      onSubmitEditing={handleAddQuestion}
                    />
                    <TouchableOpacity onPress={handleAddQuestion} className="w-10 h-10 bg-[var(--accent-color)] rounded-xl items-center justify-center shadow-lg shadow-[var(--accent-color)]/20 active:scale-90 transition-all">
                      <Ionicons name="arrow-up" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Floating Action Bar */}
          <View className="absolute bottom-0 left-0 right-0 p-6 bg-[var(--bg-card)]/80 border-t border-[var(--border-color)] shadow-lg backdrop-blur-md">
             <TouchableOpacity 
               onPress={async () => {
                 await handleSaveNotes();
                 await toggleUnitCompletion(unit.id);
                 router.back();
               }}
               className="w-full py-5 bg-[var(--text-primary)] rounded-3xl items-center shadow-xl hover:opacity-90 active:scale-95 transition-all"
             >
               <Text className="text-[11px] font-black text-[var(--bg-primary)] uppercase tracking-[0.3em] italic">Commit Vector Resolution</Text>
             </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </PerspectiveWrapper>
  );
};

const EnhancedUnitSession = withObservables(['id', 'unitId'], ({ id, unitId }) => ({
  track: database.get<StudyTrack>('study_tracks').findAndObserve(id),
  unit: database.get<StudyUnit>('study_units').findAndObserve(unitId),
}))(UnitSession);

export default function UnitPage() {
  const { id, unitId } = useLocalSearchParams<{ id: string; unitId: string }>();
  
  if (!id || !unitId) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Missing Sector Data ({id ? 'Unit' : 'Track'} ID)</Text>
      </View>
    );
  }

  return <EnhancedUnitSession id={id} unitId={unitId} />;
}
