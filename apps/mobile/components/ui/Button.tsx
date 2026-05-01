import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
 label: string;
 onPress: () => void;
 variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
 size?: 'sm' | 'md' | 'lg';
 loading?: boolean;
 disabled?: boolean;
 className?: string;
 style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
 label,
 onPress,
 variant = 'primary',
 size = 'md',
 loading = false,
 disabled = false,
 className = '',
}) => {
 const getVariantClass = () => {
 switch (variant) {
 case 'primary': return 'bg-indigo-600';
 case 'secondary': return 'bg-slate-800';
 case 'outline': return 'bg-transparent border border-slate-200';
 case 'ghost': return 'bg-transparent';
 case 'danger': return 'bg-rose-500';
 default: return 'bg-indigo-600';
 }
 };

 const getSizeClass = () => {
 switch (size) {
 case 'sm': return 'px-3 py-2';
 case 'md': return 'px-4 py-3';
 case 'lg': return 'px-6 py-4';
 default: return 'px-4 py-3';
 }
 };

 const getTextClass = () => {
 const base = 'font-black uppercase tracking-[0.1em] text-center';
 const sizeText = size === 'sm' ? 'text-[10px]' : 'text-xs';
 if (variant === 'outline' || variant === 'ghost') return `${base} ${sizeText} text-slate-800`;
 return `${base} ${sizeText} text-white`;
 };

 return (
 <TouchableOpacity
 onPress={onPress}
 disabled={disabled || loading}
 className={`rounded-2xl flex-row items-center justify-center ${getVariantClass()} ${getSizeClass()} ${disabled ? 'opacity-50' : ''} ${className}`}
 >
 {loading ? (
 <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#1e293b' : 'white'} size="small" />
 ) : (
 <Text className={getTextClass()}>{label}</Text>
 )}
 </TouchableOpacity>
 );
};
