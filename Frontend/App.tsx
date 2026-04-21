import './global.css';
import { useState, useEffect } from 'react';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import LoginScreen from './screens/auth/LoginScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { UserRole } from './constants/roles';

export interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  role: UserRole;
}

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Restore session from storage
  useEffect(() => {
    AsyncStorage.getItem('user').then((stored) => {
      if (stored) {
        let parsed = JSON.parse(stored);
        // Normalize snake_case to camelCase for legacy sessions
        if (parsed.first_name && !parsed.firstName) parsed.firstName = parsed.first_name;
        if (parsed.last_name && !parsed.lastName) parsed.lastName = parsed.last_name;
        // Default role for legacy sessions
        if (!parsed.role) parsed.role = 'general_staff';
        setUser(parsed);
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = async (loggedInUser: UserInfo, token: string) => {
    await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
    await AsyncStorage.setItem('token', token);
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const handleUserUpdated = async (updated: UserInfo) => {
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7370FF" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <DashboardScreen user={user} onLogout={handleLogout} onUserUpdated={handleUserUpdated} />
      </SafeAreaProvider>
    );
  }


  if (showForgotPassword) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ForgotPasswordScreen onBackToLogin={() => setShowForgotPassword(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LoginScreen onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
    </SafeAreaProvider>
  );
}
