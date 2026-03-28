import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API_URL } from '../../lib/api';
import { UserInfo } from '../../App';

interface LoginScreenProps {
  onLogin: (user: UserInfo, token: string) => void;
  onForgotPassword?: () => void;
}

const PRIMARY = '#7370FF';

export default function LoginScreen({
  onLogin,
  onForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Login Failed', data.error || 'Something went wrong.');
        return;
      }
      onLogin(data.user, data.token);
    } catch (err) {
      Alert.alert(
        'Connection Error',
        'Could not reach the server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputBoxStyle = {
    shadowColor: PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E7E7EE',
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* BACKGROUND GRADIENT */}
        <LinearGradient
          colors={['#D8D5FF', 'rgba(255,255,255,0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '60%' }}
        />
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          enableOnAndroid
          extraScrollHeight={18}
          keyboardOpeningTime={220}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="w-full max-w-[360px] items-center">
            <Image
              source={require('../../assets/Buildspherelogo4x.png')}
              style={{ width: 56, height: 56 }}
              resizeMode="contain"
            />
            <Text className="mt-5 text-[22px] font-bold text-[#1E1E1E]">Log In to BuildSphere</Text>

            <View className="mt-10 w-full">
              <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Email</Text>
              <View className="rounded-xl bg-white" style={inputBoxStyle}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#B9B9B9"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="h-[52px] px-4"
                />
              </View>

              <Text className="mb-2 mt-6 text-[12px] font-semibold text-[#2D2D2D]">Password</Text>
              <View className="rounded-xl bg-white" style={inputBoxStyle}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#B9B9B9"
                  secureTextEntry
                  className="h-[52px] px-4"
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="mt-10 h-[52px] items-center justify-center rounded-xl bg-[#7370FF] shadow-lg">
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-[15px] font-semibold text-white">Log In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onForgotPassword} className="mt-6 self-center">
                 <Text className="text-[12px] text-[#B8B8B8]">Forgot Password?</Text>
               </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
  );
}
