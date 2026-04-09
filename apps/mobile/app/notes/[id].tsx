import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import Note from '../../db/models/Note';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

interface NoteEditorProps {
  note: Note;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const router = useRouter();
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note]);

  const categories = ['GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  const handleSave = async () => {
    await database.write(async () => {
      await note.update(n => {
        n.title = title;
        n.content = content;
      });
    });
    setIsEditing(false);
  };

  const updateCategory = async (cat: string) => {
    await database.write(async () => {
      await note.update(n => {
        n.category = cat;
      });
    });
  };

  const handleDelete = async () => {
    await database.write(async () => {
      await note.markAsDeleted();
      await note.destroyPermanently();
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: colors.paper }}
    >
      {/* Top Bar */}
      <div className={`p-6 pt-12 border-b border-[var(--border-color)]`}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-[var(--bg-secondary)] rounded-xl">
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
                note.category === cat ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
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
      </div>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Archive Title..."
              placeholderTextColor={colors.textSecondary}
              className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-6"
              multiline
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Begin drafting neural data..."
              placeholderTextColor={colors.textSecondary}
              className="text-lg text-[var(--text-secondary)] leading-relaxed min-h-[400px]"
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
            <Markdown style={{
              body: {
                color: colors.textSecondary,
                fontSize: 16,
                lineHeight: 26,
              },
              heading1: {
                color: colors.text,
                fontWeight: '900',
                textTransform: 'uppercase',
                fontStyle: 'italic',
                marginTop: 20,
                marginBottom: 10,
              },
              paragraph: {
                marginTop: 10,
                marginBottom: 10,
              },
              blockquote: {
                backgroundColor: `${colors.accent}10`,
                borderLeftColor: colors.accent,
                borderLeftWidth: 4,
                paddingLeft: 20,
                paddingVertical: 10,
                borderRadius: 8,
              },
              code_inline: {
                backgroundColor: colors.secondary,
                color: colors.accent,
                paddingHorizontal: 5,
                borderRadius: 4,
              },
            }}>
              {content || '_No content recorded in this archive sector._'}
            </Markdown>
          </>
        )}
      </ScrollView>

      {isEditing && (
        <TouchableOpacity 
          onPress={handleSave}
          className="absolute bottom-10 right-6 bg-[var(--accent-color)] px-8 py-4 rounded-[2rem] shadow-lg shadow-[var(--accent-color)]/20"
        >
          <Text className="text-[var(--bg-primary)] font-black uppercase tracking-widest">Seal Archive</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const enhance = withObservables(['id'], ({ id }) => ({
  note: database.get<Note>('notes').findAndObserve(id),
}));

export default enhance(NoteEditor);
