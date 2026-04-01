import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPermissions, type UserRole } from '../../constants/roles';

interface TaskDetailScreenProps {
  visible: boolean;
  task: any;
  onClose: () => void;
  userRole?: UserRole;
  onViewInventory?: (projectId: number) => void;
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
  onViewInventory
}: TaskDetailScreenProps) {
  if (!task) return null;

  const perms = getPermissions(userRole);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in-progress':
        return { bg: '#EAE8FF', text: '#7370FF', label: 'In Progress' };
      case 'completed':
        return { bg: '#E8F5E9', text: '#4CAF50', label: 'Completed' };
      case 'to-review':
        return { bg: '#FFF4E5', text: '#FF9800', label: 'To Review' };
      default:
        return { bg: '#EAE8FF', text: '#7370FF', label: 'In Progress' };
    }
  };

  const statusStyle = getStatusStyle(task.status);
  const comments: Comment[] = [];
  const priorityColor = task.priority?.toLowerCase() === 'high' ? '#FF6B6B' : '#FFA500';

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
              <View className="rounded-full px-5 py-2" style={{ backgroundColor: statusStyle.bg }}>
                <Text
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: statusStyle.text }}>
                  {statusStyle.label}
                </Text>
              </View>
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
            <View className="flex-row">
              <View className="flex-1">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Start Date</Text>
                <Text className="text-[15px] font-bold text-[#1E1E1E]">
                  {task.start_date || '01/31/2026'}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">End Date</Text>
                <Text className="text-[15px] font-bold text-[#1E1E1E]">
                  {task.due_date || '02/28/2026'}
                </Text>
              </View>
            </View>
          </View>

          {/* Task Photos Section */}
          <View className="mb-8">
            <Text className="mb-4 text-[18px] font-bold text-[#1E1E1E]">Task Photos</Text>
            <TouchableOpacity className="mb-4 h-[60px] w-full flex-row items-center justify-center rounded-[16px] border border-dashed border-[#7370FF] bg-[#EAE8FF]">
              <Ionicons name="camera-outline" size={24} color="#7370FF" />
              <Text className="ml-3 font-bold text-[#7370FF]">Add a Task Photo</Text>
            </TouchableOpacity>

            {/* Dummy Photo Gird */}
            <View className="flex-row gap-3">
              <View className="h-[80px] w-[80px] overflow-hidden rounded-[12px] bg-[#F5F5F7]">
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=300',
                  }}
                  className="h-full w-full"
                />
              </View>
              <View className="h-[80px] w-[80px] overflow-hidden rounded-[12px] bg-[#F5F5F7]">
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=300',
                  }}
                  className="h-full w-full"
                />
              </View>
            </View>
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
          <TouchableOpacity className="items-center">
            <Ionicons name="home-outline" size={24} color="#9A9A9A" />
            <Text className="mt-1 text-[10px] text-[#9A9A9A]">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <View className="mb-1 h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F0F0]">
              <Ionicons name="briefcase" size={24} color="#7370FF" />
            </View>
            <Text className="text-[10px] font-bold text-[#7370FF]">My work</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="notifications-outline" size={24} color="#9A9A9A" />
            <Text className="mt-1 text-[10px] text-[#9A9A9A]">Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="ellipsis-horizontal-outline" size={24} color="#9A9A9A" />
            <Text className="mt-1 text-[10px] text-[#9A9A9A]">More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
