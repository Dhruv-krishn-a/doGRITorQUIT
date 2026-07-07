import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { ingestYoutubePlaylist } from '../../../lib/path-creation';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaInitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const MediaInitModal: React.FC<MediaInitModalProps> = ({ isVisible, onClose, onRefresh }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  // Form State
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const reset = () => {
    setUrl('');
    setTitle('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImport = async () => {
    if (!url) return;
    setLoading(true);
    try {
      // @ts-ignore
      await ingestYoutubePlaylist(url, title);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      handleClose();
      Alert.alert("Stream Buffered", "Media sequence is being ingested. Broadcast will start shortly across your neural network.");
    } catch (err: any) {
      Alert.alert("Buffer Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View style={{ backgroundColor: colors.card }} className="rounded-t-[4rem] p-10 pb-16 border-t border-[var(--border-color)] max-h-[90%]">
          {/* Header Protocol */}
          <View className="flex-row justify-between items-center mb-12 text-left">
             <View className="flex-row items-center gap-4 text-left">
               <TouchableOpacity onPress={handleClose} className="p-3 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                 <Ionicons name="close" size={20} color={colors.textSecondary} />
               </TouchableOpacity>
               <View className="text-left">
                  <Text className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] italic text-left">Ingestion Protocol</Text>
                  <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] text-left">New Media</Text>
               </View>
             </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="space-y-12">
              <View className="text-left">
                 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Playlist URL *</Text>
                 <TextInput autoCorrect={false} spellCheck={false}
                   value={url}
                   onChangeText={setUrl}
                   placeholder="HTTPS://WWW.YOUTUBE.COM/PLAYLIST?LIST=..."
                   placeholderTextColor={colors.textSecondary + '40'}
                   className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-base text-[var(--text-primary)] uppercase italic tracking-tight text-left"
                 />
              </View>

              <View className="text-left">
                 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Custom Path Title (Optional)</Text>
                 <TextInput autoCorrect={false} spellCheck={false}
                   value={title}
                   onChangeText={setTitle}
                   placeholder="E.G., SYSTEM DESIGN MASTERCLASS..."
                   placeholderTextColor={colors.textSecondary + '40'}
                   className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-base text-[var(--text-primary)] uppercase italic tracking-tight text-left"
                 />
              </View>

              <View className="p-8 bg-rose-500/[0.03] border border-rose-500/20 rounded-[2.5rem] text-left">
                 <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase leading-relaxed text-left opacity-60">
                   We will automatically fetch all videos, durations, and metadata to build your tracking engine.
                 </Text>
              </View>

              <TouchableOpacity 
                disabled={!url || loading}
                onPress={handleImport}
                className={`py-8 rounded-[2.5rem] items-center justify-center ${!url ? 'opacity-30 bg-[var(--bg-secondary)]' : 'bg-rose-600'}`}
              >
                 {loading ? <ActivityIndicator color="white" /> : (
                   <View className="flex-row items-center gap-4">
                      <Ionicons name="logo-youtube" size={20} color="white" />
                      <Text className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Import Media Path</Text>
                   </View>
                 )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
