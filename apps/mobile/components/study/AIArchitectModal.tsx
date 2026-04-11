import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface AIArchitectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, type: string) => void;
}

export const AIArchitectModal: React.FC<AIArchitectModalProps> = ({ isVisible, onClose, onGenerate }) => {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('COURSE');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsGenerating(true);
    onGenerate(prompt, type);
    // Simulation of generation delay
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
    }, 3000);
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
               <View className="w-10 h-10 bg-sky-500/10 rounded-xl items-center justify-center border border-sky-500/20">
                  <Ionicons name="sparkles" size={20} color={colors.accent} />
               </View>
               <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">AI Architect</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isGenerating ? (
            <View className="py-20 items-center justify-center">
               <ActivityIndicator size="large" color={colors.accent} />
               <Text className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tighter mt-8">Building your path...</Text>
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40">Mapping neural steps</Text>
            </View>
          ) : (
            <View className="space-y-8">
              <View className="text-left">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic">What do you want to learn?</Text>
                <TextInput
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="e.g. Master React Native in 30 days..."
                  placeholderTextColor={colors.textSecondary + '40'}
                  multiline
                  textAlignVertical="top"
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2.5rem] font-black text-lg text-[var(--text-primary)] uppercase italic tracking-tight min-h-[160px]"
                />
              </View>

              <View className="text-left">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic">Format</Text>
                <View className="flex-row gap-4">
                  {['COURSE', 'PROJECT'].map(t => (
                    <TouchableOpacity 
                      key={t}
                      onPress={() => setType(t)}
                      className={`flex-1 p-6 rounded-2xl border items-center ${type === t ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                    >
                      <Text className={`font-black text-[10px] uppercase tracking-widest ${type === t ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleGenerate}
                disabled={!prompt.trim()}
                className={`w-full p-6 rounded-3xl items-center shadow-xl ${!prompt.trim() ? 'bg-gray-500 opacity-20' : 'bg-[var(--accent-color)] shadow-sky-500/30'}`}
              >
                <Text className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Generate Journey</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
