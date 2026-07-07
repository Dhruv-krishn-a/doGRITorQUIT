import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { database } from '../../db';
import { Q } from '@nozbe/watermelondb';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';

export default function DevSettingsPage() {
 const { colors } = useTheme();
 const { user } = useAuth();
 const { status, lastSyncedAt } = useSync();
 
 const [queueCount, setQueueCount] = useState(0);
 const [logs, setLogs] = useState<string[]>([]);
 const [leaseInfo, setLeaseInfo] = useState<any>(null);

 useEffect(() => {
 // 1. Fetch Sync Queue Status
 const fetchStats = async () => {
 try {
 // Note: In mobile, sync_queue is managed by WatermelonDB's native sync but we can check for unsynced records using _status
 const unsyncedNotes = await database.get('notes').query(Q.where('_status', Q.notEq('synced'))).fetch();
 setQueueCount(unsyncedNotes.length);
 } catch (e) {
 console.warn(e);
 }
 };

 fetchStats();
 const interval = setInterval(fetchStats, 5000);
 return () => clearInterval(interval);
 }, []);

 const LogItem = ({ message, type = 'info' }: { message: string, type?: 'info'|'error'|'success'|'warn' }) => (
 <View className="flex-row gap-3 py-2 border-b border-[var(--border-color)]/20">
 <Text className="text-[8px] font-mono text-[var(--text-secondary)] opacity-40">[{new Date().toLocaleTimeString()}]</Text>
 <Text className={`text-[10px] font-mono flex-1 ${type === 'error' ? 'text-rose-400' : (type === 'success' ? 'text-emerald-400' : 'text-slate-300')}`}>
 {message}
 </Text>
 </View>
 );

 return (
 <View className="flex-1 bg-slate-950">
 <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
 <View className="mb-10 text-left">
 <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-2 italic">Admin Tools</Text>
 <Text className="text-4xl font-black text-slate-100 italic uppercase tracking-tighter">Diagnostics</Text>
 </View>

 {/* Real-time Metrics */}
 <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
 <View className="w-[48%] bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
 <Ionicons name="cloud-upload-outline" size={24} color="#6366f1" />
 <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-4">Unsynced Items</Text>
 <Text className="text-2xl font-black text-slate-100 italic tracking-tighter mt-1">{queueCount} Records</Text>
 </View>
 <View className="w-[48%] bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
 <Ionicons name="flash-outline" size={24} color="#10b981" />
 <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-4">Sync Status</Text>
 <Text className="text-2xl font-black text-slate-100 italic tracking-tighter mt-1 lowercase">{status}</Text>
 </View>
 </View>

 {/* System Info */}
 <View className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 mb-10">
 <View className="flex-row items-center gap-3 mb-6">
 <Ionicons name="information-circle-outline" size={18} color="#94a3b8" />
 <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Neural Connection</Text>
 </View>
 
 <View className="space-y-4">
 <View className="flex-row justify-between">
 <Text className="text-[10px] font-bold text-slate-500 uppercase italic">Last Sync</Text>
 <Text className="text-[10px] font-bold text-slate-300 italic">{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Never'}</Text>
 </View>
 <View className="flex-row justify-between">
 <Text className="text-[10px] font-bold text-slate-500 uppercase italic">Identity</Text>
 <Text className="text-[10px] font-bold text-slate-300 italic">{user?.email}</Text>
 </View>
 </View>
 </View>

 {/* Live Trace */}
 <View className="bg-black border border-slate-800 rounded-[2.5rem] overflow-hidden">
 <View className="bg-slate-900 px-8 py-4 border-b border-slate-800 flex-row justify-between items-center">
 <Text className="text-[9px] font-black text-slate-100 uppercase tracking-widest italic">Live Trace Log</Text>
 <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 </View>
 <View className="p-6 min-h-[300px]">
 <LogItem message="Initializing local diagnostic capture..." />
 <LogItem message={`Neural Link Status: ${status}`} />
 <LogItem message="Monitoring WatermelonDB record changes..." />
 {queueCount > 0 && <LogItem message={`${queueCount} items awaiting cloud propagation.`} type="warn" />}
 <LogItem message="Diagnostic system ready." type="success" />
 </View>
 </View>
 </ScrollView>
 </View>
 );
}
