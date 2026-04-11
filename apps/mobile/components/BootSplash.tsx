import React, { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  interpolate,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BootSplash() {
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.9);
  
  const dot1X = useSharedValue(0);
  const dot2X = useSharedValue(0);
  const dot3X = useSharedValue(0);
  const dot4X = useSharedValue(0);
  
  const dotOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Text fades in
    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    textScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });

    // 2. Dots emerge from text after delay
    const startDelay = 600;
    const expandDuration = 600;
    const gap = 14;

    dotOpacity.value = withDelay(startDelay, withTiming(1, { duration: 400 }));
    
    dot1X.value = withDelay(startDelay, withTiming(gap * 0, { duration: expandDuration, easing: Easing.out(Easing.exp) }));
    dot2X.value = withDelay(startDelay + 100, withTiming(gap * 1, { duration: expandDuration, easing: Easing.out(Easing.exp) }));
    dot3X.value = withDelay(startDelay + 200, withTiming(gap * 2, { duration: expandDuration, easing: Easing.out(Easing.exp) }));
    dot4X.value = withDelay(startDelay + 300, withTiming(gap * 3, { duration: expandDuration, easing: Easing.out(Easing.exp) }));
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  const d1 = useAnimatedStyle(() => ({ transform: [{ translateX: dot1X.value }], opacity: dotOpacity.value }));
  const d2 = useAnimatedStyle(() => ({ transform: [{ translateX: dot2X.value }], opacity: dotOpacity.value }));
  const d3 = useAnimatedStyle(() => ({ transform: [{ translateX: dot3X.value }], opacity: dotOpacity.value }));
  const d4 = useAnimatedStyle(() => ({ transform: [{ translateX: dot4X.value }], opacity: dotOpacity.value }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#050505", // noir theme primary
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={[textStyle, { marginRight: 16 }]}>
          <Text style={{ 
            color: '#f8fafc', 
            fontSize: 48, 
            fontWeight: '900', 
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: -2
          }}>
            grit.io
          </Text>
        </Animated.View>

        <View style={{ width: 60, height: 20, justifyContent: 'center' }}>
          <Animated.View style={[{ position: 'absolute', left: 0 }, d1]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f8fafc' }} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', left: 0 }, d2]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f8fafc' }} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', left: 0 }, d3]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#f8fafc' }} />
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', left: 0 }, d4]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' }} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
