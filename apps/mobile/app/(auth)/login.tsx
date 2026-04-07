import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

export default function Login() {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { colors } = useTheme();
  const { signInWithOAuth, signInWithPhone, verifyOtp, signInWithEmail: authSignInWithEmail } = useAuth();
  const router = useRouter();

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await authSignInWithEmail(email, password);
    } catch (err: any) {
      console.error("Auth Error:", err);
      let friendlyMessage = err.message || "An unexpected error occurred";
      if (err.message?.includes("Invalid email or password")) {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (err.message?.includes("email_not_verified") || err.message?.toLowerCase().includes("verify your email")) {
        friendlyMessage = "Please verify your email before signing in.";
      } else if (err.message?.includes("legacy_account") || err.message?.toLowerCase().includes("legacy account")) {
        friendlyMessage = "Legacy account detected. Use Forgot Password to set a new password.";
      }
      Alert.alert('Sign In Failed', friendlyMessage);
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
      Alert.alert('Sign In Failed', err.message || 'Could not send verification code.');
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
          className="bg-[var(--bg-card)]/40 p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl"
          style={{ backgroundColor: `${colors.card}66`, borderColor: colors.border }}
        >
          {/* Header */}
          <View className="mb-8">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
                <Ionicons name="sparkles" size={20} color={colors.accent} />
              </View>
              <View>
                <Text className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">DO GRIT</Text>
                <Text className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">OK QUIT</Text>
              </View>
            </View>

            <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Sign In</Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-widest">New here?</Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-[var(--accent-color)] font-bold text-[10px] uppercase tracking-widest ml-2">Create Account</Text>
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
                      className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] tracking-tight"
                      style={{ color: colors.text, borderColor: colors.border }}
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
                      className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)]"
                      style={{ color: colors.text, borderColor: colors.border }}
                    />
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push('/forgot-password')}
                    className="mt-2 self-end"
                  >
                    <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={signInWithEmail} 
                  disabled={loading}
                  className="bg-[var(--accent-color)] py-4 rounded-2xl items-center shadow-lg shadow-[var(--accent-color)]/20 mt-4 flex-row justify-center gap-3"
                  style={{ backgroundColor: colors.accent }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setAuthMode('phone')} className="mt-2 items-center">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Use Phone Number</Text>
                </TouchableOpacity>
                <Text className="text-center text-[9px] font-bold text-[var(--text-secondary)] mt-3 px-2">
                  If you signed up with Google/GitHub/Notion, continue with that provider or set a password from Settings after login.
                </Text>
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
                      className="bg-[var(--accent-color)] py-4 rounded-2xl items-center shadow-lg shadow-[var(--accent-color)]/20 mt-4 flex-row justify-center gap-3"
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
                      className="bg-[var(--accent-color)] py-4 rounded-2xl items-center shadow-lg shadow-[var(--accent-color)]/20 mt-4 flex-row justify-center gap-3"
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

        <Text className="text-center text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-8 opacity-50">
          © 2026 DO GRIT OK QUIT
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
