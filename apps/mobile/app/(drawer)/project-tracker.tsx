import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function ProjectTrackerPage() {
 const router = useRouter();
 const { colors } = useTheme();
 const [projects, setProjects] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);

 const fetchProjects = async () => {
 try {
 const data = await api.get('/api/github-projects');
 setProjects(data || []);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 };

 useEffect(() => {
 fetchProjects();
 }, []);

 const onRefresh = () => {
 setRefreshing(true);
 fetchProjects();
 };

 const ProjectCard = ({ project }: { project: any }) => {
 const isPlanning = project.projectStage !== 'EXECUTION';
 
 return (
 <TouchableOpacity 
 onPress={() => {
 // Mobile redirect or native detail view
 }}
 className="bg-[var(--bg-secondary)]/40 rounded-[2.5rem] p-8 border border-[var(--border-color)] mb-5 active:scale-[0.98]"
 >
 <View className="flex-row items-center justify-between mb-6">
 <View className="flex-row items-center gap-4">
 <View className={`w-12 h-12 rounded-2xl items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)]`}>
 <Ionicons 
 name="logo-github" 
 size={24} 
 color={colors.accent} 
 />
 </View>
 <View>
 <Text className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">
 {project.methodology || "AGILE"}
 </Text>
 <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] mt-0.5 italic">
 {project.projectStage}
 </Text>
 </View>
 </View>
 </View>

 <Text className="text-[var(--text-primary)] font-black text-xl italic uppercase tracking-tighter mb-3">
 {project.name}
 </Text>

 {project.description && (
 <Text className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed mb-8" numberOfLines={2}>
 {project.description}
 </Text>
 )}

 <View className="flex-row items-center justify-between pt-6 border-t border-[var(--border-color)]/30">
 <View className="flex-row items-center gap-2">
 <Ionicons name="git-branch" size={12} color={colors.textSecondary} />
 <Text className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
 {project.features?.length || 0} Technical Tasks
 </Text>
 </View>
 <View className="p-2 bg-[var(--bg-secondary)] rounded-lg">
 <Ionicons name="arrow-forward" size={16} color={colors.accent} />
 </View>
 </View>
 </TouchableOpacity>
 );
 };

 return (
 <View className="flex-1 bg-[var(--bg-primary)]">
 <ScrollView
 className="flex-1"
 contentContainerStyle={{ padding: 24, paddingTop: 60 }}
 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
 >
 <View className="mb-10">
 <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Architecture & Execution</Text>
 <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
 Projects
 </Text>
 </View>

 {loading && !refreshing ? (
 <ActivityIndicator size="large" color={colors.accent} className="py-20" />
 ) : projects.length === 0 ? (
 <View className="py-20 items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--bg-secondary)]/10">
 <Ionicons name="construct-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
 <Text className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-widest italic mt-4">No active projects</Text>
 </View>
 ) : (
 projects.map(p => <ProjectCard key={p.id} project={p} />)
 )}

 <View className="mt-10 p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3rem]">
 <Text className="text-xs font-black text-amber-500 uppercase tracking-widest italic mb-2 flex-row items-center gap-2">
 <Ionicons name="warning" size={12} color="#f59e0b" /> Technical OS
 </Text>
 <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed opacity-60 italic">
 Use the Desktop or Web app to perform high-density blueprinting and technical roadmap generation.
 </Text>
 </View>
 </ScrollView>
 </View>
 );
}
