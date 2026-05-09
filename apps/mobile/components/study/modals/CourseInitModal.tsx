import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { createManualPath } from '../../lib/path-creation';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CourseInitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const CourseInitModal: React.FC<CourseInitModalProps> = ({ isVisible, onClose, onRefresh }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [targetFinish, setTargetFinish] = useState('');
  const [cognitiveBudget, setCognitiveBudget] = useState('5');

  const reset = () => {
    setTitle('');
    setSyllabusUrl('');
    setTargetFinish('');
    setCognitiveBudget('5');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);
    try {
      await createManualPath({
        title,
        type: 'COURSE',
        metadata: { 
          syllabusUrl, 
          targetFinish,
          cognitiveBudget: parseInt(cognitiveBudget) || 5,
          startDate: dayjs().format('YYYY-MM-DD')
        }
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      handleClose();
    } catch (err: any) {
      Alert.alert("Registry Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View style={{ backgroundColor: colors.card }} className="rounded-t-[4rem] p-10 pb-16 border-t border-[var(--border-color)] max-h-[90%]">
          {/* Header Protocol */}
          <View className="flex-row justify-between items-center mb-12">
             <View className="flex-row items-center gap-4">
               <TouchableOpacity onPress={handleClose} className="p-3 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                 <Ionicons name="close" size={20} color={colors.textSecondary} />
               </TouchableOpacity>
               <View className="text-left">
                  <Text className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] italic text-left">Academic Protocol</Text>
                  <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] text-left">Add Course</Text>
               </View>
             </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-12">
            <View className="text-left">
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Course Title *</Text>
               <TextInput
                 value={title}
                 onChangeText={setTitle}
                 placeholder="E.G., NEURAL NETWORKS V2..."
                 placeholderTextColor={colors.textSecondary + '40'}
                 className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-2xl text-[var(--text-primary)] uppercase italic tracking-tight"
               />
            </View>

            <View className="text-left">
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Syllabus Link (Optional)</Text>
               <TextInput
                 value={syllabusUrl}
                 onChangeText={setSyllabusUrl}
                 placeholder="HTTPS://..."
                 placeholderTextColor={colors.textSecondary + '40'}
                 className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-base text-[var(--text-primary)] uppercase italic tracking-tight"
               />
            </View>

            <View className="flex-row gap-6">
              <View className="flex-1 text-left">
                 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Start Date</Text>
                 <View className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-[2rem] items-center flex-row gap-4 opacity-40">
                    <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                    <Text className="font-black text-[var(--text-primary)] uppercase italic">{dayjs().format('DD/MM/YYYY')}</Text>
                 </View>
              </View>
              <View className="flex-1 text-left">
                 <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Target Finish</Text>
                 <TextInput
                   value={targetFinish}
                   onChangeText={setTargetFinish}
                   placeholder="DD/MM/YYYY"
                   placeholderTextColor={colors.textSecondary + '40'}
                   className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-[2rem] font-black text-[var(--text-primary)] uppercase italic text-center"
                 />
              </View>
            </View>

            <View className="text-left">
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1 italic text-left">Weekly Cognitive Budget (Hours)</Text>
               <TextInput
                 value={cognitiveBudget}
                 onChangeText={setCognitiveBudget}
                 keyboardType="numeric"
                 placeholder="E.G., 5"
                 placeholderTextColor={colors.textSecondary + '40'}
                 className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-[2rem] font-black text-xl text-[var(--text-primary)] uppercase italic tracking-tight"
               />
            </View>

            <View className="p-8 bg-amber-500/[0.03] border border-amber-500/20 rounded-[2.5rem] flex-row items-center gap-6">
               <View className={`w-10 h-10 rounded-xl items-center justify-center bg-amber-500`}>
                  <Ionicons name="checkmark" size={24} color="white" />
               </View>
               <View className="flex-1 text-left">
                  <Text className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic text-left">AUTO-PLAN ACTIVE</Text>
                  <Text className="text-[10px] font-bold text-[var(--text-secondary)] uppercase leading-tight mt-1 opacity-60 text-left">Create weekly plan based on budget</Text>
               </View>
            </View>

            <TouchableOpacity 
              disabled={!title || loading}
              onPress={handleCreate}
              className={`py-8 rounded-[2.5rem] items-center justify-center shadow-lg ${!title ? 'opacity-30 bg-[var(--bg-secondary)]' : 'bg-fuchsia-600 shadow-fuchsia-500/20'}`}
            >
               {loading ? <ActivityIndicator color="white" /> : (
                 <View className="flex-row items-center gap-4">
                    <Ionicons name="book" size={20} color="white" />
                    <Text className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Create Course Path</Text>
                 </View>
               )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
