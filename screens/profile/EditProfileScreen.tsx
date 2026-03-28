import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../lib/api';
import { UserInfo } from '../../App';
import * as FileSystem from 'expo-file-system/legacy';

interface EditProfileScreenProps {
  user: UserInfo;
  onBack: () => void;
  onSaved: (updated: UserInfo) => void;
}

const PRIMARY = '#7370FF';

export default function EditProfileScreen({ user, onBack, onSaved }: EditProfileScreenProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initials = `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();

  // Check if the URL is already an absolute (Supabase) URL
  const getPhotoUri = (url: string | undefined | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const displayImageUri = localImageUri || getPhotoUri(user.profilePictureUrl);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!localImageUri) return user.profilePictureUrl || null;
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = localImageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('photo', {
        uri: localImageUri,
        name: filename,
        type,
      } as any);

      const res = await fetch(`${API_URL}/upload/${user.id}/photo`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        Alert.alert('Upload Error', errorData.error || 'Failed to upload photo.');
        return null;
      }

      const data = await res.json();
      return data.imageUrl; // Backend returns relative path e.g. /uploads/user_1_...jpg
    } catch (err) {
      console.error('UPLOAD_PHOTO_ERROR:', err);
      Alert.alert('Upload Error', 'Could not upload photo.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing info', 'First and last name are required.');
      return;
    }
    setSaving(true);
    try {
      // Upload photo first if changed
      const newPhotoUrl = await uploadPhoto();

      // Save name
      const res = await fetch(`${API_URL}/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          profilePictureUrl: newPhotoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.error);
        return;
      }

      onSaved({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePictureUrl: data.profilePictureUrl || user.profilePictureUrl,
      });
      Alert.alert('Saved!', 'Your profile has been updated.');
      onBack();
    } catch {
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: 'white',
    fontSize: 15,
    color: '#1E1E1E',
  } as const;

  return (
    <View className="flex-1 bg-white">


      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-[#1E1E1E]">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving || uploading}>
          {saving || uploading ? (
            <ActivityIndicator color={PRIMARY} />
          ) : (
            <Text className="text-[15px] font-semibold text-[#7370FF]">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar / Photo Picker */}
        <View className="mb-10 mt-4 items-center">
          <TouchableOpacity onPress={pickImage} className="items-center">
            {displayImageUri ? (
              <Image
                source={{ uri: displayImageUri }}
                style={{ width: 88, height: 88, borderRadius: 44 }}
              />
            ) : (
              <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-[#F0AEDE]">
                <Text className="text-[30px] font-bold text-white">{initials}</Text>
              </View>
            )}
            {/* Camera badge */}
            <View
              className="absolute right-[-2px] top-[60px] h-7 w-7 items-center justify-center rounded-full bg-[#7370FF]"
              style={{ shadowColor: '#7370FF', shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 }}>
              <Ionicons name="camera" size={14} color="white" />
            </View>
            <Text className="mt-4 text-[13px] font-semibold text-[#7370FF]">Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {/* First Name */}
        <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">First Name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          style={inputStyle}
          placeholder="First name"
          placeholderTextColor="#B9B9B9"
        />

        {/* Last Name */}
        <Text className="mb-2 mt-5 text-[12px] font-semibold text-[#2D2D2D]">Last Name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          style={inputStyle}
          placeholder="Last name"
          placeholderTextColor="#B9B9B9"
        />
      </ScrollView>
    </View>
  );
}
