import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { TodayStats } from '../types/today';

interface GritRadarProps {
 stats: TodayStats;
 energy: number; // 0-100
 focus: number; // 0-100
}

const { width } = Dimensions.get('window');
const SIZE = width - 48;
const CENTER = SIZE / 2;
const RADIUS = (SIZE / 2) * 0.8;

export const GritRadar: React.FC<GritRadarProps> = ({ stats, energy, focus }) => {
 // Vertices for Momentum, Energy, Focus
 // Momentum at top (0 degrees)
 // Energy at 120 degrees
 // Focus at 240 degrees

 const getPoint = (value: number, angleDegrees: number) => {
 const angleRadians = (angleDegrees - 90) * (Math.PI / 180);
 const r = (value / 100) * RADIUS;
 return {
 x: CENTER + r * Math.cos(angleRadians),
 y: CENTER + r * Math.sin(angleRadians),
 };
 };

 const pMomentum = getPoint(stats.momentum, 0);
 const pEnergy = getPoint(energy, 120);
 const pFocus = getPoint(focus, 240);

 const points = `${pMomentum.x},${pMomentum.y} ${pEnergy.x},${pEnergy.y} ${pFocus.x},${pFocus.y}`;

 return (
 <View className="items-center justify-center bg-white rounded-[3rem] p-6 border border-slate-100 mb-8">
 <View className="mb-4 items-center">
 <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Atmospheric Composition</Text>
 </View>
 
 <Svg width={SIZE} height={SIZE}>
 {/* Background Grids */}
 {[0.2, 0.4, 0.6, 0.8, 1].map((p) => (
 <Circle
 key={p}
 cx={CENTER}
 cy={CENTER}
 r={RADIUS * p}
 stroke="#f1f5f9"
 strokeWidth="1"
 fill="none"
 />
 ))}

 {/* Axis Lines */}
 {[0, 120, 240].map((angle) => {
 const p = getPoint(100, angle);
 return (
 <Line
 key={angle}
 x1={CENTER}
 y1={CENTER}
 x2={p.x}
 y2={p.y}
 stroke="#f1f5f9"
 strokeWidth="1"
 />
 );
 })}

 {/* Data Polygon */}
 <Polygon
 points={points}
 fill="rgba(79, 70, 229, 0.15)"
 stroke="#4f46e5"
 strokeWidth="3"
 strokeLinejoin="round"
 />

 {/* Labels */}
 <SvgText
 x={CENTER}
 y={CENTER - RADIUS - 15}
 fill="#64748b"
 fontSize="10"
 fontWeight="900"
 textAnchor="middle" >
 MOMENTUM
 </SvgText>
 <SvgText
 x={getPoint(115, 120).x}
 y={getPoint(115, 120).y}
 fill="#64748b"
 fontSize="10"
 fontWeight="900"
 textAnchor="middle" >
 ENERGY
 </SvgText>
 <SvgText
 x={getPoint(115, 240).x}
 y={getPoint(115, 240).y}
 fill="#64748b"
 fontSize="10"
 fontWeight="900"
 textAnchor="middle" >
 FOCUS
 </SvgText>
 </Svg>
 </View>
 );
};
