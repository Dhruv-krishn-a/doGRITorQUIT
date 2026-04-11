import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { GritioLogo } from "./GritioLogo";

export default function BootSplash() {
  const fade = useSharedValue(0);
  const lift = useSharedValue(10);
  const p1 = useSharedValue(0.7);
  const p2 = useSharedValue(0.7);
  const p3 = useSharedValue(0.7);
  const p4 = useSharedValue(0.7);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    lift.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
    p1.value = withDelay(60, withTiming(1, { duration: 380 }));
    p2.value = withDelay(120, withTiming(1, { duration: 380 }));
    p3.value = withDelay(180, withTiming(1, { duration: 380 }));
    p4.value = withDelay(240, withTiming(1, { duration: 380 }));
  }, [fade, lift, p1, p2, p3, p4]);

  const shellStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: lift.value }],
  }));

  const d1 = useAnimatedStyle(() => ({ transform: [{ scale: p1.value }], opacity: p1.value }));
  const d2 = useAnimatedStyle(() => ({ transform: [{ scale: p2.value }], opacity: p2.value }));
  const d3 = useAnimatedStyle(() => ({ transform: [{ scale: p3.value }], opacity: p3.value }));
  const d4 = useAnimatedStyle(() => ({ transform: [{ scale: p4.value }], opacity: p4.value }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#efefef",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={shellStyle}>
        <View
          style={{
            width: 280,
            height: 280,
            borderRadius: 34,
            backgroundColor: "#f4f4f4",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 14 },
            elevation: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Animated.View style={d1}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#050505" }} />
            </Animated.View>
            <Animated.View style={d2}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#050505" }} />
            </Animated.View>
            <Animated.View style={d3}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#050505" }} />
            </Animated.View>
            <Animated.View style={d4}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: "#ff6a00",
                  shadowColor: "#ff6a00",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 3,
                }}
              />
            </Animated.View>
          </View>
        </View>

        <View style={{ marginTop: 22, alignItems: "center" }}>
          <GritioLogo size="xl" withText={true} />
        </View>
      </Animated.View>
    </View>
  );
}
