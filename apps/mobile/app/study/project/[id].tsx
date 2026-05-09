import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { api } from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PHASES = ['BACKLOG', 'SPRINT_PLANNING', 'DEVELOPMENT', 'TESTING', 'REVIEW', 'RELEASE'];

const ProjectDetail: React.FC<{ project: any }> = ({ project: initialProject }) => {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [project, setProject] = useState(initialProject);
  const [activePhase, setActivePhase] = useState<string>(project.projectStage === 'EXECUTION' ? 'DEVELOPMENT' : 'BACKLOG');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'BLUEPRINTS' | 'EPICS'>('BLUEPRINTS');
  const [taskInput, setTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const units = project.features || [];

  const filteredUnits = useMemo(() => {
    return units.filter((u: any) => u.sdlcPhaseId === activePhase || (u.sdlcPhaseId === 'START' && activePhase === 'BACKLOG'));
  }, [units, activePhase]);

  const epics = useMemo(() => {
    const epicSet = new Set<string>();
    units.forEach((u: any) => {
      if (u.epic) epicSet.add(u.epic);
    });
    return Array.from(epicSet);
  }, [units]);

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const newFeature = await api.post(`/api/github-projects/${project.id}/features`, {
        title: taskInput.trim(),
        sdlcPhaseId: activePhase
      });
      setProject({ ...project, features: [...project.features, newFeature] });
      setTaskInput('');
    } catch (e: any) {
      Alert.alert("Registry Error", e.message);
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    try {
      await api.post(`/api/github-projects/${project.id}/generate-tasks`, { phase: activePhase });
      Alert.alert("Sequence Generated", `AI has injected implementation nodes for ${activePhase}.`);
      // Refresh
      const updated = await api.get(`/api/github-projects/${project.id}`);
      setProject(updated);
    } catch (e: any) {
      Alert.alert("Generation Error", e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdvancePhase = async () => {
    const currentIndex = PHASES.indexOf(activePhase);
    if (currentIndex < PHASES.length - 1) {
      const nextPhase = PHASES[currentIndex + 1];
      Alert.alert(
        "Protocol Advance",
        `Move from ${activePhase} to ${nextPhase}?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Advance", 
            onPress: async () => {
              try {
                // Assuming updating project stage or moving iteration
                setActivePhase(nextPhase);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch(e) {}
            }
          }
        ]
      );
    }
  };

  const UnitCard = ({ unit }: { unit: any }) => {
    const isDone = unit.status === 'DONE';
    return (
      <View 
        className={`p-6 rounded-[2rem] mb-4 border shadow-sm flex-row items-center justify-between ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
        }`}
      >
        <View className="flex-1 mr-4 text-left">
           <Text className={`font-black text-sm uppercase italic tracking-tight text-left ${isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'}`}>
             {unit.title}
           </Text>
        </View>
        <TouchableOpacity 
          onPress={async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            try {
              const updated = await api.patch(`/api/github-projects/${project.id}/features/${unit.id}`, {
                status: isDone ? 'TODO' : 'DONE'
              });
              setProject({ ...project, features: project.features.map((f: any) => f.id === unit.id ? updated : f) });
            } catch(e){}
          }}
          className={`w-10 h-10 rounded-xl items-center justify-center ${isDone ? 'bg-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
        >
          <Ionicons name={isDone ? "checkmark-circle" : "ellipse-outline"} size={20} color={isDone ? "#10b981" : colors.textSecondary + '40'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <View className="flex-1 bg-[var(--bg-primary)]">
      {/* 1. Subway Map Header */}
      <View className="pt-16 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <View className="px-6 flex-row items-center justify-between mb-6">
           <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
              <Ionicons name="chevron-back" size={20} color={colors.text} />
           </TouchableOpacity>
           <View className="flex-row items-center gap-2 bg-amber-500/10 px-4 py-1.5 rounded-lg border border-amber-500/20">
              <Ionicons name="construct" size={12} color="#f59e0b" />
              <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 italic">{project.methodology || 'AGILE'}</Text>
           </View>
           <Text className="text-[var(--text-primary)] font-black italic uppercase tracking-tighter text-sm flex-1 ml-4 text-right" numberOfLines={1}>{project.name}</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          className="flex-grow-0"
        >
          {PHASES.map((p, idx) => {
            const isActive = activePhase === p;
            const isCompleted = PHASES.indexOf(activePhase) > idx;
            return (
              <TouchableOpacity 
                key={p} 
                onPress={() => { setActivePhase(p); Haptics.selectionAsync(); }}
                className={`flex-row items-center mr-6 px-5 py-2.5 rounded-full border ${
                  isActive ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30' : 
                  isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 
                  'bg-[var(--bg-secondary)] border border-[var(--border-color)] opacity-40'
                }`}
              >
                <View className={`w-2 h-2 rounded-full mr-3 ${isActive ? 'bg-white' : isCompleted ? 'bg-emerald-500' : 'bg-[var(--text-secondary)]'}`} />
                <Text className={`text-[9px] font-black uppercase tracking-widest italic ${isActive ? 'text-white' : isCompleted ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
                  {p.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1 flex-row">
        {/* 2. Sidebar (Blueprints & Epics) */}
        <View className="w-20 border-r border-[var(--border-color)] bg-[var(--bg-card)]">
          <TouchableOpacity 
            onPress={() => setActiveSidebarTab('BLUEPRINTS')}
            className={`flex-1 items-center justify-center border-b border-[var(--border-color)] ${activeSidebarTab === 'BLUEPRINTS' ? 'bg-[var(--accent-color)]/5' : ''}`}
          >
             <Ionicons name="document-text" size={24} color={activeSidebarTab === 'BLUEPRINTS' ? colors.accent : colors.textSecondary + '40'} />
             <Text className={`text-[7px] font-black uppercase mt-2 tracking-tighter ${activeSidebarTab === 'BLUEPRINTS' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-20'}`}>Blueprints</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveSidebarTab('EPICS')}
            className={`flex-1 items-center justify-center ${activeSidebarTab === 'EPICS' ? 'bg-[var(--accent-color)]/5' : ''}`}
          >
             <Ionicons name="layers" size={24} color={activeSidebarTab === 'EPICS' ? colors.accent : colors.textSecondary + '40'} />
             <Text className={`text-[7px] font-black uppercase mt-2 tracking-tighter ${activeSidebarTab === 'EPICS' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-20'}`}>Epics</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center opacity-20">
             <Ionicons name="stats-chart" size={20} color={colors.textSecondary} />
             <Text className="text-[7px] font-black uppercase mt-2 tracking-tighter text-[var(--text-secondary)]">Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Main Phase Dashboard */}
        <View className="flex-1">
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 150 }}>
            {/* Sidebar Content */}
            {activeSidebarTab === 'BLUEPRINTS' ? (
              <View className="mb-10">
                 <Text className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] mb-6 opacity-40 italic text-left">Technical Blueprints</Text>
                 <View className="space-y-3">
                    <TouchableOpacity className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex-row items-center justify-between">
                       <Text className="text-[9px] font-black uppercase text-[var(--text-secondary)] italic text-left">REQUIREMENTS (PRD)</Text>
                       {project.prdVerified && <Ionicons name="checkmark-circle" size={12} color="#10b981" />}
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex-row items-center justify-between">
                       <Text className="text-[9px] font-black uppercase text-[var(--text-secondary)] italic text-left">USER FLOW</Text>
                       {project.userFlowVerified && <Ionicons name="checkmark-circle" size={12} color="#10b981" />}
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex-row items-center justify-between">
                       <Text className="text-[9px] font-black uppercase text-[var(--text-secondary)] italic text-left">SYSTEM FLOW</Text>
                       {project.systemFlowVerified && <Ionicons name="checkmark-circle" size={12} color="#10b981" />}
                    </TouchableOpacity>
                 </View>
              </View>
            ) : (
              <View className="mb-10">
                 <Text className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] mb-6 opacity-40 italic text-left">Epics</Text>
                 <View className="space-y-3">
                    <TouchableOpacity className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                       <Text className="text-[9px] font-black uppercase text-amber-500 italic text-left">All Epics</Text>
                    </TouchableOpacity>
                    {epics.map((e: any) => (
                      <TouchableOpacity key={e} className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                         <Text className="text-[9px] font-black uppercase text-[var(--text-secondary)] italic text-left">{e}</Text>
                      </TouchableOpacity>
                    ))}
                 </View>
              </View>
            )}

            <View className="mb-8 text-left">
               <Text className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2 italic text-left">Execution Dashboard</Text>
               <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none text-left">{activePhase.replace('_', ' ')} TASKS</Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.7}
              disabled={isGenerating}
              onPress={handleGenerateTasks}
              className={`w-full py-5 bg-amber-500 rounded-[1.5rem] flex-row items-center justify-center gap-3 shadow-lg shadow-amber-500/20 mb-8 ${isGenerating ? 'opacity-50' : ''}`}
            >
               {isGenerating ? <ActivityIndicator color="white" /> : (
                 <>
                   <Ionicons name="sparkles" size={18} color="white" />
                   <Text className="text-[11px] font-black text-white uppercase tracking-widest italic">Generate Tasks for {activePhase.replace('_', ' ')}</Text>
                 </>
               )}
            </TouchableOpacity>

            <View className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-[2.5rem] p-6 mb-10 shadow-inner flex-row items-center">
               <TextInput 
                 value={taskInput}
                 onChangeText={setTaskInput}
                 placeholder="Add manual task..."
                 placeholderTextColor={colors.textSecondary + '40'}
                 className="flex-1 font-black text-sm text-[var(--text-primary)] uppercase italic tracking-widest text-left"
                 onSubmitEditing={handleAddTask}
               />
               <TouchableOpacity onPress={handleAddTask} className="w-10 h-10 bg-[var(--text-primary)] rounded-xl items-center justify-center">
                  <Ionicons name="add" size={24} color={colors.primary} />
               </TouchableOpacity>
            </View>

            <View className="space-y-2">
               {filteredUnits.length > 0 ? (
                 filteredUnits.map((u: any) => <UnitCard key={u.id} unit={u} />)
               ) : (
                 <View className="py-20 items-center justify-center opacity-20">
                    <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
                    <Text className="text-[10px] font-black uppercase tracking-widest mt-6 text-center">No nodes defined for this phase{'\n'}Generate using AI or add manually</Text>
                 </View>
               )}
            </View>
          </ScrollView>

          {/* 4. Advancement Footer */}
          <View className="absolute bottom-0 left-0 right-0 p-8 bg-[var(--bg-primary)]/90 border-t border-[var(--border-color)]">
             <View className="flex-row items-center justify-between mb-4">
                <View className="text-left">
                   <Text className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic text-left">Phase Readiness</Text>
                   <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase italic mt-1 text-left">{filteredUnits.filter((u: any) => u.status !== 'DONE').length} Nodes Remaining</Text>
                </View>
                <View className="w-24 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                   <View className="h-full bg-emerald-500" style={{ width: `${Math.round((filteredUnits.filter((u: any) => u.status === 'DONE').length / Math.max(1, filteredUnits.length)) * 100)}%` }} />
                </View>
             </View>
             <TouchableOpacity 
               onPress={handleAdvancePhase}
               className="w-full py-6 bg-amber-500/10 border border-amber-500/30 rounded-[2rem] items-center justify-center"
             >
                <Text className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] italic">Advance to Next Protocol</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
};

export default function ProjectPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchProject = async () => {
        try {
          const data = await api.get(`/api/github-projects/${id}`);
          setProject(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      if (id) fetchProject();
    }, [id])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)] px-8">
        <View className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full items-center justify-center mb-10 border border-[var(--border-color)] shadow-inner">
          <Ionicons name="construct-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
        </View>
        <Text className="text-base font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center leading-relaxed">
          Project sequence not found{'\n'}in remote neural registry.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(drawer)/project-tracker')}
          className="mt-12 bg-[var(--accent-color)] px-12 py-6 rounded-[2rem] shadow-xl shadow-[var(--accent-color)]/20"
        >
          <Text className="text-xs font-black uppercase tracking-[0.4em] text-[var(--bg-primary)]">
            Open Registry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <ProjectDetail project={project} />;
}
