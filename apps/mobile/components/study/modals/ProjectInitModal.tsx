import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { createManualPath } from '../../lib/path-creation';
import { api } from '../../services/api';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProjectInitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

type Step = 'TYPE' | 'FORM' | 'GITHUB' | 'AI_BLUEPRINTING';

export const ProjectInitModal: React.FC<ProjectInitModalProps> = ({ isVisible, onClose, onRefresh }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>('TYPE');
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [methodology, setMethodology] = useState('AGILE');
  const [githubRepo, setGithubRepo] = useState('');

  // AI Simulation State
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState('Initializing Neural Logic...');

  const reset = () => {
    setStep('TYPE');
    setName('');
    setDescription('');
    setMethodology('AGILE');
    setGithubRepo('');
    setLoading(false);
    setAiProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const runAIProcess = () => {
    setStep('AI_BLUEPRINTING');
    setAiProgress(0);
    
    const sequence = [
      { p: 20, s: 'Synthesizing Requirements (PRD)...' },
      { p: 45, s: 'Mapping User Flows...' },
      { p: 70, s: 'Designing System Architecture...' },
      { p: 90, s: 'Generating Implementation Nodes...' },
      { p: 100, s: 'Registry Handshake Complete.' }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setAiProgress(sequence[current].p);
        setAiStatus(sequence[current].s);
        current++;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        clearInterval(interval);
        setTimeout(finalizeCreation, 800);
      }
    }, 1200);
  };

  const finalizeCreation = async () => {
    try {
      await api.post('/api/github-projects', {
        name,
        description,
        githubRepo: githubRepo || undefined,
        isConsultation: true
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      handleClose();
    } catch (err: any) {
      Alert.alert("Error", err.message);
      setStep('FORM');
    }
  };

  const CardOption = ({ icon, label, sublabel, onPress, accent = false }: any) => (
    <TouchableOpacity 
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
      activeOpacity={0.7}
      className={`p-8 rounded-[3rem] border mb-6 flex-row items-center ${
        accent ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'
      }`}
    >
      <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-6 ${accent ? 'bg-white/20' : 'bg-[var(--bg-card)] border border-[var(--border-color)]'}`}>
        <Ionicons name={icon} size={24} color={accent ? 'white' : colors.accent} />
      </View>
      <View className="flex-1 text-left">
        <Text className={`font-black text-lg uppercase italic tracking-tight ${accent ? 'text-white' : 'text-[var(--text-primary)]'}`}>{label}</Text>
        <Text className={`text-[9px] font-black uppercase tracking-widest mt-1 italic ${accent ? 'text-white/60' : 'text-[var(--text-secondary)] opacity-40'}`}>{sublabel}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View style={{ backgroundColor: colors.card }} className="rounded-t-[4rem] p-10 pb-16 border-t border-[var(--border-color)] max-h-[90%]">
          {/* Header Protocol */}
          <View className="flex-row justify-between items-center mb-12">
             <View className="flex-row items-center gap-4">
               {step !== 'AI_BLUEPRINTING' && (
                 <TouchableOpacity onPress={() => step === 'TYPE' ? handleClose() : setStep('TYPE')} className="p-3 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                   <Ionicons name={step === 'TYPE' ? "close" : "arrow-back"} size={20} color={colors.textSecondary} />
                 </TouchableOpacity>
               )}
               <View className="text-left">
                  <Text className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] italic text-left">Project Initialization</Text>
                  <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] text-left">
                    {step === 'TYPE' ? 'New Protocol' : step === 'AI_BLUEPRINTING' ? 'Neural Architect' : step === 'GITHUB' ? 'Github Ingestion' : 'Build Config'}
                  </Text>
               </View>
             </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 'TYPE' && (
              <View>
                <CardOption 
                  icon="construct" 
                  label="New Project" 
                  sublabel="Direct SDLC-driven execution" 
                  onPress={() => setStep('FORM')}
                  accent
                />
                <CardOption 
                  icon="logo-github" 
                  label="From Github" 
                  sublabel="Import existing repository archive" 
                  onPress={() => setStep('GITHUB')}
                />
              </View>
            )}

            {(step === 'FORM' || step === 'GITHUB') && (
              <View className="space-y-12">
                {step === 'GITHUB' && (
                  <View className="text-left">
                     <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Github Repo URL</Text>
                     <TextInput
                       value={githubRepo}
                       onChangeText={setGithubRepo}
                       placeholder="E.G. OWNER/REPO..."
                       placeholderTextColor={colors.textSecondary + '40'}
                       className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-lg text-[var(--text-primary)] uppercase italic tracking-tight"
                     />
                  </View>
                )}
                <View className="text-left">
                   <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Project Codename</Text>
                   <TextInput
                     value={name}
                     onChangeText={setName}
                     placeholder="ENTER TARGET NAME..."
                     placeholderTextColor={colors.textSecondary + '40'}
                     className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-2xl text-[var(--text-primary)] uppercase italic tracking-tight"
                   />
                </View>

                <View className="text-left">
                   <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Architecture Objective</Text>
                   <TextInput
                     value={description}
                     onChangeText={setDescription}
                     multiline
                     placeholder="DEFINE GOALS FOR AI BLUEPRINTING..."
                     placeholderTextColor={colors.textSecondary + '40'}
                     className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-base text-[var(--text-primary)] uppercase italic tracking-tight min-h-[120px]"
                     style={{ textAlignVertical: 'top' }}
                   />
                </View>

                <View>
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Execution Methodology</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {['AGILE', 'WATERFALL', 'V-MODEL', 'SPIRAL'].map(m => (
                      <TouchableOpacity 
                        key={m}
                        onPress={() => setMethodology(m)}
                        className={`px-6 py-4 rounded-2xl border ${methodology === m ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${methodology === m ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  disabled={!name || (step === 'GITHUB' && !githubRepo) || loading}
                  onPress={runAIProcess}
                  className={`py-8 rounded-[2.5rem] items-center justify-center shadow-lg ${(!name || (step === 'GITHUB' && !githubRepo)) ? 'opacity-30 bg-[var(--bg-secondary)]' : 'bg-[var(--text-primary)] shadow-black/20'}`}
                >
                   <View className="flex-row items-center gap-4">
                      <Ionicons name="sparkles" size={20} color={colors.primary} />
                      <Text className="text-sm font-black text-[var(--bg-primary)] uppercase tracking-[0.3em] italic">Generate Blueprints</Text>
                   </View>
                </TouchableOpacity>
              </View>
            )}

            {step === 'AI_BLUEPRINTING' && (
              <View className="items-center justify-center py-20">
                 <View className="w-48 h-48 rounded-full border-[12px] border-[var(--bg-secondary)] items-center justify-center relative mb-12">
                    <View className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-amber-500" style={{ transform: [{ rotate: `${(aiProgress / 100) * 360}deg` }] }} />
                    <Ionicons name="sparkles" size={64} color="#f59e0b" />
                 </View>
                 <Text className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-4 text-center">{aiStatus}</Text>
                 <View className="w-64 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <View className="h-full bg-amber-500" style={{ width: `${aiProgress}%` }} />
                 </View>
                 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mt-8 italic opacity-40">Feeding AI Architecture Hub</Text>
              </View>
            )}

            {step === 'GITHUB' && (
              <View className="items-center justify-center py-20 opacity-40">
                 <Ionicons name="logo-github" size={64} color={colors.textSecondary} />
                 <Text className="text-center font-black uppercase italic tracking-widest mt-8 text-[var(--text-secondary)] text-lg">Github Ingestion{'\n'}Auth Required</Text>
                 <Text className="text-[10px] font-bold text-center mt-6 text-[var(--text-secondary)] uppercase opacity-60 leading-relaxed">
                   Link your Github account via the{'\n'}Desktop or Web command centers{'\n'}to enable repository sync.
                 </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
