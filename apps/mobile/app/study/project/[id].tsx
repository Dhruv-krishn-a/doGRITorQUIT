import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { api } from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PHASES = ['BACKLOG', 'SPRINT_PLANNING', 'DEVELOPMENT', 'TESTING', 'REVIEW', 'RELEASE'] as const;

type SidebarTab = 'BLUEPRINTS' | 'EPICS';
type Phase = (typeof PHASES)[number];

const phaseLabel = (phase: string) => phase.split('_').join(' ');

// Components cast to any to bypass strict NativeWind/TS augmentation checks in some environments
const TView = View as any;
const TText = Text as any;
const TTouchableOpacity = TouchableOpacity as any;
const TScrollView = ScrollView as any;
const TTextInput = TextInput as any;

const ProjectDetail: React.FC<{ project: any }> = ({ project: initialProject }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const [project, setProject] = useState(initialProject);
  const [activePhase, setActivePhase] = useState<Phase>(
    project.projectStage === 'EXECUTION' ? 'DEVELOPMENT' : 'BACKLOG'
  );
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('BLUEPRINTS');
  const [taskInput, setTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const units = project.features || [];

  const filteredUnits = useMemo(() => {
    return units.filter(
      (u: any) => u.sdlcPhaseId === activePhase || (u.sdlcPhaseId === 'START' && activePhase === 'BACKLOG')
    );
  }, [units, activePhase]);

  const epics = useMemo(() => {
    const epicSet = new Set<string>();
    units.forEach((u: any) => {
      if (u.epic) epicSet.add(u.epic);
    });
    return Array.from(epicSet);
  }, [units]);

  const doneCount = filteredUnits.filter((u: any) => u.status === 'DONE').length;
  const remainingCount = Math.max(0, filteredUnits.length - doneCount);
  const progressPct = filteredUnits.length ? Math.round((doneCount / filteredUnits.length) * 100) : 0;
  const currentPhaseIndex = PHASES.indexOf(activePhase);
  const nextPhase = currentPhaseIndex < PHASES.length - 1 ? PHASES[currentPhaseIndex + 1] : null;

  const handleAddTask = async () => {
    const title = taskInput.trim();
    if (!title) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const newFeature = await api.post(`/api/github-projects/${project.id}/features`, {
        title,
        sdlcPhaseId: activePhase,
      });

      setProject((prev: any) => ({
        ...prev,
        features: [...(prev.features || []), newFeature],
      }));
      setTaskInput('');
    } catch (e: any) {
      Alert.alert('Registry Error', e?.message || 'Unable to create task.');
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      await api.post(`/api/github-projects/${project.id}/generate-tasks`, { phase: activePhase });
      Alert.alert('Sequence Generated', `AI has injected implementation nodes for ${phaseLabel(activePhase)}.`);
      const updated = await api.get(`/api/github-projects/${project.id}`);
      setProject(updated);
    } catch (e: any) {
      Alert.alert('Generation Error', e?.message || 'Unable to generate tasks.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdvancePhase = async () => {
    if (!nextPhase) return;

    Alert.alert('Protocol Advance', `Move from ${phaseLabel(activePhase)} to ${phaseLabel(nextPhase)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Advance',
        onPress: async () => {
          setActivePhase(nextPhase);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const openBlueprint = (noteId: string) => {
    if (!noteId) {
      Alert.alert('Blueprint Missing', 'This document has not been synthesized yet.');
      return;
    }
    Haptics.selectionAsync();
    router.push(`/notes/${noteId}`);
  };

  const UnitCard = ({ unit }: { unit: any }) => {
    const isDone = unit.status === 'DONE';
    return (
      <TView
        className={`p-5 rounded-[2rem] mb-4 border ${
          isDone ? 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]' : 'bg-[var(--bg-card)] border-[var(--border-color)]'
        }`}
      >
        <TView className="flex-row items-start justify-between gap-4">
          <TView className="flex-1">
            <TView className="flex-row items-center gap-2 mb-2 flex-wrap text-left">
              <TView className={`px-2.5 py-1 rounded-full border ${isDone ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
                <TText className={`text-[9px] font-black uppercase tracking-[0.25em] ${isDone ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
                  {phaseLabel(unit.sdlcPhaseId || activePhase)}
                </TText>
              </TView>
              {unit.epic ? (
                <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-60">
                  {unit.epic}
                </TText>
              ) : null}
            </TView>

            <TText
              className={`font-black text-sm uppercase italic tracking-tight leading-snug text-left ${
                isDone ? 'text-[var(--text-secondary)] line-through opacity-40' : 'text-[var(--text-primary)]'
              }`}
            >
              {unit.title}
            </TText>
          </TView>

          <TTouchableOpacity
            onPress={async () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              try {
                const updated = await api.patch(`/api/github-projects/${project.id}/features/${unit.id}`, {
                  status: isDone ? 'TODO' : 'DONE',
                });
                setProject((prev: any) => ({
                  ...prev,
                  features: (prev.features || []).map((f: any) => (f.id === unit.id ? updated : f)),
                }));
              } catch {
                Alert.alert('Update Error', 'Could not update this task.');
              }
            }}
            className={`w-12 h-12 rounded-2xl items-center justify-center border ${
              isDone ? 'bg-emerald-500/20 border-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
            }`}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={isDone ? '#10b981' : `${colors.textSecondary}40`}
            />
          </TTouchableOpacity>
        </TView>
      </TView>
    );
  };

  return (
    <TView style={{ flex: 1, backgroundColor: colors.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <TScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }}>
          <TView className="pt-14 pb-6 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
            <TView className="px-6 mb-5 text-left">
              <TView className="flex-row items-start justify-between gap-3 mb-4 text-left">
                <TTouchableOpacity
                  onPress={() => router.back()}
                  className="w-11 h-11 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]"
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TTouchableOpacity>

                <TView className="flex-row items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10">
                  <Ionicons name="construct" size={12} color="#f59e0b" />
                  <TText className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 italic text-left">
                    {project.methodology || 'AGILE'}
                  </TText>
                </TView>
              </TView>

              <TText className="text-[var(--text-primary)] font-black italic uppercase tracking-tighter text-[28px] leading-tight text-left">
                {project.name}
              </TText>
              <TText className="mt-2 text-[11px] font-medium text-[var(--text-secondary)] opacity-70 leading-relaxed text-left">
                Manage blueprints, epics, and execution tasks in one focused workspace.
              </TText>
            </TView>

            <TView className="px-6 flex-row gap-3 mb-5">
              <TView className="flex-1 p-4 rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-60 mb-2 text-left">
                  Total nodes
                </TText>
                <TText className="text-xl font-black italic uppercase text-[var(--text-primary)] text-left">
                  {units.length}
                </TText>
              </TView>
              <TView className="flex-1 p-4 rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-60 mb-2 text-left">
                  Completed
                </TText>
                <TText className="text-xl font-black italic uppercase text-[var(--text-primary)] text-left">
                  {doneCount}
                </TText>
              </TView>
              <TView className="flex-1 p-4 rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-60 mb-2 text-left">
                  Remaining
                </TText>
                <TText className="text-xl font-black italic uppercase text-[var(--text-primary)] text-left">
                  {remainingCount}
                </TText>
              </TView>
            </TView>

            <TScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 6 }}
            >
              {PHASES.map((p, idx) => {
                const isActive = activePhase === p;
                const isCompleted = currentPhaseIndex > idx;

                return (
                  <TTouchableOpacity
                    key={p}
                    onPress={() => {
                      setActivePhase(p);
                      Haptics.selectionAsync();
                    }}
                    className={`flex-row items-center mr-3 px-4 py-2.5 rounded-full border ${
                      isActive
                        ? 'bg-amber-500 border-amber-500'
                        : isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                    }`}
                    activeOpacity={0.82}
                  >
                    <TView
                      className={`w-2 h-2 rounded-full mr-2.5 ${
                        isActive ? 'bg-white' : isCompleted ? 'bg-emerald-500' : 'bg-[var(--text-secondary)]'
                      }`}
                    />
                    <TText
                      className={`text-[9px] font-black uppercase tracking-widest italic text-left ${
                        isActive ? 'text-white' : isCompleted ? 'text-emerald-500' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {phaseLabel(p)}
                    </TText>
                  </TTouchableOpacity>
                );
              })}
            </TScrollView>
          </TView>

          <TView className="px-6 pt-6 bg-transparent text-left">
            <TView className="flex-row gap-3 mb-6 text-left">
              <TTouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveSidebarTab('BLUEPRINTS');
                }}
                className={`flex-1 rounded-[1.5rem] border px-4 py-4 ${
                  activeSidebarTab === 'BLUEPRINTS'
                    ? 'bg-[var(--accent-color)]/8 border-[var(--accent-color)]/30'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                }`}
                activeOpacity={0.85}
              >
                <TView className="flex-row items-center justify-between">
                  <TView className="flex-row items-center gap-3">
                    <TView className={`w-10 h-10 rounded-2xl items-center justify-center ${activeSidebarTab === 'BLUEPRINTS' ? 'bg-[var(--accent-color)]/12' : 'bg-[var(--bg-primary)] border border-[var(--border-color)]'}`}>
                      <Ionicons name="document-text" size={16} color={activeSidebarTab === 'BLUEPRINTS' ? colors.accent : `${colors.textSecondary}80`} />
                    </TView>
                    <TView className="text-left">
                      <TText className={`text-[10px] font-black uppercase tracking-[0.25em] ${activeSidebarTab === 'BLUEPRINTS' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-60'} text-left`}>
                        Blueprints
                      </TText>
                      <TText className="text-[9px] font-medium text-[var(--text-secondary)] opacity-50 mt-1 text-left">
                        PRD, flows, specs
                      </TText>
                    </TView>
                  </TView>
                  {activeSidebarTab === 'BLUEPRINTS' ? <Ionicons name="chevron-forward" size={16} color={colors.accent} /> : null}
                </TView>
              </TTouchableOpacity>

              <TTouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveSidebarTab('EPICS');
                }}
                className={`flex-1 rounded-[1.5rem] border px-4 py-4 ${
                  activeSidebarTab === 'EPICS'
                    ? 'bg-[var(--accent-color)]/8 border-[var(--accent-color)]/30'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                }`}
                activeOpacity={0.85}
              >
                <TView className="flex-row items-center justify-between">
                  <TView className="flex-row items-center gap-3">
                    <TView className={`w-10 h-10 rounded-2xl items-center justify-center ${activeSidebarTab === 'EPICS' ? 'bg-[var(--accent-color)]/12' : 'bg-[var(--bg-primary)] border border-[var(--border-color)]'}`}>
                      <Ionicons name="layers" size={16} color={activeSidebarTab === 'EPICS' ? colors.accent : `${colors.textSecondary}80`} />
                    </TView>
                    <TView className="text-left">
                      <TText className={`text-[10px] font-black uppercase tracking-[0.25em] ${activeSidebarTab === 'EPICS' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] opacity-60'} text-left`}>
                        Epics
                      </TText>
                      <TText className="text-[9px] font-medium text-[var(--text-secondary)] opacity-50 mt-1 text-left">
                        grouped features
                      </TText>
                    </TView>
                  </TView>
                  {activeSidebarTab === 'EPICS' ? <Ionicons name="chevron-forward" size={16} color={colors.accent} /> : null}
                </TView>
              </TTouchableOpacity>
            </TView>

            <TView className="mb-8 text-left">
              {activeSidebarTab === 'BLUEPRINTS' ? (
                <TView className="text-left">
                  <TView className="flex-row items-end justify-between mb-4 text-left">
                    <TText className="text-[8px] font-black uppercase tracking-[0.45em] text-[var(--text-secondary)] opacity-40 italic text-left">
                      Technical Blueprints
                    </TText>
                    <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-40 text-right">
                      Tap to open
                    </TText>
                  </TView>

                  <TView className="gap-3 text-left">
                    <TTouchableOpacity
                      onPress={() => openBlueprint(project.requirementsNote?.id)}
                      className="p-4 bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] flex-row items-center justify-between"
                      activeOpacity={0.85}
                    >
                      <TView className="text-left">
                        <TText className="text-[10px] font-black uppercase text-[var(--text-primary)] italic tracking-widest text-left">
                          Requirements (PRD)
                        </TText>
                        <TText className="text-[9px] font-medium text-[var(--text-secondary)] opacity-50 mt-1 text-left">
                          Open the product requirements document.
                        </TText>
                      </TView>
                      <TView className="flex-row items-center gap-2">
                        {project.prdVerified ? <Ionicons name="checkmark-circle" size={14} color="#10b981" /> : <Ionicons name="ellipse-outline" size={14} color={colors.textSecondary} />}
                        <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                      </TView>
                    </TTouchableOpacity>

                    <TTouchableOpacity
                      onPress={() => openBlueprint(project.userFlowNote?.id)}
                      className="p-4 bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] flex-row items-center justify-between"
                      activeOpacity={0.85}
                    >
                      <TView className="text-left">
                        <TText className="text-[10px] font-black uppercase text-[var(--text-primary)] italic tracking-widest text-left">
                          User Flow
                        </TText>
                        <TText className="text-[9px] font-medium text-[var(--text-secondary)] opacity-50 mt-1 text-left">
                          Review the user journey and screens.
                        </TText>
                      </TView>
                      <TView className="flex-row items-center gap-2">
                        {project.userFlowVerified ? <Ionicons name="checkmark-circle" size={14} color="#10b981" /> : <Ionicons name="ellipse-outline" size={14} color={colors.textSecondary} />}
                        <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                      </TView>
                    </TTouchableOpacity>

                    <TTouchableOpacity
                      onPress={() => openBlueprint(project.systemFlowNote?.id)}
                      className="p-4 bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] flex-row items-center justify-between"
                      activeOpacity={0.85}
                    >
                      <TView className="text-left">
                        <TText className="text-[10px] font-black uppercase text-[var(--text-primary)] italic tracking-widest text-left">
                          System Flow
                        </TText>
                        <TText className="text-[9px] font-medium text-[var(--text-secondary)] opacity-50 mt-1 text-left">
                          Inspect system architecture and dependencies.
                        </TText>
                      </TView>
                      <TView className="flex-row items-center gap-2">
                        {project.systemFlowVerified ? <Ionicons name="checkmark-circle" size={14} color="#10b981" /> : <Ionicons name="ellipse-outline" size={14} color={colors.textSecondary} />}
                        <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                      </TView>
                    </TTouchableOpacity>
                  </TView>
                </TView>
              ) : (
                <TView className="text-left">
                  <TView className="flex-row items-end justify-between mb-4 text-left">
                    <TText className="text-[8px] font-black uppercase tracking-[0.45em] text-[var(--text-secondary)] opacity-40 italic text-left">
                      Epics
                    </TText>
                    <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-40 text-right">
                      {epics.length} groups
                    </TText>
                  </TView>

                  <TView className="gap-3 text-left">
                    <TView className="p-4 bg-amber-500/10 rounded-[1.5rem] border border-amber-500/20 flex-row items-center justify-between">
                      <TText className="text-[10px] font-black uppercase text-amber-500 italic tracking-widest text-left">
                        All Epics
                      </TText>
                      <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-500 opacity-70">
                        overview
                      </TText>
                    </TView>

                    {epics.length > 0 ? (
                      epics.map((e: string) => (
                        <TView key={e} className="p-4 bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] flex-row items-center justify-between">
                          <TText className="text-[10px] font-black uppercase text-[var(--text-secondary)] italic tracking-widest flex-1 pr-4 text-left">
                            {e}
                          </TText>
                          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                        </TView>
                      ))
                    ) : (
                      <TView className="p-5 rounded-[1.5rem] border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/30 items-center justify-center">
                        <Ionicons name="layers-outline" size={28} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                        <TText className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 text-center leading-relaxed mt-3">
                          No epics yet
                        </TText>
                      </TView>
                    )}
                  </TView>
                </TView>
              )}
            </TView>

            <TView className="mb-4 text-left">
              <TText className="text-[9px] font-black uppercase tracking-[0.45em] text-amber-500 mb-2 italic text-left">
                Execution Dashboard
              </TText>
              <TText className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none text-left">
                {phaseLabel(activePhase)} Tasks
              </TText>
              <TText className="mt-3 text-[11px] font-medium text-[var(--text-secondary)] opacity-70 leading-relaxed text-left">
                Generate tasks automatically or capture them manually in the current phase.
              </TText>
            </TView>

            <TView className="mb-5 rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-4">
              <TView className="flex-row items-center justify-between mb-3 text-left">
                <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-60 text-left">
                  Phase Progress
                </TText>
                <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-60 text-right">
                  {progressPct}%
                </TText>
              </TView>
              <TView className="h-2 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                <TView className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
              </TView>
              <TView className="flex-row items-center justify-between mt-3 text-left">
                <TText className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 text-left">
                  {doneCount} done
                </TText>
                <TText className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 text-right">
                  {remainingCount} remaining
                </TText>
              </TView>
            </TView>

            <TTouchableOpacity
              activeOpacity={0.8}
              disabled={isGenerating}
              onPress={handleGenerateTasks}
              className={`w-full py-5 bg-amber-500 rounded-[1.75rem] flex-row items-center justify-center gap-3 mb-5 ${isGenerating ? 'opacity-50' : ''}`}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="white" />
                  <TText className="text-[11px] font-black text-white uppercase tracking-widest italic text-left">
                    Generate Tasks for {phaseLabel(activePhase)}
                  </TText>
                </>
              )}
            </TTouchableOpacity>

            <TView className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-[2.5rem] p-4 mb-6 text-left">
              <TText className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-50 mb-4 text-left">
                Add manual task
              </TText>
              <TView className="flex-row items-center gap-3 text-left">
                <TView className="w-11 h-11 rounded-2xl items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] shrink-0">
                  <Ionicons name="add" size={20} color={colors.accent} />
                </TView>
                <TTextInput autoCorrect={false} spellCheck={false}
                  value={taskInput}
                  onChangeText={setTaskInput}
                  placeholder="Add manual task..."
                  placeholderTextColor={colors.textSecondary + '60'}
                  className="flex-1 font-black text-sm text-[var(--text-primary)] uppercase italic tracking-widest text-left"
                  onSubmitEditing={handleAddTask}
                  returnKeyType="done"
                  style={{ backgroundColor: 'transparent' }}
                />
                <TTouchableOpacity
                  onPress={handleAddTask}
                  className="w-11 h-11 bg-[var(--accent-color)] rounded-2xl items-center justify-center"
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-up" size={18} color={colors.primary} />
                </TTouchableOpacity>
              </TView>
            </TView>

            <TView className="flex-row items-center justify-between mb-3 text-left">
              <TText className="text-[9px] font-black uppercase tracking-[0.35em] text-[var(--text-secondary)] opacity-40 italic text-left">
                {activePhase === 'RELEASE' ? 'Release nodes' : 'Phase nodes'}
              </TText>
              <TText className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-40 text-right">
                {filteredUnits.length} items
              </TText>
            </TView>

            <TView className="text-left">
              {filteredUnits.length > 0 ? (
                filteredUnits.map((u: any) => <UnitCard key={u.id} unit={u} />)
              ) : (
                <TView className="py-20 items-center justify-center rounded-[2.5rem] border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/20 text-left">
                  <TView className="w-20 h-20 rounded-full items-center justify-center bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] mb-5 text-left">
                    <Ionicons name="construct-outline" size={42} color={colors.textSecondary} style={{ opacity: 0.25 }} />
                  </TView>
                  <TText className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] opacity-50 text-center leading-relaxed mt-2">
                    {'No nodes defined for this phase\nGenerate using AI or add manually'}
                  </TText>
                </TView>
              )}
            </TView>
          </TView>
        </TScrollView>

        <TView className="absolute bottom-0 left-0 right-0 p-5 bg-[var(--bg-primary)] border-t border-[var(--border-color)] z-50 text-left">
          <TView className="flex-row items-center justify-between mb-4 text-left">
            <TView className="text-left">
              <TText className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic text-left">
                Phase readiness
              </TText>
              <TText className="text-[10px] font-black text-[var(--text-primary)] uppercase italic mt-1 text-left">
                {remainingCount} nodes remaining
              </TText>
            </TView>
            <TView className="w-24 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
              <TView className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
            </TView>
          </TView>
          <TTouchableOpacity
            onPress={handleAdvancePhase}
            disabled={!nextPhase}
            className={`w-full py-5 rounded-[1.75rem] items-center justify-center border ${
              nextPhase
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] opacity-40'
            }`}
            activeOpacity={0.85}
          >
            <TText className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] italic text-left">
              {nextPhase ? `Advance to ${phaseLabel(nextPhase)}` : 'Final Phase Reached'}
            </TText>
          </TTouchableOpacity>
        </TView>
      </KeyboardAvoidingView>
    </TView>
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
      <TView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
        <ActivityIndicator color={colors.accent} />
      </TView>
    );
  }

  if (!project) {
    return (
      <TView className="flex-1 items-center justify-center bg-[var(--bg-primary)] px-8">
        <TView className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full items-center justify-center mb-10 border border-[var(--border-color)]">
          <Ionicons name="construct-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
        </TView>
        <TText className="text-base font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center leading-relaxed">
          Project sequence not found in remote neural registry.
        </TText>
        <TTouchableOpacity
          onPress={() => router.replace('/(drawer)/project-tracker')}
          className="mt-12 bg-[var(--accent-color)] px-12 py-6 rounded-[2rem]"
          activeOpacity={0.85}
        >
          <TText className="text-xs font-black uppercase tracking-[0.4em] text-[var(--bg-primary)]">
            Open Registry
          </TText>
        </TTouchableOpacity>
      </TView>
    );
  }

  return <ProjectDetail project={project} />;
}
