import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';

interface Task {
  id: number;
  title: string;
  project: string;
  due_date: string;
  status: string;
  priority: string;
  description?: string;
  assigned_to?: string;
  phase?: string;
  milestone?: string;
  start_date?: string;
}

interface MyWorkProps {
  userId: number;
  onTaskSelect: (task: Task) => void;
}

type Tab = 'To Do' | 'In Progress' | 'To Review' | 'Completed';

const STATUS_MAP: Record<Tab, string> = {
  'To Do': 'pending',
  'In Progress': 'in-progress',
  'To Review': 'to-review',
  Completed: 'completed',
};

export default function MyWork({ userId, onTaskSelect }: MyWorkProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('In Progress');

  const TABS: { label: Tab; color: string }[] = [
    { label: 'To Do', color: '#FF6B6B' },
    { label: 'In Progress', color: '#FFA94D' },
    { label: 'To Review', color: '#7370FF' },
    { label: 'Completed', color: '#51CF66' },
  ];

  useEffect(() => {
    fetch(`${API_URL}/tasks?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        // Dummy Data matching screenshot feel
        setTasks([
          {
            id: 1,
            title: 'Submit shop drawings for approval',
            project: 'Arane Corp',
            phase: 'Preliminary',
            milestone: 'Shop Drawings',
            status: 'in-progress',
            priority: 'high',
            due_date: '02/18/2026',
            start_date: '02/11/2026',
          },
          {
            id: 2,
            title: 'Order Concrete Mix',
            project: 'DMCI Homes',
            status: 'pending',
            priority: 'medium',
            due_date: '02/20/2026',
          },
          {
            id: 3,
            title: 'Site Inspection',
            project: 'Sunset Apartments',
            status: 'to-review',
            priority: 'high',
            due_date: '02/21/2026',
          },
          {
            id: 4,
            title: 'Foundation Pouring',
            project: 'City Tower A',
            status: 'completed',
            priority: 'high',
            due_date: '02/10/2026',
          },
        ]);
        setLoading(false);
      });
  }, [userId]);

  const getTabCount = (tab: Tab) => {
    if (!Array.isArray(tasks)) return 0;
    return tasks.filter((t) => t.status === STATUS_MAP[tab]).length;
  };

  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === STATUS_MAP[activeTab])
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#7370FF';
      case 'medium':
        return '#FFA94D';
      case 'low':
        return '#4DABF7';
      default:
        return '#7370FF';
    }
  };

  return (
    <View className="flex-1">
      <View className="px-5 pt-10">
        <Text className="text-[32px] font-bold text-[#7370FF]">My work</Text>

        {/* Tabs */}
        <View className="mt-6 flex-row justify-between rounded-2xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.label;
            const count = getTabCount(tab.label);
            return (
              <TouchableOpacity
                key={tab.label}
                onPress={() => setActiveTab(tab.label)}
                className={`h-[100px] items-center justify-center rounded-[16px] border bg-white ${isActive ? 'w-[26%] border-[#7370FF]' : 'w-[23%] border-[#F2F2F7]'}`}
                style={
                  isActive
                    ? { shadowColor: '#7370FF', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }
                    : {}
                }>
                <Text className={`mb-1 text-[28px] font-bold`} style={{ color: tab.color }}>
                  {count}
                </Text>
                <Text
                  className={`text-[11px] font-semibold ${isActive ? tab.color : '#A3A3A3'}`}
                  style={{ color: isActive ? tab.color : '#A3A3A3' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filters */}
        <View className="mt-4 flex-row px-1">
          <TouchableOpacity className="mr-3 flex-row items-center rounded-lg border border-[#E7E7EE] bg-white px-3 py-1.5">
            <Ionicons name="swap-vertical" size={14} color="#1E1E1E" />
            <Text className="ml-1.5 text-[12px] text-[#1E1E1E]">Sort by</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center rounded-lg border border-[#E7E7EE] bg-white px-3 py-1.5">
            <Ionicons name="filter" size={14} color="#1E1E1E" />
            <Text className="ml-1.5 text-[12px] text-[#1E1E1E]">Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="mt-4 flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {loading ? (
          <ActivityIndicator color="#7370FF" style={{ marginTop: 40 }} />
        ) : filteredTasks.length === 0 ? (
          <View className="mt-20 items-center justify-center">
            <Ionicons name="document-text-outline" size={48} color="#E0E0E0" />
            <Text className="mt-4 text-[14px] text-[#A3A3A3]">No tasks in this category</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => onTaskSelect(task)}
              className="mb-3 overflow-hidden rounded-xl border border-[#F0F0F0] bg-white"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}>
              <View className="flex-row">
                <View
                  className="h-full w-1.5"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />
                <View className="flex-1 flex-row items-center justify-between p-4">
                  <View className="mr-3 flex-1">
                    <Text className="text-[15px] font-semibold text-[#1E1E1E]" numberOfLines={1}>
                      {task.title}
                    </Text>
                    <View className="mt-1.5 flex-row items-center">
                      <Text className="text-[12px] text-[#A3A3A3]">{task.project}</Text>
                      {task.phase && (
                        <>
                          <View className="mx-2 h-1 w-1 rounded-full bg-[#D9D9D9]" />
                          <Text className="text-[12px] text-[#A3A3A3]">{task.phase}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View className="items-end">
                    <Ionicons name="ellipsis-horizontal" size={18} color="#B9B9B9" />
                    <View className="mt-2 rounded-md bg-[#F9F9F9] px-2 py-0.5">
                      <Text className="text-[10px] font-medium text-[#A3A3A3]">
                        {task.due_date}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
