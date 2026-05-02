import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
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
  const [profile, setProfile] = useState<UserInfo>(user);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`${API_URL}/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Profile fetch failed:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user.id]);

  const firstName = profile.firstName || '';
  const middleName = profile.middleName || '';
  const lastName = profile.lastName || '';
  const suffix = profile.suffix || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const photoUri = profile.profilePictureUrl
    ? profile.profilePictureUrl.startsWith('http')
      ? profile.profilePictureUrl
      : `${API_URL}${profile.profilePictureUrl}`
    : null;

  const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
  const age =
    profile.birthdate
      ? Math.max(
          0,
          new Date().getFullYear() - new Date(profile.birthdate).getFullYear() -
            (new Date().getMonth() < new Date(profile.birthdate).getMonth() ||
            (new Date().getMonth() === new Date(profile.birthdate).getMonth() &&
              new Date().getDate() < new Date(profile.birthdate).getDate())
              ? 1
              : 0)
        )
      : null;

  if (screen === 'editProfile') {
    return (
      <EditProfileScreen
        user={profile}
        onBack={() => setScreen('more')}
        onSaved={(updated) => {
          setProfile(updated);
          onUserUpdated(updated);
          setScreen('more');
        }}
      />
    );
  }

  if (screen === 'editAccount') {
    return (
      <EditAccountScreen
        user={profile}
        onBack={() => setScreen('more')}
        onSaved={(updated) => {
          setProfile(updated);
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

          {loadingProfile && <ActivityIndicator className="mt-2" color="#7370FF" />}
          <Text className="mt-4 text-[20px] font-bold text-[#1E1E1E]">{fullName || 'Unnamed User'}</Text>
          <Text className="mt-1 text-[13px] text-[#A3A3A3]">{profile.email}</Text>
          <Text className="mt-1 text-[12px] uppercase text-[#7D7D7D]">{profile.role || 'staff'}</Text>

          <TouchableOpacity onPress={() => setScreen('editProfile')} className="mt-2">
            <Text className="text-[13px] font-semibold text-[#7370FF]">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6 rounded-2xl border border-[#F0F0F0] bg-white p-4">
          <Text className="mb-3 text-[14px] font-bold text-[#1E1E1E]">Profile Information</Text>
          <Text className="mb-1 text-[13px] text-[#666]">Phone: {profile.phoneNumber || 'Not set'}</Text>
          <Text className="mb-1 text-[13px] text-[#666]">Gender: {profile.gender || 'Not set'}</Text>
          <Text className="mb-1 text-[13px] text-[#666]">
            Birthdate: {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : 'Not set'}
          </Text>
          <Text className="mb-1 text-[13px] text-[#666]">Age: {age !== null ? age : 'Not set'}</Text>
          <Text className="mb-1 text-[13px] text-[#666]">Department: {profile.department || 'Not set'}</Text>
          <Text className="mb-1 text-[13px] text-[#666]">Position: {profile.position || 'Not set'}</Text>
          <Text className="mb-1 text-[13px] text-[#666]">Address: {profile.address || 'Not set'}</Text>
          <Text className="text-[13px] text-[#666]">Status: {profile.accountStatus || 'active'}</Text>
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

          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to log out of BuildSphere?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: onLogout },
                ]
              );
            }} 
            className="flex-row items-center px-5 py-4">
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
