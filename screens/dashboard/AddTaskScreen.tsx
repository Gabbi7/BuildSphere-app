import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';
import { Picker } from '@react-native-picker/picker';



interface AddTaskScreenProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  projects: { id: number; name: string }[];
  onTaskAdded: () => void;
}

const PRIMARY = '#7370FF';

type Step = 1 | 2 | 'success';

export default function AddTaskScreen({
  visible,
  onClose,
  userId,
  projects,
  onTaskAdded,
}: AddTaskScreenProps) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [dbUsers, setDbUsers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        setDbUsers(data);
        if (data.length > 0) setAssignedTo(data[0].id.toString());
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  // Form Stats
  const [title, setTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects[0]?.id || null);
  const [phase, setPhase] = useState('');
  const [milestone, setMilestone] = useState('');

  // Step 2 Stats
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('High');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shift, setShift] = useState('Morning');

  const handleNext = () => {
    if (!title.trim() || !selectedProjectId) {
      Alert.alert('Missing Info', 'Task Title and Project are required.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!endDate.trim()) {
      Alert.alert('Missing Info', 'Task End Date is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          project_id: selectedProjectId,
          due_date: endDate,
          status: 'pending',
          priority: priority.toLowerCase(),
          user_id: parseInt(assignedTo), // Assign specifically to this user
          description,
          assigned_to: dbUsers.find((u) => u.id === parseInt(assignedTo))?.name || '',
          phase,
          milestone,
          start_date: startDate,
          shift,
        }),
      });

      if (response.ok) {
        setStep('success');
        onTaskAdded();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to add task.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Connection Error', 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setSelectedProjectId(projects[0]?.id || null);
    setMilestone('');
    setDescription('');
    setAssignedTo('');
    setPriority('High');
    setStartDate('');
    setEndDate('');
    setShift('Morning');
  };

  if (step === 'success') {
    return (
      <Modal visible={visible} animationType="fade" transparent={false}>
        <View className="flex-1 items-center justify-center bg-white px-10">
          <View className="mb-10 h-28 w-28 items-center justify-center rounded-full bg-[#7370FF] shadow-xl shadow-[#7370FF]/40">
            <Ionicons name="checkmark" size={60} color="white" />
          </View>
          <Text className="text-center text-[26px] font-bold text-[#1E1E1E]">Task Added.</Text>
          <Text className="mt-4 text-center text-[15px] leading-6 text-[#A3A3A3]">
            Task added. Please Inform the assignee.
          </Text>
          <TouchableOpacity
            onPress={handleFinish}
            className="mt-12 h-[56px] w-full items-center justify-center rounded-[16px] bg-[#7370FF] shadow-lg shadow-[#7370FF]/20">
            <Text className="text-[16px] font-bold text-white">Back to Task</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-[#F5F5F7]">
        <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
          <Text className="flex-1 text-center text-[18px] font-bold text-[#1E1E1E]">
            Add a Task
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="#1E1E1E" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="mb-10 mt-4 rounded-[24px] border border-[#F0F0F0] bg-white p-6 shadow-sm">
            {step === 1 ? (
              <>
                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Task Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Submit shop drawings for approval"
                  className="mb-5 h-[52px] rounded-xl border border-[#F0F0F0] bg-[#F9F9F9] px-4"
                />

                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Project</Text>
                <View className="mb-5 overflow-hidden rounded-xl border border-[#F0F0F0] bg-[#F9F9F9]">
                  <Picker
                    selectedValue={selectedProjectId}
                    onValueChange={(v) => setSelectedProjectId(v)}
                    style={{ height: 52 }}>
                    {projects.map((p) => (
                      <Picker.Item key={p.id} label={p.name} value={p.id} />
                    ))}
                  </Picker>
                </View>

                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Phase</Text>
                <View className="mb-5 overflow-hidden rounded-xl border border-[#F0F0F0] bg-[#F9F9F9]">
                  <Picker
                    selectedValue={phase}
                    onValueChange={(v) => setPhase(v)}
                    style={{ height: 52 }}>
                    <Picker.Item label="Premilinary" value="Premilinary" />
                    <Picker.Item label="Construction" value="Construction" />
                    <Picker.Item label="Finishing" value="Finishing" />
                  </Picker>
                </View>

                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Milestone</Text>
                <View className="mb-10 overflow-hidden rounded-xl border border-[#F0F0F0] bg-[#F9F9F9]">
                  <Picker
                    selectedValue={milestone}
                    onValueChange={(v) => setMilestone(v)}
                    style={{ height: 52 }}>
                    <Picker.Item label="Shop Drawings" value="Shop Drawings" />
                    <Picker.Item label="Foundation" value="Foundation" />
                    <Picker.Item label="Glass Installation" value="Glass Installation" />
                  </Picker>
                </View>

                <TouchableOpacity
                  onPress={handleNext}
                  className="h-[52px] items-center justify-center rounded-xl bg-[#7370FF]">
                  <Text className="text-[15px] font-bold text-white">Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">
                  Task Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Submit the complete shop drawings..."
                  multiline
                  className="mb-5 h-[80px] rounded-xl border border-[#F0F0F0] bg-[#F9F9F9] px-4 py-3"
                />

                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Assigned to</Text>
                <View className="mb-5 overflow-hidden rounded-xl border border-[#F0F0F0] bg-[#F9F9F9]">
                  <Picker
                    selectedValue={assignedTo}
                    onValueChange={(v) => setAssignedTo(v)}
                    style={{ height: 52 }}>
                    {dbUsers.map((u) => (
                      <Picker.Item key={u.id} label={u.name} value={u.id.toString()} />
                    ))}
                  </Picker>
                </View>

                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">
                  Priority Level
                </Text>
                <View className="mb-5 overflow-hidden rounded-xl border border-[#F0F0F0] bg-[#F9F9F9]">
                  <Picker
                    selectedValue={priority}
                    onValueChange={(v) => setPriority(v)}
                    style={{ height: 52 }}>
                    <Picker.Item label="High" value="High" />
                    <Picker.Item label="Medium" value="Medium" />
                    <Picker.Item label="Low" value="Low" />
                  </Picker>
                </View>

                <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">
                  Shift
                </Text>
                <View className="mb-5 overflow-hidden rounded-xl border border-[#F0F0F0] bg-[#F9F9F9]">
                  <Picker
                    selectedValue={shift}
                    onValueChange={(v) => setShift(v)}
                    style={{ height: 52 }}>
                    <Picker.Item label="Morning" value="Morning" />
                    <Picker.Item label="Noon" value="Noon" />
                    <Picker.Item label="Afternoon" value="Afternoon" />
                  </Picker>
                </View>

                <View className="mb-10 flex-row justify-between">
                  <View style={{ width: '48%' }}>
                    <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">
                      Task Start
                    </Text>
                    <View className="h-[52px] flex-row items-center justify-between rounded-xl border border-[#F0F0F0] bg-[#F9F9F9] px-4">
                      <TextInput
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="02/11/2026"
                        className="flex-1 text-[13px]"
                      />
                      <Ionicons name="calendar-outline" size={18} color="#A3A3A3" />
                    </View>
                  </View>
                  <View style={{ width: '48%' }}>
                    <Text className="mb-2 text-[12px] font-semibold text-[#2D2D2D]">Task End</Text>
                    <View className="h-[52px] flex-row items-center justify-between rounded-xl border border-[#F0F0F0] bg-[#F9F9F9] px-4">
                      <TextInput
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="02/18/2026"
                        className="flex-1 text-[13px]"
                      />
                      <Ionicons name="calendar-outline" size={18} color="#A3A3A3" />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="h-[52px] items-center justify-center rounded-xl bg-[#7370FF]">
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-[15px] font-bold text-white">Submit</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)} className="mt-4 items-center">
                  <Text className="text-[14px] text-[#A3A3A3]">Back to Step 1</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
