import { View, Text } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useCurrentUser } from '../context/AuthContext';
import { Mail, IdCard, ShieldCheck, Bus, Clock, Award } from 'lucide-react-native';
import { ProfileHeroCard, ProfileStatCard, ProfileInfoCard } from '../components/molecules';
import { ScreenContainer } from '../components/layout/ScreenContainer';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  STUDENT: 'Estudiante verificado',
  DRIVER: 'Conductor',
};

export function ProfileScreen() {
  const { user: clerkUser } = useUser();
  const { user } = useCurrentUser();

  const firstName = clerkUser?.firstName ?? '';
  const lastName = clerkUser?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Sin nombre';
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? '';
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?';
  const avatarUrl = clerkUser?.imageUrl;
  const role = user?.role ?? 'STUDENT';

  return (
    <ScreenContainer>
      <View className="mb-7">
        <Text className="text-2xl font-bold text-navy-900">Mi perfil</Text>
        <Text className="text-gray-500 text-sm mt-1">Tu información de cuenta en UCE Bus-Link.</Text>
      </View>

      <ProfileHeroCard
        fullName={fullName}
        email={email}
        initials={initials}
        avatarUrl={avatarUrl}
        roleLabel={ROLE_LABEL[role] ?? role}
      />

      <View className="flex-row gap-3 mb-6">
        <ProfileStatCard icon={<Award size={20} color="#16a34a" />} value="--" label="Confianza" accent="bg-green-50" />
        <ProfileStatCard icon={<Bus size={20} color="#1a3a5c" />} value="--" label="Viajes" accent="bg-blue-50" />
        <ProfileStatCard icon={<Clock size={20} color="#d97706" />} value="--" label="Puntualidad" accent="bg-amber-50" />
      </View>

      <ProfileInfoCard
        title="Datos de la cuenta"
        rows={[
          { icon: <IdCard size={16} color="#6b7280" />, label: 'Nombre completo', value: fullName },
          { icon: <Mail size={16} color="#6b7280" />, label: 'Correo institucional', value: email || '—' },
          { icon: <ShieldCheck size={16} color="#6b7280" />, label: 'Rol', value: ROLE_LABEL[role] ?? role },
          { icon: <ShieldCheck size={16} color="#6b7280" />, label: 'Estado de la cuenta', value: 'Activa' },
        ]}
      />
    </ScreenContainer>
  );
}
