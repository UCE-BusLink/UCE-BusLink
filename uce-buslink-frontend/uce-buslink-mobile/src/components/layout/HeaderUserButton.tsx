import { useState } from 'react';
import { View, Text, Pressable, Image, Modal, ScrollView } from 'react-native';
import { LogOut, Bell, X } from 'lucide-react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../services/api';

interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function HeaderUserButton() {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNotifMenu, setOpenNotifMenu] = useState(false);

  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?';
  const avatarUrl = user?.imageUrl;
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  const { data, isLoading } = useQuery<PageResponse<NotificationResponse>>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      
      const res = await apiFetch<PageResponse<NotificationResponse>>(
        '/api/v1/notifications/user?page=0&size=10', 
        token, 
        { method: 'GET' }
      );
      return res;
    },
    refetchInterval: 30000,
  });

  const notifications = data?.content || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View className="flex-row items-center gap-3 mr-4">
      {/* Notification Bell */}
      <Pressable 
        onPress={() => setOpenNotifMenu(true)} 
        className="relative w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center active:bg-gray-50"
      >
        <Bell size={18} color="#4b5563" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 items-center justify-center bg-red-500 rounded-full">
            <Text className="text-[10px] font-bold text-white">{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      {/* User Avatar */}
      <Pressable onPress={() => setOpenUserMenu(true)}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-9 h-9 rounded-full" />
        ) : (
          <View className="w-9 h-9 rounded-full bg-amber-500 items-center justify-center">
            <Text className="text-sm font-bold text-white">{initials}</Text>
          </View>
        )}
      </Pressable>

      {/* User Modal */}
      <Modal visible={openUserMenu} transparent animationType="fade" onRequestClose={() => setOpenUserMenu(false)}>
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpenUserMenu(false)}>
          <View className="absolute right-4 top-16 bg-white rounded-2xl shadow-xl w-56 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-100">
              <Text className="text-sm font-semibold text-navy-900">{`${firstName} ${lastName}`.trim() || 'Usuario'}</Text>
              <Text className="text-xs text-gray-400" numberOfLines={1}>{email}</Text>
            </View>
            <Pressable
              onPress={() => { setOpenUserMenu(false); signOut(); }}
              className="flex-row items-center gap-2 px-4 py-3 active:bg-gray-50"
            >
              <LogOut size={16} color="#ef4444" />
              <Text className="text-sm text-red-500 font-medium">Cerrar sesión</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={openNotifMenu} transparent animationType="fade" onRequestClose={() => setOpenNotifMenu(false)}>
        <Pressable className="flex-1 bg-black/30 justify-center items-center p-4" onPress={() => setOpenNotifMenu(false)}>
          <Pressable 
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl max-h-[80%]" 
            onPress={(e) => e.stopPropagation()} // Prevent closing when tapping inside
          >
            <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-base font-bold text-navy-900">Notificaciones</Text>
              <Pressable onPress={() => setOpenNotifMenu(false)} className="p-1">
                <X size={18} color="#9ca3af" />
              </Pressable>
            </View>
            <ScrollView className="px-2" contentContainerStyle={{ paddingVertical: 10 }}>
              {isLoading ? (
                <Text className="py-10 text-center text-sm text-gray-500">Cargando...</Text>
              ) : notifications.length === 0 ? (
                <Text className="py-10 text-center text-sm text-gray-500">No tienes notificaciones</Text>
              ) : (
                <View className="gap-2">
                  {notifications.map((notif) => (
                    <View 
                      key={notif.id} 
                      className={`px-4 py-3 rounded-xl border ${!notif.isRead ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-100'}`}
                    >
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-sm font-semibold text-navy-900 flex-1 mr-2">{notif.title}</Text>
                        <Text className="text-[10px] text-gray-400">
                          {new Date(notif.createdAt).toLocaleDateString('es-EC')}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-600 leading-relaxed">{notif.message}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
