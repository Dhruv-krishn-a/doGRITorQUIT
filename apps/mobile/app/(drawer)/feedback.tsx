import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { PerspectiveWrapper } from './_layout';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

type Tab = 'FEEDBACK' | 'ABOUT';

export default function MobileDeveloperHub() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('FEEDBACK');
  const [feedbackType, setFeedbackType] = useState('BUG');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://www.dogritorquit.in';
      const response = await fetch(`${apiBaseUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          type: feedbackType, 
          platform: 'mobile',
          metadata: {
            appVersion: Constants.expoConfig?.version,
            device: Constants.deviceName,
            os: Constants.platform?.ios ? 'iOS' : 'Android'
          }
        })
      });

      if (!response.ok) {
        throw new Error("API Failure");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Transmission Successful", "Your signal has been sent to the developer stream.");
      setMessage('');
    } catch (err) {
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Transmission Failed", "Unable to send signal. Use direct Gmail fallback?", [
        { text: "Later", style: "cancel" },
        { text: "Open Gmail", onPress: () => Linking.openURL('mailto:dogritorquit@gmail.com') }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const SocialButton = ({ icon, label, url }: any) => (
    <TouchableOpacity 
      onPress={() => Linking.openURL(url)}
      className="w-full flex-row items-center justify-between p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] mb-3"
    >
      <View className="flex-row items-center gap-4">
        <Ionicons name={icon} size={20} color={colors.accent} />
        <Text className="text-[10px] font-black uppercase text-[var(--text-primary)]">{label}</Text>
      </View>
      <Ionicons name="open-outline" size={14} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        {/* Header */}
        <View className="px-6 pt-16 pb-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-sm">
          <View className="mb-8">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-1 italic">Community Stream</Text>
            <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Developer Hub</Text>
          </View>

          <View className="bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] flex-row h-12">
            {(['FEEDBACK', 'ABOUT'] as const).map(tab => (
              <TouchableOpacity 
                key={tab}
                onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
                className={`flex-1 items-center justify-center rounded-xl ${activeTab === tab ? 'bg-[var(--bg-card)] shadow-sm border border-[var(--border-color)]' : ''}`}
              >
                <Text className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>
                  {tab === 'ABOUT' ? 'About Me' : tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {activeTab === 'FEEDBACK' ? (
            <View>
              <View className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-8 mb-8 text-left">
                <View className="flex-row items-center gap-3 mb-4">
                  <Ionicons name="alert-circle" size={24} color="#f43f5e" />
                  <Text className="text-sm font-black text-rose-500 uppercase italic">Independent Dev</Text>
                </View>
                <Text className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed italic uppercase opacity-80">
                  I am a solo developer building this ecosystem overtime. Thank you for your patience. If something breaks, I apologize and will fix it as soon as I can.
                </Text>
              </View>

              <View className="space-y-6">
                <View className="text-left">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1">Type</Text>
                  <View className="flex-row gap-3">
                    {['BUG', 'IDEA', 'OTHER'].map(t => (
                      <TouchableOpacity 
                        key={t}
                        onPress={() => setFeedbackType(t)}
                        className={`flex-1 py-4 rounded-xl border items-center ${feedbackType === t ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                      >
                        <Text className={`text-[9px] font-black uppercase ${feedbackType === t ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="text-left">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1">Report</Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Describe the issue or idea..."
                    placeholderTextColor={`${colors.textSecondary}44`}
                    multiline
                    numberOfLines={6}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-6 text-sm font-black italic text-[var(--text-primary)] uppercase h-48"
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleSubmit}
                  disabled={isSending || !message.trim()}
                  className={`w-full py-6 rounded-3xl items-center shadow-xl ${!message.trim() ? 'bg-gray-500 opacity-20' : 'bg-[var(--accent-color)] shadow-sky-500/20'}`}
                >
                  {isSending ? <ActivityIndicator color="white" /> : <Text className="text-[11px] font-black text-white uppercase italic">Transmit Signal</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] p-10 items-center text-center mb-8">
                 <View className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full border-2 border-[var(--accent-color)] items-center justify-center mb-6">
                    <Text className="text-3xl font-black text-[var(--text-primary)]">DK</Text>
                 </View>
                 <Text className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">Dhruv Krishna</Text>
                 <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-2 italic opacity-40">Creator & Lead Architect</Text>
                 
                 <Text className="mt-8 text-xs font-bold text-[var(--text-secondary)] leading-relaxed italic uppercase opacity-80">
                   CS Engineer & Technical BA building tools that solve real-world problems.
                 </Text>
              </View>

              <SocialButton icon="logo-github" label="GitHub Profile" url="https://github.com/Dhruv-krishn-a" />
              <SocialButton icon="logo-linkedin" label="LinkedIn" url="https://www.linkedin.com/in/dhruv-krishna-410b98221/" />
              <SocialButton icon="cloud-download-outline" label="App Releases" url="https://github.com/Dhruv-krishn-a/dogritorquit-releases" />
              <SocialButton icon="mail-outline" label="Direct Gmail" url="mailto:dogritorquit@gmail.com" />
            </View>
          )}
        </ScrollView>
      </View>
    </PerspectiveWrapper>
  );
}
