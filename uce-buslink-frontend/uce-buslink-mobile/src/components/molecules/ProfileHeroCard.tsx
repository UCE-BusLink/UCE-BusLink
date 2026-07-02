import { View, Text, Image } from 'react-native';
import { Mail, ShieldCheck } from 'lucide-react-native';

interface ProfileHeroCardProps {
  fullName: string;
  email: string;
  initials: string;
  avatarUrl: string | undefined;
  roleLabel: string;
}

export function ProfileHeroCard({ fullName, email, initials, avatarUrl, roleLabel }: ProfileHeroCardProps) {
  return (
    <View className="bg-navy-900 rounded-2xl shadow-sm p-6 mb-6">
      <View className="flex-row items-center gap-5">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-20 h-20 rounded-2xl" />
        ) : (
          <View className="w-20 h-20 rounded-2xl bg-amber-500 items-center justify-center">
            <Text className="text-2xl font-bold text-white">{initials}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white" numberOfLines={1}>{fullName}</Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Mail size={14} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/50 text-sm">{email || '—'}</Text>
          </View>
          <View className="flex-row self-start items-center gap-1.5 mt-3 bg-green-500/15 px-3 py-1 rounded-full">
            <ShieldCheck size={13} color="#4ade80" />
            <Text className="text-xs font-semibold text-green-400">{roleLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
