import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { ProjectInitModal } from '../../components/study/modals/ProjectInitModal';
import { useSync } from '../../context/SyncContext';
import { api } from '../../services/api';

export default function ProjectTrackerPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isSyncing, sync } = useSync();
  const [creationVisible, setCreationVisible] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await api.get('/api/github-projects');
      setProjects(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [])
  );

  const onRefresh = () => {
    sync().then(() => fetchProjects());
  };

  const ProjectCard = ({ project }: { project: any }) => {
    const methodology = project.methodology || "AGILE";
    const projectStage = project.projectStage || "REQUIREMENTS";
    const lifecycle = project.lifecycle || "AGILE";

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/study/project/${project.id}`)}
        activeOpacity={0.7}
        className="bg-[var(--bg-card)]/40 rounded-[2.5rem] p-8 border border-[var(--border-color)] mb-5"
      >
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-2xl items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <Ionicons name="logo-github" size={24} color={colors.accent} />
            </View>
            <View className="text-left">
              <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 text-left">
                {methodology}
              </Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <View className={`w-1.5 h-1.5 rounded-full ${projectStage === 'EXECUTION' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] italic text-left">
                  {projectStage.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>
          <View className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
            <Text className="text-[8px] font-black text-[var(--accent-color)] uppercase tracking-widest italic">
              {lifecycle}
            </Text>
          </View>
        </View>

        <Text className="text-[var(--text-primary)] font-black text-2xl italic uppercase tracking-tighter mb-3 leading-tight text-left">
          {project.name}
        </Text>

        {project.description && (
          <Text className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed mb-8 text-left" numberOfLines={2}>
            {project.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between pt-6 border-t border-[var(--border-color)]/30">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="git-branch-outline" size={12} color={colors.textSecondary} />
              <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
                ACTIVE
              </Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
            <Text className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              {project.features?.length || 0} TASKS
            </Text>
          </View>
          <View className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
            <Ionicons name="chevron-forward" size={18} color={colors.accent} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isSyncing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View className="mb-10 flex-row justify-between items-end">
          <View className="text-left">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic text-left">Architecture & Execution</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter text-left">
              Projects
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setCreationVisible(true)}
            className="w-14 h-14 bg-[var(--accent-color)] rounded-2xl items-center justify-center shadow-lg shadow-[var(--accent-color)]/20"
          >
            <Ionicons name="add" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading && !isSyncing ? (
          <ActivityIndicator size="large" color={colors.accent} className="py-20" />
        ) : projects.length === 0 ? (
          <View className="py-32 items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--bg-secondary)]/10">
            <Ionicons name="construct-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
            <Text className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic mt-4 text-center">No active projects found{'\n'}Initiate your first build</Text>
            <TouchableOpacity 
              onPress={() => setCreationVisible(true)}
              className="mt-8 px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl"
            >
              <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">Initialize New Project</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map(p => <ProjectCard key={p.id} project={p} />)
        )}

        <View className="mt-10 p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3.5rem] text-left">
          <View className="flex-row items-center gap-3 mb-4 text-left">
            <View className="p-2 bg-amber-500/20 rounded-lg">
              <Ionicons name="flash" size={14} color="#f59e0b" />
            </View>
            <Text className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] italic text-left">Technical Protocol</Text>
          </View>
          <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-60 italic text-left">
            Full SDLC management is synchronized with your web and desktop command centers. Progress made here is broadcasted to the neural network.
          </Text>
        </View>
      </ScrollView>

      <ProjectInitModal 
        isVisible={creationVisible} 
        onClose={() => setCreationVisible(false)} 
        onRefresh={onRefresh}
      />
    </View>
  );
}

