import { View, Text, ScrollView } from 'react-native';

export default function PlannerPage() {
  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold text-slate-800 mb-4">Your Tasks</Text>
      
      {/* Dummy Task List */}
      {[1, 2, 3].map((item) => (
        <View key={item} className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex-row items-center">
          <View className="w-6 h-6 rounded-full border-2 border-indigo-500 mr-4" />
          <View>
            <Text className="font-bold text-slate-700">Finish Project Module {item}</Text>
            <Text className="text-slate-400 text-xs">Due Tomorrow</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}