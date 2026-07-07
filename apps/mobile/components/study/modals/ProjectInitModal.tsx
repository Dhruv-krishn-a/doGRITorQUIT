import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../services/api';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProjectInitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

type Step = 'TYPE' | 'FORM' | 'GITHUB' | 'AI_BLUEPRINTING';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoCapitalize = 'none',
  colors,
}: any) => (
  <View style={{ marginBottom: 24 }}>
    <Text
      style={{
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '900',
        marginBottom: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontStyle: 'italic',
      }}
    >
      {label}
    </Text>

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary + '40'}
      autoCorrect={false}
      spellCheck={false}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      selectionColor={colors.accent}
      style={{
        backgroundColor: colors.secondary,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: multiline ? 20 : 18,
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: multiline ? 120 : undefined,
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);

export const ProjectInitModal: React.FC<ProjectInitModalProps> = ({
  isVisible,
  onClose,
  onRefresh,
}) => {
  const { colors } = useTheme();

  const [step, setStep] = useState<Step>('TYPE');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [methodology, setMethodology] = useState('AGILE');
  const [githubRepo, setGithubRepo] = useState('');

  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState('Initializing Neural Logic...');

  const reset = () => {
    setStep('TYPE');
    setName('');
    setDescription('');
    setMethodology('AGILE');
    setGithubRepo('');
    setLoading(false);
    setAiProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const runAIProcess = () => {
    setStep('AI_BLUEPRINTING');
    setAiProgress(0);

    const sequence = [
      { p: 20, s: 'Synthesizing Requirements...' },
      { p: 45, s: 'Mapping User Flows...' },
      { p: 70, s: 'Designing Architecture...' },
      { p: 90, s: 'Generating Nodes...' },
      { p: 100, s: 'Blueprint Complete.' },
    ];

    let current = 0;

    const interval = setInterval(() => {
      if (current < sequence.length) {
        setAiProgress(sequence[current].p);
        setAiStatus(sequence[current].s);
        current++;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        clearInterval(interval);
        setTimeout(finalizeCreation, 800);
      }
    }, 1000);
  };

  const finalizeCreation = async () => {
    try {
      setLoading(true);
      await api.post('/api/github-projects', {
        name,
        description,
        githubRepo: githubRepo || undefined,
        isConsultation: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      handleClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setStep('FORM');
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({ icon, title, subtitle, onPress, active = false }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={{
        backgroundColor: active ? colors.accent + '15' : colors.secondary,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: colors.border,
          marginRight: 20,
        }}
      >
        <Ionicons name={icon} size={24} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 4 }}>
          {title}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            style={{
              backgroundColor: colors.primary,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              borderTopWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 40,
              maxHeight: SCREEN_HEIGHT * 0.9,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
               <View>
                  <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' }}>
                    Project Initialization
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginTop: 4 }}>
                    {step === 'TYPE' ? 'New Protocol' : step === 'AI_BLUEPRINTING' ? 'Neural Architect' : 'Build Config'}
                  </Text>
               </View>
               <TouchableOpacity onPress={handleClose} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
               </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {step === 'TYPE' && (
                <View>
                  <OptionCard
                    icon="construct"
                    title="Direct Build"
                    subtitle="AI planned execution node"
                    onPress={() => setStep('FORM')}
                    active
                  />
                  <OptionCard
                    icon="logo-github"
                    title="Github Import"
                    subtitle="Analyze repository archive"
                    onPress={() => setStep('GITHUB')}
                  />
                </View>
              )}

              {(step === 'FORM' || step === 'GITHUB') && (
                <View>
                  {step === 'GITHUB' && (
                    <InputField
                      label="Repository Source"
                      value={githubRepo}
                      onChangeText={setGithubRepo}
                      placeholder="owner/repo"
                      colors={colors}
                    />
                  )}
                  <InputField
                    label="Project Codename"
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter target name"
                    autoCapitalize="words"
                    colors={colors}
                  />
                  <InputField
                    label="Execution Objective"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Define architectural goals"
                    multiline
                    colors={colors}
                  />

                  <View style={{ marginBottom: 32 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12, fontStyle: 'italic' }}>
                      Methodology
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                      {['AGILE', 'WATERFALL', 'V-MODEL', 'SPIRAL'].map(m => {
                        const active = methodology === m;
                        return (
                          <TouchableOpacity
                            key={m}
                            onPress={() => setMethodology(m)}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 10,
                              borderRadius: 12,
                              backgroundColor: active ? colors.accent : colors.secondary,
                              borderWidth: 1,
                              borderColor: active ? colors.accent : colors.border,
                            }}
                          >
                            <Text style={{ color: active ? colors.primary : colors.textSecondary, fontSize: 10, fontWeight: '900' }}>{m}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <TouchableOpacity
                    disabled={!name || (step === 'GITHUB' && !githubRepo) || loading}
                    onPress={runAIProcess}
                    style={{
                      backgroundColor: (!name || (step === 'GITHUB' && !githubRepo)) ? colors.border : colors.text,
                      paddingVertical: 20,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 12,
                    }}
                  >
                    <Ionicons name="sparkles" size={18} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '900', textTransform: 'uppercase', fontSize: 14, fontStyle: 'italic' }}>
                      Initialize Protocol
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {step === 'AI_BLUEPRINTING' && (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                  <View style={{ width: 140, height: 140, borderRadius: 70, borderWidth: 8, borderColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                    <Ionicons name="sparkles" size={48} color={colors.accent} />
                  </View>
                  <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: 12, textAlign: 'center' }}>
                    {aiStatus}
                  </Text>
                  <View style={{ width: '100%', height: 4, backgroundColor: colors.secondary, borderRadius: 2, overflow: 'hidden' }}>
                    <View style={{ width: `${aiProgress}%`, height: '100%', backgroundColor: colors.accent }} />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginTop: 12, opacity: 0.5 }}>
                    {aiProgress}% Synthesized
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
