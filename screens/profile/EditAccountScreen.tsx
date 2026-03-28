import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { API_URL } from '../../lib/api';
import { UserInfo } from '../../App';

interface EditAccountScreenProps {
  user: UserInfo;
  onBack: () => void;
  onSaved: (updated: UserInfo) => void;
}

const PRIMARY = '#7370FF';

export default function EditAccountScreen({ user, onBack, onSaved }: EditAccountScreenProps) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Missing info', 'Email is required.');
      return;
    }
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const body: any = { email };
      if (password) body.password = password;

      const res = await fetch(`${API_URL}/users/${user.id}/account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.error);
        return;
      }
      onSaved({ ...user, email });
      Alert.alert('Saved!', 'Your account has been updated.');
      onBack();
    } catch {
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#E7E7EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: 'white',
    fontSize: 15,
    color: '#1E1E1E',
    marginBottom: 12,
  } as const;

  const focusedStyle = {
    ...inputStyle,
    borderColor: PRIMARY,
  } as const;

  return (
    <View className="flex-1 bg-white">


      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-[#1E1E1E]">Edit Account</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={PRIMARY} />
          ) : (
            <Text className="text-[15px] font-semibold text-[#7370FF]">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="mt-4 flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={focusedStyle}
          placeholder="Email address"
          placeholderTextColor="#B9B9B9"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="mb-2 mt-3 text-[12px] font-semibold text-[#2D2D2D]">
          New Password{' '}
          <Text className="font-normal text-[#B9B9B9]">(leave blank to keep current)</Text>
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={inputStyle}
          placeholder="Password"
          placeholderTextColor="#B9B9B9"
          secureTextEntry
        />

        <Text className="mb-2 mt-3 text-[12px] font-semibold text-[#2D2D2D]">Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={inputStyle}
          placeholder="Confirm Password"
          placeholderTextColor="#B9B9B9"
          secureTextEntry
        />
      </ScrollView>
    </View>
  );
}
