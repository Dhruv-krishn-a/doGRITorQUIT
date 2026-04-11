import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface YoutubeImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImport: (url: string) => void;
}

export const YoutubeImportModal: React.FC<YoutubeImportModalProps> = ({ isVisible, onClose, onImport }) => {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    if (!url.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsImporting(true);
    onImport(url);
    // Simulate
    setTimeout(() => {
      setIsImporting(false);
      onClose();
    }, 2500);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View 
          style={{ backgroundColor: colors.card }}
          className="rounded-t-[3.5rem] p-8 pb-16 border-t border-[var(--border-color)] shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center gap-3 text-left">
               <View className="w-10 h-10 bg-rose-500/10 rounded-xl items-center justify-center border border-rose-500/20">
                  <Ionicons name="logo-youtube" size={20} color="#f43f5e" />
               </View>
               <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Media Path</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isImporting ? (
            <View className="py-20 items-center justify-center">
               <ActivityIndicator size="large" color="#f43f5e" />
               <Text className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tighter mt-8">Ingesting Content...</Text>
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40">Connecting to API stream</Text>
            </View>
          ) : (
            <View className="space-y-8">
              <View className="text-left">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic">YouTube Playlist URL</Text>
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://youtube.com/playlist?list=..."
                  placeholderTextColor={colors.textSecondary + '40'}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-3xl font-black text-sm text-[var(--text-primary)] uppercase italic tracking-tight"
                />
              </View>

              <View className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-left">
                 <Text className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest leading-relaxed italic">
                   The system will automatically extract all videos from the playlist and create a structured learning path.
                 </Text>
              </View>

              <TouchableOpacity 
                onPress={handleImport}
                disabled={!url.trim()}
                className={`w-full p-6 rounded-3xl items-center shadow-xl ${!url.trim() ? 'bg-gray-500 opacity-20' : 'bg-rose-500 shadow-rose-500/30'}`}
              >
                <Text className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Start Ingestion</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
