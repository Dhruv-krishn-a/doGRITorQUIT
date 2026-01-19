import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Or Lucide if you installed it

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4f46e5' }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }} 
      />
    </Tabs>
  );
}