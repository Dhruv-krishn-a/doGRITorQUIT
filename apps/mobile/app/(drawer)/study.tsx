import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useStudyHub } from '../../hooks/useStudyHub';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createTrack } from '../../lib/study-logic';
import { PerspectiveWrapper } from './_layout';
import { useTheme } from '../../context/ThemeContext';

export default function StudyHubPage() {
  const { categorizedTracks, loading } = useStudyHub();
  const router = useRouter();
  const { colors } = useTheme();
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackType, setNewTrackType] = useState<'PLAYLIST' | 'COURSE' | 'PROJECT'>('COURSE');

  const handleCreateTrack = async () => {
    if (!newTrackTitle) return;
    const track = await createTrack(newTrackTitle, newTrackType);
    setModalVisible(false);
    setNewTrackTitle('');
    router.push(`/study/${track.id}`);
  };

  const TrackCard = ({ track }: { track: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/study/${track.id}`)}
      className="bg-[var(--bg-secondary)]/40 rounded-[2.5rem] p-6 border border-[var(--border-color)] mb-5 shadow-sm active:scale-[0.98] transition-all"
    >
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-3xl items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
          <Ionicons 
            name={track.type === 'PLAYLIST' ? 'logo-youtube' : track.type === 'COURSE' ? 'school' : 'rocket'} 
            size={28} 
            color={colors.accent} 
          />
        </View>
        <View className="ml-5 flex-1">
          <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase tracking-tighter" numberOfLines={1}>{track.title}</Text>
          <View className="flex-row items-center mt-3">
             <View className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]/50">
                <View 
                  className="h-full bg-[var(--accent-color)] rounded-full shadow-lg" 
                  style={{ width: `${track.progressPercentage}%` }} 
                />
             </View>
             <Text className="ml-4 text-xs font-black text-[var(--accent-color)] italic tracking-tighter">{track.progressPercentage}%</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ opacity: 0.3 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 text-left">Cognitive Matrix</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter text-left">
              Projects
            </Text>
          </View>

          <View className="flex-row gap-5 mb-12">
            <View className="flex-1 bg-[var(--bg-card)]/50 p-6 rounded-[2.5rem] border border-[var(--border-color)] items-center justify-center shadow-sm">
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Active Missions</Text>
               <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{Object.values(categorizedTracks).flat().length}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="w-24 h-24 bg-[var(--accent-color)] rounded-[3rem] items-center justify-center shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
            >
              <Ionicons name="add" size={40} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading && Object.values(categorizedTracks).every(arr => arr.length === 0) ? (
            <ActivityIndicator size="large" color={colors.accent} className="mt-10" />
          ) : (
            <>
              {['PLAYLIST', 'COURSE', 'PROJECT'].map((type) => {
                const tracks = type === 'PLAYLIST' ? categorizedTracks.youtube : type === 'COURSE' ? categorizedTracks.course : categorizedTracks.project;
                const label = type === 'PLAYLIST' ? 'Neural Playlists' : type === 'COURSE' ? 'Skill Tracks' : 'Structural Projects';
                return (
                  <View key={type} className="mb-10">
                    <View className="flex-row items-center gap-3 mb-5 ml-1">
                       <View className="w-1 h-4 bg-[var(--accent-color)] rounded-full" />
                       <Text className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">{label}</Text>
                    </View>
                    
                    {tracks.length > 0 ? (
                      tracks.map(t => <TrackCard key={t.id} track={t} />)
                    ) : (
                      <View className="p-10 bg-[var(--bg-secondary)]/20 rounded-[2.5rem] border-2 border-dashed border-[var(--border-color)] items-center justify-center">
                        <Ionicons name="layers-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.2, marginBottom: 12 }} />
                        <Text className="text-[10px] font-black text-[var(--text-secondary)]/40 uppercase italic tracking-widest text-center">Sector Empty</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View 
              style={{ backgroundColor: colors.card }}
              className="rounded-t-[3.5rem] p-10 pb-16 border-t border-[var(--border-color)] shadow-2xl"
            >
              <View className="flex-row justify-between items-center mb-10">
                <Text className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Initialize mission</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View className="mb-8">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1">Mission label</Text>
                <TextInput
                  value={newTrackTitle}
                  onChangeText={setNewTrackTitle}
                  placeholder="Designation..."
                  placeholderTextColor={colors.textSecondary + '80'}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-3xl font-black text-lg text-[var(--text-primary)] uppercase italic tracking-tight"
                />
              </View>

              <View className="mb-10">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-5 ml-1">Sector type</Text>
                <View className="flex-row gap-3">
                  {(['PLAYLIST', 'COURSE', 'PROJECT'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNewTrackType(type)}
                      className={`flex-1 py-5 rounded-2xl items-center border ${
                        newTrackType === type ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-sky-500/20' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                      }`}
                    >
                      <Text className={`text-[9px] font-black uppercase tracking-widest ${
                        newTrackType === type ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                      }`}>
                        {type === 'PLAYLIST' ? 'Media' : type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCreateTrack}
                activeOpacity={0.9}
                className="bg-[var(--accent-color)] py-6 rounded-3xl items-center shadow-xl shadow-sky-500/30"
              >
                <Text className="text-[var(--bg-primary)] font-black uppercase tracking-[0.2em] text-xs italic">Execute initialization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </PerspectiveWrapper>
  );
}
