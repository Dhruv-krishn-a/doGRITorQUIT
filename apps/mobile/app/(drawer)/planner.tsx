import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { database } from '../../db';
import Task from '../../db/models/Task';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PlannerProps {
  tasks: Task[];
}

const Planner: React.FC<PlannerProps> = ({ tasks }) => {
  const { colors } = useTheme();

  const handleToggle = async (task: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await database.write(async () => {
      await task.update(t => {
        t.completed = !t.completed;
        t.status = t.completed ? 'completed' : 'pending';
      });
    });
  };

  const sections = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const categorized = {
      today: [] as Task[],
      upcoming: [] as Task[],
      completed: [] as Task[]
    };

    tasks.forEach(t => {
      if (t.completed) {
        categorized.completed.push(t);
      } else if (t.date && new Date(t.date) <= today) {
        categorized.today.push(t);
      } else {
        categorized.upcoming.push(t);
      }
    });

    return categorized;
  }, [tasks]);

  const TaskItem = ({ task }: { task: Task }) => (
    <TouchableOpacity 
      onPress={() => handleToggle(task)}
      className={`p-5 rounded-[2rem] border mb-3 flex-row items-center ${
        task.completed ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm'
      }`}
    >
      <View className={`w-8 h-8 rounded-full border-2 items-center justify-center mr-4 ${
        task.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-[var(--accent-color)]'
      }`}>
        {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <View className="flex-1">
        <Text className={`font-black uppercase italic tracking-tight ${
          task.completed ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'
        }`}>
          {task.title}
        </Text>
        {task.priority && (
          <Text className={`text-[7px] font-black uppercase mt-1 tracking-widest ${
            task.priority === 'HIGH' ? 'text-rose-500' : 'text-[var(--accent-color)]'
          }`}>
            {task.priority} Priority
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, count }: { title: string, count: number }) => (
    <View className="flex-row items-center justify-between mb-4 mt-6 ml-1">
      <View className="flex-row items-center gap-2">
        <View className="w-1 h-4 bg-[var(--accent-color)] rounded-full" />
        <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">{title}</Text>
      </View>
      <Text className="text-[10px] font-black text-[var(--text-secondary)] opacity-30">{count}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View className="mb-10 text-left">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Neural Planner</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none">
              Tasks
            </Text>
          </View>

          {tasks.length === 0 ? (
            <View className="p-20 border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] items-center justify-center bg-[var(--bg-secondary)]/10 opacity-30">
              <Ionicons name="list-outline" size={48} color={colors.textSecondary} />
              <Text className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-6 italic text-center">No tasks in repository</Text>
            </View>
          ) : (
            <>
              {sections.today.length > 0 && (
                <>
                  <SectionHeader title="Immediate" count={sections.today.length} />
                  {sections.today.map(t => <TaskItem key={t.id} task={t} />)}
                </>
              )}

              {sections.upcoming.length > 0 && (
                <>
                  <SectionHeader title="Scheduled" count={sections.upcoming.length} />
                  {sections.upcoming.map(t => <TaskItem key={t.id} task={t} />)}
                </>
              )}

              {sections.completed.length > 0 && (
                <>
                  <SectionHeader title="Resolved" count={sections.completed.length} />
                  {sections.completed.map(t => <TaskItem key={t.id} task={t} />)}
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
  );
};

const EnhancedPlanner = withObservables([], () => ({
  tasks: database.get<Task>('tasks').query(Q.sortBy('created_at', Q.desc)).observe(),
}))(Planner);

export default function PlannerPage() {
  return <EnhancedPlanner />;
}
