import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
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
  'To Review': 'in-review',
  Completed: 'completed',
};

export default function MyWork({ userId, onTaskSelect }: MyWorkProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('In Progress');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [sortBy, setSortBy] = useState<'due_date_asc' | 'due_date_desc' | 'priority'>('due_date_asc');
  const [filterBy, setFilterBy] = useState<'all' | 'high_priority' | 'medium_priority' | 'low_priority'>('all');

  const TABS: { label: Tab; color: string }[] = [
    { label: 'To Do', color: '#FF6B6B' },
    { label: 'In Progress', color: '#7370FF' },
    { label: 'To Review', color: '#FF9800' },
    { label: 'Completed', color: '#4CAF50' },
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

  // Unique projects for filtering
  const projectList = ['All', ...new Set(tasks.map(t => t.project).filter(Boolean))];

  const getTabCount = (tab: Tab) => {
    if (!Array.isArray(tasks)) return 0;
    let filtered = tasks.filter((t) => t.status === STATUS_MAP[tab]);
    if (selectedProject !== 'All') {
      filtered = filtered.filter(t => t.project === selectedProject);
    }
    return filtered.length;
  };

  let processedTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === STATUS_MAP[activeTab])
    : [];

  // Filter by Project
  if (selectedProject !== 'All') {
    processedTasks = processedTasks.filter(t => t.project === selectedProject);
  }

  if (filterBy !== 'all') {
    processedTasks = processedTasks.filter((t) => {
      const p = t.priority?.toLowerCase();
      if (filterBy === 'high_priority') return p === 'high';
      if (filterBy === 'medium_priority') return p === 'medium';
      if (filterBy === 'low_priority') return p === 'low';
      return true;
    });
  }

  processedTasks.sort((a, b) => {
    if (sortBy === 'priority') {
      const getPrioVal = (p?: string) => (p?.toLowerCase() === 'high' ? 3 : p?.toLowerCase() === 'medium' ? 2 : 1);
      return getPrioVal(b.priority) - getPrioVal(a.priority);
    } else {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return sortBy === 'due_date_asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const filteredTasks = processedTasks;

  const handleSortPress = () => {
    Alert.alert('Sort Tasks', 'Choose how you want to sort your tasks', [
      { text: 'Due Date (Earliest First)', onPress: () => setSortBy('due_date_asc') },
      { text: 'Due Date (Latest First)', onPress: () => setSortBy('due_date_desc') },
      { text: 'Priority (High to Low)', onPress: () => setSortBy('priority') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleFilterPress = () => {
    Alert.alert('Filter Tasks', 'Show specific tasks', [
      { text: 'All Priorities', onPress: () => setFilterBy('all') },
      { text: 'High Priority Only', onPress: () => setFilterBy('high_priority') },
      { text: 'Medium Priority Only', onPress: () => setFilterBy('medium_priority') },
      { text: 'Low Priority Only', onPress: () => setFilterBy('low_priority') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'todo':
        return '#FF6B6B'; // To Do
      case 'in-progress':
      case 'in_progress':
        return '#7370FF'; // In Progress
      case 'in-review':
      case 'to-review':
      case 'in_review':
        return '#FF9800'; // To Review
      case 'completed':
        return '#4CAF50'; // Completed
      default:
        return '#757575';
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
                className={`h-[100px] items-center justify-center rounded-[16px] border bg-white ${isActive ? 'w-[26%]' : 'w-[23%] border-[#F2F2F7]'}`}
                style={
                  isActive
                    ? { borderColor: tab.color, shadowColor: tab.color, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }
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

        {/* Filters and Project Dropdown */}
        <View className="mt-4 flex-row items-center px-1">
          <TouchableOpacity
            onPress={handleSortPress}
            className={`mr-2 flex-row items-center rounded-lg border px-3 py-2 ${sortBy !== 'due_date_asc' ? 'border-[#7370FF] bg-[#F5F5FF]' : 'border-[#E7E7EE] bg-white'}`}>
            <Ionicons name="swap-vertical" size={14} color={sortBy !== 'due_date_asc' ? '#7370FF' : '#1E1E1E'} />
            <Text className={`ml-1.5 text-[12px] ${sortBy !== 'due_date_asc' ? 'text-[#7370FF] font-bold' : 'text-[#1E1E1E]'}`}>
              {sortBy === 'priority' ? 'Prio' : sortBy === 'due_date_desc' ? 'Due' : 'Sort'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFilterPress}
            className={`mr-2 flex-row items-center rounded-lg border px-3 py-2 ${filterBy !== 'all' ? 'border-[#7370FF] bg-[#F5F5FF]' : 'border-[#E7E7EE] bg-white'}`}>
            <Ionicons name="filter" size={14} color={filterBy !== 'all' ? '#7370FF' : '#1E1E1E'} />
            <Text className={`ml-1.5 text-[12px] ${filterBy !== 'all' ? 'text-[#7370FF] font-bold' : 'text-[#1E1E1E]'}`}>
              {filterBy !== 'all' ? 'Filtered' : 'Filter'}
            </Text>
          </TouchableOpacity>

          {/* Purple Project Dropdown */}
          <TouchableOpacity
            onPress={() => setShowProjectModal(true)}
            className="flex-1 flex-row items-center justify-between rounded-lg bg-[#7370FF] px-3 py-2"
            style={{ shadowColor: '#7370FF', shadowOpacity: 0.2, shadowRadius: 5, elevation: 2 }}
          >
            <Text className="text-[12px] font-bold text-white mr-2" numberOfLines={1}>
              {selectedProject === 'All' ? 'All Projects' : selectedProject}
            </Text>
            <Ionicons name="chevron-down" size={14} color="white" />
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
            <Text className="mt-4 text-[14px] text-[#A3A3A3]">
              {selectedProject === 'All'
                ? 'No tasks in this category'
                : `No tasks for ${selectedProject} in this category`}
            </Text>
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
                  style={{ backgroundColor: getStatusColor(task.status) }}
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

      {/* Project Selection Modal */}
      <Modal
        visible={showProjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowProjectModal(false)}
        >
          <View className="bg-white rounded-t-[30px] p-6 pb-10 max-h-[70%]">
            <View className="w-10 h-1 bg-gray-200 self-center rounded-full mb-6" />
            <Text className="text-xl font-bold text-[#1E1E1E] mb-6 text-center">Select Project</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {projectList.map((proj) => (
                <TouchableOpacity
                  key={proj}
                  onPress={() => {
                    setSelectedProject(proj);
                    setShowProjectModal(false);
                  }}
                  className={`flex-row items-center justify-between py-4 border-b border-[#F2F2F7] ${selectedProject === proj ? 'bg-[#F5F5FF] -mx-6 px-6' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-3 ${selectedProject === proj ? 'bg-[#7370FF]' : 'bg-gray-300'}`} />
                    <Text className={`text-base ${selectedProject === proj ? 'font-bold text-[#7370FF]' : 'text-[#2D2D2D]'}`}>
                      {proj === 'All' ? 'All Projects' : proj}
                    </Text>
                  </View>
                  {selectedProject === proj && (
                    <Ionicons name="checkmark-sharp" size={20} color="#7370FF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setShowProjectModal(false)}
              className="mt-6 h-14 bg-[#7370FF] items-center justify-center rounded-2xl shadow-lg"
              style={{ shadowColor: '#7370FF', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 }}
            >
              <Text className="text-white font-bold text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
