import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';


import * as ImagePicker from 'expo-image-picker';

import { API_URL } from '../../lib/api';
import { UserInfo } from '../../App';
import { hybridGlassAudit } from '../../lib/generative-ai';
import * as FileSystem from 'expo-file-system/legacy';

interface Props {
  visible: boolean;
  user: UserInfo;
  onClose: () => void;
  projects: { id: number; name: string }[];
  initialTask?: any;
}

const PRIMARY = '#7370FF';

// Step 1: Pick photo + basic info
// Step 2: Full photo preview
// Step 3: Form details
// Step 4: Success

export default function UploadSiteProgressScreen({ visible, user, onClose, projects, initialTask }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<number | null>(initialTask?.project_id || null);
  const [taskId, setTaskId] = useState<number | null>(initialTask?.id || null);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [quantityInstalled, setQuantityInstalled] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
  const [shift, setShift] = useState('Morning');
  const [workDate, setWorkDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [glassCount, setGlassCount] = useState<number>(0);


  const reset = () => {
    setStep(1);
    setPhotoUri(null);
    setProjectId(projects[0]?.id || null);
    setTaskId(null);
    setShift('Morning');
    setWorkDate(new Date());
    setQuantityInstalled('');

    setNotes('');
    setGlassCount(0);
    setSaving(false);
  };

  React.useEffect(() => {
    setLoadingTasks(true);
    fetch(`${API_URL}/tasks?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUserTasks(data);
        // Only auto-select first task if no initialTask was provided
        if (!initialTask && data.length > 0) {
          setTaskId(data[0].id);
          setProjectId(data[0].project_id);
        }
      })
      .catch((err) => console.error('Error fetching user tasks:', err))
      .finally(() => setLoadingTasks(false));
  }, [user.id, initialTask]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCountGlass = async () => {
    console.log('DEBUG: handleCountGlass triggered (Hybrid Mode)');
    if (!photoUri) {
      console.log('DEBUG: photoUri is null, returning');
      return;
    }

    setAnalyzing(true);
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: 'base64',
      });

      const filename = photoUri.split('/').pop() || 'photo.jpg';
      const ext = (filename.split('.').pop() || 'jpeg').toLowerCase();
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

      console.log(`DEBUG: Hybrid Analysis starting. Mime: ${mimeType}`);

      // NEW HYBRID FLOW: Roboflow (Count) + Gemini (Summary)
      const { count, summary } = await hybridGlassAudit(base64, mimeType);
      
      console.log(`DEBUG: Hybrid Success! Count: ${count}`);
      
      setGlassCount(count);

      // Append result to notes
      const newNotes = notes
        ? `${notes}\n\nSite Audit Summary: ${summary}`
        : `Site Audit Summary: ${summary}`;
      setNotes(newNotes);

      Alert.alert('Analysis Complete', `Precision Count: ${count} panels.\n\nSummary: ${summary}`);
      setStep(3); // Go to form to see notes
    } catch (error: any) {
      console.error('HYBRID_ANALYSIS_ERROR:', error);
      Alert.alert(
        'AI Error',
        `Failed to perform hybrid audit.\n\nDetail: ${error.message || 'Unknown error'}`
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!projectId || !taskId) {
      Alert.alert('Missing info', 'Please select a project and a task.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('projectId', projectId.toString());
      formData.append('taskId', taskId.toString());
      formData.append('glassCount', glassCount.toString());
      formData.append('shift', shift);
      
      // Use local date string (YYYY-MM-DD) to avoid UTC timezone shifts
      const year = workDate.getFullYear();
      const month = String(workDate.getMonth() + 1).padStart(2, '0');
      const day = String(workDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      formData.append('workDate', formattedDate);
      formData.append('notes', notes);

      formData.append('userId', user.id.toString());


      if (photoUri) {
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${API_URL}/site-progress`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const d = await response.json();
        Alert.alert('Error', d.error || 'Failed to save record.');
        return;
      }

      setStep(4);
    } catch (error) {
      console.error('SAVE_ERROR:', error);
      Alert.alert('Error', 'Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#E7E7EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#FAFAFA',
    fontSize: 14,
    color: '#1E1E1E',
    marginBottom: 12,
  } as const;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        {/* ── STEP 1: Upload photo + quick info ── */}
        {step === 1 && (
          <>

            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-[#F0F0F0] px-5 pb-4 pt-10">
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#1E1E1E" />
              </TouchableOpacity>
              <Text className="text-[16px] font-bold text-[#1E1E1E]">Upload a site progress</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Photo Picker */}
              <TouchableOpacity
                onPress={showPhotoOptions}
                className="mb-6 items-center justify-center rounded-[16px] border-2 border-dashed border-[#D3D0FF] bg-[#F8F7FF]"
                style={{ height: 160 }}>
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={{ width: '100%', height: 160, borderRadius: 14 }}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-[#EAE8FF]">
                      <Ionicons name="camera" size={26} color={PRIMARY} />
                    </View>
                    <Text className="text-[13px] text-[#A3A3A3]">Tap to upload photo</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Task</Text>
              <TouchableOpacity
                onPress={() => setIsTaskModalVisible(true)}
                className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E7EE] bg-[#FAFAFA] px-4"
                style={{ height: 50 }}>
                <Text style={{ color: taskId ? '#1E1E1E' : '#C0C0C0' }}>
                  {loadingTasks ? 'Loading tasks...' : (userTasks.find(t => String(t.id) === String(taskId))?.title || 'Select a task')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#777" />
              </TouchableOpacity>

              {/* Shift Dropdown */}
              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Shift</Text>
              <TouchableOpacity
                onPress={() => setIsShiftModalVisible(true)}
                className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E7EE] bg-[#FAFAFA] px-4"
                style={{ height: 50 }}>
                <Text style={{ color: '#1E1E1E' }}>{shift}</Text>
                <Ionicons name="chevron-down" size={20} color="#777" />
              </TouchableOpacity>

              {/* Date Picker */}
              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Work Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E7EE] bg-[#FAFAFA] px-4"
                style={{ height: 50 }}>
                <Text style={{ color: '#1E1E1E' }}>{workDate.toDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#777" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={workDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setWorkDate(selectedDate);
                  }}
                />
              )}



              {/* Glass Panels Count (Editable) */}
              <View className="mt-8 mb-6 rounded-2xl border border-[#D3D0FF] bg-[#F8F7FF] p-4">

                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#EAE8FF]">
                      <Ionicons name="apps" size={20} color={PRIMARY} />
                    </View>
                    <Text className="text-[14px] font-semibold text-[#1E1E1E]">
                      Glass Panels Count
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between bg-white rounded-xl border border-[#E0E0E0] p-3">
                  <TouchableOpacity 
                    onPress={() => setGlassCount(Math.max(0, glassCount - 1))}
                    className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Ionicons name="remove" size={24} color={PRIMARY} />
                  </TouchableOpacity>
                  
                  <TextInput
                    value={String(glassCount)}
                    onChangeText={(v) => setGlassCount(parseInt(v) || 0)}
                    keyboardType="numeric"
                    className="text-[24px] font-bold text-[#7370FF] text-center"
                    style={{ minWidth: 60 }}
                  />
                  
                  <TouchableOpacity 
                    onPress={() => setGlassCount(glassCount + 1)}
                    className="h-10 w-10 items-center justify-center rounded-full bg-[#7370FF]">
                      <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="mt-2 text-center text-[10px] text-gray-400">Verify and adjust the count above</Text>
              </View>

              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Notes / Comments</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                style={{ ...inputStyle, height: 80, textAlignVertical: 'top', paddingTop: 12 }}
                placeholder="Add comments about progress..."
                placeholderTextColor="#C0C0C0"
                multiline
              />


            </ScrollView>

            {/* Footer Buttons */}
            <View className="flex-row gap-3 border-t border-[#F0F0F0] px-5 pb-10 pt-3">
              <TouchableOpacity
                onPress={handleClose}
                className="h-12 flex-1 items-center justify-center rounded-[14px] border border-[#E0E0E0]">
                <Text className="text-[14px] font-semibold text-[#777]">Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => (photoUri ? setStep(2) : setStep(3))}
                className="h-12 flex-1 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: PRIMARY }}>
                <Text className="text-[14px] font-bold text-white">Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 2: Full Photo Preview ── */}
        {step === 2 && photoUri && (
          <View className="flex-1">
            {/* Back button */}
            <TouchableOpacity
              onPress={() => setStep(1)}
              className="absolute left-5 top-12 z-10 h-9 w-9 items-center justify-center rounded-full bg-white"
              style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}>
              <Ionicons name="chevron-back" size={20} color="#1E1E1E" />
            </TouchableOpacity>
            <Text className="absolute top-14 z-10 self-center text-[16px] font-bold text-[#1E1E1E]">
              Upload Site Progress
            </Text>

            <Image source={{ uri: photoUri }} style={{ flex: 1 }} resizeMode="cover" />

            {/* Add more photos label */}
            <TouchableOpacity
              onPress={showPhotoOptions}
              className="absolute bottom-28 flex-row items-center self-center rounded-full bg-white px-4 py-2"
              style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>
              <Ionicons name="add-circle-outline" size={16} color={PRIMARY} />
              <Text className="ml-1 text-[13px] font-semibold text-[#7370FF]">add more photo</Text>
            </TouchableOpacity>

            <View className="absolute bottom-10 left-5 right-5">
              <TouchableOpacity
                onPress={() => setStep(3)}
                className="h-14 items-center justify-center rounded-[16px]"
                style={{ backgroundColor: PRIMARY }}>
                <Text className="text-[16px] font-bold text-white">Next</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCountGlass}
                disabled={analyzing}
                className="mt-3 h-14 flex-row items-center justify-center rounded-[16px] border-2 border-[#D3D0FF] bg-[#F8F7FF]">
                {analyzing ? (
                  <ActivityIndicator color={PRIMARY} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color={PRIMARY} />
                    <Text className="ml-2 text-[16px] font-bold text-[#7370FF]">
                      Count Glass Panels (AI)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 3: Form Details ── */}
        {step === 3 && (
          <>
            <View className="flex-row items-center border-b border-[#F0F0F0] px-5 pb-4 pt-10">
              <TouchableOpacity onPress={() => setStep(photoUri ? 2 : 1)}>
                <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
              </TouchableOpacity>
              <Text className="ml-3 text-[16px] font-bold text-[#1E1E1E]">
                Upload Site Progress
              </Text>
            </View>

            {/* Mini photo preview if available */}
            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                style={{ width: '100%', height: 200 }}
                resizeMode="cover"
              />
            )}

            <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 40 }}>
              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Task</Text>
              <TouchableOpacity
                onPress={() => setIsTaskModalVisible(true)}
                className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E7EE] bg-[#FAFAFA] px-4"
                style={{ height: 50 }}>
                <Text style={{ color: taskId ? '#1E1E1E' : '#C0C0C0' }}>
                  {loadingTasks ? 'Loading...' : (userTasks.find(t => String(t.id) === String(taskId))?.title || 'Select a task')}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#777" />
              </TouchableOpacity>

              {/* Shift Dropdown */}
              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Shift</Text>
              <TouchableOpacity
                onPress={() => setIsShiftModalVisible(true)}
                className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E7EE] bg-[#FAFAFA] px-4"
                style={{ height: 50 }}>
                <Text style={{ color: '#1E1E1E' }}>{shift}</Text>
                <Ionicons name="chevron-down" size={20} color="#777" />
              </TouchableOpacity>

              {/* Date Picker */}
              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Work Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E7EE] bg-[#FAFAFA] px-4"
                style={{ height: 50 }}>
                <Text style={{ color: '#1E1E1E' }}>{workDate.toDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#777" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={workDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setWorkDate(selectedDate);
                  }}
                />
              )}





              <Text className="mb-1 text-[12px] font-semibold text-[#2D2D2D]">Notes / Comments</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                style={{ ...inputStyle, height: 100, textAlignVertical: 'top', paddingTop: 12 }}
                placeholder="Add comments about progress..."
                placeholderTextColor="#C0C0C0"
                multiline
              />

              {/* Glass Count Display */}
              <View className="mt-8 mb-6 rounded-2xl border border-[#D3D0FF] bg-[#F8F7FF] p-4">

                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#EAE8FF]">
                      <Ionicons name="apps" size={20} color={PRIMARY} />
                    </View>
                    <Text className="text-[14px] font-semibold text-[#1E1E1E]">
                      Glass Panels Count
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between bg-white rounded-xl border border-[#E0E0E0] p-3">
                  <TouchableOpacity 
                    onPress={() => setGlassCount(Math.max(0, glassCount - 1))}
                    className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Ionicons name="remove" size={24} color={PRIMARY} />
                  </TouchableOpacity>
                  
                  <TextInput
                    value={String(glassCount)}
                    onChangeText={(v) => setGlassCount(parseInt(v) || 0)}
                    keyboardType="numeric"
                    className="text-[24px] font-bold text-[#7370FF] text-center"
                    style={{ minWidth: 60 }}
                  />
                  
                  <TouchableOpacity 
                    onPress={() => setGlassCount(glassCount + 1)}
                    className="h-10 w-10 items-center justify-center rounded-full bg-[#7370FF]">
                      <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="mt-2 text-center text-[10px] text-gray-400">Verify and adjust the count above</Text>
              </View>

            </ScrollView>

            <View className="border-t border-[#F0F0F0] px-5 pb-10 pt-3">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="h-14 items-center justify-center rounded-[16px]"
                style={{ backgroundColor: PRIMARY }}>
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-[16px] font-bold text-white">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && (
          <View className="flex-1 items-center justify-center px-8">


            <View
              className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-[#7370FF]"
              style={{
                shadowColor: '#7370FF',
                shadowOpacity: 0.4,
                shadowRadius: 20,
                elevation: 8,
              }}>
              <Ionicons name="checkmark" size={48} color="white" />
            </View>

            <Text className="mb-3 text-center text-[22px] font-bold text-[#1E1E1E]">
              Site progress uploaded!
            </Text>
            <Text className="mb-10 text-center text-[14px] leading-6 text-[#A3A3A3]">
              Photo(s) uploaded and progress recorded successfully.
            </Text>

            <TouchableOpacity
              onPress={handleClose}
              className="h-14 w-full items-center justify-center rounded-[16px]"
              style={{ backgroundColor: PRIMARY }}>
              <Text className="text-[16px] font-bold text-white">Back to home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Task Selection Modal ── */}
      <Modal visible={isTaskModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="h-[60%] w-full rounded-t-[30px] bg-white p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-[#1E1E1E]">Select Task</Text>
              <TouchableOpacity onPress={() => setIsTaskModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1E1E1E" />
              </TouchableOpacity>
            </View>

            {loadingTasks ? (
              <ActivityIndicator color={PRIMARY} />
            ) : userTasks.length === 0 ? (
              <Text className="text-center text-gray-500 py-10">No tasks assigned to you yet.</Text>
            ) : (
              <ScrollView>
                {userTasks.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      setTaskId(t.id);
                      setProjectId(t.project_id);
                      setIsTaskModalVisible(false);
                    }}
                    className="mb-3 flex-row items-center rounded-xl border border-[#F0F0F0] p-4 bg-[#FAFAFA]">
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#EAE8FF]">
                      <Ionicons name="clipboard-outline" size={16} color={PRIMARY} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[14px] font-semibold text-[#1E1E1E]">{t.title}</Text>
                      <Text className="text-[12px] text-gray-500">{t.project || 'No Project'}</Text>
                    </View>
                    {String(taskId) === String(t.id) && (
                      <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Shift Selection Modal ── */}
      <Modal visible={isShiftModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="h-[40%] w-full rounded-t-[30px] bg-white p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-[#1E1E1E]">Select Shift</Text>
              <TouchableOpacity onPress={() => setIsShiftModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1E1E1E" />
              </TouchableOpacity>
            </View>

            {['Morning', 'Afternoon', 'Noon'].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setShift(item);
                  setIsShiftModalVisible(false);
                }}
                className="mb-3 flex-row items-center rounded-xl border border-[#F0F0F0] p-4 bg-[#FAFAFA]">
                <Text className="flex-1 text-[14px] font-semibold text-[#1E1E1E]">{item}</Text>
                {shift === item && <Ionicons name="checkmark-circle" size={20} color={PRIMARY} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

    </Modal>

  );
}
