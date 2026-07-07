// @ts-nocheck
import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, RefreshControl, Dimensions, TouchableOpacity, Alert, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { database } from '../../db';
import Note from '../../db/models/Note';
import { Q } from '@nozbe/watermelondb';
import { useTheme } from '../../context/ThemeContext';
import { useSync } from '../../context/SyncContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Components cast to any to bypass strict NativeWind/TS augmentation checks
const TView = View as any;
const TText = Text as any;
const TTouchableOpacity = TouchableOpacity as any;
const TScrollView = ScrollView as any;
const TTextInput = TextInput as any;
const TActivityIndicator = ActivityIndicator as any;
const TSectionList = SectionList as any;
const TRefreshControl = RefreshControl as any;

type SortOption = 'MODIFIED' | 'CREATED' | 'ALPHABETICAL';

// --- MEMOIZED COMPONENTS ---

const NoteCard = memo(({ note, isSelected, onPress, onLongPress, displayMode, colors }: { note: any, isSelected: boolean, onPress: any, onLongPress: any, displayMode: string, colors: any }) => {
  const isPending = note.syncStatus === 'created' || note.syncStatus === 'updated';
  return (
    <TTouchableOpacity 
      onPress={() => onPress(note.id)}
      onLongPress={() => onLongPress(note.id)}
      activeOpacity={0.7}
      className={`rounded-3xl p-5 border flex-col min-h-[130px] mb-4 ${
        isSelected ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' :
        isPending ? 'bg-[var(--bg-card)]/40 border-amber-500/50' : 'bg-[var(--bg-card)]/40 border-[var(--border-color)]'
      }`}
      style={displayMode === 'GRID' ? { width: '100%' } : {}}
    >
      <TView className="flex-row items-center gap-2 mb-3">
          <TView className={`p-2 rounded-xl border ${isSelected ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-primary)] border-[var(--border-color)]'}`}>
             {note.category === 'YOUTUBE' ? <Ionicons name="logo-youtube" size={12} color={isSelected ? colors.primary : colors.accent} /> :
              note.category === 'PROJECT' ? <Ionicons name="briefcase" size={12} color={isSelected ? colors.primary : colors.accent} /> :
              note.category === 'COURSE' ? <Ionicons name="school" size={12} color={isSelected ? colors.primary : colors.accent} /> :
              <Ionicons name="document-text" size={12} color={isSelected ? colors.primary : colors.accent} />}
          </TView>
          <TText className={`text-[8px] font-black uppercase tracking-[0.2em] flex-1 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`} numberOfLines={1}>
              {note.category}
          </TText>
      </TView>
      <TText className={`text-sm font-black italic uppercase tracking-tight mb-4 leading-tight text-left ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`} numberOfLines={3}>
        {note.title || 'Untitled Note'}
      </TText>
      <TView className="mt-auto">
        <TText className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </TText>
      </TView>
    </TTouchableOpacity>
  );
});

const CompactItem = memo(({ note, isSelected, onPress, onLongPress, onDelete }: { note: any, isSelected: boolean, onPress: any, onLongPress: any, onDelete: any }) => {
  return (
    <Swipeable renderRightActions={() => (
      <TTouchableOpacity onPress={() => onDelete(note.id)} className="bg-rose-500 justify-center items-center w-20 rounded-[2rem] ml-2 mb-3 h-[85%]">
        <Ionicons name="trash" size={24} color="white" />
      </TTouchableOpacity>
    )}>
      <TTouchableOpacity 
        onPress={() => onPress(note.id)}
        onLongPress={() => onLongPress(note.id)}
        className={`flex-row items-center py-4 px-4 border-b gap-4 ${isSelected ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]/50' : 'bg-transparent border-[var(--border-color)]/30'}`}
      >
          <TView className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-secondary)]/30'}`} />
          <TText className="flex-1 text-[13px] font-black text-[var(--text-primary)] uppercase italic tracking-tighter" numberOfLines={1}>
              {note.title || "Untitled Note"}
          </TText>
          <TText className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
              {note.category}
          </TText>
      </TTouchableOpacity>
    </Swipeable>
  );
});

const ListItem = memo(({ note, isSelected, onPress, onLongPress, onDelete, colors }: { note: any, isSelected: boolean, onPress: any, onLongPress: any, onDelete: any, colors: any }) => {
  return (
    <Swipeable renderRightActions={() => (
      <TTouchableOpacity onPress={() => onDelete(note.id)} className="bg-rose-500 justify-center items-center w-20 rounded-[2rem] ml-2 mb-3 h-[85%]">
        <Ionicons name="trash" size={24} color="white" />
      </TTouchableOpacity>
    )}>
      <TTouchableOpacity 
          onPress={() => onPress(note.id)}
          onLongPress={() => onLongPress(note.id)}
          className={`flex-row items-center p-5 border rounded-[2rem] mb-3 ${isSelected ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' : 'bg-[var(--bg-card)]/40 border-[var(--border-color)]'}`}
        >
          <TView className={`p-3 rounded-2xl border mr-5 ${isSelected ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-primary)] border-[var(--border-color)]'}`}>
            <Ionicons name={note.category === 'YOUTUBE' ? 'logo-youtube' : 'document-text'} size={16} color={isSelected ? colors.primary : colors.accent} />
          </TView>
          <TView className="flex-1">
            <TText className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1" numberOfLines={1}>
              {note.title || "Untitled Note"}
            </TText>
            <TText className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-50">
              MODIFIED {new Date(note.updatedAt).toLocaleDateString()}
            </TText>
          </TView>
          <Ionicons name={isSelected ? "checkmark-circle" : "chevron-forward"} size={16} color={isSelected ? colors.accent : colors.textSecondary} />
        </TTouchableOpacity>
    </Swipeable>
  );
});

export default function NotesPage() {
  const { user } = useAuth();
  const { sync, isSyncing } = useSync();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [displayMode, setDisplayMode] = useState<'GRID' | 'LIST' | 'COMPACT'>('GRID');
  const [sortBy, setSortBy] = useState<SortOption>('MODIFIED');
  const [isOnline, setIsOnline] = useState(true); 
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();

  const categories = ['ALL', 'GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('notes_display_mode'),
      AsyncStorage.getItem('notes_sort_by')
    ]).then(([mode, sort]) => {
      if (mode) setDisplayMode(mode as any);
      if (sort) setSortBy(sort as any);
    });
  }, []);

  const handleDisplayModeChange = (mode: 'GRID' | 'LIST' | 'COMPACT') => {
    Haptics.selectionAsync();
    setDisplayMode(mode);
    AsyncStorage.setItem('notes_display_mode', mode);
  };

  const handleSortChange = (sort: SortOption) => {
    Haptics.selectionAsync();
    setSortBy(sort);
    AsyncStorage.setItem('notes_sort_by', sort);
  };

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

    let sortCol = 'updated_at';
    let sortOrder = Q.desc;

    if (sortBy === 'CREATED') sortCol = 'created_at';
    if (sortBy === 'ALPHABETICAL') {
        sortCol = 'title';
        sortOrder = Q.asc;
    }

    try {
      const res = await database.get<Note>('notes').query(
        ...conditions,
        Q.sortBy(sortCol, sortOrder)
      ).fetch();
      setNotes(res || []);
    } catch (e) {
      console.error("NEURAL_REGISTRY_SQL_CRASH:", e);
    }
  }, [search, activeCategory, sortBy]);

  useFocusEffect(
    useCallback(() => {
      fetchFilteredNotes();
    }, [fetchFilteredNotes])
  );

  useEffect(() => {
    const sub = database.get('notes').changes.subscribe(() => fetchFilteredNotes());
    return () => sub.unsubscribe();
  }, [fetchFilteredNotes]);

  const groupedNotes = useMemo(() => {
    let mappedGroups = [];

    if (sortBy === 'ALPHABETICAL') {
        mappedGroups = [{ title: 'All Neural Records', data: notes }];
    } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const groups: { [key: string]: Note[] } = {
          'Today': [],
          'Yesterday': [],
          'Last 7 Days': [],
          'Archive': []
        };

        notes.forEach(note => {
          const date = new Date(sortBy === 'CREATED' ? note.createdAt : note.updatedAt);
          if (date >= today) groups['Today'].push(note);
          else if (date >= yesterday) groups['Yesterday'].push(note);
          else if (date >= thisWeek) groups['Last 7 Days'].push(note);
          else groups['Archive'].push(note);
        });

        mappedGroups = Object.keys(groups)
          .filter(key => groups[key].length > 0)
          .map(key => ({ title: key, data: groups[key] }));
    }

    if (displayMode === 'GRID') {
        return mappedGroups.map(group => ({
            title: group.title,
            data: [{ isGridRow: true, notes: group.data, id: `grid-${group.title}` }]
        }));
    }

    return mappedGroups;
  }, [notes, sortBy, displayMode]);

  const handleAddNote = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Run DB write in background without await blocking the JS thread before routing, if possible
    // Since we need the ID to route, we must await it, but we can do it inside requestAnimationFrame to let the UI update first (e.g. show loading state)
    requestAnimationFrame(async () => {
        try {
            const newNote = await database.write(async () => {
                return await database.get<Note>('notes').create(note => {
                note.title = 'Untitled Note';
                note.content = '';
                note.category = activeCategory === 'ALL' ? 'GENERAL' : activeCategory;
                note.userId = user?.id || '';
                });
            });
            router.push(`/notes/${newNote.id}`);
        } catch (e) {
            console.error(e);
        } finally {
            setTimeout(() => setIsCreating(false), 500);
        }
    });
  }, [activeCategory, user?.id, isCreating, router]);

  const toggleSelection = useCallback((noteId: string) => {
    Haptics.selectionAsync();
    setSelectedNotes(prev => 
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  }, []);

  const handlePressNote = useCallback((noteId: string) => {
    if (selectedNotes.length > 0) {
      toggleSelection(noteId);
    } else {
      router.push(`/notes/${noteId}`);
    }
  }, [selectedNotes.length, toggleSelection, router]);

  const handleDelete = useCallback(async (noteId: string) => {
    try {
      const note = await database.get<Note>('notes').find(noteId);
      await database.write(async () => {
        await note.markAsDeleted();
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleBatchDelete = () => {
    Alert.alert(
      "Confirm Batch Purge",
      `Are you sure you want to permanently delete ${selectedNotes.length} neural records?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Purge", 
          style: "destructive",
          onPress: async () => {
            try {
              await database.write(async () => {
                for (const id of selectedNotes) {
                  const note = await database.get<Note>('notes').find(id);
                  await note.markAsDeleted();
                }
              });
              setSelectedNotes([]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              Alert.alert("Purge Failed", "Could not delete all selected records.");
            }
          }
        }
      ]
    );
  };

  const renderRightActions = (noteId: string) => {
    return (
      <TTouchableOpacity 
        onPress={() => handleDelete(noteId)}
        className="bg-rose-500 justify-center items-center w-20 rounded-[2rem] ml-2 mb-3 h-[85%]"
      >
        <Ionicons name="trash" size={24} color="white" />
      </TTouchableOpacity>
    );
  };

  const NoteCard = ({ note }: { note: any }) => {
    const meta = typeof note.metadata === 'string' ? JSON.parse(note.metadata || '{}') : note.metadata || {};
    const sourceTitle = meta.sourceTitle || meta.trackTitle;
    const isPending = note.syncStatus === 'created' || note.syncStatus === 'updated';
    const isSelected = selectedNotes.includes(note.id);

    return (
      <TTouchableOpacity 
        onPress={() => handlePressNote(note.id)}
        onLongPress={() => toggleSelection(note.id)}
        activeOpacity={0.7}
        className={`rounded-3xl p-5 border flex-col min-h-[130px] mb-4 ${
          isSelected ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' :
          isPending ? 'bg-[var(--bg-card)]/40 border-amber-500/50' : 'bg-[var(--bg-card)]/40 border-[var(--border-color)]'
        }`}
        style={displayMode === 'GRID' ? { width: '100%' } : {}}
      >
        <TView className="flex-row items-center gap-2 mb-3">
            <TView className={`p-2 rounded-xl border ${isSelected ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-primary)] border-[var(--border-color)]'}`}>
               {note.category === 'YOUTUBE' ? <Ionicons name="logo-youtube" size={12} color={isSelected ? colors.primary : colors.accent} /> :
                note.category === 'PROJECT' ? <Ionicons name="briefcase" size={12} color={isSelected ? colors.primary : colors.accent} /> :
                note.category === 'COURSE' ? <Ionicons name="school" size={12} color={isSelected ? colors.primary : colors.accent} /> :
                <Ionicons name="document-text" size={12} color={isSelected ? colors.primary : colors.accent} />}
            </TView>
            <TText className={`text-[8px] font-black uppercase tracking-[0.2em] flex-1 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`} numberOfLines={1}>
                {note.category}
            </TText>
        </TView>

        <TText className={`text-sm font-black italic uppercase tracking-tight mb-4 leading-tight text-left ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`} numberOfLines={3}>
          {note.title || 'Untitled Note'}
        </TText>

        <TView className="mt-auto">
          <TText className={`text-[8px] font-black uppercase tracking-[0.2em] opacity-50 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </TText>
        </TView>
      </TTouchableOpacity>
    );
  };

  const CompactItem = ({ note }: { note: any }) => {
    const isSelected = selectedNotes.includes(note.id);
    return (
      <Swipeable renderRightActions={() => renderRightActions(note.id)}>
        <TTouchableOpacity 
          onPress={() => handlePressNote(note.id)}
          onLongPress={() => toggleSelection(note.id)}
          className={`flex-row items-center py-4 px-4 border-b gap-4 ${isSelected ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]/50' : 'bg-transparent border-[var(--border-color)]/30'}`}
        >
            <TView className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-secondary)]/30'}`} />
            <TText className="flex-1 text-[13px] font-black text-[var(--text-primary)] uppercase italic tracking-tighter" numberOfLines={1}>
                {note.title || "Untitled Note"}
            </TText>
            <TText className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40">
                {note.category}
            </TText>
        </TTouchableOpacity>
      </Swipeable>
    );
  };

  const ListItem = ({ note }: { note: any }) => {
    const isSelected = selectedNotes.includes(note.id);
    return (
      <Swipeable renderRightActions={() => renderRightActions(note.id)}>
        <TTouchableOpacity 
            onPress={() => handlePressNote(note.id)}
            onLongPress={() => toggleSelection(note.id)}
            className={`flex-row items-center p-5 border rounded-[2rem] mb-3 ${isSelected ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' : 'bg-[var(--bg-card)]/40 border-[var(--border-color)]'}`}
          >
            <TView className={`p-3 rounded-2xl border mr-5 ${isSelected ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-primary)] border-[var(--border-color)]'}`}>
              <Ionicons name={note.category === 'YOUTUBE' ? 'logo-youtube' : 'document-text'} size={16} color={isSelected ? colors.primary : colors.accent} />
            </TView>
            <TView className="flex-1">
              <TText className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight leading-none mb-1" numberOfLines={1}>
                {note.title || "Untitled Note"}
              </TText>
              <TText className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-50">
                MODIFIED {new Date(note.updatedAt).toLocaleDateString()}
              </TText>
            </TView>
            <Ionicons name={isSelected ? "checkmark-circle" : "chevron-forward"} size={16} color={isSelected ? colors.accent : colors.textSecondary} />
          </TTouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <TView className="flex-1 bg-[var(--bg-primary)]">
      {/* Neural Header Protocol */}
      <TView className="px-6 pt-16 pb-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <TView className="flex-row justify-between items-center mb-6">
            <TView className="flex-row items-center gap-3">
                <TView className="p-2.5 bg-[var(--accent-color)] rounded-xl">
                    <Ionicons name="book" size={20} color={colors.primary} />
                </TView>
                <TText className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Archive</TText>
            </TView>
            <TTouchableOpacity onPress={handleAddNote} className="w-12 h-12 bg-[var(--text-primary)] rounded-full items-center justify-center">
                <Ionicons name="add" size={24} color={colors.primary} />
            </TTouchableOpacity>
        </TView>

        {/* Dynamic Controls Bar */}
        <TView className="flex-row gap-2 items-center mb-4">
            <TView className="flex-1 flex-row bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl items-center px-4 h-14">
                <Ionicons name="search" size={18} color={colors.textSecondary} />
                <TTextInput 
                    className="flex-1 ml-3 text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] italic"
                    placeholder="SCAN NEURAL PATTERNS..."
                    placeholderTextColor={colors.textSecondary + '40'}
                    value={search}
                    onChangeText={setSearch}
                />
            </TView>
            
            <TTouchableOpacity 
                onPress={() => {
                    const options: SortOption[] = ['MODIFIED', 'CREATED', 'ALPHABETICAL'];
                    const next = options[(options.indexOf(sortBy) + 1) % options.length];
                    handleSortChange(next);
                }}
                className="h-14 px-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl items-center justify-center flex-row gap-2"
            >
                <Ionicons name="swap-vertical" size={16} color={colors.accent} />
                <TText className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{sortBy}</TText>
            </TTouchableOpacity>
        </TView>

        {/* View Density Switcher */}
        <TView className="flex-row justify-between items-center">
            <TView className="flex-row bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1 rounded-2xl">
                {(['GRID', 'LIST', 'COMPACT'] as const).map(mode => (
                    <TTouchableOpacity 
                        key={mode}
                        onPress={() => handleDisplayModeChange(mode)}
                        className={`px-4 py-2 rounded-xl ${displayMode === mode ? 'bg-[var(--bg-primary)] border border-[var(--border-color)]' : ''}`}
                    >
                        <Ionicons 
                            name={mode === 'GRID' ? 'grid' : mode === 'LIST' ? 'list' : 'reorder-four'} 
                            size={16} 
                            color={displayMode === mode ? colors.accent : colors.textSecondary} 
                        />
                    </TTouchableOpacity>
                ))}
            </TView>
            <TText className="text-[10px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-[0.2em]">
                {notes.length} RECORDS FOUND
            </TText>
        </TView>
      </TView>

      {/* Shard Pager (Horizontal Category Selector) */}
      <TView className="bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <TScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 14 }}>
            {categories.map(cat => (
                <TTouchableOpacity 
                    key={cat} 
                    onPress={() => setActiveCategory(cat)}
                    className={`mr-4 px-6 py-2.5 rounded-full border ${activeCategory === cat ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}
                >
                    <TText className={`text-[10px] font-black uppercase tracking-widest ${activeCategory === cat ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {cat}
                    </TText>
                </TTouchableOpacity>
            ))}
        </TScrollView>
      </TView>

      <TSectionList
        sections={groupedNotes}
        keyExtractor={(item: any) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        refreshControl={<TRefreshControl refreshing={isSyncing} onRefresh={sync} tintColor={colors.accent} />}
        renderSectionHeader={({ section: { title } }: any) => (
            <TView className="bg-[var(--bg-primary)] py-4 flex-row items-center gap-4">
                <TText className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.4em] italic">{title}</TText>
                <TView className="flex-1 h-[1px] bg-[var(--border-color)] opacity-30" />
            </TView>
        )}
        renderItem={({ item }: any) => {
            if (displayMode === 'GRID' && item.isGridRow) {
                return (
                    <TView style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {item.notes.map((n: any) => (
                            <NoteCard 
                                key={n.id} 
                                note={n} 
                            />
                        ))}
                    </TView>
                );
            }
            
            const isSelected = selectedNotes.includes(item.id);
            const props = {
                note: item,
                isSelected,
                onPress: () => handlePressNote(item.id),
                onLongPress: () => toggleSelection(item.id),
                onDelete: () => handleDelete(item.id),
                colors
            };

            if (displayMode === 'COMPACT') return <CompactItem {...props} />;
            if (displayMode === 'LIST') return <ListItem {...props} />;
            return null;
        }}
        ListEmptyComponent={
            <TView className="items-center justify-center py-20 opacity-30">
                <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                <TText className="mt-4 font-black uppercase tracking-widest">No neural data</TText>
            </TView>
        }
      />

      {/* Floating Action Button / Selection Action Bar */}
      {selectedNotes.length === 0 ? (
        <TTouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddNote}
          className="absolute bottom-8 right-6 w-16 h-16 bg-[var(--accent-color)] rounded-[1.5rem] items-center justify-center border border-[var(--border-color)]"
        >
          <Ionicons name="add" size={32} color={colors.primary} />
        </TTouchableOpacity>
      ) : (
        <Animated.View entering={FadeInDown} exiting={FadeOutDown} className="absolute bottom-8 left-6 right-6 flex-row gap-4 z-50">
          <TTouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedNotes([]);
            }}
            className="flex-1 h-14 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[1.5rem] items-center justify-center"
          >
            <TText className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Cancel</TText>
          </TTouchableOpacity>
          <TTouchableOpacity
            activeOpacity={0.8}
            onPress={handleBatchDelete}
            className="flex-1 h-14 bg-rose-500 border border-rose-600 rounded-[1.5rem] items-center justify-center flex-row gap-2"
          >
            <Ionicons name="trash" size={16} color="white" />
            <TText className="text-[10px] font-black text-white uppercase tracking-widest">Purge ({selectedNotes.length})</TText>
          </TTouchableOpacity>
        </Animated.View>
      )}
    </TView>
  );
}
