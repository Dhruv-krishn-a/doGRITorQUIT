import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
 label?: string;
 error?: string;
 className?: string;
}

export const Input: React.FC<InputProps> = ({ 
 label, 
 error, 
 className = '', 
 ...props 
}) => {
 return (
 <View className={`mb-4 ${className}`}>
 {label && (
 <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
 {label}
 </Text>
 )}
 <TextInput
 placeholderTextColor="#94a3b8"
 className={`bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold ${
 error ? 'border-rose-500 bg-rose-50' : ''
 }`}
 {...props}
 />
 {error && (
 <Text className="text-[10px] font-bold text-rose-500 mt-1 ml-1 uppercase">
 {error}
 </Text>
 )}
 </View>
 );
};
