import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useRef } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { getPermissions, type UserRole } from '../../constants/roles';
import { API_URL } from '../../lib/api';


interface TaskDetailScreenProps {
  visible: boolean;
  task: any;
  onClose: () => void;
  userRole?: UserRole;
  onViewInventory?: (projectId: number) => void;
  onNavigate?: (tab: 'home' | 'mywork' | 'notifications' | 'more') => void;
  onAddProgress?: (task: any) => void;
  onAddTask?: () => void;
}


interface Comment {
  id: number;
  user: string;
  initials: string;
  text: string;
  avatarBg: string;
  avatarText: string;
}

const PRIMARY = '#7370FF';

export default function TaskDetailScreen({
  visible,
  task,
  onClose,
  userRole,
  onViewInventory,
  onNavigate,
  onAddProgress,
  onAddTask
}: TaskDetailScreenProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const [currentShift, setCurrentShift] = useState(task?.shift || 'Morning');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task?.status || 'pending');
  const [showStatusModal, setShowStatusModal] = useState(false);


  useEffect(() => {
    if (task?.shift) {
      setCurrentShift(task.shift);
    } else {
      setCurrentShift('Morning');
    }
    if (task?.status) {
      setCurrentStatus(task.status);
    }
  }, [task?.id, task?.shift, task?.status]);

  useEffect(() => {
    if (visible && task?.id) {
      setLoadingHistory(true);
      fetch(`${API_URL}/tasks/${task.id}/progress`)
        .then(res => res.json())
        .then(data => {
          setHistory(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error('Fetch History Error:', err))
        .finally(() => setLoadingHistory(false));
    }
  }, [visible, task?.id]);

  if (!task) return null;
  const perms = getPermissions(userRole);


  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'todo':
        return { bg: '#FFEBEB', text: '#FF6B6B', label: 'To Do' };
      case 'in-progress':
      case 'in progress':
      case 'in_progress':
        return { bg: '#EAE8FF', text: '#7370FF', label: 'In Progress' };
      case 'to-review':
      case 'in review':
      case 'in-review':
      case 'in_review':
        return { bg: '#FFF4E5', text: '#FF9800', label: 'In Review' };
      case 'completed':
        return { bg: '#E8F5E9', text: '#4CAF50', label: 'Completed' };
      default:
        return { bg: '#F5F5F5', text: '#757575', label: status || 'To Do' };
    }
  };

  const statusStyle = getStatusStyle(task.status);
  const comments: Comment[] = [];
  const priorityColor = task.priority?.toLowerCase() === 'high' ? '#FF6B6B' : '#FFA500';

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnim, { toValue, useNativeDriver: true, friction: 6 }).start();
    setFabOpen(!fabOpen);
  };

  const FAB_ACTIONS = [
    { label: 'Add new task', icon: 'add-circle-outline', key: 'task' },
    { label: 'Update inventory', icon: 'cube-outline', key: 'inventory' },
    { label: 'Upload Site Progress', icon: 'cloud-upload-outline', key: 'site' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center px-5 pb-4 pt-12">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Ionicons name="chevron-back" size={32} color="#1E1E1E" />
          </TouchableOpacity>
          <Text className="text-[32px] font-bold text-[#7370FF]">Task Details</Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Status & Title Card */}
          <View
            className="mb-8 rounded-[24px] border border-[#F0F0F0] bg-white p-6"
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="mr-4 flex-1 text-[20px] font-bold text-[#1E1E1E]">{task.title}</Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(true)}
                className="rounded-full px-5 py-2 flex-row items-center"
                style={{ backgroundColor: getStatusStyle(currentStatus).bg }}>
                <Text
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: getStatusStyle(currentStatus).text }}>
                  {getStatusStyle(currentStatus).label}
                </Text>
                <Ionicons name="chevron-down" size={12} color={getStatusStyle(currentStatus).text} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
            <Text className="text-[14px] leading-6 text-[#A3A3A3]">
              {task.description ||
                'The task involves technical drawings and layouts required for the initial construction phase. Please ensure all details are accurate and adhere to project standards.'}
            </Text>
          </View>

          {/* Metadata Grid */}
          <View className="mb-8">
            {/* Row 1: Phase, Milestone, Priority */}
            <View className="mb-6 flex-row">
              <View className="flex-1">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Phase</Text>
                <Text className="text-[15px] font-bold text-[#1E1E1E]">
                  {task.phase || 'Phase 1'}
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Milestone</Text>
                <Text className="text-[15px] font-bold text-[#1E1E1E]">
                  {task.milestone || 'Milestone 1'}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Priority</Text>
                <Text className="text-[15px] font-bold" style={{ color: priorityColor }}>
                  {task.priority || 'High'}
                </Text>
              </View>
            </View>

            {/* Row 2: Dates */}
            <View className="mb-6 flex-row">
              <View className="flex-1">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Start Date</Text>
                <Text className="text-[15px] font-bold text-[#1E1E1E]">
                  {task.start_date ? new Date(task.start_date).toLocaleDateString() : '01/31/2026'}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">End Date</Text>
                <Text className="text-[15px] font-bold text-[#1E1E1E]">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : '02/28/2026'}
                </Text>
              </View>
            </View>

            {/* Row 3: Shift/Time of Day — Tappable */}
            <View className="flex-row">
              <TouchableOpacity className="flex-1" onPress={() => setShowShiftModal(true)}>
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Shift</Text>
                <View className="flex-row items-center rounded-lg bg-[#F8F7FF] px-3 py-2 self-start border border-[#E8E6FF]">
                  <Ionicons
                    name={
                      currentShift.toLowerCase() === 'afternoon' ? 'partly-sunny-outline' :
                        currentShift.toLowerCase() === 'noon' ? 'sunny-outline' :
                          'partly-sunny-outline'
                    }
                    size={16}
                    color={PRIMARY}
                  />
                  <Text className="ml-1.5 text-[15px] font-bold text-[#1E1E1E]">
                    {currentShift}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#A3A3A3" style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
            </View>

          </View>

          {/* Progress History Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[14px] font-bold text-[#A3A3A3] uppercase tracking-widest">
                Progress History ({history.length})
              </Text>
            </View>

            {loadingHistory ? (
              <ActivityIndicator color={PRIMARY} />
            ) : history.filter(item => !currentShift || item.shift === currentShift).length === 0 ? (
              <View className="items-center justify-center py-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                <Text className="text-[12px] text-gray-400">No {currentShift} progress recorded yet.</Text>
              </View>
            ) : (
              history
                .filter(item => !currentShift || item.shift === currentShift)
                .map((item, idx, filteredArr) => (
                  <View
                    key={item.id}
                    className="mb-4 rounded-2xl bg-[#FAFBFF] border border-[#F0F2FF] p-4"
                    style={{ position: 'relative' }}>
                    
                    {/* Timeline Line */}
                    {idx < filteredArr.length - 1 && (
                    <View
                      style={{
                        position: 'absolute',
                        left: 17,
                        top: 40,
                        bottom: -20,
                        width: 1,
                        backgroundColor: '#E0E0E0',
                        zIndex: -1
                      }}
                    />
                  )}

                  <View className="flex-row items-start">
                    {/* Status Dot */}
                    <View className={`h-2.5 w-2.5 rounded-full mt-1.5 mr-3 ${idx === 0 ? 'bg-[#7370FF]' : 'bg-[#D1D1D1]'}`} />

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <View className="h-8 w-8 items-center justify-center rounded-full bg-[#7370FF] mr-2">
                            <Text className="text-[10px] font-bold text-white">
                              {item.first_name?.[0]}{item.last_name?.[0]}
                            </Text>
                          </View>
                          <Text className="text-[14px] font-bold text-[#1E1E1E]">
                            {item.first_name} {item.last_name}
                          </Text>
                          <View className="ml-2 bg-[#E8FBF2] px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-bold text-[#27AE60]">
                              + {item.quantity_accomplished} units
                            </Text>
                          </View>
                          {item.shift && (
                            <View className="ml-2 bg-[#F0F2FF] px-2 py-0.5 rounded-full border border-[#D0D7FF]">
                              <Text className="text-[10px] font-bold text-[#7370FF]">
                                {item.shift}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="time-outline" size={14} color="#1E1E1E" />
                          <Text className="ml-1 text-[10px] font-medium text-[#A3A3A3]">
                            {item.created_at 
                              ? `${new Date(item.created_at).toLocaleDateString([], { month: 'numeric', day: 'numeric' })} @ ${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                              : 'Log'}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedHistoryItem(item);
                              setShowActionMenu(true);
                            }}
                            className="ml-2">
                            <Ionicons name="ellipsis-vertical" size={14} color="#1E1E1E" />
                          </TouchableOpacity>
                        </View>

                      </View>

                      <Text className="text-[12px] leading-5 text-[#666] mb-3">
                        {item.remarks || "Site update recorded successfully."}
                      </Text>

                      {item.evidence_image_path && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedImage(item.evidence_image_path);
                            setShowImageModal(true);
                          }}
                          className="flex-row items-center bg-[#F0F2FF] rounded-lg p-1.5 self-start pr-4">
                          <Image
                            source={{ uri: item.evidence_image_path }}
                            className="h-10 w-10 rounded-md bg-gray-200 mr-2"
                            resizeMode="cover"
                          />
                          <Ionicons name="image-outline" size={14} color={PRIMARY} />
                          <Text className="ml-1 text-[11px] font-bold text-[#7370FF]">View Photo</Text>
                        </TouchableOpacity>
                      )}

                    </View>
                  </View>
                </View>
              ))
            )}
          </View>



          {/* RBAC: Audit Inventory Link for Accounting/Engr */}
          {perms.canViewInventory && (
            <View className="mb-8">
              <Text className="mb-4 text-[18px] font-bold text-[#1E1E1E]">Project Oversight</Text>
              <TouchableOpacity
                onPress={() => onViewInventory && onViewInventory(task.project_id)}
                className="h-[60px] w-full flex-row items-center justify-center rounded-[16px] bg-[#7370FF]">
                <Ionicons name="cube-outline" size={24} color="white" />
                <Text className="ml-3 font-bold text-white">Audit Project Inventory</Text>
              </TouchableOpacity>
              <Text className="mt-2 text-center text-[12px] italic text-[#A3A3A3]">
                Verification access for project materials & budgets.
              </Text>
            </View>
          )}

          {/* Comments Section */}
          <View className="mb-10 rounded-[24px] border border-[#EDECFF] bg-[#F6F6FF] p-6">
            <Text className="mb-6 text-[18px] font-bold text-[#1E1E1E]">Comments</Text>

            {comments.map((comment, index) => (
              <View
                key={comment.id}
                className={`flex-row items-center ${index !== comments.length - 1 ? 'mb-6' : ''}`}>
                <View
                  className="mr-4 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: comment.avatarBg }}>
                  <Text className="text-[12px] font-bold" style={{ color: comment.avatarText }}>
                    {comment.initials}
                  </Text>
                </View>
                <Text className="flex-1 text-[15px] font-medium text-[#1E1E1E]">
                  {comment.text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation Mimic */}
        <View className="h-[90px] flex-row items-center justify-between border-t border-[#F5F5F7] px-10 pb-4">
          {perms.canViewDashboard && (
            <TouchableOpacity
              onPress={() => onNavigate && onNavigate('home')}
              className="items-center">
              <Ionicons name="home-outline" size={24} color="#9A9A9A" />
              <Text className="mt-1 text-[10px] text-[#9A9A9A]">Home</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('mywork')}
            className="items-center">
            <View className="mb-1 h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F0F0]">
              <Ionicons name="briefcase" size={24} color="#7370FF" />
            </View>
            <Text className="text-[10px] font-bold text-[#7370FF]">My work</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('notifications')}
            className="items-center">
            <Ionicons name="notifications-outline" size={24} color="#9A9A9A" />
            <Text className="mt-1 text-[10px] text-[#9A9A9A]">Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigate && onNavigate('more')}
            className="items-center">
            <Ionicons name="ellipsis-horizontal-outline" size={24} color="#9A9A9A" />
            <Text className="mt-1 text-[10px] text-[#9A9A9A]">More</Text>
          </TouchableOpacity>
        </View>

        {/* FAB Backdrop */}
        {fabOpen && (
          <TouchableOpacity
            className="absolute inset-0 z-20"
            onPress={toggleFab}
            activeOpacity={1}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
          />
        )}

        {/* FAB Menu Items */}
        {fabOpen && (
          <View className="absolute bottom-[160px] right-5 items-end z-30">
            {FAB_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.label}
                style={{
                  opacity: fabAnim,
                  transform: [
                    {
                      translateY: fabAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (FAB_ACTIONS.length - index), 0],
                      }),
                    },
                  ],
                  marginBottom: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    toggleFab();
                    if (action.key === 'site' && onAddProgress) onAddProgress(task);
                    if (action.key === 'inventory' && onViewInventory) onViewInventory(task.project_id);
                    if (action.key === 'task' && onAddTask) onAddTask();
                  }}
                  className="flex-row items-center rounded-[14px] bg-white px-4 py-3"
                  style={{
                    shadowColor: '#7370FF',
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                  }}>
                  <Text className="mr-3 text-[14px] font-medium text-[#1E1E1E]">
                    {action.label}
                  </Text>
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAE8FF]">
                    <Ionicons name={action.icon as any} size={15} color="#7370FF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Floating Action Button (+) */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="z-40"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 110, // Just above the bottom nav mimic
            backgroundColor: PRIMARY,
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: PRIMARY,
            shadowOffset: { width: 0, height: 9 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
          onPress={toggleFab}>
          <Animated.View style={{
            transform: [{
              rotate: fabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
              })
            }]
          }}>
            <Ionicons name="add" size={28} color="white" />
          </Animated.View>
        </TouchableOpacity>

      </View>

      {/* Image Viewer Modal */}
      <Modal visible={showImageModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center">
          <TouchableOpacity
            onPress={() => setShowImageModal(false)}
            className="absolute top-12 right-6 z-10">
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-[70%]"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Action Menu Modal */}
      <Modal visible={showActionMenu} transparent={true} animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
          className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[30px] p-6 pb-12">
            <View className="h-1 w-10 bg-gray-300 self-center rounded-full mb-6" />
            <Text className="text-center text-[16px] font-bold text-[#1E1E1E] mb-6">Log Options</Text>

            <TouchableOpacity className="flex-row items-center py-4 border-b border-gray-50">
              <Ionicons name="create-outline" size={22} color="#7370FF" />
              <Text className="ml-4 text-[16px] text-[#2D2D2D]">Edit Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert("Delete History", "Are you sure you want to remove this progress log?");
                setShowActionMenu(false);
              }}
              className="flex-row items-center py-4">
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <Text className="ml-4 text-[16px] text-[#FF6B6B] font-semibold">Delete Entry</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Shift Selection Modal */}
      <Modal visible={showShiftModal} transparent={true} animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowShiftModal(false)}
          className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[30px] p-6 pb-12">
            <View className="h-1 w-10 bg-gray-300 self-center rounded-full mb-6" />
            <Text className="text-center text-[18px] font-bold text-[#1E1E1E] mb-6">Select Shift</Text>

            {[
              { label: 'Morning', icon: 'partly-sunny-outline' as const, desc: '6:00 AM - 12:00 PM' },
              { label: 'Noon', icon: 'sunny-outline' as const, desc: '12:00 PM - 2:00 PM' },
              { label: 'Afternoon', icon: 'partly-sunny-outline' as const, desc: '2:00 PM - 6:00 PM' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={async () => {
                  setCurrentShift(item.label);
                  setShowShiftModal(false);
                  // Update in database
                  try {
                    await fetch(`${API_URL}/tasks/${task.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ shift: item.label }),
                    });
                  } catch (err) {
                    console.error('Failed to update shift:', err);
                  }
                }}
                className={`mb-3 flex-row items-center rounded-xl border p-4 ${currentShift === item.label
                    ? 'border-[#7370FF] bg-[#F5F5FF]'
                    : 'border-[#F0F0F0] bg-[#FAFAFA]'
                  }`}>
                <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${currentShift === item.label ? 'bg-[#7370FF]' : 'bg-[#EAE8FF]'
                  }`}>
                  <Ionicons name={item.icon} size={20} color={currentShift === item.label ? 'white' : PRIMARY} />
                </View>
                <View className="flex-1">
                  <Text className={`text-[15px] font-semibold ${currentShift === item.label ? 'text-[#7370FF]' : 'text-[#1E1E1E]'
                    }`}>{item.label}</Text>
                  <Text className="text-[11px] text-[#A3A3A3]">{item.desc}</Text>
                </View>
                {currentShift === item.label && (
                  <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Status Selection Modal */}
      <Modal visible={showStatusModal} transparent={true} animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
          className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[30px] p-6 pb-12">
            <View className="h-1 w-10 bg-gray-300 self-center rounded-full mb-6" />
            <Text className="text-center text-[18px] font-bold text-[#1E1E1E] mb-6">Update Status</Text>

            {[
              { label: 'To Do', value: 'todo', icon: 'list-outline' as const, color: '#FF6B6B', bg: '#FFEBEB' },
              { label: 'In Progress', value: 'in_progress', icon: 'play-outline' as const, color: '#7370FF', bg: '#EAE8FF' },
              { label: 'In Review', value: 'in_review', icon: 'eye-outline' as const, color: '#FF9800', bg: '#FFF4E5' },
              { label: 'Completed', value: 'completed', icon: 'checkmark-done-outline' as const, color: '#4CAF50', bg: '#E8F5E9' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={async () => {
                  const oldStatus = currentStatus;
                  setCurrentStatus(item.value);
                  setShowStatusModal(false);
                  
                  try {
                    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: item.value }),
                    });
                    
                    if (!res.ok) {
                      const errorData = await res.json();
                      throw new Error(errorData.error || 'Failed to update status');
                    }
                  } catch (err: any) {
                    console.error('Failed to update status:', err);
                    setCurrentStatus(oldStatus);
                    Alert.alert('Update Failed', err.message || 'Could not update status. Please try again.');
                  }
                }}
                className={`mb-3 flex-row items-center rounded-xl border p-4 ${currentStatus === item.value
                    ? 'border-[#7370FF] bg-[#F5F5FF]'
                    : 'border-[#F0F0F0] bg-[#FAFAFA]'
                  }`}>
                <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full`} style={{ backgroundColor: item.bg }}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className={`text-[15px] font-semibold ${currentStatus === item.value ? 'text-[#7370FF]' : 'text-[#1E1E1E]'
                    }`}>{item.label}</Text>
                </View>
                {currentStatus === item.value && (
                  <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </Modal>

  );
}
