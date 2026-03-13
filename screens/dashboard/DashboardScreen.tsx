import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
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
import { Alert } from "react-native";

interface DashboardScreenProps {
    onLogout: () => void;
    user: UserInfo;
}

interface Project {
    id: number;
    name: string;
    location: string;
    color: string;
    status: string;
}

const FAB_ACTIONS = [
    { label: 'Add new task', icon: 'add-circle-outline', key: 'task' },
    { label: 'Update inventory', icon: 'cube-outline', key: 'inventory' },
    { label: 'Upload Site Progress', icon: 'cloud-upload-outline', key: 'site' },
];

export default function DashboardScreen({ onLogout, user: initialUser }: DashboardScreenProps) {
    const [activeTab, setActiveTab] = useState<'home' | 'mywork' | 'notifications' | 'more'>('home');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [user, setUser] = useState<UserInfo>(initialUser);
    const [fabOpen, setFabOpen] = useState(false);
    const [showSiteProgress, setShowSiteProgress] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showInventory, setShowInventory] = useState(false);
    const [inventoryProjectId, setInventoryProjectId] = useState<number | null>(null);
    const fabAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetch(`${API_URL}/projects`)
            .then(res => res.json())
            .then(data => {
                const mappedData = data.map((p: any) => {
                    if (p.image_url === 'building.jpg') p.image = require('../../assets/building.jpg');
                    if (p.image_url === 'Gemini_Generated_Image_mcjrmgmcjrmgmcjr.png') p.image = require('../../assets/Gemini_Generated_Image_mcjrmgmcjrmgmcjr.png');
                    if (p.image_url === 'pexels-annechois-6148374.jpg') p.image = require('../../assets/pexels-annechois-6148374.jpg');
                    return p;
                });
                setProjects(mappedData);
                setLoadingProjects(false);
            })
            // .catch(() => setLoadingProjects(false)); eto yung oopen 
            .catch(() => {
                // If offline, show some dummy projects for demo purposes
                setProjects([
                    { id: 1, name: "High Rise Building", location: "123 Main St", color: "#FF6B6B", status: "Active", image: require('../../assets/building.jpg') }, // aalising image if ayaw 
                    { id: 2, name: "DMCI Homes", location: "456 Market St", color: "#4ECDC4", status: "Active", image: require('../../assets/Gemini_Generated_Image_mcjrmgmcjrmgmcjr.png') }, // aalising lang yung image if ayaw 
                    { id: 3, name: "Sunset Apartments", location: "789 Ocean Blvd", color: "#45B7D1", status: "Planning", image: require('../../assets/pexels-annechois-6148374.jpg') } // aalising lang yung image if ayaw 
                ] as any);
                setLoadingProjects(false);
            });
    }, []);

    const toggleFab = () => {
        const toValue = fabOpen ? 0 : 1;
        Animated.spring(fabAnim, { toValue, useNativeDriver: true, friction: 6 }).start();
        setFabOpen(!fabOpen);
    };

    const showFab = activeTab !== 'more';

    return (
        <View className="flex-1 bg-[#F5F5F7]">
            {selectedProjectId ? (
                <ProjectDetailScreen
                    projectId={selectedProjectId}
                    onBack={() => setSelectedProjectId(null)}
                />
            ) : (
                <SafeAreaView className="flex-1">
                    {activeTab === 'home' ? (
                        <ScrollView contentContainerStyle={{ paddingBottom: 160 }} className="px-5 pt-4">
                            <Text className="text-[#6C63FF] text-[22px] font-bold mb-1">Home</Text>
                            <Text className="text-[#A3A3A3] text-[13px] mb-4">
                                Welcome back, {user.firstName}! 👋
                            </Text>
                            <View className="bg-white rounded-[20px] p-5 shadow-sm mb-6 flex-row justify-between items-center border border-gray-100">
                                <View>
                                    <Text className="text-[#1E1E1E] text-base font-semibold">Ongoing Projects</Text>
                                </View>
                                <Text className="text-[#FFA500] text-3xl font-bold">{projects.length}</Text>
                            </View>
                            <Text className="text-[#1E1E1E] text-lg font-bold mb-4">Projects</Text>
                            {loadingProjects ? (
                                <ActivityIndicator color="#7370FF" />
                            ) : projects.length === 0 ? (
                                <Text className="text-[#A3A3A3] text-center mt-4">No projects found.</Text>
                            ) : (
                                projects.map((p: any) => (
                                    <TouchableOpacity key={p.id} onPress={() => setSelectedProjectId(p.id)}>
                                        <ProjectCard name={p.name} location={p.location} color={`bg-[${p.color}]`} image={p.image} />
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    ) : activeTab === 'mywork' ? (
                        <MyWork userId={user.id} onTaskSelect={(task) => setSelectedTask(task)} />
                    ) : activeTab === 'notifications' ? (
                        <Notifications userId={user.id} />
                    ) : (
                        <MoreScreen
                            user={user}
                            onLogout={onLogout}
                            onUserUpdated={(updated) => setUser(updated)}
                        />
                    )}

                    {/* FAB Action Menu */}
                    {fabOpen && (
                        <TouchableOpacity
                            className="absolute inset-0"
                            onPress={() => { setFabOpen(false); fabAnim.setValue(0); }}
                            activeOpacity={1}
                        />
                    )}

                    {fabOpen && (
                        <View className="absolute bottom-[160px] right-5 items-end">
                            {FAB_ACTIONS.map((action, index) => (
                                <Animated.View
                                    key={action.label}
                                    style={{
                                        opacity: fabAnim,
                                        transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [20 * (FAB_ACTIONS.length - index), 0] }) }],
                                        marginBottom: 10,
                                    }}
                                >
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
                                                    Alert.alert("No Projects", "You need at least one project to update inventory.");
                                                }
                                            }
                                        }}
                                        className="flex-row items-center bg-white rounded-[14px] px-4 py-3"
                                        style={{ shadowColor: "#7370FF", shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }}
                                    >
                                        <Text className="text-[14px] text-[#1E1E1E] font-medium mr-3">{action.label}</Text>
                                        <View className="w-7 h-7 rounded-full bg-[#EAE8FF] items-center justify-center">
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
                            className="absolute bottom-[110px] right-5 w-14 h-14 rounded-full bg-[#7370FF] items-center justify-center"
                            style={{ shadowColor: "#7370FF", shadowOpacity: 0.50, shadowRadius: 12, shadowOffset: { width: 0, height: 9 }, elevation: 8 }}
                        >
                            <Animated.View style={{ transform: [{ rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }}>
                                <Ionicons name="add" size={28} color="white" />
                            </Animated.View>
                        </TouchableOpacity>
                    )}

                    {/* BOTTOM NAVIGATION */}
                    <View className="absolute bottom-8 left-5 right-5 bg-white rounded-[30px] h-[70px] flex-row items-center justify-between px-6 shadow-xl shadow-gray-200">
                        <TouchableOpacity className={`p-2 rounded-full px-4 items-center ${activeTab === 'home' ? 'bg-[#EAE8FF]' : ''}`} onPress={() => setActiveTab('home')}>
                            <Ionicons name="home" size={24} color={activeTab === 'home' ? '#6C63FF' : '#9A9A9A'} />
                            <Text className={`text-[10px] mt-1 ${activeTab === 'home' ? 'text-[#6C63FF] font-bold' : 'text-[#9A9A9A]'}`}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className={`p-2 rounded-full px-4 items-center ${activeTab === 'mywork' ? 'bg-[#EAE8FF]' : ''}`} onPress={() => setActiveTab('mywork')}>
                            <Ionicons name="briefcase-outline" size={24} color={activeTab === 'mywork' ? '#6C63FF' : '#9A9A9A'} />
                            <Text className={`text-[10px] mt-1 ${activeTab === 'mywork' ? 'text-[#6C63FF] font-bold' : 'text-[#9A9A9A]'}`}>My Work</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className={`items-center ${activeTab === 'notifications' ? 'bg-[#EAE8FF] p-2 rounded-full px-4' : ''}`} onPress={() => setActiveTab('notifications')}>
                            <Ionicons name="notifications-outline" size={24} color={activeTab === 'notifications' ? '#6C63FF' : '#9A9A9A'} />
                            <Text className={`text-[10px] mt-1 ${activeTab === 'notifications' ? 'text-[#6C63FF] font-bold' : 'text-[#9A9A9A]'}`}>Notification</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className={`p-2 rounded-full px-4 items-center ${activeTab === 'more' ? 'bg-[#EAE8FF]' : ''}`} onPress={() => setActiveTab('more')}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={activeTab === 'more' ? '#6C63FF' : '#9A9A9A'} />
                            <Text className={`text-[10px] mt-1 ${activeTab === 'more' ? 'text-[#6C63FF] font-bold' : 'text-[#9A9A9A]'}`}>More</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

            {/* Upload Site Progress Modal */}
            <UploadSiteProgressScreen
                visible={showSiteProgress}
                user={user}
                projects={projects}
                onClose={() => setShowSiteProgress(false)}
            />

            {/* Add Task Modal */}
            <AddTaskScreen
                visible={showAddTask}
                onClose={() => setShowAddTask(false)}
                userId={user.id}
                projects={projects}
                onTaskAdded={() => {
                    console.log("Task added, refreshing data...");
                }}
            />
            {/* Task Detail Modal */}
            <TaskDetailScreen
                visible={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
            />
            {/* Inventory Modal */}
            {showInventory && inventoryProjectId && (
                <Modal visible={showInventory} animationType="slide" transparent={false}>
                    <InventoryScreen 
                        projectId={inventoryProjectId} 
                        onBack={() => setShowInventory(false)} 
                    />
                </Modal>
            )}
        </View>
    );
}
