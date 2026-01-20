import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl text-indigo-600 font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-xl font-bold text-slate-800">{user?.email}</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-500 mb-1 ml-1">Display Name</Text>
          <TextInput 
            placeholder="Dhruv Krishna" 
            className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800"
          />
        </View>
        
        <TouchableOpacity className="bg-indigo-600 p-4 rounded-xl items-center mt-4">
          <Text className="text-white font-bold">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}