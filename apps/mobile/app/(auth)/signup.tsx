import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="transform-gpu flex-1 justify-center bg-slate-50 px-8">
      <View className="transform-gpu mb-8">
        <Text className="transform-gpu text-3xl font-bold text-slate-900">Create Account</Text>
        <Text className="transform-gpu text-slate-500 mt-2">Start organizing your life today</Text>
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
          onPress={signUpWithEmail} 
          disabled={loading}
          className="transform-gpu w-full bg-indigo-600 p-4 rounded-xl items-center mt-4"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="transform-gpu text-white font-bold text-lg">Sign Up</Text>}
        </TouchableOpacity>

        <View className="transform-gpu flex-row justify-center mt-4">
          <Text className="transform-gpu text-slate-600">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="transform-gpu text-indigo-600 font-bold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}