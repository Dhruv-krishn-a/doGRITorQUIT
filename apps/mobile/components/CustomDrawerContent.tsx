import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';

cssInterop(Ionicons, {
  className: {
    target: 'style',
  },
});

export default function CustomDrawerContent(props: any) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* 1. User Profile Section (Top) */}
      <View className="p-6 pt-16 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-4">
          <View className="h-12 w-12 bg-indigo-100 rounded-full items-center justify-center">
            <Text className="text-indigo-600 font-bold text-xl">
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-800 text-lg" numberOfLines={1}>
              {user?.email?.split('@')[0]}
            </Text>
            <Text className="text-slate-500 text-xs">Free Plan</Text>
          </View>
        </View>
      </View>

      {/* 2. Navigation Items (Middle) */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* 3. Logout Section (Bottom) */}
      <View className="p-4 border-t border-slate-200 pb-8">
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center gap-3 p-3 rounded-xl active:bg-red-50"
        >
          <Ionicons name="log-out-outline" size={24} className="text-red-500" />
          <Text className="text-red-500 font-medium ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}