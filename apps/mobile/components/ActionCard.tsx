import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodayActionItem } from '../types/today';

interface ActionCardProps {
  item: TodayActionItem;
  onToggle: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ item, onToggle }) => {
  const isDone = item.status === 'DONE';

  const getIcon = () => {
    switch (item.type) {
      case 'HABIT': return 'refresh-circle';
      case 'PROJECT': return 'rocket';
      case 'YOUTUBE': return 'logo-youtube';
      case 'COURSE': return 'school';
      default: return 'radio-button-on';
    }
  };

  return (
    <TouchableOpacity 
      onPress={onToggle}
      activeOpacity={0.7}
      className={`flex-row items-center p-5 rounded-[2.5rem] border ${
        isDone 
          ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' 
          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-sm'
      }`}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${
        isDone ? 'bg-[var(--border-color)]/50' : 'bg-[var(--bg-primary)]'
      }`}>
        <Ionicons 
          name={getIcon() as any} 
          size={24} 
          color={isDone ? '#475569' : '#0EA5E9'} 
        />
      </View>

      <View className="flex-1 ml-4">
        <Text className={`text-[10px] font-black uppercase tracking-widest ${
          isDone ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'
        } mb-1`}>
          {item.type}
        </Text>
        <Text className={`text-sm font-black uppercase italic tracking-tight ${
          isDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
        }`}>
          {item.title}
        </Text>
      </View>

      <View 
        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
          isDone ? 'bg-mint border-mint' : 'border-[var(--border-color)]'
        }`}
      >
        {isDone && <Ionicons name="checkmark" size={16} color="#0B0F19" />}
      </View>
    </TouchableOpacity>
  );
};
