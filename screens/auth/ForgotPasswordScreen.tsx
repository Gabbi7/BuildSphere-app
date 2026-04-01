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

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

const PRIMARY = '#7370FF';

export default function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert('Missing info', 'Please enter your email address.');
      return;
    }
    // Simulate API call for password reset
    Alert.alert(
      'Reset Link Sent',
      'If an account exists with this email, you will receive a password reset link shortly.',
      [{ text: 'OK', onPress: onBackToLogin }]
    );
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            <Text className="mt-5 text-[22px] font-bold text-[#1E1E1E]">Reset Password</Text>
            <View className="mt-2 flex-row items-center">
              <Text className="text-[12.5px] text-[#A3A3A3]">Remember your password? </Text>
              <TouchableOpacity onPress={onBackToLogin} activeOpacity={0.8}>
                <Text className="text-[12.5px] font-semibold text-[#7370FF]">Log In</Text>
              </TouchableOpacity>
            </View>

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

              <TouchableOpacity
                onPress={handleResetPassword}
                activeOpacity={0.9}
                className="mt-10 h-[52px] items-center justify-center rounded-xl bg-[#7370FF] shadow-lg">
                <Text className="text-[15px] font-semibold text-white">Send Reset Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}
