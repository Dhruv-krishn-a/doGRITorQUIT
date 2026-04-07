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
      className="flex-1 bg-obsidian"
    >
      {/* Top Bar */}
      <View className="p-6 pt-12 border-b border-slate-800">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-slate-800 rounded-xl">
            <Ionicons name="chevron-back" size={24} color="#64748b" />
          </TouchableOpacity>
          
          <View className="flex-row">
             <TouchableOpacity 
              onPress={() => setIsEditing(!isEditing)}
              className="w-10 h-10 rounded-xl bg-slate-800 items-center justify-center mr-2 border border-slate-700"
            >
              <Ionicons name={isEditing ? "eye-outline" : "create-outline"} size={20} color="#0EA5E9" />
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
                note.category === cat ? 'bg-sky-focus border-sky-focus' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${
                note.category === cat ? 'text-obsidian' : 'text-slate-500'
              }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Archive Title..."
              placeholderTextColor="#475569"
              className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6"
              multiline
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Begin drafting neural data..."
              placeholderTextColor="#475569"
              className="text-lg text-slate-300 leading-relaxed min-h-[400px]"
              multiline
              textAlignVertical="top"
              autoFocus
              onBlur={handleSave}
            />
          </>
        ) : (
          <>
            <Text className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6">
              {title || 'Untitled Note'}
            </Text>
            <Markdown style={markdownStyles}>
              {content || '_No content recorded in this archive sector._'}
            </Markdown>
          </>
        )}
      </ScrollView>

      {isEditing && (
        <TouchableOpacity 
          onPress={handleSave}
          className="absolute bottom-10 right-6 bg-sky-focus px-8 py-4 rounded-[2rem] shadow-lg shadow-sky-500/20"
        >
          <Text className="text-obsidian font-black uppercase tracking-widest">Seal Archive</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const markdownStyles = {
  body: {
    color: '#94a3b8',
    fontSize: 16,
    lineHeight: 26,
  },
  heading1: {
    color: '#ffffff',
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
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderLeftColor: '#0EA5E9',
    borderLeftWidth: 4,
    paddingLeft: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: '#1e293b',
    color: '#0ea5e9',
    paddingHorizontal: 5,
    borderRadius: 4,
  },
};

const enhance = withObservables(['id'], ({ id }) => ({
  note: database.get<Note>('notes').findAndObserve(id),
}));

export default enhance(NoteEditor);
