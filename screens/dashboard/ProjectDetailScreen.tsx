import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { API_URL } from '../../lib/api';
import InventoryScreen from './InventoryScreen';
import SiteUpdatesScreen from './SiteUpdatesScreen';
import { type UserRole } from '../../constants/roles';

const { width } = Dimensions.get('window');

interface Project {
  id: number;
  name: string;
  location: string;
  color: string;
  status: string;
  engineer?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  progress?: number;
}

interface Props {
  projectId: number;
  onBack: () => void;
  userRole?: UserRole;
}

const PRIMARY = '#7370FF';

function statusBadge(status: string) {
  switch ((status || '').toLowerCase()) {
    case 'delayed':
      return { label: 'Delayed', bg: '#FF6B6B', text: 'white' };
    case 'completed':
      return { label: 'Completed', bg: '#51CF66', text: 'white' };
    case 'on hold':
      return { label: 'On Hold', bg: '#FFA500', text: 'white' };
    default:
      return { label: 'Ongoing', bg: '#7370FF', text: 'white' };
  }
}

function fmt(date?: string) {
  if (!date) return '01/01/2026'; // Fallback to match screenshot style
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '01/01/2026';
  }
}

function daysLeft(end?: string) {
  if (!end) return 128; // Dummy for UI demo matching screenshot
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  return diff > 0 ? diff : 0;
}

export default function ProjectDetailScreen({ projectId, onBack, userRole }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'detail' | 'inventory' | 'siteUpdates' | 'tasks'
  >('detail');
  const [showSiteUpdates, setShowSiteUpdates] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/projects/${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        setProject(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('ProjectDetail Fetch Error:', err);
        setLoading(false);
      });
  }, [projectId]);

  if (activeSection === 'inventory' && project) {
    return <InventoryScreen projectId={project.id} onBack={() => setActiveSection('detail')} userRole={userRole} />;
  }

  if (loading || !project) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#7370FF" size="large" />
      </View>
    );
  }

  const badge = statusBadge(project.status);
  const days = daysLeft(project.end_date);
  const progress = project.progress || 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row items-center px-5 pb-4 pt-12">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Ionicons name="chevron-back" size={32} color="#1E1E1E" />
          </TouchableOpacity>
          <Text className="text-[32px] font-bold text-[#7370FF]">Project Name</Text>
        </View>

        {/* Main Info Card */}
        <View
          className="mb-5 rounded-[24px] border border-[#F0F0F0] bg-white p-6"
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 15, elevation: 3 }}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="flex-1 text-[20px] font-bold text-[#1E1E1E]">{project.name}</Text>
            <View className="rounded-full px-5 py-2" style={{ backgroundColor: '#FF7D7D' }}>
              <Text className="text-[11px] font-bold uppercase tracking-wider text-white">
                {project.status}
              </Text>
            </View>
          </View>

          <View className="mb-6 flex-row items-center">
            <View className="flex-row items-center rounded-lg border border-[#DEDCFF] bg-[#EAE8FF] px-3 py-1.5">
              <Ionicons name="time-outline" size={14} color="#7370FF" />
              <Text className="ml-1.5 text-[12px] font-bold text-[#7370FF]">{days} days left</Text>
            </View>
          </View>

          <View className="mb-6 flex-row">
            <View className="flex-1">
              <Text className="mb-1 text-[11px] font-medium text-[#A3A3A3]">Project Engineer</Text>
              <Text className="text-[13px] font-bold text-[#1E1E1E]">
                {project.engineer || 'Michael Replan'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-[11px] font-medium text-[#A3A3A3]">Project Start</Text>
              <Text className="text-[13px] font-bold text-[#1E1E1E]">
                {fmt(project.start_date)}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1">
              <Text className="mb-1 text-[11px] font-medium text-[#A3A3A3]">Budget</Text>
              <Text className="text-[13px] font-bold text-[#1E1E1E]">
                ₱{project.budget?.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-[11px] font-medium text-[#A3A3A3]">Project End</Text>
              <Text className="text-[13px] font-bold text-[#1E1E1E]">{fmt(project.end_date)}</Text>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View
          className="mb-4 rounded-[24px] border border-[#F0F0F0] bg-white p-6"
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 15, elevation: 3 }}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-[#1E1E1E]">Project Progress</Text>
            <Text className="text-[11px] text-[#A3A3A3]">as of 01/31/26</Text>
          </View>

          <View className="mb-6 flex-row items-center">
            <Text className="text-[48px] font-extrabold text-[#5DBF50]">{progress}%</Text>
            <View className="ml-4 h-[30px] flex-row items-end">
              <Ionicons name="trending-up" size={32} color="#FF9F1C" />
              <View
                className="-ml-2 mb-[14px] h-[2px] w-[50px] bg-[#FF9F1C]"
                style={{ transform: [{ rotate: '-15deg' }] }}
              />
            </View>
          </View>

          <View className="h-[2px] w-full rounded-full bg-[#E0E0E0]">
            <View
              style={{ width: `${progress}%`, backgroundColor: '#5DBF50' }}
              className="h-full rounded-full"
            />
          </View>
        </View>

        {/* Navigation List */}
        <View className="mt-8">
          {[
            { label: 'Inventory', key: 'inventory' },
            { label: 'Site Updates', key: 'siteUpdates' },
            { label: 'Tasks', key: 'tasks' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => {
                if (item.key === 'siteUpdates') setShowSiteUpdates(true);
                else if (item.key === 'inventory') setActiveSection('inventory');
              }}
              className="mb-4 flex-row items-center justify-between rounded-[20px] border border-[#F5F5F7] bg-white px-6 py-5"
              style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1 }}>
              <Text className="text-[16px] font-bold text-[#1E1E1E]">{item.label}</Text>
              <Ionicons name="chevron-forward" size={24} color="#D1D1D6" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>



      {/* Bottom space to avoid overlap with Dashboard nav if needed, or just let ScrollView handle it */}
      <View style={{ height: 100 }} />

      {project && (
        <SiteUpdatesScreen
          visible={showSiteUpdates}
          projectName={project.name}
          onClose={() => setShowSiteUpdates(false)}
        />
      )}
    </View>
  );
}
