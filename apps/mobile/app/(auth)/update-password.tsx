import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';

export default function UpdatePassword() {
 const [password, setPasswordInput] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const { colors } = useTheme();
 const router = useRouter();
 const { setPassword } = useAuth();

 async function handleUpdate() {
 if (!password || !confirmPassword) {
 Alert.alert('Error', 'Please fill in all fields');
 return;
 }

 if (password !== confirmPassword) {
 Alert.alert('Error', 'Passwords do not match');
 return;
 }

 setLoading(true);
 try {
 await setPassword(password);
 
 Alert.alert('Success', 'Your password has been updated. Access re-initialized.');
 router.replace('/(drawer)/dashboard');
 } catch (err: any) {
 console.error("Update Error:", err);
 Alert.alert('Update Failed', err.message || 'An unexpected error occurred');
 } finally {
 setLoading(false);
 }
 }

 return (
 <KeyboardAvoidingView 
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 style={{ flex: 1, backgroundColor: colors.primary }}
 >
 {/* Ambient Glow */}
 <View 
 style={{ 
 position: 'absolute', 
 top: -100, 
 left: -100, 
 width: 400, 
 height: 400, 
 borderRadius: 200, 
 backgroundColor: colors.accent, 
 opacity: 0.05 
 }} 
 />

 <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
 <Animated.View 
 entering={FadeInDown.duration(600).springify()}
 className="bg-[var(--bg-card)]/40 p-8 rounded-[2.5rem] border border-[var(--border-color)] "
 style={{ backgroundColor: `${colors.card}66`, borderColor: colors.border }}
 >
 {/* Header */}
 <View className="mb-8">
 <View className="flex-row items-center gap-3 mb-6">
 <View className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
 <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
 </View>
 <View>
 <Text className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">DO GRIT</Text>
 <Text className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">OK QUIT</Text>
 </View>
 </View>

 <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Update Password</Text>
 <Text className="text-[var(--text-secondary)] mt-2 font-medium text-sm leading-relaxed">
 Define a strong new password to re-initialize your account access.
 </Text>
 </View>

 {/* Form */}
 <View className="space-y-5">
 <View>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">New Password</Text>
 <View className="relative">
 <View className="absolute left-4 top-[18px] z-10">
 <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
 </View>
 <TextInput
 onChangeText={setPasswordInput}
 value={password}
 secureTextEntry
 placeholder="••••••••"
 placeholderTextColor={`${colors.textSecondary}44`}
 className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)]"
 style={{ color: colors.text, borderColor: colors.border }}
 />
 </View>
 </View>

 <View>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Confirm New Password</Text>
 <View className="relative">
 <View className="absolute left-4 top-[18px] z-10">
 <Ionicons name="checkmark-shield-outline" size={18} color={colors.textSecondary} />
 </View>
 <TextInput
 onChangeText={setConfirmPassword}
 value={confirmPassword}
 secureTextEntry
 placeholder="••••••••"
 placeholderTextColor={`${colors.textSecondary}44`}
 className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)]"
 style={{ color: colors.text, borderColor: colors.border }}
 />
 </View>
 </View>

 <TouchableOpacity 
 onPress={handleUpdate} 
 disabled={loading}
 className="bg-[var(--accent-color)] py-4 rounded-2xl items-center mt-4 flex-row justify-center gap-3"
 style={{ backgroundColor: colors.accent }}
 >
 {loading ? (
 <ActivityIndicator color={colors.primary} />
 ) : (
 <>
 <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>Update and Sign In</Text>
 <Ionicons name="arrow-forward" size={16} color={colors.primary} />
 </>
 )}
 </TouchableOpacity>

 <TouchableOpacity 
 onPress={() => router.replace('/login')}
 className="mt-6 items-center flex-row justify-center gap-2"
 >
 <Ionicons name="arrow-back" size={14} color={colors.textSecondary} />
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Back to Sign In</Text>
 </TouchableOpacity>
 </View>
 </Animated.View>

 <Text className="text-center text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-8 opacity-50 italic">© 2026 grit.io</Text>
 </ScrollView>
 </KeyboardAvoidingView>
 );
}
