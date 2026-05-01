import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { AIArchitectModal } from './AIArchitectModal';
import { YoutubeImportModal } from './YoutubeImportModal';
import { ExcelImportModal } from './ExcelImportModal';
import { createManualPath, ingestYoutubePlaylist, generateAIPath } from '../../lib/path-creation';
import { useBilling } from '../../hooks/useBilling';
import * as Haptics from 'expo-haptics';

interface PathCreationManagerProps {
 isVisible: boolean;
 onClose: () => void;
 onRefresh: () => void;
}

type CreationMode = 'SELECT' | 'AI' | 'MANUAL' | 'YOUTUBE' | 'EXCEL';

export const PathCreationManager: React.FC<PathCreationManagerProps> = ({ isVisible, onClose, onRefresh }) => {
 const { colors } = useTheme();
 const router = useRouter();
 const { data: billingData } = useBilling();
 const [mode, setCreationMode] = useState<CreationMode>('SELECT');
 const [loading, setLoading] = useState(false);
 const [title, setTitle] = useState('');

 const reset = () => {
 setCreationMode('SELECT');
 setTitle('');
 setLoading(false);
 };

 const handleClose = () => {
 reset();
 onClose();
 };

 const checkLimit = () => {
 const used = billingData?.usage?.plans?.used || 0;
 const limit = billingData?.usage?.plans?.limit || 3;
 if (used >= limit) {
 Alert.alert(
 "Limit Reached",
 `You have reached your limit of ${limit} paths. Upgrade to Pro for unlimited growth.`,
 [
 { text: "Later", style: "cancel" },
 { text: "View Plans", onPress: () => { handleClose(); router.push('/subscriptions'); } }
 ]
 );
 return false;
 }
 return true;
 };

 const handleManualCreate = async (type: 'COURSE' | 'PROJECT') => {
 if (!title) return;
 if (!checkLimit()) return;
 
 setLoading(true);
 try {
 const track = await createManualPath({ title, type });
 onRefresh();
 handleClose();
 router.push(`/study/${track.id}`);
 } catch (err: any) {
 Alert.alert("Error", err.message);
 } finally {
 setLoading(false);
 }
 };

 const handleYoutubeImport = async (url: string) => {
 if (!checkLimit()) return;
 setLoading(true);
 try {
 await ingestYoutubePlaylist(url);
 onRefresh();
 handleClose();
 // We don't have the ID immediately if it's backend-created, 
 // the user will see it in the list after sync.
 Alert.alert("Import Started", "Your YouTube path is being ingested. It will appear in your list shortly.");
 } catch (err: any) {
 Alert.alert("Error", err.message);
 } finally {
 setLoading(false);
 }
 };

 const handleAIGenerate = async (prompt: string, type: string) => {
 if (!checkLimit()) return;
 try {
 await generateAIPath(prompt, type);
 onRefresh();
 handleClose();
 Alert.alert("Generation Started", "Our AI is architecting your path. Check back in a few moments.");
 } catch (err: any) {
 Alert.alert("Error", err.message);
 }
 };

 const OptionButton = ({ icon, label, sublabel, onPress, accent = false }: any) => (
 <TouchableOpacity 
 onPress={() => { Haptics.selectionAsync(); onPress(); }}
 className={`p-6 rounded-[2.5rem] border mb-4 flex-row items-center ${
 accent ? 'bg-[var(--accent-color)] border-[var(--accent-color)] ' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'
 }`}
 >
 <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-5 ${accent ? 'bg-white/20' : 'bg-[var(--bg-card)] border border-[var(--border-color)]'}`}>
 <Ionicons name={icon} size={22} color={accent ? 'white' : colors.accent} />
 </View>
 <View className="flex-1 text-left">
 <Text className={`font-black text-base uppercase italic tracking-tight ${accent ? 'text-white' : 'text-[var(--text-primary)]'}`}>{label}</Text>
 <Text className={`text-[8px] font-black uppercase tracking-widest mt-1 italic ${accent ? 'text-white/60' : 'text-[var(--text-secondary)] opacity-40'}`}>{sublabel}</Text>
 </View>
 <Ionicons name="chevron-forward" size={18} color={accent ? 'white' : colors.textSecondary} style={{ opacity: 0.3 }} />
 </TouchableOpacity>
 );

 return (
 <>
 <Modal
 animationType="slide"
 transparent={true}
 visible={isVisible && (mode === 'SELECT' || mode === 'MANUAL')}
 onRequestClose={handleClose}
 >
 <View className="flex-1 justify-end bg-black/60">
 <View 
 style={{ backgroundColor: colors.card }}
 className="rounded-t-[3.5rem] p-8 pb-16 border-t border-[var(--border-color)] max-h-[90%]"
 >
 {/* Header */}
 <View className="flex-row justify-between items-center mb-10">
 <View className="flex-row items-center gap-3">
 <TouchableOpacity onPress={() => mode !== 'SELECT' ? setCreationMode('SELECT') : handleClose()} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
 <Ionicons name={mode === 'SELECT' ? "close" : "arrow-back"} size={20} color={colors.textSecondary} />
 </TouchableOpacity>
 <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
 {mode === 'SELECT' ? 'New Journey' : 'Manual Build'}
 </Text>
 </View>
 </View>

 <ScrollView showsVerticalScrollIndicator={false}>
 {mode === 'SELECT' && (
 <View>
 <OptionButton 
 icon="sparkles" 
 label="AI Architect" 
 sublabel="Smart path generation" 
 onPress={() => setCreationMode('AI')}
 accent
 />
 <OptionButton 
 icon="create-outline" 
 label="Manual Build" 
 sublabel="Structure from scratch" 
 onPress={() => setCreationMode('MANUAL')} 
 />
 <OptionButton 
 icon="logo-youtube" 
 label="Media Path" 
 sublabel="Import YouTube playlist" 
 onPress={() => setCreationMode('YOUTUBE')} 
 />
 <OptionButton 
 icon="document-attach-outline" 
 label="Import Data" 
 sublabel="CSV or Excel ingestion" 
 onPress={() => setCreationMode('EXCEL')} 
 />
 </View>
 )}

 {mode === 'MANUAL' && (
 <View className="space-y-8">
 <View className="text-left">
 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic">Path Name</Text>
 <TextInput
 value={title}
 onChangeText={setTitle}
 placeholder="Enter title..."
 placeholderTextColor={colors.textSecondary + '40'}
 className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-3xl font-black text-lg text-[var(--text-primary)] uppercase italic tracking-tight"
 />
 </View>
 <View className="flex-row gap-4">
 <TouchableOpacity onPress={() => handleManualCreate('COURSE')} className="flex-1 bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)] items-center ">
 <Ionicons name="school-outline" size={24} color={colors.accent} />
 <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase mt-3 italic">Course</Text>
 </TouchableOpacity>
 <TouchableOpacity onPress={() => handleManualCreate('PROJECT')} className="flex-1 bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)] items-center ">
 <Ionicons name="rocket-outline" size={24} color={colors.accent} />
 <Text className="text-[10px] font-black text-[var(--text-primary)] uppercase mt-3 italic">Project</Text>
 </TouchableOpacity>
 </View>
 </View>
 )}
 </ScrollView>

 {loading && (
 <View className="absolute inset-0 bg-black/20 items-center justify-center rounded-t-[3.5rem]">
 <ActivityIndicator size="large" color={colors.accent} />
 </View>
 )}
 </View>
 </View>
 </Modal>

 <AIArchitectModal 
 isVisible={mode === 'AI'} 
 onClose={() => setCreationMode('SELECT')}
 onGenerate={handleAIGenerate}
 />

 <YoutubeImportModal 
 isVisible={mode === 'YOUTUBE'}
 onClose={() => setCreationMode('SELECT')}
 onImport={handleYoutubeImport}
 />

 <ExcelImportModal 
 isVisible={mode === 'EXCEL'}
 onClose={() => setCreationMode('SELECT')}
 onImport={(file) => {
 // CSV Parsing logic here
 setCreationMode('SELECT');
 }}
 />
 </>
 );
};
