import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Modal,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import MyWork from './MyWork';
import Notifications from './Notifications';
import MoreScreen from '../profile/MoreScreen';
import UploadSiteProgressScreen from './UploadSiteProgressScreen';
import ProjectDetailScreen from './ProjectDetailScreen';
import AddTaskScreen from './AddTaskScreen';
import TaskDetailScreen from './TaskDetailScreen';
import InventoryScreen from './InventoryScreen';
import { API_URL } from '../../lib/api';
import { UserInfo } from '../../App';
import { getPermissions } from '../../constants/roles';

interface DashboardScreenProps {
  onLogout: () => void;
  user: UserInfo;
  onUserUpdated: (updated: UserInfo) => void;
}

interface Project {
  id: number;
  name: string;
  location: string;
  color: string;
  status: string;
}

export default function DashboardScreen({
  onLogout,
  user: initialUser,
  onUserUpdated,
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'mywork' | 'notifications' | 'more'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [user, setUser] = useState<UserInfo>(initialUser);
  const [fabOpen, setFabOpen] = useState(false);
  const [showSiteProgress, setShowSiteProgress] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [inventoryProjectId, setInventoryProjectId] = useState<number | null>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [projectActionModal, setProjectActionModal] = useState<Project | null>(null);

  // RBAC: Filtered FAB Actions 
  const perms = useMemo(() => getPermissions(user.role), [user.role]);

  const FAB_ACTIONS = useMemo(() => {
    const actions = [];
    if (perms.canCreateTasks)
      actions.push({ label: 'Add new task', icon: 'add-circle-outline', key: 'task' });
    if (perms.canEditInventory)
      actions.push({ label: 'Update inventory', icon: 'cube-outline', key: 'inventory' });
    if (perms.canSubmitSiteUpdates)
      actions.push({ label: 'Upload Site Progress', icon: 'cloud-upload-outline', key: 'site' });
    return actions;
  }, [perms]);

  const handleProjectAction = (project: Project) => {
    setProjectActionModal(project);
  };

  const deleteProject = async (projectId: number) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/projects/${projectId}`, { method: 'DELETE' });
              if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== projectId));
                setProjectActionModal(null);
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete project.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    // ─── RBAC: Redirect from Home if not permitted ───
    if (!perms.canViewDashboard && activeTab === 'home') {
      setActiveTab('mywork');
    }
  }, [perms.canViewDashboard, activeTab]);

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotificationCount = () => {
    fetch(`${API_URL}/notifications?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      })
      .catch((err) => console.error('Notif Count Fetch Error:', err));
  };

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    fetch(`${API_URL}/projects`)
      .then((res) => res.json())
      .then((data) => {
        // ─── RBAC: Filter projects for Project Engineers (PIC only) ───
        let filteredData = data;
        if (user.role.toLowerCase() === 'project_engineer') {
          filteredData = data.filter((p: any) => String(p.project_in_charge_id) === String(user.id));
        }

        const mappedData = filteredData.map((p: any) => {
          if (p.image_url === 'building.jpg') p.image = require('../../assets/building.jpg');
          if (p.image_url === 'Gemini_Generated_Image_mcjrmgmcjrmgmcjr.png')
            p.image = require('../../assets/Gemini_Generated_Image_mcjrmgmcjrmgmcjr.png');
          if (p.image_url === 'pexels-annechois-6148374.jpg')
            p.image = require('../../assets/pexels-annechois-6148374.jpg');
          return p;
        });
        setProjects(mappedData);
        setLoadingProjects(false);
      })
      .catch((err) => {
        console.error('Dashboard Projects Fetch Error:', err);
        setLoadingProjects(false);
      });
  }, []);

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnim, { toValue, useNativeDriver: true, friction: 6 }).start();
    setFabOpen(!fabOpen);
  };

  // Only show FAB if current tab allows it (More tab hides it) and there are actions available for the role
  const showFab = activeTab !== 'more' && FAB_ACTIONS.length > 0;

  return (
    <View className="flex-1 bg-[#F5F5F7]">
      <SafeAreaView className="flex-1">
        {activeTab === 'home' ? (
          <View className="flex-1">
            {selectedProjectId ? (
              <ProjectDetailScreen
                projectId={selectedProjectId}
                userRole={user.role}
                onBack={() => setSelectedProjectId(null)}
              />
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 160 }} className="px-5 pt-4">
                <View className="flex-row items-center justify-between">
                  <Text className="mb-1 text-[22px] font-bold text-[#6C63FF]">Home</Text>
                  <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-[#6C63FF] uppercase">{user.role}</Text>
                  </View>
                </View>
                <Text className="mb-4 text-[13px] text-[#A3A3A3]">
                  Welcome back, {user.firstName}! 👋
                </Text>

                {/* Dashboard Summary Card — Hidden for Accounting audit view */}
                {user.role.toLowerCase() !== 'accounting' && (
                  <View className="mb-6 flex-row items-center justify-between rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm">
                    <View>
                      <Text className="text-base font-semibold text-[#1E1E1E]">Ongoing Projects</Text>
                    </View>
                    <Text className="text-3xl font-bold text-[#FFA500]">{projects.length}</Text>
                  </View>
                )}

                <Text className="mb-4 text-lg font-bold text-[#1E1E1E]">Projects</Text>
                {loadingProjects ? (
                  <ActivityIndicator color="#7370FF" />
                ) : projects.length === 0 ? (
                  <Text className="mt-4 text-center text-[#A3A3A3]">No projects found.</Text>
                ) : (
                  projects.map((p: any) => (
                    <TouchableOpacity key={p.id} onPress={() => setSelectedProjectId(p.id)}>
                      <ProjectCard
                        name={p.name}
                        location={p.location}
                        color={`bg-[${p.color}]`}
                        image={p.image}
                        onAction={() => handleProjectAction(p)}
                      />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        ) : activeTab === 'mywork' ? (
          <MyWork userId={user.id} onTaskSelect={(task) => setSelectedTask(task)} />
        ) : activeTab === 'notifications' ? (
          <Notifications userId={user.id} />
        ) : (
          <MoreScreen user={user} onLogout={onLogout} onUserUpdated={onUserUpdated} />
        )}

        {/* FAB Action Menu */}
        {fabOpen && (
          <TouchableOpacity
            className="absolute inset-0"
            onPress={() => {
              setFabOpen(false);
              fabAnim.setValue(0);
            }}
            activeOpacity={1}
          />
        )}

        {/* FAB Actions (Strictly filtered by RBAC) */}
        {fabOpen && (
          <View className="absolute bottom-[160px] right-5 items-end">
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
                    setFabOpen(false);
                    fabAnim.setValue(0);
                    if (action.key === 'site') setShowSiteProgress(true);
                    if (action.key === 'task') setShowAddTask(true);
                    if (action.key === 'inventory') {
                      if (projects.length > 0) {
                        setInventoryProjectId(projects[0].id);
                        setShowInventory(true);
                      } else {
                        Alert.alert(
                          'No Projects',
                          'You need at least one project to update inventory.'
                        );
                      }
                    }
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

        {/* FAB Button */}
        {showFab && (
          <TouchableOpacity
            onPress={toggleFab}
            className="absolute bottom-[110px] right-5 h-14 w-14 items-center justify-center rounded-full bg-[#7370FF]"
            style={{
              shadowColor: '#7370FF',
              shadowOpacity: 0.5,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 9 },
              elevation: 8,
            }}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: fabAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg'],
                    }),
                  },
                ],
              }}>
              <Ionicons name="add" size={28} color="white" />
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* BOTTOM NAVIGATION */}
        <View className="absolute bottom-8 left-5 right-5 h-[70px] flex-row items-center justify-between rounded-[30px] bg-white px-6 shadow-xl shadow-gray-200">
          {perms.canViewDashboard && (
            <TouchableOpacity
              className={`items-center rounded-full p-2 px-4 ${activeTab === 'home' ? 'bg-[#EAE8FF]' : ''}`}
              onPress={() => setActiveTab('home')}>
              <Ionicons name="home" size={24} color={activeTab === 'home' ? '#6C63FF' : '#9A9A9A'} />
              <Text
                className={`mt-1 text-[10px] ${activeTab === 'home' ? 'font-bold text-[#6C63FF]' : 'text-[#9A9A9A]'}`}>
                Home
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className={`items-center rounded-full p-2 px-4 ${activeTab === 'mywork' ? 'bg-[#EAE8FF]' : ''}`}
            onPress={() => setActiveTab('mywork')}>
            <Ionicons
              name="briefcase-outline"
              size={24}
              color={activeTab === 'mywork' ? '#6C63FF' : '#9A9A9A'}
            />
            <Text
              className={`mt-1 text-[10px] ${activeTab === 'mywork' ? 'font-bold text-[#6C63FF]' : 'text-[#9A9A9A]'}`}>
              My Work
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`items-center rounded-full p-2 px-4 ${activeTab === 'notifications' ? 'bg-[#EAE8FF]' : ''}`}
            onPress={() => {
              setActiveTab('notifications');
              setUnreadCount(0); // Reset local count when viewing
            }}>
            <View>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={activeTab === 'notifications' ? '#6C63FF' : '#9A9A9A'}
              />
              {unreadCount > 0 && (
                <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-[#FF6B6B]">
                  <Text className="text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={`mt-1 text-[10px] ${activeTab === 'notifications' ? 'font-bold text-[#6C63FF]' : 'text-[#9A9A9A]'}`}>
              Notification
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`items-center rounded-full p-2 px-4 ${activeTab === 'more' ? 'bg-[#EAE8FF]' : ''}`}
            onPress={() => setActiveTab('more')}>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={activeTab === 'more' ? '#6C63FF' : '#9A9A9A'}
            />
            <Text
              className={`mt-1 text-[10px] ${activeTab === 'more' ? 'font-bold text-[#6C63FF]' : 'text-[#9A9A9A]'}`}>
              More
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Modals */}
      <UploadSiteProgressScreen
        visible={showSiteProgress}
        user={user}
        projects={projects}
        onClose={() => setShowSiteProgress(false)}
      />
      <AddTaskScreen
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        userId={user.id}
        projects={projects}
        onTaskAdded={() => { }}
      />
      <TaskDetailScreen
        visible={!!selectedTask}
        task={selectedTask}
        userRole={user.role}
        onClose={() => setSelectedTask(null)}
        onNavigate={(tab) => {
          setSelectedTask(null);
          setActiveTab(tab);
        }}
        onViewInventory={(projectId) => {

          setSelectedTask(null);
          setInventoryProjectId(projectId);
          setShowInventory(true);
        }}
      />
      {showInventory && inventoryProjectId && (
        <Modal visible={showInventory} animationType="slide" transparent={false}>
          <InventoryScreen projectId={inventoryProjectId} onBack={() => setShowInventory(false)} userRole={user.role} />
        </Modal>
      )}

      {/* Project Action Modal (ActionSheet) */}
      <Modal
        visible={!!projectActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProjectActionModal(null)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setProjectActionModal(null)}
          className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-[30px] bg-white p-6 pb-12">
            <View className="mb-6 h-1 w-10 self-center rounded-full bg-gray-300" />
            <Text className="mb-4 text-center text-lg font-bold text-[#1E1E1E]">
              {projectActionModal?.name}
            </Text>

            <TouchableOpacity
              onPress={() => setProjectActionModal(null)}
              className="flex-row items-center py-4 border-b border-gray-50">
              <Ionicons name="create-outline" size={22} color="#7370FF" />
              <Text className="ml-4 text-[16px] text-[#2D2D2D]">Edit Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteProject(projectActionModal!.id)}
              className="flex-row items-center py-4">
              <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
              <Text className="ml-4 text-[16px] text-[#FF6B6B] font-semibold">Delete Project</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
