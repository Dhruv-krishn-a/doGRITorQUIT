import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
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
import { updateUnitNotes, toggleUnitCompletion } from '../../../lib/study-logic';
import { sendImmediateNotification } from '../../../lib/notifications';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* Fixed Video Player Header */}
        <View className="bg-black aspect-video w-full z-20 relative shadow-2xl">
          {youtubeId ? (
            <YoutubePlayer
              ref={playerRef}
              height={Dimensions.get('window').width * (9/16)}
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
          
          {/* Top Control Overlay */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-30 pointer-events-none">
             <TouchableOpacity 
              onPress={() => { handleSaveNotes(); router.back(); }}
              className="w-10 h-10 bg-black/40 rounded-xl items-center justify-center border border-white/10 pointer-events-auto"
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsDeepWork(true)}
              className="w-10 h-10 bg-amber-500/40 border border-amber-500/20 rounded-xl items-center justify-center pointer-events-auto"
            >
              <Ionicons name="expand" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Main Controls & Content */}
          <View className="flex-1">
            <View className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex-row items-center justify-between shadow-sm">
               <View className="flex-1">
                  <Text className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] italic mb-0.5">Focus Clock</Text>
                  <Text className="text-xl font-black text-[var(--text-primary)] italic tracking-tighter" numberOfLines={1}>{formatTime(seconds)}</Text>
               </View>
               <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => setIsPaused(!isPaused)}
                    className={`w-10 h-10 rounded-xl items-center justify-center shadow-sm ${isPaused ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                  >
                    <Ionicons name={isPaused ? "play" : "pause"} size={18} color={isPaused ? "white" : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={async () => {
                      await handleSaveNotes();
                      await toggleUnitCompletion(unit.id);
                      sendImmediateNotification("Mission Success 🏁", `Sector "${unit.title}" has been resolved.`);
                      router.back();
                    }}
                    className="h-10 px-5 bg-[var(--text-primary)] rounded-xl items-center justify-center shadow-md"
                  >
                    <Text className="text-[8px] font-black text-[var(--bg-primary)] uppercase tracking-widest italic">Resolve</Text>
                  </TouchableOpacity>
               </View>
            </View>

            <View className="flex-1">
              <View className="flex-row px-6 py-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] gap-4">
                {(['NOTES', 'QUESTIONS'] as const).map(tab => (
                  <TouchableOpacity 
                    key={tab} 
                    onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                    className={`pb-2 border-b-2 ${activeTab === tab ? 'border-[var(--accent-color)]' : 'border-transparent'}`}
                  >
                    <Text className={`text-[9px] font-black uppercase tracking-widest italic ${activeTab === tab ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-40'}`}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {activeTab === 'NOTES' ? (
                  <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-sm min-h-[400px]">
                    <TextInput
                      multiline
                      placeholder="Capture neural insights..."
                      placeholderTextColor={`${colors.textSecondary}40`}
                      value={freeformNotes}
                      onChangeText={setFreeformNotes}
                      className="flex-1 w-full text-base font-black italic text-[var(--text-primary)] uppercase tracking-tighter"
                      style={{ textAlignVertical: 'top' }}
                    />
                  </View>
                ) : (
                  <View className="flex-1 space-y-4">
                    {questions.map(q => (
                      <View key={q.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm text-left">
                        <View className="flex-row justify-between items-start mb-3">
                          <Text className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-md italic">
                            {formatTime(q.timestampSeconds)}
                          </Text>
                          <TouchableOpacity 
                            onPress={() => { if (playerRef.current) playerRef.current.seekTo(q.timestampSeconds, true); }}
                            className="flex-row items-center gap-1.5"
                          >
                            <Ionicons name="play-circle" size={14} color={colors.accent} />
                            <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase italic">Jump</Text>
                          </TouchableOpacity>
                        </View>
                        <Text className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">{q.content}</Text>
                      </View>
                    ))}

                    <View className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex-row items-center mt-4">
                      <TextInput
                        value={newQuestion}
                        onChangeText={setNewQuestion}
                        placeholder="Ask query..."
                        placeholderTextColor={`${colors.textSecondary}40`}
                        className="flex-1 text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest italic"
                        onSubmitEditing={handleAddQuestion}
                      />
                      <TouchableOpacity onPress={handleAddQuestion} className="w-10 h-10 bg-[var(--accent-color)] rounded-xl items-center justify-center shadow-lg active:scale-90 transition-all">
                        <Ionicons name="arrow-up" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
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
