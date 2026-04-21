import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';

interface NotificationMetadata {
  task_id?: number;
  project_id?: number;
  item_id?: number;
}

interface Notification {
  id: number;
  type: 'update' | 'alert' | 'message' | 'success';
  title: string;
  message: string;
  time: string;
  is_read: boolean;
  metadata?: NotificationMetadata | null;
}

interface NotificationsProps {
  userId: number;
  onNavigateToTask?: (taskId: number) => void;
  onNavigateToInventory?: (projectId: number) => void;
  onNavigateToTab?: (tab: 'home' | 'mywork' | 'notifications' | 'more') => void;
}

export default function Notifications({ userId, onNavigateToTask, onNavigateToInventory, onNavigateToTab }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notifications?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error('Expected array from notifications API, got:', data);
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return 'stats-chart-outline';
      case 'update':
        return 'refresh-outline';
      case 'message':
        return 'chatbox-outline';
      case 'success':
        return 'clipboard-outline';
      default:
        return 'notifications-outline';
    }
  };


  const getColor = (type: string) => {
    switch (type) {
      case 'alert':
        return '#FF6B6B';
      case 'update':
        return '#7370FF';
      case 'message':
        return '#4DABF7';
      case 'success':
        return '#51CF66';
      default:
        return '#B9B9B9';
    }
  };

  const markAsRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch(`${API_URL}/notifications/read-all?userId=${userId}`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationPress = (notif: Notification) => {
    // 1. Instantly mark as read locally and in background (don't await!)
    if (!notif.is_read) {
      markAsRead(notif.id).catch(err => console.error("Mark as read error:", err));
    }

    const meta = notif.metadata;

    // 2. Navigation with fallbacks
    if (meta?.task_id && onNavigateToTask) {
      onNavigateToTask(meta.task_id);
    } else if (notif.type === 'alert' && meta?.project_id && onNavigateToInventory) {
      onNavigateToInventory(meta.project_id);
    } else if (onNavigateToTab) {
      // Fallback: If no metadata (old notifications), just go to My Work
      onNavigateToTab('mywork');
    }
  };

  const getActionLabel = (notif: Notification) => {
    const meta = notif.metadata;
    if (!meta) return 'View details';
    if (meta.task_id) return 'View task';
    if (notif.type === 'alert' && meta.project_id) return 'Check inventory';
    return 'View details';
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Format the time display with relative timestamps
  const formatTime = (time: string, createdAt?: string) => {
    if (createdAt) {
      const diff = Date.now() - new Date(createdAt).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return new Date(createdAt).toLocaleDateString();
    }
    return time || 'Just now';
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7370FF']}
            tintColor="#7370FF"
          />
        }>
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 pt-5">
          <View>
            <Text className="text-[24px] font-bold text-[#7370FF]">Notifications</Text>
            <Text className="mt-1 text-[13px] text-[#A3A3A3]">
              {loading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </Text>
          </View>
        </View>


        { }
        <View className="mb-6 flex-row rounded-[100px] border border-[#F0F0F0] bg-[#FAFAFA] p-1.5 self-center w-full">
          <TouchableOpacity
            className={`flex-1 items-center rounded-full py-2.5 ${filter === 'all' ? 'bg-[#7370FF]' : ''}`}
            onPress={() => setFilter('all')}
            style={
              filter === 'all'
                ? { shadowColor: '#7370FF', shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }
                : {}
            }>
            <Text
              className={`text-[13px] font-bold ${filter === 'all' ? 'text-white' : 'text-[#A3A3A3]'}`}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center rounded-full py-2.5 ${filter === 'unread' ? 'bg-[#7370FF]' : ''}`}
            onPress={() => setFilter('unread')}>
            <Text
              className={`text-[13px] font-bold ${filter === 'unread' ? 'text-white' : 'text-[#A3A3A3]'}`}>
              Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>


        {loading ? (
          <ActivityIndicator color="#7370FF" size="large" className="mt-10" />
        ) : filtered.length === 0 ? (
          <View className="mt-20 items-center justify-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#F5F5F7]">
              <Ionicons name="notifications-off-outline" size={40} color="#D1D1D6" />
            </View>
            <Text className="text-base font-medium text-[#A3A3A3]">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </Text>
          </View>
        ) : (
          filtered.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              onPress={() => handleNotificationPress(notif)}
              onLongPress={() => deleteNotification(notif.id)}
              activeOpacity={0.7}
              className={`mb-4 rounded-[20px] border bg-white p-5 ${notif.is_read ? 'border-[#F8F8F8]' : 'border-[#EDE9FF]'}`}
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.02,
                shadowRadius: 10,
                elevation: 1,
              }}>
              <View className="flex-row items-start">
                {/* Icon container */}
                <View
                  className="mr-4 h-11 w-11 items-center justify-center rounded-[15px]"
                  style={{ backgroundColor: '#E8E7FF' }}>
                  <Ionicons
                    name={getIcon(notif.type) as any}
                    size={22}
                    color="#7370FF"
                  />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-[15px] font-bold text-[#1E1E1E]">
                      {notif.title}
                    </Text>

                    {!notif.is_read && <View className="h-2 w-2 rounded-full bg-[#7370FF]" />}
                  </View>
                  <Text
                    className="text-[13px] leading-[20px] text-[#444]">
                    {notif.message}

                    {notif.metadata?.task_id && (
                      <Text className="text-[#7370FF] font-bold"> Check details.</Text>
                    )}
                  </Text>
                  <View className="mt-3 flex-row items-center">
                    <Ionicons name="time-outline" size={13} color="#D1D1D1" />
                    <Text className="ml-1 text-[11px] font-medium text-[#D1D1D1]">
                      {formatTime(notif.time, (notif as any).created_at)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

          ))
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
