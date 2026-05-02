import './global.css';
import { useState, useEffect } from 'react';
import HomeScreen from './screens/home/HomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { UserRole } from './constants/roles';
import * as Notifications from 'expo-notifications';
import { API_URL } from './lib/api';
import { addNotificationListeners, registerForPushNotificationsAsync } from './lib/notifications';

export interface UserInfo {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  department?: string;
  position?: string;
  accountStatus?: string;
  profilePictureUrl?: string;
  role: UserRole;
}

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingNotificationData, setPendingNotificationData] = useState<Record<string, any> | null>(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Restore session from storage
  useEffect(() => {
    AsyncStorage.getItem('user').then((stored) => {
      if (stored) {
        let parsed = JSON.parse(stored);
        // Normalize snake_case to camelCase for legacy sessions
        if (parsed.first_name && !parsed.firstName) parsed.firstName = parsed.first_name;
        if (parsed.middle_name && !parsed.middleName) parsed.middleName = parsed.middle_name;
        if (parsed.last_name && !parsed.lastName) parsed.lastName = parsed.last_name;
        if (parsed.phone_number && !parsed.phoneNumber) parsed.phoneNumber = parsed.phone_number;
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

  useEffect(() => {
    const cleanup = addNotificationListeners(
      () => {
        // In-app notification received; app can optionally refresh data in child screens.
      },
      (response) => {
        const data = response.notification.request.content.data as Record<string, any> | undefined;
        if (data) setPendingNotificationData(data);
      }
    );

    Notifications.getLastNotificationResponseAsync().then((lastResponse) => {
      const data = lastResponse?.notification?.request?.content?.data as Record<string, any> | undefined;
      if (data) setPendingNotificationData(data);
    });

    return cleanup;
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const syncPushToken = async () => {
      try {
        const expoPushToken = await registerForPushNotificationsAsync();
        if (!expoPushToken) return;

        await fetch(`${API_URL}/api/notifications/register-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            expo_push_token: expoPushToken,
            device_type: Platform.OS === 'ios' ? 'ios' : 'android',
          }),
        });
      } catch (err) {
        console.error('Failed to register push token:', err);
      }
    };

    syncPushToken();
  }, [user?.id]);

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
        <HomeScreen
          user={user}
          onLogout={handleLogout}
          onUserUpdated={handleUserUpdated}
          notificationData={pendingNotificationData}
          onNotificationHandled={() => setPendingNotificationData(null)}
        />
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
