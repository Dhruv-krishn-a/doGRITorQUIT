import 'react-native-url-polyfill/auto'; // MUST be at the top
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert, Platform, Button 
} from 'react-native';import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// ---------------------------------------------------------
// 1. Types (Ideally import { Plan } from '@planner/db')
// ---------------------------------------------------------
type Plan = {
  id: string;
  title: string;
  status: string; // 'pending' | 'completed' | 'archived'
  createdAt: string;
};

// ---------------------------------------------------------
// 2. Configuration
// ---------------------------------------------------------
// Replace 192.168.29.223 with your computer's IP found via 'ifconfig' or 'ipconfig'
const HOST_IP = "localhost"; 
const API_URL = Platform.OS === 'android' 
  ? `http://${HOST_IP}:3000/api/v1/plans` 
  : `http://localhost:3000/api/v1/plans`;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check generic auth status on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Router: If logged in, show Plans. If not, show Login.
  return (
    <SafeAreaView style={styles.container}>
      {session && session.user ? (
        <PlansScreen session={session} />
      ) : (
        <LoginScreen />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------
// 3. Login Screen Component
// ---------------------------------------------------------
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("Login Failed", error.message);
    setLoading(false);
  }

  return (
    <View style={styles.authContainer}>
      <View style={styles.headerContainer}>
        <Ionicons name="planet" size={60} color="#4F46E5" />
        <Text style={styles.title}>Planner AI</Text>
        <Text style={styles.subtitle}>Sign in to view your plans</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          autoCapitalize="none"
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={signInWithEmail} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------
// 4. Plans List Component
// ---------------------------------------------------------
function PlansScreen({ session }: { session: Session }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPlans() {
    setFetching(true);
    setError(null);
    try {
      console.log("Fetching from:", API_URL);
      
      // 1. Get the latest token
      const { access_token } = session;

      // 2. Fetch from Next.js API with Auth Header
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}` // Crucial for security
        }
      });

      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(text || `Server responded with ${response.status}`);
      }

      // 3. Parse and set data
      const data = JSON.parse(text);
      setPlans(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Fetch error:", msg);
      setError(msg);
    } finally {
      setFetching(false);
    }
  }

  // Load plans when screen mounts
  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.navBar}>
        <Text style={styles.navTitle}>My Plans</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load plans</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <Button title="Retry" onPress={fetchPlans} />
        </View>
      )}

      {/* List */}
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        refreshing={fetching}
        onRefresh={fetchPlans}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !fetching && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No plans found.</Text>
              <Text style={styles.emptySubText}>Create one on the web app!</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardDate}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Helper for status colors
function StatusBadge({ status }: { status: string }) {
  let bg = "#e2e8f0"; // gray
  let text = "#475569";
  
  if (status === 'completed') { bg = "#dcfce7"; text = "#166534"; }
  else if (status === 'pending') { bg = "#e0e7ff"; text = "#4338ca"; }
  else if (status === 'archived') { bg = "#f1f5f9"; text = "#94a3b8"; }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
}

// ---------------------------------------------------------
// 5. Styles
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Auth Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 5,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // App Styles
  screenContainer: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cardDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  errorBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: {
    color: '#991b1b',
    fontWeight: 'bold',
  },
  errorSubText: {
    color: '#b91c1c',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  }
});