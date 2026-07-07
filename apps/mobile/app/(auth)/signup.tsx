// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { GritioLogo } from '../../components/GritioLogo';

export default function Signup() {
 const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [phone, setPhone] = useState('');
 const [otp, setOtp] = useState('');
 const [showOtp, setShowOtp] = useState(false);
 const [loading, setLoading] = useState(false);
 
 const { colors } = useTheme();
 const { signInWithOAuth, signInWithPhone, verifyOtp, signUpWithEmail: authSignUpWithEmail } = useAuth();
 const router = useRouter();

 async function signUpWithEmail() {
 if (!email || !password) {
 Alert.alert('Error', 'Please fill in all fields');
 return;
 }

 setLoading(true);
 try {
 await authSignUpWithEmail(email, password);
 Alert.alert('Verify Email', 'Account created. Please verify your email from inbox before signing in.');
 router.replace('/(auth)/login');
 } catch (err: any) {
 console.error("Auth Error:", err);
 let friendlyMessage = err.message || "An unexpected error occurred";
 if (err.message?.includes("already")) {
 friendlyMessage = "This email is already in use. Try signing in.";
 }
 Alert.alert('Signup Failed', friendlyMessage);
 } finally {
 setLoading(false);
 }
 }

 async function handlePhoneSubmit() {
 if (!phone) {
 Alert.alert('Error', 'Please enter your phone number');
 return;
 }
 try {
 await signInWithPhone(phone);
 setShowOtp(true);
 } catch (err: any) {
 Alert.alert('Signup Failed', err.message || 'Could not send verification code.');
 }
 }

 async function handleOtpSubmit() {
 if (!otp) {
 Alert.alert('Error', 'Please enter the verification code');
 return;
 }
 try {
 await verifyOtp(phone, otp);
 } catch (err: any) {
 Alert.alert('Verification Failed', err.message || 'Invalid code.');
 }
 }

 return (
 <KeyboardAvoidingView 
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 style={{ flex: 1, backgroundColor: colors.primary }}
 >
 <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.primary }} />

 <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
 <Animated.View 
 entering={FadeInDown.duration(600).springify()}
 className="p-8 rounded-[2.5rem] border bg-[var(--bg-card)] border-[var(--border-color)]"
 >
 {/* Header */}
 <View className="mb-8">
 <View className="mb-6">
 <GritioLogo size="lg" withText={true} />
 </View>
 <Text className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">Create Account</Text>
 <View className="flex-row items-center mt-2">
 <Text className="font-bold text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Have an account?</Text>
 <Link href="/login" asChild>
 <TouchableOpacity>
 <Text className="font-bold text-[10px] uppercase tracking-widest ml-2 text-[var(--accent-color)]">Sign In</Text>
 </TouchableOpacity>
 </Link>
 </View>
 </View>

 {/* Form */}
 <View className="space-y-5">
 {authMode === 'email' ? (
 <>
 <View>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Email Address</Text>
 <View className="relative">
 <View className="absolute left-4 top-[18px] z-10">
 <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
 </View>
 <TextInput
 onChangeText={setEmail}
 value={email}
 autoCapitalize="none"
 keyboardType="email-address"
 placeholder="name@example.com"
 placeholderTextColor={`${colors.textSecondary}44`}
 className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] tracking-tight"
 style={{ color: colors.text }}
 />
 </View>
 </View>

 <View>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Password</Text>
 <View className="relative">
 <View className="absolute left-4 top-[18px] z-10">
 <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
 </View>
 <TextInput
 onChangeText={setPassword}
 value={password}
 secureTextEntry
 placeholder="••••••••"
 placeholderTextColor={`${colors.textSecondary}44`}
 className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)]"
 style={{ color: colors.text }}
 />
 </View>
 </View>

 <TouchableOpacity 
 onPress={signUpWithEmail} 
 disabled={loading}
 className="bg-[var(--accent-color)] py-4 rounded-2xl items-center mt-4 flex-row justify-center gap-3"
 >
 {loading ? (
 <ActivityIndicator color={colors.primary} />
 ) : (
 <>
 <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg-primary)]">Create Account</Text>
 <Ionicons name="arrow-forward" size={16} color={colors.primary} />
 </>
 )}
 </TouchableOpacity>

 <TouchableOpacity onPress={() => setAuthMode('phone')} className="mt-2 items-center">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Use Phone Number</Text>
 </TouchableOpacity>
 </>
 ) : (
 // PHONE MODE
 <Animated.View entering={FadeIn} exiting={FadeOut} className="space-y-5">
 {!showOtp ? (
 <>
 <View>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</Text>
 <View className="relative">
 <View className="absolute left-4 top-[18px] z-10">
 <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
 </View>
 <TextInput
 onChangeText={setPhone}
 value={phone}
 keyboardType="phone-pad"
 placeholder="+1 234 567 8900"
 placeholderTextColor={`${colors.textSecondary}44`}
 className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] tracking-tight"
 style={{ color: colors.text, borderColor: colors.border }}
 />
 </View>
 </View>
 <TouchableOpacity 
 onPress={handlePhoneSubmit} 
 disabled={loading}
 className="bg-[var(--accent-color)] py-4 rounded-2xl items-center mt-4 flex-row justify-center gap-3"
 style={{ backgroundColor: colors.accent }}
 >
 {loading ? (
 <ActivityIndicator color={colors.primary} />
 ) : (
 <>
 <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>Send Code</Text>
 <Ionicons name="arrow-forward" size={16} color={colors.primary} />
 </>
 )}
 </TouchableOpacity>
 </>
 ) : (
 <>
 <View>
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Verification Code</Text>
 <View className="relative">
 <View className="absolute left-4 top-[18px] z-10">
 <Ionicons name="keypad-outline" size={18} color={colors.textSecondary} />
 </View>
 <TextInput
 onChangeText={setOtp}
 value={otp}
 keyboardType="number-pad"
 placeholder="000000"
 placeholderTextColor={`${colors.textSecondary}44`}
 className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] tracking-tight"
 style={{ color: colors.text, borderColor: colors.border }}
 />
 </View>
 </View>
 <TouchableOpacity 
 onPress={handleOtpSubmit} 
 disabled={loading}
 className="bg-[var(--accent-color)] py-4 rounded-2xl items-center mt-4 flex-row justify-center gap-3"
 style={{ backgroundColor: colors.accent }}
 >
 {loading ? (
 <ActivityIndicator color={colors.primary} />
 ) : (
 <>
 <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>Verify & Sign In</Text>
 <Ionicons name="arrow-forward" size={16} color={colors.primary} />
 </>
 )}
 </TouchableOpacity>
 </>
 )}

 <TouchableOpacity onPress={() => setAuthMode('email')} className="mt-2 items-center">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Use Email Address</Text>
 </TouchableOpacity>
 </Animated.View>
 )}

 <View className="my-6 flex-row items-center gap-4">
 <View className="h-[1px] bg-[var(--border-color)] flex-1" style={{ backgroundColor: colors.border }} />
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Social Login</Text>
 <View className="h-[1px] bg-[var(--border-color)] flex-1" style={{ backgroundColor: colors.border }} />
 </View>

 <View className="flex-row gap-3">
 <TouchableOpacity 
 onPress={() => signInWithOAuth('google')}
 className="bg-[var(--bg-secondary)] py-4 rounded-2xl items-center border border-[var(--border-color)] flex-row justify-center gap-2 flex-1"
 style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
 >
 <Ionicons name="logo-google" size={18} color={colors.text} />
 <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Google</Text>
 </TouchableOpacity>

 <TouchableOpacity 
 onPress={() => signInWithOAuth('github')}
 className="bg-[var(--bg-secondary)] py-4 rounded-2xl items-center border border-[var(--border-color)] flex-row justify-center gap-2 flex-1"
 style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
 >
 <Ionicons name="logo-github" size={18} color={colors.text} />
 <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">GitHub</Text>
 </TouchableOpacity>
 </View>

 <TouchableOpacity
 disabled
 className="bg-[var(--bg-secondary)] py-4 rounded-2xl items-center border border-[var(--border-color)] flex-row justify-center gap-3 mt-3"
 style={{ backgroundColor: colors.secondary, borderColor: colors.border }}
 >
 <Text className="text-xl font-bold leading-none text-[var(--text-primary)]">N</Text>
 <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Continue with Notion</Text>
 </TouchableOpacity>

 <TouchableOpacity 
 onPress={() => router.push('/support')}
 className="mt-8 pt-6 border-t border-[var(--border-color)] items-center"
 style={{ borderTopColor: colors.border }}
 >
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Need help? Contact Support</Text>
 </TouchableOpacity>
 </View>
 </Animated.View>

 <Text className="text-center text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-8 opacity-50 italic">© 2026 grit.io</Text>
 </ScrollView>
 </KeyboardAvoidingView>
 );
}
