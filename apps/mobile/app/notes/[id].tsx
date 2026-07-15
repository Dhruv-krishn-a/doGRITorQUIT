import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, AppState, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../db';
import Note from '../../db/models/Note';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../context/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { map } from 'rxjs/operators';
import { getStoredSession } from '../../lib/nativeAuth';
import { config } from '../../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Bypass strict NativeWind/TS augmentation checks
const TView = View as any;
const TText = Text as any;
const TTouchableOpacity = TouchableOpacity as any;
const TScrollView = ScrollView as any;
const TTextInput = TextInput as any;

interface NoteEditorProps {
  note: Note;
}

const extractTextFromBlockNote = (data: any): string => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  
  try {
    const blocks = data.content?.blocks || data.blocks;
    
    if (blocks && Array.isArray(blocks)) {
      return blocks.map((block: any) => {
        if (!block.content) return '';
        if (Array.isArray(block.content)) {
          return block.content.map((c: any) => c.text || '').join('');
        }
        if (typeof block.content === 'string') return block.content;
        return '';
      }).join('\n\n');
    }
    return data.text || JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};

const NoteEditor: React.FC<NoteEditorProps> = ({ note }) => {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initialTitleRef = useRef('');
  const initialContentRef = useRef('');
  const titleRef = useRef('');
  const contentRef = useRef('');

  useEffect(() => {
    if (note && !initialTitleRef.current && !initialContentRef.current) {
      const initT = note.title || '';
      let initC = note.content || '';
      try {
        const asJson = JSON.parse(initC);
        initC = extractTextFromBlockNote(asJson);
      } catch (e) { }
      
      setTitle(initT);
      setContent(initC);
      initialTitleRef.current = initT;
      initialContentRef.current = initC;
      titleRef.current = initT;
      contentRef.current = initC;
      setIsDirty(false);
      
      // If it's a completely new, empty note, automatically jump into edit mode
      if (initT === 'Untitled Note' && initC === '') {
        setIsEditing(true);
      }
    }
  }, [note?.id]);

  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);

  useEffect(() => {
    // Cleanup on unmount: if note is completely empty and untitled, delete it to prevent DB clutter.
    return () => {
      const t = titleRef.current.trim();
      const c = contentRef.current.trim();
      if ((t === 'Untitled Note' || t === '') && c === '') {
        database.write(async () => {
          await note.markAsDeleted();
        }).catch(e => console.error("Failed to purge empty note:", e));
      }
    };
  }, []);

  const categories = ['GENERAL', 'YOUTUBE', 'COURSE', 'PROJECT', 'OTHER'];

  const handleSave = async () => {
    if (!note || !isDirty) return;
    try {
      await database.write(async () => {
        await note.update(n => {
          n.title = titleRef.current;
          n.content = contentRef.current;
          if (n.syncStatus !== 'created') {
            (n as any).syncStatus = 'updated';
          }
        });
      });
      setIsDirty(false);
      initialTitleRef.current = titleRef.current;
      initialContentRef.current = contentRef.current;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleDiscard = () => {
    setTitle(initialTitleRef.current);
    setContent(initialContentRef.current);
    setIsDirty(false);
    Haptics.selectionAsync();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (isDirty) {
          handleSave();
        }
      }
    });
    return () => subscription.remove();
  }, [isDirty]);

  const handleExportPdf = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const html = `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica'; padding: 40px; color: #111827; }
          h1 { font-size: 28px; text-transform: uppercase; border-bottom: 4px solid #6366f1; padding-bottom: 15px; margin-bottom: 30px; font-weight: 900; font-style: italic; }
          .content { font-size: 16px; line-height: 1.6; white-space: pre-wrap; color: #374151; }
          .footer { font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-weight: bold; font-style: italic; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <h1>${title || 'Untitled Note'}</h1>
        <div class="content">${content}</div>
        <div class="footer">Archive Record Generated by grit.io // ${new Date().toLocaleDateString()} // Confidential</div>
      </body>
      </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      Alert.alert("Error", "Failed to generate PDF signal");
    }
  };

  const updateCategory = async (cat: string) => {
    Haptics.selectionAsync();
    await database.write(async () => {
      await note.update(n => {
        n.category = cat;
        if (n.syncStatus !== 'created') (n as any).syncStatus = 'updated';
      });
    });
  };

  const handleDelete = async () => {
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
            router.back();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const handleAIRefine = async () => {
    if (!content.trim()) {
      Alert.alert("Buffer Empty", "You need to add some content before AI can refine it.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRefining(true);
    try {
      const session = await getStoredSession();
      if (!session) throw new Error("Authentication required");
      const res = await fetch(`${config.apiUrl}/api/ai/refine-note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Neural synthesis failed");
      const data = await res.json();
      setContent(data.refinedContent);
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("Refinement Error", e.message);
    } finally {
      setIsRefining(false);
    }
  };

  const markdownStyles = {
    body: { color: colors.text, fontSize: 16, lineHeight: 26 },
    heading1: { color: colors.text, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 20, marginBottom: 10 },
    heading2: { color: colors.text, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 16, marginBottom: 8 },
    heading3: { color: colors.text, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 14, marginBottom: 6 },
    paragraph: { marginTop: 10, marginBottom: 10 },
    blockquote: { backgroundColor: `${colors.accent}10`, borderLeftColor: colors.accent, borderLeftWidth: 4, paddingLeft: 20, paddingVertical: 10, borderRadius: 8 },
    code_inline: { backgroundColor: colors.secondary, color: colors.accent, borderRadius: 4, paddingHorizontal: 4 },
    fence: { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginVertical: 10 },
    link: { color: colors.accent, textDecorationLine: 'underline' }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isPending = note.syncStatus === 'created' || note.syncStatus === 'updated';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1, backgroundColor: colors.primary }}
    >
      {/* Top Bar Protocol */}
      <TView className="p-6 pt-16 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <TView className="flex-row items-center justify-between mb-8">
          <TTouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
          </TTouchableOpacity>
          
          <TView className="flex-row gap-3">
            <TTouchableOpacity 
              onPress={handleAIRefine}
              disabled={isRefining}
              className={`flex-row items-center gap-2 px-4 py-2.5 rounded-xl border ${
                isRefining ? 'bg-[var(--bg-secondary)] border-[var(--border-color)] opacity-50' : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              {isRefining ? <ActivityIndicator size="small" color="#f59e0b" /> : (
                <>
                  <Ionicons name="sparkles" size={14} color="#f59e0b" />
                  <TText className="text-[9px] font-black uppercase tracking-widest text-amber-500 italic">Refine</TText>
                </>
              )}
            </TTouchableOpacity>
            <TTouchableOpacity 
              onPress={() => { Haptics.selectionAsync(); setIsEditing(!isEditing); }}
              className={`w-10 h-10 rounded-xl items-center justify-center border ${isEditing ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}
            >
              <Ionicons name={isEditing ? "eye-outline" : "create-outline"} size={20} color={isEditing ? "#10b981" : colors.accent} />
            </TTouchableOpacity>
            <TTouchableOpacity 
              onPress={handleExportPdf}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] items-center justify-center border border-[var(--border-color)]"
            >
              <Ionicons name="download-outline" size={20} color={colors.accent} />
            </TTouchableOpacity>
            <TTouchableOpacity onPress={handleDelete} className="w-10 h-10 rounded-xl bg-rose-500/10 items-center justify-center border border-rose-500/20">
              <Ionicons name="trash-outline" size={20} color="#F43F5E" />
            </TTouchableOpacity>
          </TView>
        </TView>

        <TScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {categories.map(cat => (
            <TTouchableOpacity
              key={cat}
              onPress={() => updateCategory(cat)}
              className={`mr-3 px-5 py-2.5 rounded-xl border ${
                note.category === cat ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
              }`}
            >
              <TText className={`text-[9px] font-black uppercase tracking-widest ${note.category === cat ? 'text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {cat}
              </TText>
            </TTouchableOpacity>
          ))}
        </TScrollView>
      </TView>

      {/* Neural Ledger HUD (Web Parity) */}
      <TView className="px-6 py-4 flex-row items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/10">
         <TView className="flex-row items-center gap-4">
            <TView className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${isDirty ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
               <TView className={`w-1.5 h-1.5 rounded-full ${isDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
               <TText className={`text-[8px] font-black uppercase tracking-widest ${isDirty ? 'text-amber-500' : 'text-emerald-500'}`}>
                 {isDirty ? 'Unsaved Changes' : (isPending ? 'Syncing...' : 'Neural Link Active')}
               </TText>
            </TView>
            
            {isDirty && (
               <TView className="flex-row gap-2">
                 <TTouchableOpacity onPress={handleDiscard} className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <TText className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Discard</TText>
                 </TTouchableOpacity>
                 <TTouchableOpacity onPress={handleSave} className="px-3 py-1 rounded-full bg-[var(--accent-color)]">
                    <TText className="text-[8px] font-black text-[var(--bg-primary)] uppercase tracking-widest">Save</TText>
                 </TTouchableOpacity>
               </TView>
            )}
         </TView>
         <TView className="flex-row items-center gap-3">
            <TText className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-40 italic">{wordCount} Words</TText>
         </TView>
      </TView>

      <TScrollView className="flex-1 bg-[var(--bg-primary)]" contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isEditing ? (
          <>
            <TTextInput autoCorrect={false} spellCheck={false}
              value={title}
              onChangeText={(t: string) => { setTitle(t); setIsDirty(true); }}
              placeholder="ENTER TITLE..."
              placeholderTextColor={`${colors.textSecondary}40`}
              className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-8 text-left"
              multiline
            />
            <TView className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 min-h-[400px]">
              <TTextInput autoCorrect={false} spellCheck={false}
                value={content}
                onChangeText={(c: string) => { setContent(c); setIsDirty(true); }}
                placeholder="Begin synthesizing neural patterns (Markdown supported)..."
                placeholderTextColor={`${colors.textSecondary}40`}
                className="flex-1 w-full text-lg text-[var(--text-primary)] text-left"
                multiline
                textAlignVertical="top"
              />
            </TView>
          </>
        ) : (
          <>
            <TText className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter mb-8 text-left">
              {title || 'Untitled Note'}
            </TText>
            <TView className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 min-h-[400px] text-left">
              <Markdown style={markdownStyles as any}>
                {content || '_No content recorded._'}
              </Markdown>
            </TView>
          </>
        )}
      </TScrollView>
    </KeyboardAvoidingView>
  );
};

const EnhancedNoteEditor = withObservables(['id'], ({ id }) => ({
  note: database.get<Note>('notes').query(Q.where('id', id)).observe().pipe(map(rows => rows[0] || null)),
}))(({ note }: { note: Note | null }) => {
  const { colors } = useTheme();
  const router = useRouter();
  if (!note) {
    return (
      <TView className="flex-1 items-center justify-center bg-[var(--bg-primary)] p-10">
        <TView className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full items-center justify-center mb-10 border border-[var(--border-color)]">
          <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.2 }} />
        </TView>
        <TText className="text-base font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] text-center leading-relaxed">
          Neural record not found in local archive.
        </TText>
        <TTouchableOpacity
          onPress={() => router.replace('/(drawer)/notes')}
          className="mt-12 bg-[var(--accent-color)] px-12 py-6 rounded-[2rem]"
        >
          <TText className="text-xs font-black uppercase tracking-[0.4em] text-[var(--bg-primary)]">
            Return to Archive
          </TText>
        </TTouchableOpacity>
      </TView>
    );
  }
  return <NoteEditor note={note} />;
});

export default function NotePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <EnhancedNoteEditor id={id} />;
}
