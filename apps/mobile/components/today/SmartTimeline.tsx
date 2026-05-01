import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';

interface SmartTimelineProps {
 blocks: any[];
 onTimeClick?: (minutes: number) => void;
 startHour?: number;
}

const formatMinutesToLabel = (mins: number) => {
 const h = Math.floor(mins / 60) % 24;
 const ampm = h >= 12 ? 'PM' : 'AM';
 const displayH = h % 12 === 0 ? 12 : h % 12;
 return `${displayH}${ampm}`;
};

export default function SmartTimeline({ blocks = [], onTimeClick, startHour = 23 }: SmartTimelineProps) {
 const offsetMins = startHour * 60;
 const shiftMinutes = (m: number) => (m - offsetMins + 1440) % 1440;

 const timelineTicks = useMemo(() => {
 const ticks = [];
 for (let i = 0; i <= 24; i++) { // Every hour for mobile to keep it simple
 const totalMins = i * 60;
 const absMins = (totalMins + offsetMins) % 1440;
 ticks.push({
 relMins: totalMins,
 absMins,
 label: formatMinutesToLabel(absMins)
 });
 }
 return ticks;
 }, [offsetMins]);

 const processedBlocks = useMemo(() => {
 const result: any[] = [];
 blocks.forEach(b => {
 const sMins = b.startMinutes || 0;
 const eMins = b.endMinutes || 0;
 const rs = shiftMinutes(sMins);
 const re = shiftMinutes(eMins);
 if (re < rs) {
 result.push({ ...b, rs, re: 1440 });
 result.push({ ...b, rs: 0, re });
 } else {
 result.push({ ...b, rs, re });
 }
 });
 return result;
 }, [blocks, offsetMins]);

 const handleTimelineClick = (event: any) => {
 if (!onTimeClick) return;
 const { locationX } = event.nativeEvent;
 const screenWidth = Dimensions.get('window').width - 48; // Padding
 const percentage = locationX / screenWidth;
 const clickedRelMins = Math.floor(percentage * 1440);
 const clickedAbsMins = (clickedRelMins + offsetMins) % 1440;
 const roundedMins = Math.round(clickedAbsMins / 30) * 30;
 onTimeClick(roundedMins % 1440);
 };

 return (
 <View className="px-6 mb-8">
 <TouchableOpacity 
 activeOpacity={1}
 onPress={handleTimelineClick}
 className="relative w-full h-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl overflow-hidden flex-row items-center"
 >
 {/* Grid Lines */}
 {timelineTicks.map((tick, i) => (
 <View 
 key={i} 
 className="absolute h-full border-l border-[var(--border-color)]/20 flex flex-col justify-end pb-2 pl-1"
 style={{ left: `${(tick.relMins / 1440) * 100}%` }}
 >
 {i % 3 === 0 && (
 <Text className="text-[7px] font-black uppercase text-[var(--text-secondary)] opacity-50">
 {tick.label}
 </Text>
 )}
 </View>
 ))}

 {/* Blocks */}
 {processedBlocks.map((b, i) => {
 const isSleep = b.title?.toLowerCase().includes('sleep') || b.icon === 'moon';
 return (
 <View 
 key={`${b.id}-${i}`}
 className="absolute top-0 bottom-0 flex items-center justify-center"
 style={{ 
 left: `${(b.rs / 1440) * 100}%`, 
 width: `${((b.re - b.rs) / 1440) * 100}%`,
 backgroundColor: '#0EA5E9',
 opacity: isSleep ? 0.8 : 0.4,
 borderLeftWidth: 1,
 borderLeftColor: 'rgba(255,255,255,0.1)',
 }}
 >
 <Text className="text-[8px] font-black text-white uppercase tracking-tighter truncate px-1">
 {b.rs === 0 || (b.re - b.rs) > 60 ? b.title : ''}
 </Text>
 </View>
 )
 })}

 <CurrentTimeIndicator offsetMins={offsetMins} />
 </TouchableOpacity>
 </View>
 );
}

function CurrentTimeIndicator({ offsetMins }: { offsetMins: number }) {
 const [now, setNow] = useState(new Date());

 useEffect(() => {
 const timer = setInterval(() => setNow(new Date()), 60000);
 return () => clearInterval(timer);
 }, []);

 const absMins = now.getHours() * 60 + now.getMinutes();
 const relMins = (absMins - offsetMins + 1440) % 1440;

 return (
 <View 
 className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20"
 style={{ left: `${(relMins / 1440) * 100}%` }}
 >
 <View className="absolute top-0 -left-1 w-2 h-2 bg-rose-500 rounded-full" />
 </View>
 );
}
