import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNotes } from '../../hooks/useNotes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { database } from '../../db';
import { Q } from '@nozbe/watermelondb';
import Note from '../../db/models/Note';
import { useTheme } from '../../context/ThemeContext';

export default function NotesPage() {
  const { loading, addNote } = useNotes();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const router = useRouter();
  const { colors } = useTheme();

  const categories = ['ALL', 'GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  const fetchFilteredNotes = useCallback(async () => {
    let query = database.get<Note>('notes').query(
      Q.sortBy('updated_at', Q.desc)
    );
    
    const conditions = [];
    if (search) {
      conditions.push(Q.or(
        Q.where('title', Q.like(`%${search}%`)),
        Q.where('content', Q.like(`%${search}%`))
      ));
    }
    if (activeCategory !== 'ALL') {
      conditions.push(Q.where('category', activeCategory));
    }

    if (conditions.length > 0) {
      query = database.get<Note>('notes').query(
        ...conditions,
        Q.sortBy('updated_at', Q.desc)
      );
    }

    const res = await query.fetch();
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
      className="bg-[var(--bg-secondary)]/30 rounded-3xl p-5 border border-[var(--border-color)] mb-4"
    >
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
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[var(--bg-primary)]">
        <View className="p-6 pb-0">
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2">Information Repository</Text>
              <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">
                Archive
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleAddNote}
              className="w-14 h-14 bg-[var(--accent-color)] rounded-2xl items-center justify-center shadow-lg shadow-sky-500/20"
            >
              <Ionicons name="add" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row bg-[var(--bg-secondary)]/30 border border-[var(--border-color)] rounded-2xl p-4 items-center mb-4">
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search Neural Archives..."
              placeholderTextColor={colors.textSecondary}
              className="flex-1 ml-3 font-bold text-[var(--text-primary)]"
            />
          </View>

          {/* Categories Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`mr-2 px-6 py-3 rounded-2xl border ${
                  activeCategory === cat ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-sky-500/20' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                }`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${
                  activeCategory === cat ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView 
          className="flex-1 px-6" 
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {loading && notes.length === 0 ? (
            <ActivityIndicator color={colors.accent} className="mt-10" />
          ) : notes.length > 0 ? (
            notes.map(note => <NoteCard key={note.id} note={note} />)
          ) : (
            <View className="items-center justify-center py-20 bg-[var(--bg-secondary)]/10 rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
              <Ionicons name="document-text-outline" size={48} color={colors.border} />
              <Text className="mt-4 text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Archive Empty</Text>
              <TouchableOpacity onPress={handleAddNote}>
                <Text className="mt-2 text-[10px] font-black text-[var(--accent-color)] uppercase underline tracking-widest">Initialize First Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
  );
}
