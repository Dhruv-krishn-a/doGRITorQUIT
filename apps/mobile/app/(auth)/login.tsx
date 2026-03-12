import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Error', error.message);
    setLoading(false);
    // The AuthProvider will detect the change and auto-redirect
  }

  return (
    <View className="transform-gpu flex-1 justify-center bg-slate-50 px-8">
      <View className="transform-gpu mb-8">
        <Text className="transform-gpu text-3xl font-bold text-slate-900">Welcome Back</Text>
        <Text className="transform-gpu text-slate-500 mt-2">Sign in to continue to your planner</Text>
      </View>

      <View className="transform-gpu space-y-4">
        <View>
          <Text className="transform-gpu text-slate-700 font-medium mb-1">Email</Text>
          <TextInput
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            placeholder="john@example.com"
            className="transform-gpu w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
          />
        </View>

        <View>
          <Text className="transform-gpu text-slate-700 font-medium mb-1">Password</Text>
          <TextInput
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="••••••••"
            className="transform-gpu w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
          />
        </View>

        <TouchableOpacity 
          onPress={signInWithEmail} 
          disabled={loading}
          className="transform-gpu w-full bg-indigo-600 p-4 rounded-xl items-center mt-4"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="transform-gpu text-white font-bold text-lg">Sign In</Text>}
        </TouchableOpacity>

        <View className="transform-gpu flex-row justify-center mt-4">
          <Text className="transform-gpu text-slate-600">Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text className="transform-gpu text-indigo-600 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}