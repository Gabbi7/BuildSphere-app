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
  shift: 'Morning' | 'Noon' | 'Afternoon';
}

interface Comment {
  id: number;
  user: string;
  initials: string;
  text: string;
  avatarBg?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  projectName: string;
}

const PRIMARY = '#7370FF';

export default function SiteUpdatesScreen({ visible, onClose, projectName }: Props) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'Today' | 'Past'>('Today');
  const [activeShift, setActiveShift] = useState<'Morning' | 'Noon' | 'Afternoon'>('Noon');
  const [selectedDate, setSelectedDate] = useState(new Date('2026-01-31')); // Match paper demo dates
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);

  const comments: Comment[] = [];


  useEffect(() => {
    if (visible) {
      fetchUpdates();
    }
  }, [visible, projectName, activeShift, selectedDate, timeRange]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      // In a real app, we would pass date/shift to the API. 
      // For this refinement, we'll fetch all and filter client-side to show the specified UI.
      const response = await fetch(
        `${API_URL}/site-progress/project/${encodeURIComponent(projectName)}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setUpdates(data);
      } else {
        console.warn('Expected array for site updates, got:', data);
        setUpdates([]);
      }
    } catch (error) {
      console.error('Fetch Site Updates Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock filtering based on the paper's demo data
  const currentUpdate = (Array.isArray(updates) ? updates.find(u => u.shift === activeShift) : null) || (updates && updates[0]) || null;

  const renderCalendar = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = Array.from({ length: 31 }, (_, i) => i + 1);
    
    return (
      <View className="bg-white rounded-[24px] border border-[#F0F0F0] p-5 mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[16px] font-bold text-[#1E1E1E]">January</Text>
          <View className="flex-row gap-4">
            <Ionicons name="chevron-back" size={20} color="#A3A3A3" />
            <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2">
          {days.map((d, i) => (
            <Text key={`${d}-${i}`} className="w-8 text-center text-[11px] font-bold text-[#D1D1D6]">{d}</Text>
          ))}
        </View>

        
        <View className="flex-row flex-wrap justify-between">
          {dates.map(date => {
            const isSelected = date === 15; // Mock highlighting Jan 15 like Figure 93
            return (
              <TouchableOpacity 
                key={date}
                className={`w-8 h-8 items-center justify-center rounded-full mb-1 ${isSelected ? 'bg-[#7370FF]' : ''}`}>
                <Text className={`text-[12px] font-semibold ${isSelected ? 'text-white' : 'text-[#1E1E1E]'}`}>
                  {date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

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

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View className="px-5">
            
            {/* Layer 1: Today / Past Toggle (Figure 111 Type) */}
            <View className="mb-6 flex-row gap-8">
              <TouchableOpacity onPress={() => setTimeRange('Today')}>
                <Text className={`text-[14px] font-bold ${timeRange === 'Today' ? 'text-[#7370FF]' : 'text-[#A3A3A3]'}`}>
                  Today
                </Text>
                {timeRange === 'Today' && <View className="mt-1 h-0.5 w-full bg-[#7370FF]" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTimeRange('Past')}>
                <Text className={`text-[14px] font-bold ${timeRange === 'Past' ? 'text-[#7370FF]' : 'text-[#A3A3A3]'}`}>
                  Past
                </Text>
                {timeRange === 'Past' && <View className="mt-1 h-0.5 w-full bg-[#7370FF]" />}
              </TouchableOpacity>
            </View>

            {/* Layer 2: Shift Switcher */}
            {timeRange === 'Today' && (
              <View className="mb-8 flex-row">
                <View className="h-[60px] flex-1 flex-row rounded-[14px] border border-[#E7E7EE] bg-white p-1">
                  {['Morning', 'Noon', 'Afternoon'].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveShift(tab as any)}
                      className={`flex-1 items-center justify-center rounded-[10px] ${activeShift === tab ? 'border border-[#7370FF] bg-[#F8F7FF]' : ''}`}>
                      <Text
                        className={`text-[13px] font-bold ${activeShift === tab ? 'text-[#7370FF]' : 'text-[#A3A3A3]'}`}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Calendar for "Past" mode */}
            {timeRange === 'Past' && renderCalendar()}

            <Text className="mb-4 text-[18px] font-bold text-[#1E1E1E]">Site Photos</Text>

            {loading ? (
              <ActivityIndicator color={PRIMARY} />
            ) : (
              <View>
                {/* Photo Container */}
                <View className="mb-6">
                  {(() => {
                    let photos: string[] = [];
                    try {
                      if (currentUpdate?.photo_url) {
                        const parsed = JSON.parse(currentUpdate.photo_url);
                        photos = Array.isArray(parsed) ? parsed : [currentUpdate.photo_url];
                      }
                    } catch (e) {
                      if (currentUpdate?.photo_url) photos = [currentUpdate.photo_url];
                    }

                    if (photos.length > 0) {
                      return (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                          {photos.map((p, idx) => (
                            <View key={idx} className="relative h-[240px] w-[300px] mr-4 overflow-hidden rounded-[24px] bg-[#F0F0F0]">
                              <Image
                                source={{
                                  uri: p.startsWith('http') ? p : `${API_URL}${p}`,
                                }}
                                className="h-full w-full"
                                resizeMode="cover"
                              />
                              {/* Count Badge on the first photo or each photo? Let's show on each for clarity */}
                              <View className="absolute bottom-4 right-4 rounded-full bg-[#5DBF50]/90 px-3 py-1 shadow-sm">
                                <Text className="text-[10px] font-bold text-white">
                                  {currentUpdate?.glass_count || 0} installed
                                </Text>
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                      );
                    }

                    return (
                      <View className="h-[240px] w-full items-center justify-center rounded-[24px] bg-[#F0F0F0]">
                        <Ionicons name="image-outline" size={48} color="#D1D1D6" />
                        <Text className="text-[12px] text-gray-400 mt-2">No photo for this shift</Text>
                      </View>
                    );
                  })()}
                </View>

                {/* Metadata Grid */}
                <View className="mb-6 flex-row">
                  <View className="flex-1">
                    <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Date</Text>
                    <Text className="text-[16px] font-bold text-[#1E1E1E]">
                      {currentUpdate ? new Date(currentUpdate.created_at).toLocaleDateString() : '01/31/2026'}
                    </Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Taken By</Text>
                    <Text className="text-[16px] font-bold text-[#1E1E1E]">
                      {currentUpdate?.partner || 'Gavin Rama'}
                    </Text>
                  </View>
                  <View className="flex-1 items-end">
                    <Text className="mb-1 text-[12px] font-medium text-[#A3A3A3]">Time</Text>
                    <Text className="text-[16px] font-bold text-[#1E1E1E]">
                      {activeShift === 'Morning' ? '08:00 AM' : activeShift === 'Noon' ? '12:00 PM' : '04:00 PM'}
                    </Text>
                  </View>
                </View>

                {/* Notes */}
                <View className="mb-8">
                  <Text className="mb-1 text-[13px] font-medium text-[#A3A3A3]">Notes</Text>
                  <Text className="text-[15px] font-semibold leading-6 text-[#1E1E1E]">
                    {currentUpdate?.notes || 'Ongoing Works: Glass Panes Installing.'}
                  </Text>
                </View>

                {/* Comments Section */}
                <View className="mb-10 rounded-[24px] bg-[#F6F6FF] p-6 border border-[#EDECFF]">
                  <Text className="mb-6 text-[18px] font-bold text-[#1E1E1E]">Comments</Text>

                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <View
                        key={comment.id}
                        className={`flex-row items-center ${index !== comments.length - 1 ? 'mb-6' : ''}`}>
                        <View 
                          className="mr-4 h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: comment.avatarBg }}>
                          <Text className="text-[12px] font-bold text-[#FF1F8E]">
                            {comment.initials}
                          </Text>
                        </View>
                        <Text className="flex-1 text-[14px] font-medium text-[#1E1E1E]">
                          {comment.text}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-[13px] text-gray-400 italic">No comments yet</Text>
                  )}

                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
