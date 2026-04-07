import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <View 
      style={style}
      className={`bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${className}`}
    >
      {children}
    </View>
  );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = ({ 
  title, 
  subtitle,
  className = ''
}) => (
  <View className={`mb-4 ${className}`}>
    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
      {subtitle}
    </Text>
    <Text className="text-xl font-black text-slate-900 italic uppercase">
      {title}
    </Text>
  </View>
);
