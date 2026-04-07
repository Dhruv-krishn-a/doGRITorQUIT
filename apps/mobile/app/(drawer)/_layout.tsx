import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { DrawerContentScrollView, DrawerItemList, useDrawerProgress } from "@react-navigation/drawer";
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function CustomDrawerContent(props: any) {
  const [expanded, setExpanded] = useState(true);
  const width = useSharedValue(280);
  const { colors } = useTheme();

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExpanded(!expanded);
    width.value = withSpring(expanded ? 80 : 280, { damping: 20, stiffness: 90 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.card }, animatedStyle]}>
      <DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={{ flex: 1 }}>
        <View style={{ padding: 20, paddingTop: 40, paddingBottom: 40, alignItems: expanded ? 'flex-start' : 'center' }}>
          {expanded ? (
            <View>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '900', fontStyle: 'italic' }}>DO GRIT</Text>
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 }}>OK QUIT</Text>
            </View>
          ) : (
            <Ionicons name="sparkles" size={24} color={colors.accent} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <DrawerItemList {...props} />
        </View>

        <TouchableOpacity 
          onPress={toggleExpand}
          style={{ 
            padding: 20, 
            borderTopWidth: 1, 
            borderTopColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ionicons 
            name={expanded ? "chevron-back-circle" : "chevron-forward-circle"} 
            size={24} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </DrawerContentScrollView>
    </Animated.View>
  );
}

// Perspective Wrapper Component
export const PerspectiveWrapper = ({ children }: { children: React.ReactNode }) => {
  const progress = useDrawerProgress() as Animated.SharedValue<number>;
  
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.85], Extrapolation.CLAMP);
    const borderRadius = interpolate(progress.value, [0, 1], [0, 40], Extrapolation.CLAMP);
    const rotateY = interpolate(progress.value, [0, 1], [0, -10], Extrapolation.CLAMP);
    const translateX = interpolate(progress.value, [0, 1], [0, 20], Extrapolation.CLAMP);

    return {
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateY: `${rotateY}deg` },
        { translateX }
      ],
      borderRadius,
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View 
      className="flex-1 bg-[var(--bg-primary)]" 
      style={animatedStyle}
    >
      {children}
    </Animated.View>
  );
};

export default function DrawerLayout() {
  const { session, loading } = useAuth();
  const { width } = useWindowDimensions();
  const { theme, colors } = useTheme();

  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <GestureHandlerRootView className={`theme-${theme}`} style={{ flex: 1, backgroundColor: colors.primary }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: "slide",
          overlayColor: "transparent", 
          drawerStyle: {
            backgroundColor: colors.primary,
            width: width * 0.75,
          },
          sceneStyle: { backgroundColor: colors.primary },
          headerStyle: {
            backgroundColor: colors.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1,
            fontSize: 14,
            fontStyle: "italic",
          },
          drawerActiveTintColor: colors.accent,
          drawerInactiveTintColor: colors.textSecondary,
          drawerActiveBackgroundColor: `${colors.accent}15`, // Adding some transparency
          drawerLabelStyle: {
            fontWeight: "900",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          },
        }}
      >
        <Drawer.Screen
          name="today"
          options={{
            drawerLabel: "Today",
            headerTitle: "Command Center",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="notes"
          options={{
            drawerLabel: "Notes",
            headerTitle: "Neural Archive",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="journal" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="study"
          options={{
            drawerLabel: "Projects",
            headerTitle: "Active Missions",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="rocket" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="checklist"
          options={{
            drawerLabel: "Daily Checklist",
            headerTitle: "The Pulse",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="checkmark-circle" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="dashboard"
          options={{
            drawerLabel: "Insights",
            headerTitle: "Performance HUD",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            headerTitle: "System Config",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="subscriptions"
          options={{
            drawerLabel: "Subscription",
            headerTitle: "Neural Limits",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="card" size={size} color={color} />
            ),
          }}
        />
        
        {/* Hidden screens */}
        <Drawer.Screen name="analytics" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="profile" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="planner" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
