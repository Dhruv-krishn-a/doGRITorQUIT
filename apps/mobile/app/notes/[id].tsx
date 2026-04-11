import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import Note from '../../db/models/Note';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../context/ThemeContext';

interface NoteEditorProps {
  note: Note | null;
  id: string;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, id }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note]);

  const categories = ['GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  const handleSave = async () => {
    if (!note) return;
    await database.write(async () => {
      await note.update(n => {
        n.title = title;
        n.content = content;
      });
    });
    setIsEditing(false);
  };

  const updateCategory = async (cat: string) => {
    if (!note) return;
    await database.write(async () => {
      await note.update(n => {
        n.category = cat;
      });
    });
  };

  const handleDelete = async () => {
    if (!note) return;
    await database.write(async () => {
      await note.markAsDeleted();
      await note.destroyPermanently();
    });
    router.back();
  };

  const markdownStyles = {
    body: { color: colors.text, fontSize: 16, lineHeight: 26 },
    heading1: { color: colors.text, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 20, marginBottom: 10 },
    heading2: { color: colors.text, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 16, marginBottom: 8 },
    paragraph: { marginTop: 10, marginBottom: 10 },
    blockquote: { backgroundColor: `${colors.accent}10`, borderLeftColor: colors.accent, borderLeftWidth: 4, paddingLeft: 20, paddingVertical: 10, borderRadius: 8 },
    code_inline: { backgroundColor: colors.bgSecondary, color: colors.accent, borderRadius: 4, paddingHorizontal: 4 },
    fence: { backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, padding: 12, marginVertical: 10 },
    link: { color: colors.accent, textDecorationLine: 'underline' }
  };

  if (!note) {
    return (
      <View className="flex-1 items-center justify-center bg-[var(--bg-primary)] p-10">
        <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
        <Text className="text-[var(--text-primary)] text-xl font-black italic uppercase mt-6">Note Not Found</Text>
        <Text className="text-[var(--text-secondary)] text-center mt-2 uppercase tracking-widest text-[10px]">Record #{id} not found in local sync.</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-8 px-8 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl"
        >
          <Text className="text-[var(--text-primary)] font-black uppercase tracking-widest text-[10px]">Return to Notes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: colors.primary }}
    >
      {/* Top Bar */}
      <View className="p-6 pt-16 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View className="flex-row">
             <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] items-center justify-center mr-2 border border-[var(--border-color)]"
            >
              <Ionicons name={isEditing ? "eye-outline" : "create-outline"} size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              className="w-10 h-10 rounded-xl bg-rose-500/10 items-center justify-center border border-rose-500/20"
            >
              <Ionicons name="trash-outline" size={20} color="#F43F5E" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => updateCategory(cat)}
              className={`mr-2 px-5 py-2.5 rounded-2xl border ${
                note.category === cat ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
              }`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${
                note.category === cat ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'
              }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Note Title..."
              placeholderTextColor={`${colors.textSecondary}40`}
              className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-6"
              multiline
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Begin writing your note..."
              placeholderTextColor={`${colors.textSecondary}40`}
              className="text-lg text-[var(--text-secondary)] leading-relaxed min-h-[400px] italic font-black uppercase tracking-tighter"
              multiline
              textAlignVertical="top"
              autoFocus
              onBlur={handleSave}
            />
          </>
        ) : (
          <>
            <Text className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-6">
              {title || 'Untitled Note'}
            </Text>
            <View className="text-left">
              <Markdown style={markdownStyles as any}>
                {content || '_No content recorded._'}
              </Markdown>
            </View>
          </>
        )}
      </ScrollView>

      {isEditing && (
        <TouchableOpacity 
          onPress={handleSave}
          className="absolute bottom-10 right-6 bg-[var(--accent-color)] px-8 py-4 rounded-[2rem] shadow-xl shadow-[var(--accent-color)]/30 active:scale-95"
        >
          <Text className="text-[var(--bg-primary)] font-black uppercase tracking-widest italic">Save Note</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const EnhancedNoteEditor = withObservables(['id'], ({ id }) => ({
  note: database.get<Note>('notes').findAndObserve(id),
}))(NoteEditor);

export default function NotePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
        <Text style={{ color: 'white' }}>Missing Note ID</Text>
      </View>
    );
  }

  return <EnhancedNoteEditor id={id} />;
}
