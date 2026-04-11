import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBilling, Product } from '../../hooks/useBilling';
import { PerspectiveWrapper } from './_layout';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SubscriptionsPage() {
  const { products, data, loading, buyingKey, handleBuy } = useBilling();
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
      <View className="flex-1 mx-2">
        <View className="flex-row items-center mb-2">
          <Ionicons name={icon} size={12} color={colors.textSecondary} />
          <Text className="ml-1.5 text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest" numberOfLines={1}>{label}</Text>
        </View>
        <View className="h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <View 
            className="h-full bg-[var(--accent-color)] shadow-sm" 
            style={{ width: `${percent}%` }} 
          />
        </View>
        <Text className="text-[7px] font-black text-[var(--text-primary)] italic mt-1">{used}/{limit === 999999 ? '∞' : limit}</Text>
      </View>
    );
  };

  const PlanCard = ({ product }: { product: Product }) => {
    const isActive = activeSub?.product?.id === product.id;
    const isBuying = buyingKey === product.key;

    return (
      <View 
        style={{ width: width * 0.75 }}
        className={`p-8 rounded-[3rem] border mr-4 ${
          isActive ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-[var(--bg-secondary)]/30 border border-[var(--border-color)]'
        }`}
      >
        <View className="mb-6">
          <Text className={`text-2xl font-black italic uppercase tracking-tighter ${
            isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]'
          }`}>
            {product.name}
          </Text>
          <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
            isActive ? 'text-[var(--bg-primary)]/60' : 'text-[var(--text-secondary)]'
          }`}>
            {product.description || 'Premium access'}
          </Text>
        </View>

        <View className="flex-row items-baseline mb-8">
          <Text className={`text-4xl font-black italic ${isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]'}`}>
            ₹{product.price / 100}
          </Text>
          <Text className={`ml-1 text-xs font-bold ${isActive ? 'text-[var(--bg-primary)]/60' : 'text-[var(--text-secondary)]'}`}>/MO</Text>
        </View>

        <TouchableOpacity
          onPress={() => !isActive && handleBuy(product.key)}
          disabled={isActive || !!buyingKey}
          className={`py-5 rounded-2xl items-center justify-center ${
            isActive ? 'bg-[var(--bg-primary)]/10 border border-[var(--bg-primary)]/20' : 'bg-[var(--text-primary)] shadow-lg'
          }`}
        >
          {isBuying ? (
            <ActivityIndicator color={isActive ? colors.accent : colors.primary} />
          ) : (
            <Text className={`text-[10px] font-black uppercase tracking-widest ${
              isActive ? 'text-[var(--bg-primary)]/40' : 'text-[var(--bg-primary)]'
            }`}>
              {isActive ? 'Current Plan' : 'Upgrade Now'}
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
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 mb-8 text-left">
            <Text className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] mb-2 italic">Your Plan</Text>
            <Text className="text-4xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter leading-none">Usage</Text>
          </View>

          {/* Compact HUD */}
          <View className="mx-6 p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] mb-8 shadow-sm">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl items-center justify-center border border-[var(--border-color)]">
                  <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
                </View>
                <View className="ml-3">
                  <Text className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic">Level</Text>
                  <Text className="text-sm font-black text-[var(--text-primary)] uppercase italic leading-none">{activeSub?.product?.name || 'Free Tier'}</Text>
                </View>
              </View>
              <TouchableOpacity className="p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]">
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row -mx-2">
              <UsageItem label="AI Assist" used={usage.aiGenerated} limit={usage.aiLimit} icon="sparkles" />
              <UsageItem label="Paths" used={data?.usage?.plans?.used || 0} limit={data?.usage?.plans?.limit || 1} icon="rocket" />
              <UsageItem label="Habits" used={data?.usage?.habits?.used || 0} limit={data?.usage?.habits?.limit || 3} icon="refresh" />
            </View>
          </View>

          {/* Tab Selector */}
          <View className="px-6 mb-8">
            <View className="flex-row bg-[var(--bg-secondary)]/50 p-1 rounded-2xl border border-[var(--border-color)]">
              <TouchableOpacity 
                onPress={() => setActiveTab('PLANS')}
                className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'PLANS' ? 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm' : ''}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'PLANS' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActiveTab('HISTORY')}
                className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'HISTORY' ? 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm' : ''}`}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'HISTORY' ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}>Log</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeTab === 'PLANS' ? (
            <View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
              >
                {products.map(p => <PlanCard key={p.id} product={p} />)}
                {products.length === 0 && (
                  <View style={{ width: width - 48 }} className="p-10 bg-[var(--bg-secondary)]/10 rounded-[2.5rem] border border-dashed border-[var(--border-color)] items-center justify-center">
                    <Text className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest italic text-center">
                      Loading plans...
                    </Text>
                  </View>
                )}
              </ScrollView>
              
              <View className="px-6 mt-10">
                <View className="p-8 bg-[var(--bg-secondary)]/20 rounded-[3rem] border border-[var(--border-color)]">
                   <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] mb-4 italic">Neural Benefits</Text>
                   <View className="space-y-4">
                      {['Unlimited Cloud Sync', 'Priority AI Assistance', 'Advanced Insights', 'Custom Path Creation'].map((feature, i) => (
                        <View key={i} className="flex-row items-center gap-3">
                           <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                           <Text className="text-[11px] font-black uppercase italic text-[var(--text-primary)] tracking-tight">{feature}</Text>
                        </View>
                      ))}
                   </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="px-6">
              {history.map((item: any) => (
                <View key={item.id} className="flex-row items-center justify-between p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] mb-4 shadow-sm">
                  <View>
                    <Text className="text-[var(--text-primary)] font-black uppercase text-xs tracking-tight italic">Transaction</Text>
                    <Text className="text-[var(--text-secondary)] text-[8px] font-bold uppercase mt-1 tracking-widest opacity-40">{item.formattedDate || new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[var(--accent-color)] text-lg font-black italic">₹{item.amount / 100}</Text>
                    <Text className="text-emerald-500 text-[8px] font-black uppercase tracking-widest mt-1">Confirmed</Text>
                  </View>
                </View>
              ))}
              {history.length === 0 && (
                <View className="p-20 border-2 border-dashed border-[var(--border-color)] rounded-[3.5rem] items-center justify-center bg-[var(--bg-secondary)]/10 opacity-30">
                  <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                  <Text className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em] mt-6 italic text-center leading-relaxed">No transaction history</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </PerspectiveWrapper>
  );
}
