import { useState } from 'react';
import { View, Text, Pressable, Image, Modal } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';

export function HeaderUserButton() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?';
  const avatarUrl = user?.imageUrl;
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <>
      <Pressable onPress={() => setOpen(true)} className="mr-4">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-9 h-9 rounded-full" />
        ) : (
          <View className="w-9 h-9 rounded-full bg-amber-500 items-center justify-center">
            <Text className="text-sm font-bold text-white">{initials}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpen(false)}>
          <View className="absolute right-4 top-16 bg-white rounded-2xl shadow-xl w-56 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-100">
              <Text className="text-sm font-semibold text-navy-900">{`${firstName} ${lastName}`.trim() || 'Usuario'}</Text>
              <Text className="text-xs text-gray-400" numberOfLines={1}>{email}</Text>
            </View>
            <Pressable
              onPress={() => { setOpen(false); signOut(); }}
              className="flex-row items-center gap-2 px-4 py-3"
            >
              <LogOut size={16} color="#ef4444" />
              <Text className="text-sm text-red-500 font-medium">Cerrar sesión</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
