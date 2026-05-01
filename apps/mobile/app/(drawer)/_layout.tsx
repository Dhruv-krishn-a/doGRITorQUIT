import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import Animated, { 
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import { GritioLogo } from "../../components/GritioLogo";

function CustomDrawerContent(props: any) {
  const [expanded, setExpanded] = useState(true);
  const width = useSharedValue(280);
  const { colors } = useTheme();

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    width.value = withSpring(nextExpanded ? 280 : 80, { damping: 20, stiffness: 90 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    alignItems: width.value > 150 ? 'flex-start' : 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.card }, animatedStyle]}>
      <DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={{ flex: 1 }}>
        <Animated.View style={logoContainerStyle}>
          {expanded ? (
            <View>
              <GritioLogo size="lg" withText={true} />
            </View>
          ) : (
            <Ionicons name="sparkles" size={24} color={colors.accent} />
          )}
        </Animated.View>

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

export default function DrawerLayout() {
  const { session, loading } = useAuth();
  const { width } = useWindowDimensions();
  const { theme, colors } = useTheme();
  const safeWindowWidth = Number.isFinite(width) && width > 0 ? width : 360;
  const computedDrawerWidth = Math.max(260, Math.min(safeWindowWidth * 0.78, 380));

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
            width: computedDrawerWidth,
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
            letterSpacing: 1,
            fontSize: 14,
            fontStyle: "italic",
          },
          headerTitleContainerStyle: {
            maxWidth: Math.max(120, computedDrawerWidth - 140),
          },
          drawerActiveTintColor: colors.accent,
          drawerInactiveTintColor: colors.textSecondary,
          drawerActiveBackgroundColor: `${colors.accent}15`, 
          drawerLabelStyle: {
            fontWeight: "900",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
          },
        }}
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            drawerLabel: "Dashboard",
            headerTitle: "Command Center",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="apps" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="today"
          options={{
            drawerLabel: "Today",
            headerTitle: "Daily Planner",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="notes"
          options={{
            drawerLabel: "Notes",
            headerTitle: "My Notes",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="journal" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="tracker"
          options={{
            drawerLabel: "Project Tracker",
            headerTitle: "Execution OS",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="study"
          options={{
            drawerLabel: "Study Paths",
            headerTitle: "Current Paths",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="rocket" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="checklist"
          options={{
            drawerLabel: "Checklist",
            headerTitle: "Daily Checklist",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="checkmark-circle" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            headerTitle: "Settings",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="subscriptions"
          options={{
            drawerLabel: "Plan & Usage",
            headerTitle: "Usage & Plan",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="card" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="feedback"
          options={{
            drawerLabel: "Developer Hub",
            headerTitle: "Community",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        
        {/* Hidden internal screens */}
        <Drawer.Screen name="profile" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="planner" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
