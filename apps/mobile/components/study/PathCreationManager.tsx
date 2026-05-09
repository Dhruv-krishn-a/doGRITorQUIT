import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { useBilling } from '../../hooks/useBilling';
import * as Haptics from 'expo-haptics';

// Specialized Modals
import { ProjectInitModal } from './modals/ProjectInitModal';
import { CourseInitModal } from './modals/CourseInitModal';
import { MediaInitModal } from './modals/MediaInitModal';
import { RoadmapInitModal } from './modals/RoadmapInitModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PathCreationManagerProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

type MainCategory = 'SELECT' | 'PROJECT' | 'COURSE' | 'MEDIA' | 'ROADMAP';

export const PathCreationManager: React.FC<PathCreationManagerProps> = ({ isVisible, onClose, onRefresh }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: billingData } = useBilling();
  
  const [activeCategory, setActiveCategory] = useState<MainCategory>('SELECT');

  const handleClose = () => {
    setActiveCategory('SELECT');
    onClose();
  };

  const checkLimit = () => {
    const used = billingData?.usage?.plans?.used || 0;
    const limit = billingData?.usage?.plans?.limit || 3;
    if (used >= limit) {
      Alert.alert(
        "Neural Capacity Reached",
        `You have reached your limit of ${limit} active paths. Upgrade to Pro for unlimited growth.`,
        [
          { text: "Later", style: "cancel" },
          { text: "View Plans", onPress: () => { handleClose(); router.push('/subscriptions'); } }
        ]
      );
      return false;
    }
    return true;
  };

  const OptionButton = ({ icon, label, sublabel, onPress, accent = false }: any) => (
    <TouchableOpacity 
      onPress={() => { 
        if (checkLimit()) {
          Haptics.selectionAsync(); 
          onPress(); 
        }
      }}
      activeOpacity={0.7}
      className={`p-6 rounded-[2.5rem] border mb-4 flex-row items-center ${
        accent ? 'bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'
      }`}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-5 ${accent ? 'bg-white/20' : 'bg-[var(--bg-card)] border border-[var(--border-color)]'}`}>
        <Ionicons name={icon} size={22} color={accent ? 'white' : colors.accent} />
      </View>
      <View className="flex-1 text-left">
        <Text className={`font-black text-base uppercase italic tracking-tight ${accent ? 'text-white' : 'text-[var(--text-primary)]'}`}>{label}</Text>
        <Text className={`text-[8px] font-black uppercase tracking-widest mt-1 italic ${accent ? 'text-white/60' : 'text-[var(--text-secondary)] opacity-40'}`}>{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={accent ? 'white' : colors.textSecondary} style={{ opacity: 0.3 }} />
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible && activeCategory === 'SELECT'}
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View 
            style={{ backgroundColor: colors.card }}
            className="rounded-t-[3.5rem] p-8 pb-16 border-t border-[var(--border-color)]"
          >
            <View className="flex-row justify-between items-center mb-10 text-left">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={handleClose} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <View className="text-left">
                  <Text className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] italic text-left">Neural Link</Text>
                  <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] text-left">Initiate Path</Text>
                </View>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <OptionButton 
                icon="construct" 
                label="Technical Project" 
                sublabel="Build & SDLC execution engine" 
                onPress={() => setActiveCategory('PROJECT')}
                accent
              />
              <OptionButton 
                icon="school" 
                label="Course Module" 
                sublabel="Academic curriculum ingestion" 
                onPress={() => setActiveCategory('COURSE')}
              />
              <OptionButton 
                icon="logo-youtube" 
                label="Media Protocol" 
                sublabel="Deconstruct YouTube playlists" 
                onPress={() => setActiveCategory('MEDIA')}
              />
              <OptionButton 
                icon="map" 
                label="Strategic Roadmap" 
                sublabel="Temporal day-wise sequencing" 
                onPress={() => setActiveCategory('ROADMAP')}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Specialized Modals */}
      <ProjectInitModal 
        isVisible={isVisible && activeCategory === 'PROJECT'} 
        onClose={handleClose} 
        onRefresh={onRefresh} 
      />
      <CourseInitModal 
        isVisible={isVisible && activeCategory === 'COURSE'} 
        onClose={handleClose} 
        onRefresh={onRefresh} 
      />
      <MediaInitModal 
        isVisible={isVisible && activeCategory === 'MEDIA'} 
        onClose={handleClose} 
        onRefresh={onRefresh} 
      />
      <RoadmapInitModal 
        isVisible={isVisible && activeCategory === 'ROADMAP'} 
        onClose={handleClose} 
        onRefresh={onRefresh} 
      />
    </>
  );
};
