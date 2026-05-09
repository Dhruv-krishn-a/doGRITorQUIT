import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { generateAIPath, createManualPath } from '../../lib/path-creation';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoadmapInitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

type Step = 'TYPE' | 'AI' | 'EXCEL' | 'MANUAL';

export const RoadmapInitModal: React.FC<RoadmapInitModalProps> = ({ isVisible, onClose, onRefresh }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>('TYPE');
  const [loading, setLoading] = useState(false);

  // Form State
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');

  const reset = () => {
    setStep('TYPE');
    setPrompt('');
    setTitle('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAI = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      await generateAIPath(prompt, 'PLAN');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      handleClose();
      Alert.alert("Architecture Initialized", "Our AI is deconstructing the target journey. Check the registry in a few moments.");
    } catch (err: any) {
      Alert.alert("AI Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManual = async () => {
    if (!title) return;
    setLoading(true);
    try {
      await createManualPath({ title, type: 'PLAN' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      handleClose();
    } catch (err: any) {
      Alert.alert("Registry Error", err.message);
    } finally {
      setLoading(false);
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
          <View className="flex-row justify-between items-center mb-12 text-left">
             <View className="flex-row items-center gap-4 text-left">
               <TouchableOpacity onPress={() => step === 'TYPE' ? handleClose() : setStep('TYPE')} className="p-3 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                 <Ionicons name={step === 'TYPE' ? "close" : "arrow-back"} size={20} color={colors.textSecondary} />
               </TouchableOpacity>
               <View className="text-left">
                  <Text className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] italic text-left">Strategic Protocol</Text>
                  <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] text-left">
                    {step === 'TYPE' ? 'Roadmap Logic' : step === 'AI' ? 'AI Architect' : 'Custom Sequence'}
                  </Text>
               </View>
             </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 'TYPE' && (
              <View>
                <CardOption 
                  icon="sparkles" 
                  label="AI Architect" 
                  sublabel="Smart temporal path generation" 
                  onPress={() => setStep('AI')}
                  accent
                />
                <CardOption 
                  icon="document-attach" 
                  label="Excel Import" 
                  sublabel="Ingest sequence from spreadsheet" 
                  onPress={() => setStep('EXCEL')}
                />
                <CardOption 
                  icon="create" 
                  label="Manual Path" 
                  sublabel="Direct day-wise node sequencing" 
                  onPress={() => setStep('MANUAL')}
                />
              </View>
            )}

            {step === 'AI' && (
              <View className="space-y-12">
                <View className="text-left">
                   <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Neural Prompt</Text>
                   <TextInput
                     value={prompt}
                     onChangeText={setPrompt}
                     multiline
                     placeholder="I WANT TO LEARN ADVANCED SYSTEM DESIGN IN 30 DAYS..."
                     placeholderTextColor={colors.textSecondary + '40'}
                     className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-base text-[var(--text-primary)] uppercase italic tracking-tight min-h-[150px]"
                     style={{ textAlignVertical: 'top' }}
                   />
                </View>

                <TouchableOpacity 
                  disabled={!prompt || loading}
                  onPress={handleAI}
                  className={`py-8 rounded-[2.5rem] items-center justify-center shadow-lg ${!prompt ? 'opacity-30 bg-[var(--bg-secondary)]' : 'bg-amber-500 shadow-amber-500/20'}`}
                >
                   {loading ? <ActivityIndicator color="white" /> : (
                     <View className="flex-row items-center gap-4">
                        <Ionicons name="sparkles" size={20} color="white" />
                        <Text className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Synthesize Journey</Text>
                     </View>
                   )}
                </TouchableOpacity>
              </View>
            )}

            {step === 'MANUAL' && (
              <View className="space-y-12">
                <View className="text-left">
                   <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Roadmap Codename</Text>
                   <TextInput
                     value={title}
                     onChangeText={setTitle}
                     placeholder="DEFINE STRATEGIC GOAL..."
                     placeholderTextColor={colors.textSecondary + '40'}
                     className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-2xl text-[var(--text-primary)] uppercase italic tracking-tight"
                   />
                </View>

                <TouchableOpacity 
                  disabled={!title || loading}
                  onPress={handleManual}
                  className={`py-8 rounded-[2.5rem] items-center justify-center shadow-lg ${!title ? 'opacity-30 bg-[var(--bg-secondary)]' : 'bg-[var(--text-primary)] shadow-black/20'}`}
                >
                   {loading ? <ActivityIndicator color="white" /> : <Text className="text-sm font-black text-[var(--bg-primary)] uppercase tracking-[0.3em] italic">Initialize Plan</Text>}
                </TouchableOpacity>
              </View>
            )}

            {step === 'EXCEL' && (
              <View className="items-center justify-center py-20 opacity-40">
                 <Ionicons name="document-attach-outline" size={64} color={colors.textSecondary} />
                 <Text className="text-center font-black uppercase italic tracking-widest mt-8 text-[var(--text-secondary)]">Neural Link: File System{'\n'}Access Required</Text>
                 <Text className="text-[9px] font-bold text-center mt-4 text-[var(--text-secondary)] uppercase opacity-60">Use the Desktop OS to perform batch{'\n'}Excel ingestion for complex sequences.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
