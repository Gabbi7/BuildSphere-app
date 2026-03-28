import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';

const { width } = Dimensions.get('window');

interface SiteUpdate {
  id: number;
  project_name: string;
  partner: string;
  milestone: string;
  location: string;
  notes: string;
  photo_url: string;
  glass_count: number;
  created_at: string;
}

interface Comment {
  id: number;
  user: string;
  initials: string;
  text: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  projectName: string;
}

const PRIMARY = '#7370FF';

export default function SiteUpdatesScreen({ visible, onClose, projectName }: Props) {
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Morning' | 'Noon' | 'Afternoon'>('Noon');

  const comments: Comment[] = [
    { id: 1, user: 'Ivan', initials: 'IV', text: 'When will the 9th glass be installed?' },
    { id: 2, user: 'Ivan', initials: 'IV', text: 'Comments here' },
    { id: 3, user: 'Ivan', initials: 'IV', text: 'Another comment here' },
  ];

  useEffect(() => {
    if (visible) {
      fetchUpdates();
    }
  }, [visible, projectName]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/site-progress/project/${encodeURIComponent(projectName)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        setUpdates(data);
      }
    } catch (error) {
      console.error('Fetch Site Updates Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: '01/31/2026', // Matching screenshot exactly for demo
      time: '12:00',
    };
  };

  const currentUpdate = updates[0] || null;
  const { date, time } = currentUpdate
    ? formatDate(currentUpdate.created_at)
    : { date: '01/31/2026', time: '12:00' };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center px-5 pb-4 pt-12">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Ionicons name="chevron-back" size={32} color="#1E1E1E" />
          </TouchableOpacity>
          <Text className="text-[32px] font-bold text-[#7370FF]">Site Updates</Text>
        </View>

        {/* Tabs */}
        <View className="mb-8 flex-row px-5">
          <View className="h-[60px] flex-1 flex-row rounded-[14px] border border-[#E7E7EE] bg-white p-1">
            {['Morning', 'Noon', 'Afternoon'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                className={`flex-1 items-center justify-center rounded-[10px] ${activeTab === tab ? 'border border-[#7370FF]' : ''}`}>
                <Text
                  className={`text-[14px] font-bold ${activeTab === tab ? 'text-[#7370FF]' : 'text-[#A3A3A3]'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="px-5">
              <Text className="mb-4 text-[18px] font-bold text-[#1E1E1E]">Site Photos</Text>

              {/* Photo Container */}
              <View className="mb-6">
                <View className="relative h-[240px] w-full overflow-hidden rounded-[24px] bg-[#F0F0F0]">
                  {currentUpdate?.photo_url && (
                    <Image
                      source={{
                        uri: currentUpdate.photo_url.startsWith('http')
                          ? currentUpdate.photo_url
                          : `${API_URL}${currentUpdate.photo_url}`,
                      }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  )}
                  {/* Bounding Box Simulation */}
                  <View
                    className="absolute rounded-sm border-2 border-[#7370FF]"
                    style={{ top: '35%', left: '42%', width: '20%', height: '30%' }}>
                    <View className="absolute -bottom-6 left-1/2 -ml-[40px] rounded-full bg-[#5DBF50]/90 px-3 py-0.5">
                      <Text className="text-[10px] font-bold text-white">8 installed</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Metadata Grid */}
              <View className="mb-6 flex-row">
                <View className="flex-1">
                  <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Date</Text>
                  <Text className="text-[16px] font-bold text-[#1E1E1E]">{date}</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Taken By</Text>
                  <Text className="text-[16px] font-bold text-[#1E1E1E]">
                    {currentUpdate?.partner || 'Gavin Rama'}
                  </Text>
                </View>
                <View className="flex-1 items-end">
                  <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Time</Text>
                  <Text className="text-[16px] font-bold text-[#1E1E1E]">{time}</Text>
                </View>
              </View>

              {/* Notes */}
              <View className="mb-8">
                <Text className="mb-1 text-[14px] font-medium text-[#A3A3A3]">Notes</Text>
                <Text className="text-[16px] font-bold leading-6 text-[#1E1E1E]">
                  {currentUpdate?.notes || 'Ongoing Works: Glass Panes Installing.'}
                </Text>
              </View>

              {/* Comments Section */}
              <View className="mb-10 rounded-[24px] bg-[#F6F6FF] p-6">
                <Text className="mb-6 text-[18px] font-bold text-[#1E1E1E]">Comments</Text>

                {comments.map((comment, index) => (
                  <View
                    key={comment.id}
                    className={`flex-row items-center ${index !== comments.length - 1 ? 'mb-6' : ''}`}>
                    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-[#FFD6E8]">
                      <Text className="text-[12px] font-bold text-[#FF1F8E]">
                        {comment.initials}
                      </Text>
                    </View>
                    <Text className="flex-1 text-[15px] font-medium text-[#1E1E1E]">
                      {comment.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
