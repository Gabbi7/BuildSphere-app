import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../lib/api';

interface ChangeProjectColorModalProps {
  visible: boolean;
  project: any;
  onClose: () => void;
  onColorUpdated: () => void;
}

export default function ChangeProjectColorModal({
  visible,
  project,
  onClose,
  onColorUpdated,
}: ChangeProjectColorModalProps) {
  const PRESET_COLORS = [
    '#FFDFF2', // New Default
    '#7370FF', '#FF6B6B', '#020202ff', '#FFD93D',
    '#6BCB77', '#4D96FF', '#F94892', '#A0A0A0',
  ];

  const [color, setColor] = useState('#FFDFF2');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project && visible) {
      setColor(project.color || '#FFDFF2');
    }
  }, [project, visible]);

  const validateHex = (hex: string) => {
    return /^#[0-9A-Fa-f]{6}$/i.test(hex);
  };

  const handleSave = async () => {
    let finalColor = color;
    
    // Normalize: if no #, add it
    if (!finalColor.startsWith('#')) {
      finalColor = '#' + finalColor;
    }

    if (!validateHex(finalColor)) {
      Alert.alert('Invalid Color', 'Please enter a valid 6-character HEX code (e.g. #F94892).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/projects/${project.id}/color`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: finalColor }),
      });

      if (res.ok) {
        onColorUpdated();
        onClose();
      } else {
        const errData = await res.json();
        Alert.alert('Error', errData.error || 'Failed to update color.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="w-full rounded-[30px] bg-white p-6 shadow-xl">
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-[#1E1E1E]">Change Color</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#A3A3A3" />
                </TouchableOpacity>
              </View>

              {/* Live Preview */}
              <View className="mb-8 items-center">
                <View 
                  style={{ backgroundColor: validateHex(color.startsWith('#') ? color : '#' + color) ? (color.startsWith('#') ? color : '#' + color) : '#F5F5F7' }}
                  className="h-24 w-full rounded-2xl border border-gray-100 shadow-sm items-center justify-center"
                >
                    <Text 
                        style={{ color: '#000', opacity: 0.5 }}
                        className="text-[12px] font-bold uppercase"
                    >
                        Preview
                    </Text>
                </View>
              </View>

              <Text className="mb-3 text-[14px] font-semibold text-[#1E1E1E]">Presets</Text>
              <View className="mb-6 flex-row flex-wrap justify-between gap-y-3">
                {PRESET_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-10 w-10 items-center justify-center rounded-full border-2 ${color === c ? 'border-gray-900' : 'border-transparent'}`}
                  >
                    {color === c && (
                      <Ionicons name="checkmark" size={20} color={c === '#FFDFF2' || c === '#FFD93D' ? '#000' : 'white'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="mb-3 text-[14px] font-semibold text-[#1E1E1E]">Custom HEX</Text>
              <View className="mb-8 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Text className="mr-2 font-bold text-gray-400">#</Text>
                <TextInput
                  className="flex-1 text-[16px] font-medium text-[#1E1E1E]"
                  placeholder="F94892"
                  value={color.replace('#', '')}
                  onChangeText={(val) => {
                    const clean = val.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    setColor('#' + clean.toUpperCase());
                  }}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 rounded-2xl bg-gray-100 py-4"
                >
                  <Text className="text-center font-bold text-gray-600">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-[#7370FF] py-4"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center font-bold text-white">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
