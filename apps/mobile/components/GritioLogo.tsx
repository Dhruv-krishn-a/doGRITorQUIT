import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
 useSharedValue, 
 useAnimatedStyle, 
 withTiming, 
 withSequence,
 withDelay,
 withRepeat,
 Easing
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface GritioLogoProps {
 size?: 'sm' | 'md' | 'lg' | 'xl';
 withText?: boolean;
}

export function GritioLogo({ size = 'md', withText = true }: GritioLogoProps) {
 const { colors } = useTheme();

 // Size mappings
 const sizes = {
 sm: { text: 18, dotSize: 4, gap: 4 },
 md: { text: 24, dotSize: 6, gap: 6 },
 lg: { text: 32, dotSize: 8, gap: 8 },
 xl: { text: 48, dotSize: 12, gap: 12 },
 };

 const s = sizes[size];

 // Animation values
 const dot1Opacity = useSharedValue(1);
 const dot1Scale = useSharedValue(1);
 
 const dot4ColorIndex = useSharedValue(0); // 0: primary, 1: accent
 const dot4Scale = useSharedValue(1);
 const dot4BorderOpacity = useSharedValue(1); // 1 = hollow, 0 = filled

 const shiftX = useSharedValue(0);
 const shiftAmount = -(s.dotSize + s.gap);

 useEffect(() => {
 // Total loop duration is 1200 + 600 + 800 + 500 + 500 = 3600ms
 const runLoop = () => {
 // Frame 1: Neutral State (● ● ● ○)
 dot1Opacity.value = 1;
 dot1Scale.value = 1;
 dot4ColorIndex.value = 0;
 dot4BorderOpacity.value = 1; // Hollow
 shiftX.value = 0;

 // Frame 2: Activation (Last dot fills orange, pulse) (● ● ● 🟠)
 // Happens after 1200ms
 setTimeout(() => {
 dot4BorderOpacity.value = withTiming(0, { duration: 300 });
 dot4ColorIndex.value = withTiming(1, { duration: 300 });
 dot4Scale.value = withSequence(
 withTiming(1.2, { duration: 300, easing: Easing.inOut(Easing.ease) }),
 withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
 );
 }, 1200);

 // Frame 3: Fade Past (First dot fades) (◐ ● ● 🟠)
 // Happens after 1200 + 600 + 800 = 2600ms
 setTimeout(() => {
 dot1Opacity.value = withTiming(0.3, { duration: 500, easing: Easing.out(Easing.ease) });
 dot1Scale.value = withTiming(0.8, { duration: 500, easing: Easing.out(Easing.ease) });
 }, 2600);

 // Frame 4: Shift Forward (All dots shift left) (● ● ● ○)
 // Happens after 2600 + 500 = 3100ms
 setTimeout(() => {
 dot1Opacity.value = withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) });
 shiftX.value = withTiming(shiftAmount, { duration: 500, easing: Easing.inOut(Easing.ease) }, (finished) => {
 if (finished) {
 // Instantly reset for next loop
 dot1Opacity.value = 1;
 dot1Scale.value = 1;
 dot4ColorIndex.value = 0;
 dot4BorderOpacity.value = 1;
 shiftX.value = 0;
 }
 });
 }, 3100);
 };

 runLoop();
 const intervalId = setInterval(runLoop, 3600); // Repeat every 3.6s

 return () => clearInterval(intervalId);
 }, []);

 // Animated styles
 const dot1Style = useAnimatedStyle(() => ({
 opacity: dot1Opacity.value,
 transform: [{ scale: dot1Scale.value }]
 }));

 const dot4Style = useAnimatedStyle(() => {
 // Interpolate color index (0 -> 1) between textSecondary and accentColor
 return {
 backgroundColor: dot4BorderOpacity.value === 1 ? 'transparent' : (dot4ColorIndex.value > 0.5 ? colors.accent : colors.textSecondary),
 borderColor: dot4BorderOpacity.value === 1 ? colors.textSecondary : 'transparent',
 borderWidth: dot4BorderOpacity.value,
 transform: [{ scale: dot4Scale.value }]
 };
 });

 const containerShiftStyle = useAnimatedStyle(() => ({
 transform: [{ translateX: shiftX.value }]
 }));

 return (
 <View style={styles.wrapper}>
 {withText && (
 <Text style={[styles.text, { fontSize: s.text, color: colors.text }]}>
 grit.io
 </Text>
 )}
 
 {/* Overflow hidden mask container - Expanded width to prevent clipping the 4th dot pulse */}
 <View style={[styles.mask, { width: (s.dotSize * 4) + (s.gap * 3) + (s.dotSize * 0.5) }]}>
 <Animated.View style={[styles.dotsContainer, { gap: s.gap }, containerShiftStyle]}>
 <Animated.View style={[styles.dot, { width: s.dotSize, height: s.dotSize, backgroundColor: colors.textSecondary, opacity: 0.5 }, dot1Style]} />
 <View style={[styles.dot, { width: s.dotSize, height: s.dotSize, backgroundColor: colors.textSecondary, opacity: 0.5 }]} />
 <View style={[styles.dot, { width: s.dotSize, height: s.dotSize, backgroundColor: colors.textSecondary, opacity: 0.5 }]} />
 <Animated.View style={[styles.dot, { width: s.dotSize, height: s.dotSize }, dot4Style]} />
 </Animated.View>
 </View>
 </View>
 );
}

const styles = StyleSheet.create({
 wrapper: {
 flexDirection: 'row',
 alignItems: 'center',
 gap: 8,
 },
 text: {
 fontWeight: '900',
 fontStyle: 'italic',
 textTransform: 'uppercase',
 letterSpacing: -1,
 },
 mask: {
 overflow: 'hidden',
 paddingVertical: 4, // Allow room for pulse scaling
 paddingHorizontal: 2,
 },
 dotsContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 dot: {
 borderRadius: 999,
 }
});
