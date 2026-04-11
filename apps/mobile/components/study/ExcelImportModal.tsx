import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { createManualPath, batchCreateUnits } from '../../lib/path-creation';
import { useRouter } from 'expo-router';

interface ExcelImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isVisible, onClose, onRefresh }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [file, setFile] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values'],
      });
      if (!result.canceled) {
        setFile(result.assets[0]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    
    try {
      // 1. Read file as string
      const fileContent = await FileSystem.readAsStringAsync(file.uri);
      
      // 2. Parse CSV
      const { data, errors } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (errors.length > 0) {
        console.warn("CSV Parse Errors:", errors);
      }

      if (data.length === 0) {
        throw new Error("No data found in the selected file.");
      }

      // 3. Map Columns
      const mappedSteps = (data as any[]).map((row) => {
        const title = row.Title || row.Task || row.Name || row.title || row.task || row.name || "Untitled Step";
        const duration = parseInt(row.Duration || row.Minutes || row.Time || row.duration || row.minutes || row.time) || 30;
        const phase = row.Phase || row.Category || row.Group || row.phase || row.category || row.group || "Imported";
        return { title, duration, phase };
      });

      // 4. Extract unique phases
      const uniquePhases = Array.from(new Set(mappedSteps.map(s => s.phase)));

      // 5. Create Track
      const track = await createManualPath({
        title: file.name.split('.')[0] || "Imported Path",
        type: 'PROJECT',
        phases: uniquePhases,
      });

      // 6. Batch Create Units
      await batchCreateUnits(track.id, mappedSteps);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onRefresh();
      onClose();
      router.push(`/study/${track.id}`);
      Alert.alert("Import Successful", `Processed ${mappedSteps.length} steps across ${uniquePhases.length} phases.`);
    } catch (err: any) {
      console.error("Import Error:", err);
      Alert.alert("Import Failed", err.message || "Failed to process the ledger file.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View 
          style={{ backgroundColor: colors.card }}
          className="rounded-t-[3.5rem] p-8 pb-16 border-t border-[var(--border-color)] shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-10">
            <View className="flex-row items-center gap-3 text-left">
               <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center border border-emerald-500/20">
                  <Ionicons name="document-attach" size={20} color="#10b981" />
               </View>
               <Text className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Import Data</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isImporting ? (
            <View className="py-20 items-center justify-center">
               <ActivityIndicator size="large" color="#10b981" />
               <Text className="text-lg font-black text-[var(--text-primary)] italic uppercase tracking-tighter mt-8">Processing Ledger...</Text>
               <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40">Parsing CSV structure</Text>
            </View>
          ) : (
            <View className="space-y-8">
              <TouchableOpacity 
                onPress={pickDocument}
                className="w-full p-12 bg-[var(--bg-secondary)]/50 rounded-[2.5rem] border-2 border-dashed border-[var(--border-color)] items-center justify-center"
              >
                <Ionicons name={file ? "checkmark-circle" : "cloud-upload-outline"} size={48} color={file ? "#10b981" : colors.textSecondary} style={{ opacity: 0.5 }} />
                <Text className="text-sm font-black text-[var(--text-primary)] italic uppercase tracking-widest mt-4">
                  {file ? file.name : 'Select CSV File'}
                </Text>
                {file && <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase mt-1 opacity-40 italic">{(file.size / 1024).toFixed(1)} KB READY</Text>}
              </TouchableOpacity>

              <View className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-left">
                 <Text className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest leading-relaxed italic">
                   System supports standard CSV exports. Ensure your headers include "Title", "Duration", and "Phase".
                 </Text>
              </View>

              <TouchableOpacity 
                onPress={handleImport}
                disabled={!file}
                className={`w-full p-6 rounded-3xl items-center shadow-xl ${!file ? 'bg-gray-500 opacity-20' : 'bg-emerald-500 shadow-emerald-500/30'}`}
              >
                <Text className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic">Execute Import</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
