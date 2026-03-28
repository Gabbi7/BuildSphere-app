import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserInfo } from '../../App';
import EditProfileScreen from './EditProfileScreen';
import EditAccountScreen from './EditAccountScreen';
import { API_URL } from '../../lib/api';

interface MoreScreenProps {
  user: UserInfo;
  onLogout: () => void;
  onUserUpdated: (updated: UserInfo) => void;
}

export default function MoreScreen({ user, onLogout, onUserUpdated }: MoreScreenProps) {
  const [screen, setScreen] = useState<'more' | 'editProfile' | 'editAccount'>('more');

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const photoUri = user.profilePictureUrl
    ? user.profilePictureUrl.startsWith('http')
      ? user.profilePictureUrl
      : `${API_URL}${user.profilePictureUrl}`
    : null;

  if (screen === 'editProfile') {
    return (
      <EditProfileScreen
        user={user}
        onBack={() => setScreen('more')}
        onSaved={(updated) => {
          onUserUpdated(updated);
          setScreen('more');
        }}
      />
    );
  }

  if (screen === 'editAccount') {
    return (
      <EditAccountScreen
        user={user}
        onBack={() => setScreen('more')}
        onSaved={(updated) => {
          onUserUpdated(updated);
          setScreen('more');
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-14" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Avatar + Name */}
        <View className="mb-10 mt-6 items-center">
          {/* Avatar */}
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}
            />
          ) : (
            <View
              className="h-20 w-20 items-center justify-center rounded-full bg-[#F0AEDE]"
              style={{
                shadowColor: '#F0AEDE',
                shadowOpacity: 0.5,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}>
              <Text className="text-[28px] font-bold text-white">{initials}</Text>
            </View>
          )}

          <Text className="mt-4 text-[20px] font-bold text-[#1E1E1E]">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="mt-1 text-[13px] text-[#A3A3A3]">{user.email}</Text>

          <TouchableOpacity onPress={() => setScreen('editProfile')} className="mt-2">
            <Text className="text-[13px] font-semibold text-[#7370FF]">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View
          className="overflow-hidden rounded-2xl border border-[#F0F0F0] bg-white"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
          <TouchableOpacity
            onPress={() => setScreen('editAccount')}
            className="flex-row items-center justify-between border-b border-[#F5F5F5] px-5 py-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#EAE8FF]">
                <Ionicons name="person-circle-outline" size={18} color="#7370FF" />
              </View>
              <Text className="text-[15px] font-medium text-[#1E1E1E]">Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C0C0C0" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} className="flex-row items-center px-5 py-4">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#FFE8E8]">
              <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
            </View>
            <Text className="text-[15px] font-medium text-[#FF6B6B]">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
