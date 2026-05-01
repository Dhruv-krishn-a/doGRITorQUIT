import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNotes } from '../../hooks/useNotes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { database } from '../../db';
import Note from '../../db/models/Note';
import { Q } from '@nozbe/watermelondb';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';

export default function NotesPage() {
  const { loading: initialLoading, addNote } = useNotes();
  const { sync, isSyncing } = useSync();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const router = useRouter();
  const { colors } = useTheme();

  const categories = ['ALL', 'GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  const fetchFilteredNotes = useCallback(async () => {
    let conditions: any[] = [];
    
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
    const newNote = await addNote('Untitled Note', activeCategory === 'ALL' ? 'GENERAL' : activeCategory);
    router.push(`/notes/${newNote.id}`);
  };

  const NoteCard = ({ note }: { note: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/notes/${note.id}`)}
      style={{ marginBottom: 16 }}
    >
      <View className="bg-[var(--bg-secondary)]/30 rounded-3xl p-5 border border-[var(--border-color)]">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-[var(--text-primary)] font-black text-lg italic uppercase flex-1 mr-2" numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Text>
          <View className="px-2 py-1 bg-[var(--accent-color)]/10 rounded-lg">
            <Text className="text-[8px] font-black text-[var(--accent-color)] uppercase tracking-widest">{note.category}</Text>
          </View>
        </View>
        <Text className="text-[var(--text-secondary)] text-xs leading-relaxed" numberOfLines={2}>
          {note.content || 'No content yet... Start drafting your neural archive.'}
        </Text>
        <View className="flex-row items-center mt-4 pt-4 border-t border-[var(--border-color)]">
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text className="ml-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
        <View className="p-6 pb-0">
          <View className="flex-row justify-between items-center mb-10 mt-10">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-1 italic">Neural Archive</Text>
              <Text className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
                Archive
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleAddNote}
            >
              <View className="w-14 h-14 bg-[var(--accent-color)] rounded-2xl items-center justify-center">
                <Ionicons name="add" size={28} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-2xl p-4 items-center mb-4">
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              className="flex-1 ml-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] italic"
              placeholder="Search neural patterns..."
              placeholderTextColor={colors.textSecondary + '60'}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Categories Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
            {categories.map(cat => (
              <View key={cat} className="mr-2">
                <TouchableOpacity
                  onPress={() => setActiveCategory(cat)}
                >
                  <View className={`px-6 py-3 rounded-2xl border ${
                    activeCategory === cat ? 'bg-[var(--accent-color)] border border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                  }`}>
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${
                      activeCategory === cat ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                    }`}>
                      {cat}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          className="flex-1 px-6" 
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
            notes.map(note => <NoteCard key={note.id} note={note} />)
          ) : (
            <View className="items-center justify-center py-20 bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
                <View className="w-20 h-20 bg-[var(--bg-secondary)]/50 rounded-full items-center justify-center mb-6">
                   <Ionicons name="documents-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                </View>
                <Text className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] italic">No neural data found</Text>
              <TouchableOpacity onPress={handleAddNote}>
                <View>
                  <Text className="mt-2 text-[10px] font-black text-[var(--accent-color)] uppercase underline tracking-widest">Initialize First Entry</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
  );
}
