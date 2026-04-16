import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/api';

interface Notification {
  id: number;
  type: 'update' | 'alert' | 'message' | 'success';
  title: string;
  message: string;
  time: string;
  is_read: boolean;
}

interface NotificationsProps {
  userId: number;
}

export default function Notifications({ userId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetch(`${API_URL}/notifications?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        // Defensive check: Ensure we got an array
        if (Array.isArray(data)) {
          setNotifications(data);
        } else {
          console.error('Expected array from notifications API, got:', data);
          setNotifications([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return 'alert-circle';
      case 'update':
        return 'calendar';
      case 'message':
        return 'chatbox';
      case 'success':
        return 'checkmark-circle';
      default:
        return 'notifications';
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
    await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    // In a real app, you'd have an endpoint for this, but for now we loop or just update local
    // Let's assume there's a batch endpoint or we just do it for the current list
    notifications.forEach(async (n) => {
      if (!n.is_read) await fetch(`${API_URL}/notifications/${n.id}/read`, { method: 'PATCH' });
    });
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 pt-5">
          <View>
            <Text className="text-[24px] font-bold text-[#7370FF]">Notifications</Text>
            <Text className="mt-1 text-[13px] text-[#A3A3A3]">
              {loading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </Text>
          </View>
          {!loading && unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead}>
              <Text className="text-[12px] font-bold text-[#7370FF]">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* All / Unread Toggle */}
        <View className="mb-5 flex-row rounded-[12px] bg-[#F5F5F7] p-1">
          <TouchableOpacity
            className={`flex-1 items-center rounded-[10px] py-2 ${filter === 'all' ? 'bg-white' : ''}`}
            onPress={() => setFilter('all')}
            style={
              filter === 'all'
                ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }
                : {}
            }>
            <Text
              className={`text-[13px] font-semibold ${filter === 'all' ? 'text-[#1E1E1E]' : 'text-[#A3A3A3]'}`}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center rounded-[10px] py-2 ${filter === 'unread' ? 'bg-white' : ''}`}
            onPress={() => setFilter('unread')}
            style={
              filter === 'unread'
                ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }
                : {}
            }>
            <Text
              className={`text-[13px] font-semibold ${filter === 'unread' ? 'text-[#1E1E1E]' : 'text-[#A3A3A3]'}`}>
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
              onPress={() => markAsRead(notif.id)}
              activeOpacity={0.7}
              className={`mb-4 rounded-[20px] border bg-white p-5 ${notif.is_read ? 'border-[#F2F2F7]' : 'border-[#E8E7FF]'}`}
              style={{
                shadowColor: notif.is_read ? '#000' : '#7370FF',
                shadowOpacity: notif.is_read ? 0.05 : 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}>
              <View className="flex-row items-start">
                {/* Icon container with subtle gradient-like background */}
                <View
                  className="mr-4 h-12 w-12 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: getColor(notif.type) + '15' }}>
                  <Ionicons
                    name={getIcon(notif.type) as any}
                    size={24}
                    color={getColor(notif.type)}
                  />
                </View>

                <View className="flex-1">
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text
                      className={`text-[15px] font-bold ${notif.is_read ? 'text-[#6A6A6A]' : 'text-[#1E1E1E]'}`}>
                      {notif.title}
                    </Text>
                    {!notif.is_read && <View className="h-2 w-2 rounded-full bg-[#7370FF]" />}
                  </View>

                  <Text
                    className={`mb-3 text-[13px] leading-[20px] ${notif.is_read ? 'text-[#A3A3A3]' : 'text-[#5A5A5A]'}`}>
                    {notif.message}{' '}
                    <Text className="text-[12px] font-bold text-[#7370FF]">Check details.</Text>
                  </Text>

                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#C4C4C4" />
                    <Text className="ml-1.5 text-[11px] font-medium text-[#C4C4C4]">
                      {notif.time}
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
