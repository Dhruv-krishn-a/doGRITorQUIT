import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View className="transform-gpu flex-1 bg-[var(--bg-primary)] p-8">
      <View className="transform-gpu items-center mb-12">
        <View className="transform-gpu w-32 h-32 bg-[var(--bg-secondary)] rounded-[2.5rem] items-center justify-center mb-6 shadow-xl shadow-slate-300">
          <Text className="transform-gpu text-5xl text-[var(--text-primary)] font-black italic">
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="transform-gpu text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">{user?.email}</Text>
        <Text className="transform-gpu text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Neural Identity Verified</Text>
      </View>

      <View className="space-y-6">
        <View>
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 ml-1">Archive ID</Text>
          <View className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)]">
             <Text className="font-bold text-[var(--text-primary)]" numberOfLines={1}>{user?.id}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-rose-500 p-6 rounded-[2rem] items-center flex-row justify-center shadow-lg shadow-rose-200 mt-10"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-black uppercase tracking-widest ml-2">Deauthorize Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
