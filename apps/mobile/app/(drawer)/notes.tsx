import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, RefreshControl, Dimensions, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNotes } from '../../hooks/useNotes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { database } from '../../db';
import Note from '../../db/models/Note';
import { Q } from '@nozbe/watermelondb';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NotesPage() {
  const { loading: initialLoading, addNote } = useNotes();
  const { sync, isSyncing } = useSync();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [displayMode, setDisplayMode] = useState<'GRID' | 'LIST'>('GRID');
  // For simplicity, tracking network state manually is complex without NetInfo, we assume online unless sync fails
  const [isOnline, setIsOnline] = useState(true); 
  const router = useRouter();
  const { colors } = useTheme();

  const categories = ['ALL', 'GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  useEffect(() => {
    AsyncStorage.getItem('notes_display_mode').then((mode) => {
      if (mode === 'GRID' || mode === 'LIST') {
        setDisplayMode(mode);
      }
    });
  }, []);

  const handleDisplayModeChange = (mode: 'GRID' | 'LIST') => {
    Haptics.selectionAsync();
    setDisplayMode(mode);
    AsyncStorage.setItem('notes_display_mode', mode);
  };

  const fetchFilteredNotes = useCallback(async () => {
    let conditions: any[] = [Q.where('status', Q.notEq('DELETED'))];
    
    if (search) {
      conditions.push(Q.or(
        Q.where('title', Q.like(`%${search}%`)),
        Q.where('content', Q.like(`%${search}%`))
      ));
    }
    
    if (activeCategory !== 'ALL') {
      conditions.push(Q.where('category', activeCategory));
    }

    const res = await database.get<Note>('notes').query(
      ...conditions,
      Q.sortBy('updated_at', Q.desc)
    ).fetch();
    
    setNotes(res);
  }, [search, activeCategory]);

  useEffect(() => {
    fetchFilteredNotes();
    const sub = database.get('notes').changes.subscribe(() => fetchFilteredNotes());
    return () => sub.unsubscribe();
  }, [fetchFilteredNotes]);

  const handleAddNote = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newNote = await addNote('Untitled Note', activeCategory === 'ALL' ? 'GENERAL' : activeCategory);
    router.push(`/notes/${newNote.id}`);
  };

  const handleDelete = async (note: Note) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this neural record?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await database.write(async () => {
              await note.markAsDeleted();
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'YOUTUBE': return <Ionicons name="logo-youtube" size={16} color={colors.accent} />;
      case 'PROJECT': return <Ionicons name="briefcase" size={16} color={colors.accent} />;
      case 'COURSE': return <Ionicons name="school" size={16} color={colors.accent} />;
      default: return <Ionicons name="document-text" size={16} color={colors.accent} />;
    }
  };

  const NoteCard = ({ note }: { note: Note }) => {
    const meta = typeof note.metadata === 'string' ? JSON.parse(note.metadata || '{}') : note.metadata || {};
    const sourceTitle = meta.sourceTitle || meta.trackTitle;
    const isPending = note.syncStatus === 'created' || note.syncStatus === 'updated';

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/notes/${note.id}`)}
        activeOpacity={0.7}
        className={`bg-[var(--bg-card)]/40 rounded-[2.5rem] p-6 border shadow-sm flex-col h-full min-h-[200px] mb-4 ${
          isPending ? 'border-amber-500/50 shadow-amber-500/10' : 'border-[var(--border-color)]'
        }`}
        style={displayMode === 'GRID' ? { width: (SCREEN_WIDTH - 48 - 16) / 2, marginRight: 16 } : {}}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            {getIconForCategory(note.category)}
          </View>
        </View>

        <Text className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tight mb-2 leading-tight" numberOfLines={2}>
          {note.title || 'Untitled Note'}
        </Text>

        {sourceTitle && (
          <View className="flex-row items-center gap-2 mb-4">
            <View className="p-1 bg-[var(--bg-primary)] rounded border border-[var(--border-color)]">
              <Ionicons name="git-commit" size={10} color={colors.textSecondary} />
            </View>
            <Text className="text-[9px] font-bold text-[var(--text-secondary)] truncate uppercase tracking-widest flex-1" numberOfLines={1}>
              {sourceTitle}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-2 mt-auto pt-4 border-t border-[var(--border-color)]/50">
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar" size={10} color={colors.textSecondary} />
            <Text className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
              {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
          <Text className={`text-[9px] font-bold uppercase tracking-widest ${isPending ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
            {isPending ? 'Syncing...' : note.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const NoteListItem = ({ note }: { note: Note }) => {
    const meta = typeof note.metadata === 'string' ? JSON.parse(note.metadata || '{}') : note.metadata || {};
    const sourceTitle = meta.sourceTitle || meta.trackTitle;
    const isPending = note.syncStatus === 'created' || note.syncStatus === 'updated';

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/notes/${note.id}`)}
        activeOpacity={0.7}
        className="flex-row items-center p-5 bg-[var(--bg-card)]/40 hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl mb-4 shadow-sm"
      >
        <View className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] shrink-0 mr-5">
          {getIconForCategory(note.category)}
        </View>

        <View className="flex-1 mr-4">
          <Text className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight truncate leading-none mb-1">
            {note.title || "Untitled Note"}
          </Text>
          {sourceTitle && (
            <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest truncate opacity-60">
              {sourceTitle}
            </Text>
          )}
        </View>

        <View className="flex-col items-end gap-1 px-4 border-l border-[var(--border-color)]/50">
          <Text className={`text-[9px] font-black uppercase tracking-[0.2em] ${isPending ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
            {note.category}
          </Text>
          <Text className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
      <View className="p-6 pb-0 pt-16">
        <View className="flex-row justify-between items-start mb-10">
          <View className="flex-1">
            <View className="flex-row items-center gap-4 mb-2">
              <View className="p-3 bg-[var(--bg-secondary)] rounded-[1.2rem] border border-[var(--border-color)] shadow-sm">
                <Ionicons name="book" size={24} color={colors.accent} />
              </View>
              <Text className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
                Archive
              </Text>
            </View>
            <View className="flex-row items-center gap-4 mt-2 ml-1">
              <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">
                {notes.length} RECORDED THOUGHTS
              </Text>
              <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                <Ionicons name={isOnline ? "wifi" : "wifi-outline"} size={10} color={isOnline ? "#10b981" : "#f59e0b"} />
                <Text className={`text-[8px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isOnline ? 'Smart Link Active' : 'Offline Buffer'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View className="flex-col gap-4 mb-6">
          <View className="flex-row items-center gap-3 w-full">
            <View className="flex-row flex-1 bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-2xl p-4 items-center shadow-sm">
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                className="flex-1 ml-3 text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)] italic"
                placeholder="Search neural patterns..."
                placeholderTextColor={colors.textSecondary + '60'}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            
            {/* View Switcher */}
            <View className="flex-row bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-inner shrink-0">
              <RNTouchableOpacity 
                onPress={() => handleDisplayModeChange('GRID')}
                className={`p-3 rounded-xl transition-all ${displayMode === 'GRID' ? 'bg-[var(--bg-primary)] shadow-md' : ''}`}
              >
                <Ionicons name="grid" size={18} color={displayMode === 'GRID' ? colors.accent : colors.textSecondary} />
              </RNTouchableOpacity>
              <RNTouchableOpacity 
                onPress={() => handleDisplayModeChange('LIST')}
                className={`p-3 rounded-xl transition-all ${displayMode === 'LIST' ? 'bg-[var(--bg-primary)] shadow-md' : ''}`}
              >
                <Ionicons name="list" size={18} color={displayMode === 'LIST' ? colors.accent : colors.textSecondary} />
              </RNTouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center gap-3 w-full">
            <RNTouchableOpacity
              onPress={() => { Haptics.selectionAsync(); sync(); }}
              disabled={isSyncing}
              className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.25rem] shadow-sm ${isSyncing ? 'opacity-50' : ''}`}
            >
              <Ionicons name="sync" size={16} color={colors.textSecondary} />
              <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Sync</Text>
            </RNTouchableOpacity>
            <RNTouchableOpacity 
              onPress={handleAddNote} 
              className="flex-[2] flex-row items-center justify-center gap-2 px-6 py-4 bg-[var(--accent-color)] rounded-[1.25rem] shadow-lg shadow-[var(--accent-color)]/20"
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text className="text-[11px] font-black text-[var(--bg-primary)] uppercase tracking-widest italic">Initialize</Text>
            </RNTouchableOpacity>
          </View>
        </View>

        {/* Categories Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2 h-14" contentContainerStyle={{ alignItems: 'center' }}>
          {categories.map(cat => (
            <RNTouchableOpacity
              key={cat}
              onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}
              className="mr-3"
            >
              <View className={`px-6 py-3 rounded-xl border transition-all ${
                activeCategory === cat 
                  ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20' 
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
              }`}>
                <Text className={`text-[10px] font-black uppercase tracking-widest ${
                  activeCategory === cat ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {cat}
                </Text>
              </View>
            </RNTouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-4" 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl 
            refreshing={isSyncing} 
            onRefresh={sync} 
            tintColor={colors.accent} 
            colors={[colors.accent]}
          />
        }
      >
        {initialLoading && (!notes || notes.length === 0) ? (
          <ActivityIndicator color={colors.accent} size="large" className="py-20" />
        ) : notes.length > 0 ? (
          displayMode === 'GRID' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {notes.map(note => <NoteCard key={note.id} note={note} />)}
            </View>
          ) : (
            <View>
              {notes.map(note => <NoteListItem key={note.id} note={note} />)}
            </View>
          )
        ) : (
          <View className="items-center justify-center py-24 bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
              <View className="w-20 h-20 bg-[var(--bg-secondary)]/50 rounded-full items-center justify-center mb-6">
                 <Ionicons name="document-text-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.3 }} />
              </View>
              <Text className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-tight italic">No neural data found</Text>
            <RNTouchableOpacity onPress={handleAddNote} className="mt-6">
              <Text className="text-[10px] font-black text-[var(--accent-color)] uppercase underline tracking-widest">Initialize First Entry →</Text>
            </RNTouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
