import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function PlannerPage() {
  const { colors } = useTheme();
  return (
    <ScrollView className="transform-gpu flex-1 bg-[var(--bg-primary)] p-5">
      <Text className="transform-gpu text-2xl font-bold text-[var(--text-primary)] mb-4">Your Tasks</Text>
      
      {/* Dummy Task List */}
      {[1, 2, 3].map((item) => (
        <View key={item} className="transform-gpu mb-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex-row items-center">
          <View className="transform-gpu w-6 h-6 rounded-full border-2 border-[var(--accent-color)] mr-4" />
          <View>
            <Text className="transform-gpu font-bold text-[var(--text-primary)]">Finish Project Module {item}</Text>
            <Text className="transform-gpu text-[var(--text-secondary)] text-xs">Due Tomorrow</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}