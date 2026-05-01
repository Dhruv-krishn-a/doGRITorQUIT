import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

interface WeeklyReflectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function WeeklyReflectionModal({ visible, onClose }: WeeklyReflectionModalProps) {
  const { colors } = useTheme();
  const [reflection, setReflection] = useState('');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-[var(--bg-primary)] rounded-t-[3rem] p-8 pb-16 min-h-[60%] border-t border-[var(--border-color)]">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-4">
              <View className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Ionicons name="journal" size={24} color="#6366f1" />
              </View>
              <View>
                <Text className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Weekly Review</Text>
                <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1 opacity-60">Sunday Synthesis</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-[var(--bg-secondary)] rounded-full">
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 mb-6">
            <Text className="text-sm font-black italic uppercase text-[var(--text-primary)] mb-4">What were the key breakthroughs?</Text>
            <TextInput
              multiline
              value={reflection}
              onChangeText={setReflection}
              placeholder="Reflect on this week's progress..."
              placeholderTextColor={`${colors.textSecondary}60`}
              className="text-base font-bold text-[var(--text-primary)] min-h-[100px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          <TouchableOpacity 
            onPress={onClose}
            className={`w-full py-5 rounded-3xl items-center flex-row justify-center gap-3 ${!reflection.trim() ? 'bg-indigo-500/20' : 'bg-indigo-500'}`}
            disabled={!reflection.trim()}
          >
             <Text className={`text-[12px] font-black uppercase tracking-[0.2em] italic ${!reflection.trim() ? 'text-indigo-300' : 'text-white'}`}>Save & Reset</Text>
             <Ionicons name="checkmark-circle" size={16} color={!reflection.trim() ? '#a5b4fc' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
