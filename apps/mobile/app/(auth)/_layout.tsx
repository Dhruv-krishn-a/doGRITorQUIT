import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout() {
  const { session, loading } = useAuth();
  const { theme, colors } = useTheme();
  const themeClass = theme === 'warm-light' ? 'theme-warm-light' : theme === 'dark' ? 'theme-dark' : 'theme-noir';

  if (loading) return null;
  if (session) return <Redirect href="/(drawer)/dashboard" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }} className={themeClass}>
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'fade',
        contentStyle: { backgroundColor: colors.primary }
      }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </View>
  );
}
