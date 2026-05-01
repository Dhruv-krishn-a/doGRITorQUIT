import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

interface CommitmentModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CommitmentModal({ visible, onClose }: CommitmentModalProps) {
  const { colors } = useTheme();
  const [hours, setHours] = useState('10');

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="w-full bg-[var(--bg-card)] rounded-[3rem] p-8 border border-[var(--border-color)] relative overflow-hidden">
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent-color)]/10 rounded-full blur-[40px]" />
          
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-[var(--accent-color)]/10 rounded-full items-center justify-center mb-4 border border-[var(--accent-color)]/20">
              <Ionicons name="flame" size={32} color={colors.accent} />
            </View>
            <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] text-center">New Commitment</Text>
            <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center mt-2 leading-relaxed opacity-60">
              Declare your intent for the upcoming sprint.
            </Text>
          </View>

          <View className="flex-row items-center justify-between bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--border-color)] mb-8">
             <Text className="text-xs font-black uppercase text-[var(--text-primary)] ml-2">Target Hours</Text>
             <View className="flex-row items-center gap-2 bg-[var(--bg-primary)] px-4 py-2 rounded-xl border border-[var(--border-color)]">
               <TextInput 
                 value={hours}
                 onChangeText={setHours}
                 keyboardType="numeric"
                 className="text-lg font-black text-[var(--text-primary)]"
               />
               <Text className="text-xs font-bold text-[var(--text-secondary)]">hrs</Text>
             </View>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity onPress={onClose} className="flex-1 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl items-center">
              <Text className="text-[10px] font-black uppercase text-[var(--text-secondary)]">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="flex-1 py-4 bg-[var(--accent-color)] rounded-2xl items-center">
              <Text className="text-[10px] font-black uppercase text-white tracking-widest">Commit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
