import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

import { GritioLogo } from "../../components/GritioLogo";

function CustomDrawerContent(props: any) {
  const [isStudyExpanded, setIsStudyExpanded] = useState(true);
  const { state, navigation } = props;
  const { colors } = useTheme();

  const toggleStudy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsStudyExpanded(!isStudyExpanded);
  };

  const renderDrawerItem = (name: string, label: string, icon: string, isSubItem = false) => {
    const focused = state.routeNames[state.index] === name;
    
    return (
      <TouchableOpacity
        key={name}
        onPress={() => navigation.navigate(name)}
        activeOpacity={0.7}
        className={`flex-row items-center px-4 py-3 rounded-2xl mb-1 ${
          focused ? 'bg-[var(--accent-color)]/10' : ''
        } ${isSubItem ? 'ml-8' : ''}`}
      >
        <Ionicons 
          name={icon as any} 
          size={isSubItem ? 16 : 20} 
          color={focused ? colors.accent : colors.textSecondary} 
        />
        <Text 
          className={`ml-4 uppercase font-black tracking-widest ${
            isSubItem ? 'text-[9px]' : 'text-[12px]'
          } ${focused ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ padding: 12, paddingTop: 40 }}>
        <View className="px-4 mb-10">
          <GritioLogo size="lg" withText={true} />
        </View>

        <View className="space-y-1">
          {renderDrawerItem("today", "Today", "flash")}
          {renderDrawerItem("notes", "Notes", "journal")}
          
          {/* Collapsible Study Paths */}
          <View className="mb-1">
            <TouchableOpacity
              onPress={() => navigation.navigate("study")}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between px-4 py-3 rounded-2xl ${
                state.routeNames[state.index] === "study" ? 'bg-[var(--accent-color)]/10' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="rocket" 
                  size={20} 
                  color={state.routeNames[state.index] === "study" ? colors.accent : colors.textSecondary} 
                />
                <Text className={`ml-4 text-[12px] uppercase font-black tracking-widest ${
                  state.routeNames[state.index] === "study" ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'
                }`}>
                  Study Paths
                </Text>
              </View>
              <TouchableOpacity onPress={toggleStudy} className="p-1">
                <Ionicons 
                  name={isStudyExpanded ? "chevron-down" : "chevron-forward"} 
                  size={14} 
                  color={colors.textSecondary} 
                  style={{ opacity: 0.5 }}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {isStudyExpanded && (
              <View className="overflow-hidden">
                {renderDrawerItem("project-tracker", "Project Tracker", "logo-github", true)}
                {renderDrawerItem("course-tracker", "Course Tracker", "school", true)}
                {renderDrawerItem("media-tracker", "Media Tracker", "play-circle", true)}
                {renderDrawerItem("roadmap-tracker", "Roadmap Tracker", "map", true)}
              </View>
            )}
          </View>

          {renderDrawerItem("checklist", "Checklist", "checkmark-circle")}
          {renderDrawerItem("insights", "Insights", "bar-chart")}
          {renderDrawerItem("settings", "Settings", "settings")}
          {renderDrawerItem("subscriptions", "Plan & Usage", "card")}
          {renderDrawerItem("feedback", "Developer Hub", "people")}
        </View>
      </DrawerContentScrollView>
    </View>
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
          name="insights"
          options={{
            drawerLabel: "Insights",
            headerTitle: "Performance Hub",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
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
          name="study"
          options={{
            drawerLabel: "Study Paths",
            headerTitle: "Growth Hub",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="rocket" size={size} color={color} />
            ),
          }}
        />
        
        {/* Tracker Sub-pages */}
        <Drawer.Screen
          name="project-tracker"
          options={{
            drawerLabel: "  • Project Tracker",
            headerTitle: "Execution OS",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="logo-github" size={size-2} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="course-tracker"
          options={{
            drawerLabel: "  • Course Tracker",
            headerTitle: "Academic OS",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="school" size={size-2} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="media-tracker"
          options={{
            drawerLabel: "  • Media Tracker",
            headerTitle: "Focus Tube",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="play-circle" size={size-2} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="roadmap-tracker"
          options={{
            drawerLabel: "  • Roadmap Tracker",
            headerTitle: "Strategic Maps",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="map" size={size-2} color={color} />
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
        <Drawer.Screen name="dev-settings" options={{ drawerItemStyle: { display: 'none' }, headerTitle: "Diagnostics" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
