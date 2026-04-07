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
      className="bg-[var(--bg-secondary)]/20 rounded-[2rem] p-5 border border-[var(--border-color)] mb-4"
    >
      <View className="flex-row items-center">
        <View className={`w-14 h-14 rounded-2xl items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)]`}>
          <Ionicons 
            name={track.type === 'PLAYLIST' ? 'logo-youtube' : track.type === 'COURSE' ? 'school' : 'rocket'} 
            size={24} 
            color={colors.accent} 
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-[var(--text-primary)] font-black text-lg italic uppercase tracking-tight" numberOfLines={1}>{track.title}</Text>
          <View className="flex-row items-center mt-2">
             <View className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <View 
                  className="h-full bg-[var(--accent-color)] rounded-full" 
                  style={{ width: `${track.progressPercentage}%` }} 
                />
             </View>
             <Text className="ml-3 text-[10px] font-black text-[var(--accent-color)] italic">{track.progressPercentage}%</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2">Knowledge Matrix</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
              Projects
            </Text>
          </View>

          <View className="flex-row gap-4 mb-10">
            <View className="flex-1 bg-[var(--bg-secondary)]/30 p-5 rounded-[2rem] border border-[var(--border-color)] items-center justify-center">
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Active Missions</Text>
               <Text className="text-2xl font-black text-[var(--text-primary)] italic">{Object.values(categorizedTracks).flat().length}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)}
              className="w-20 h-20 bg-[var(--accent-color)] rounded-[2rem] items-center justify-center shadow-lg shadow-sky-500/20"
            >
              <Ionicons name="add" size={32} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loading && Object.values(categorizedTracks).every(arr => arr.length === 0) ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              {['PLAYLIST', 'COURSE', 'PROJECT'].map((type) => {
                const tracks = type === 'PLAYLIST' ? categorizedTracks.youtube : type === 'COURSE' ? categorizedTracks.course : categorizedTracks.project;
                const label = type === 'PLAYLIST' ? 'Neural Playlists' : type === 'COURSE' ? 'Skill Tracks' : 'Structural Projects';
                return (
                  <View key={type} className="mb-8">
                    <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 ml-1">{label}</Text>
                    {tracks.length > 0 ? (
                      tracks.map(t => <TrackCard key={t.id} track={t} />)
                    ) : (
                      <View className="p-6 bg-[var(--bg-secondary)]/10 rounded-3xl border border-dashed border-[var(--border-color)] items-center">
                        <Text className="text-[10px] font-bold text-[var(--text-secondary)]/50 uppercase italic">Empty Sector</Text>
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
          <View className="flex-1 justify-end bg-[var(--bg-primary)]/80">
            <View className="bg-[var(--bg-secondary)] rounded-t-[3rem] p-8 pb-12 border-t border-[var(--border-color)]">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-black italic uppercase text-[var(--text-primary)]">Initialize Mission</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-1">Mission Label</Text>
                <TextInput
                  value={newTrackTitle}
                  onChangeText={setNewTrackTitle}
                  placeholder="Mission Name..."
                  placeholderTextColor={colors.textSecondary}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-5 rounded-2xl font-bold text-[var(--text-primary)] uppercase italic"
                />
              </View>

              <View className="mb-8">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4 ml-1">Sector Type</Text>
                <View className="flex-row gap-3">
                  {(['PLAYLIST', 'COURSE', 'PROJECT'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNewTrackType(type)}
                      className={`flex-1 py-4 rounded-2xl items-center border ${
                        newTrackType === type ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-sky-500/20' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                      }`}
                    >
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${
                        newTrackType === type ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCreateTrack}
                className="bg-[var(--accent-color)] p-6 rounded-[2rem] items-center shadow-lg shadow-sky-500/20"
              >
                <Text className="text-[var(--bg-primary)] font-black uppercase tracking-widest">Execute Initialization</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </PerspectiveWrapper>
  );
}
