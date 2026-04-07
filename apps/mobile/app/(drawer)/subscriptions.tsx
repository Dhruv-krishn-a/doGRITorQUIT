import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBilling, Product } from '../../hooks/useBilling';
import { PerspectiveWrapper } from './_layout';
import { useTheme } from '../../context/ThemeContext';

export default function SubscriptionsPage() {
  const { products, data, loading, buyingKey, handleBuy, refresh } = useBilling();
  const [activeTab, setActiveTab] = useState<'PLANS' | 'HISTORY'>('PLANS');
  const { colors } = useTheme();

  if (loading && !data) {
    return (
      <PerspectiveWrapper>
        <View className="flex-1 items-center justify-center bg-[var(--bg-primary)]">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </PerspectiveWrapper>
    );
  }

  const activeSub = data?.activeSubscription;
  const usage = data?.usage || { aiGenerated: 0, aiLimit: 5, remaining: 5 };
  const history = data?.history || [];

  const UsageItem = ({ label, used, limit, icon }: { label: string, used: number, limit: number, icon: any }) => {
    const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Ionicons name={icon} size={14} color={colors.textSecondary} />
            <Text className="ml-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{label}</Text>
          </View>
          <Text className="text-[10px] font-black text-[var(--text-primary)] italic">{used} / {limit === 999999 ? '∞' : limit}</Text>
        </View>
        <View className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <View 
            className="h-full bg-[var(--accent-color)] shadow-lg shadow-sky-500/50" 
            style={{ width: `${percent}%` }} 
          />
        </View>
      </View>
    );
  };

  const PlanCard = ({ product }: { product: Product }) => {
    const isActive = activeSub?.product?.id === product.id;
    const isBuying = buyingKey === product.key;

    return (
      <View className={`p-6 rounded-[2.5rem] border mb-6 ${
        isActive ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)]/30 border-[var(--border-color)]'
      }`}>
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className={`text-xl font-black italic uppercase tracking-tighter ${
              isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]'
            }`}>
              {product.name}
            </Text>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isActive ? 'text-[var(--bg-primary)]/60' : 'text-[var(--text-secondary)]'
            }`}>
              {product.description || 'Neural Enhancement'}
            </Text>
          </View>
          {isActive && (
            <View className="bg-[var(--bg-primary)] px-3 py-1 rounded-full border border-[var(--bg-primary)]/10">
              <Text className="text-[8px] font-black text-[var(--accent-color)] uppercase">Current</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-baseline mb-6">
          <Text className={`text-3xl font-black italic ${isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]'}`}>
            ₹{product.price / 100}
          </Text>
          <Text className={`ml-1 text-xs font-bold ${isActive ? 'text-[var(--bg-primary)]/60' : 'text-[var(--text-secondary)]'}`}>/MO</Text>
        </View>

        <TouchableOpacity
          onPress={() => !isActive && handleBuy(product.key)}
          disabled={isActive || !!buyingKey}
          className={`py-4 rounded-2xl items-center justify-center ${
            isActive ? 'bg-[var(--bg-primary)]/10 border border-[var(--bg-primary)]/20' : 'bg-[var(--text-primary)] shadow-lg'
          }`}
        >
          {isBuying ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text className={`text-[10px] font-black uppercase tracking-widest ${
              isActive ? 'text-[var(--bg-primary)]/40' : 'text-[var(--bg-primary)]'
            }`}>
              {isActive ? 'Active System' : 'Initialize Upgrade'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PerspectiveWrapper>
      <View className="flex-1 bg-[var(--bg-primary)]">
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2">Resource Management</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Limits</Text>
          </View>

          {/* Current Status HUD */}
          <View className="p-6 bg-[var(--bg-secondary)]/30 rounded-[2.5rem] border border-[var(--border-color)] mb-10">
            <View className="flex-row items-center mb-8">
              <View className="w-12 h-12 bg-[var(--bg-secondary)] rounded-2xl items-center justify-center border border-[var(--border-color)]">
                <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
              </View>
              <View className="ml-4">
                <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Active Plan</Text>
                <Text className="text-lg font-black text-[var(--text-primary)] uppercase italic">{activeSub?.product?.name || 'Free Tier'}</Text>
              </View>
            </View>

            <UsageItem label="Neural AI Capacity" used={usage.aiGenerated} limit={usage.aiLimit} icon="sparkles" />
            <UsageItem label="Project Slots" used={data?.usage?.plans?.used || 0} limit={data?.usage?.plans?.limit || 1} icon="rocket" />
            <UsageItem label="Pulse Channels" used={data?.usage?.habits?.used || 0} limit={data?.usage?.habits?.limit || 3} icon="refresh" />
          </View>

          {/* Tabs */}
          <View className="flex-row mb-8 bg-[var(--bg-secondary)]/50 p-1.5 rounded-2xl border border-[var(--border-color)]">
            <TouchableOpacity 
              onPress={() => setActiveTab('PLANS')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'PLANS' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'PLANS' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('HISTORY')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'HISTORY' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm' : ''}`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'HISTORY' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>Log</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'PLANS' ? (
            <View>
              {products.map(p => <PlanCard key={p.id} product={p} />)}
              {products.length === 0 && (
                <View className="p-10 bg-[var(--bg-secondary)]/10 rounded-[2.5rem] border border-dashed border-[var(--border-color)] items-center">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic text-center">
                    Awaiting Uplink to Plan Repository...
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {history.map((item: any) => (
                <View key={item.id} className="flex-row items-center justify-between p-5 bg-[var(--bg-secondary)]/20 rounded-3xl border border-[var(--border-color)] mb-3">
                  <View>
                    <Text className="text-[var(--text-primary)] font-black uppercase text-[10px] tracking-tight italic">Transaction Resolve</Text>
                    <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase mt-1 tracking-widest">{item.formattedDate || new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[var(--accent-color)] font-black italic">₹{item.amount / 100}</Text>
                    <Text className="text-mint text-[8px] font-black uppercase tracking-widest mt-1">Success</Text>
                  </View>
                </View>
              ))}
              {history.length === 0 && (
                <View className="p-10 bg-[var(--bg-secondary)]/10 rounded-[2.5rem] border border-dashed border-[var(--border-color)] items-center">
                  <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic text-center">
                    No transaction logs detected.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </PerspectiveWrapper>
  );
}
