import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PerspectiveWrapper } from './_layout';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { clearLocalData } = useSync();
  const { theme, changeTheme, themes } = useTheme();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Terminate Session",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleSetPassword = async () => {
    router.push('/(auth)/update-password');
  };

  const handleClearData = () => {
    Alert.alert(
      "Purge Local Cache",
      "This will remove all local data. It will be re-synced from the cloud upon next initialization.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Purge", 
          style: "destructive",
          onPress: async () => {
            await clearLocalData();
            Alert.alert("Success", "Local cache purged.");
          }
        }
      ]
    );
  };

  const SettingRow = ({ icon, label, children, danger, onPress }: { icon: any, label: string, children?: React.ReactNode, danger?: boolean, onPress?: () => void }) => (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={!onPress}
      className="flex-row items-center justify-between p-5 bg-[var(--bg-secondary)]/30 rounded-3xl border border-[var(--border-color)] mb-3"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <Ionicons name={icon} size={20} color={danger ? "#F43F5E" : "#6366f1"} />
        </View>
        <Text className={`ml-4 text-sm font-black uppercase tracking-tight ${danger ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{label}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );

  return (
    <PerspectiveWrapper>
      <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ padding: 24 }}>
        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2">System Config</Text>
          <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Settings</Text>
        </View>

        {/* User Identity */}
        <View className="p-6 bg-[var(--bg-secondary)]/30 rounded-[2.5rem] border border-[var(--border-color)] mb-8 items-center">
           <View className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full items-center justify-center border-2 border-[var(--accent-color)] mb-4">
              <Text className="text-3xl font-black text-[var(--text-primary)] uppercase">{user?.email?.[0]}</Text>
           </View>
           <Text className="text-[var(--text-primary)] font-black uppercase text-lg tracking-tight">{user?.email?.split('@')[0]}</Text>
           <Text className="text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-widest mt-1 italic">Neural Link: Operational</Text>
        </View>

        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 ml-1">General Matrix</Text>
          <SettingRow icon="notifications" label="Push Notifications">
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#1E293B', true: '#6366f1' }} />
          </SettingRow>
          <SettingRow icon="radio-button-on" label="Haptic Feedback">
            <Switch value={haptics} onValueChange={setHaptics} trackColor={{ false: '#1E293B', true: '#6366f1' }} />
          </SettingRow>
          
          <SettingRow 
            icon="color-palette" 
            label="Visual Theme" 
            onPress={() => setShowThemes(!showThemes)}
          >
            <View className="flex-row items-center">
              <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase mr-2">
                {themes.find(t => t.id === theme)?.name}
              </Text>
              <Ionicons name={showThemes ? "chevron-up" : "chevron-down"} size={14} color="#94a3b8" />
            </View>
          </SettingRow>

          {showThemes && (
            <View className="mb-4 bg-[var(--bg-secondary)]/20 rounded-3xl p-2 border border-[var(--border-color)]">
              {themes.map((t) => (
                <TouchableOpacity 
                  key={t.id} 
                  onPress={() => changeTheme(t.id)}
                  className={`flex-row items-center justify-between p-4 rounded-2xl ${theme === t.id ? 'bg-[var(--accent-color)]/10' : ''}`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-lg mr-3">{t.emoji}</Text>
                    <View>
                      <Text className={`text-xs font-black uppercase tracking-widest ${theme === t.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}>
                        {t.name}
                      </Text>
                      <Text className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                        {t.description}
                      </Text>
                    </View>
                  </View>
                  {theme === t.id && <Ionicons name="checkmark-circle" size={18} color="var(--accent-color)" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 ml-1">Data Management</Text>
          <TouchableOpacity onPress={handleClearData}>
            <SettingRow icon="trash-bin" label="Purge Local Cache" />
          </TouchableOpacity>
          <SettingRow icon="code-working" label="Debug Mode">
            <Switch value={debugMode} onValueChange={setDebugMode} trackColor={{ false: '#1E293B', true: '#6366f1' }} />
          </SettingRow>
        </View>

        <View className="mb-10">
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 ml-1">Session</Text>
          <SettingRow icon="key" label="Set Password" onPress={handleSetPassword} />
          <SettingRow icon="log-out" label="Logout" danger onPress={handleSignOut} />
        </View>

        <Text className="text-center text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-10 italic">
          System Version 1.0.4 // grit.io
        </Text>
      </ScrollView>
    </PerspectiveWrapper>
  );
}
