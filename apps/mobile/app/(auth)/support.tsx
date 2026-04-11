import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';

export default function Support() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  async function handleSubmit() {
    if (!email || !message) {
      Alert.alert('Error', 'Please provide both your email and message');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Send to custom API directly
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          message, 
          userId: user?.id || null,
          status: 'pending'
        })
      });

      if (!response.ok) {
        console.error("Direct send failed, falling back to mailto:", await response.text());
      }
      
      // Attempt to open email client as a secondary action
      const subject = encodeURIComponent("Support Request: Mobile App");
      const body = encodeURIComponent(`User Email: ${email}\n\nMessage:\n${message}`);
      const mailtoUrl = `mailto:dogritorquit@gmail.com?subject=${subject}&body=${body}`;
      await Linking.openURL(mailtoUrl);
      
      setSuccess(true);
    } catch (e) {
      console.error("Support submission error:", e);
      // Last resort fallback
      const mailtoUrl = `mailto:dogritorquit@gmail.com`;
      await Linking.openURL(mailtoUrl);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  const openEmailClient = () => {
    Linking.openURL('mailto:dogritorquit@gmail.com');
  };

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
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mb-6 flex-row items-center gap-2"
            >
              <Ionicons name="arrow-back" size={18} color={colors.accent} />
              <Text className="text-[10px] font-black italic uppercase tracking-widest text-[var(--accent-color)]">Back</Text>
            </TouchableOpacity>

            <View className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl items-center justify-center shadow-xl mb-4">
              <Ionicons name="help-buoy" size={24} color={colors.accent} />
            </View>
            <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Support</Text>
            <Text className="text-[var(--text-secondary)] mt-2 font-medium text-sm leading-relaxed">
              Need help with your account or have a question? Our team is here to assist you.
            </Text>
          </View>

          {success ? (
            <View className="items-center justify-center py-10 space-y-6">
              <View className="w-20 h-20 bg-[var(--accent-color)]/10 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={48} color={colors.accent} />
              </View>
              <Text className="text-xl font-black text-[var(--text-primary)] italic uppercase text-center">Message Sent</Text>
              <Text className="text-[var(--text-secondary)] text-center text-sm font-medium">We have received your signal. Stand by for response.</Text>
              <TouchableOpacity 
                onPress={() => router.back()}
                className="bg-[var(--bg-secondary)] px-8 py-4 rounded-2xl border border-[var(--border-color)] mt-6"
              >
                <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Return to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-5">
              <View>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Your Email</Text>
                <TextInput
                  onChangeText={setEmail}
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="name@example.com"
                  placeholderTextColor={`${colors.textSecondary}44`}
                  className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 px-4 text-sm font-bold text-[var(--text-primary)]"
                  style={{ color: colors.text, borderColor: colors.border }}
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 ml-1">Message</Text>
                <TextInput
                  onChangeText={setMessage}
                  value={message}
                  multiline
                  numberOfLines={5}
                  placeholder="Explain the issue you're facing..."
                  placeholderTextColor={`${colors.textSecondary}44`}
                  className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-2xl py-4 px-4 text-sm font-bold text-[var(--text-primary)] h-32"
                  textAlignVertical="top"
                  style={{ color: colors.text, borderColor: colors.border }}
                />
              </View>

              <TouchableOpacity 
                onPress={openEmailClient}
                className="bg-[var(--bg-secondary)]/30 p-4 rounded-2xl border border-[var(--border-color)] flex-row items-center gap-3"
              >
                <Ionicons name="mail" size={16} color={colors.accent} />
                <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">dogritorquit@gmail.com</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={loading}
                className="bg-[var(--accent-color)] py-4 rounded-2xl items-center shadow-lg shadow-[var(--accent-color)]/20 mt-4 flex-row justify-center gap-3"
                style={{ backgroundColor: colors.accent }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>Send Message</Text>
                    <Ionicons name="send" size={16} color={colors.primary} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <Text className="text-center text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-8 opacity-50 italic">© 2026 grit.io</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
