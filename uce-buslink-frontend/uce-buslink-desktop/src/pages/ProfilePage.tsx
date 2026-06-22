import { useUser } from '@clerk/clerk-react';
import { useCurrentUser } from '../context/AuthContext';
import { Mail, IdCard, ShieldCheck, Bus, Clock, Award } from 'lucide-react';
import { ProfileHeroCard, ProfileStatCard, ProfileInfoCard } from '../components/molecules';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  STUDENT: 'Estudiante verificado',
  DRIVER: 'Conductor',
};

export function ProfilePage() {
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
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Tu información de cuenta en UCE Bus-Link.</p>
      </div>

      <ProfileHeroCard
        fullName={fullName}
        email={email}
        initials={initials}
        avatarUrl={avatarUrl}
        roleLabel={ROLE_LABEL[role] ?? role}
      />

      <div className="grid grid-cols-3 gap-5 mb-6">
        <ProfileStatCard
          icon={<Award size={20} className="text-green-600" />}
          value="--"
          label="Índice de confianza"
          accent="bg-green-50"
        />
        <ProfileStatCard
          icon={<Bus size={20} className="text-navy-700" />}
          value="--"
          label="Viajes realizados"
          accent="bg-blue-50"
        />
        <ProfileStatCard
          icon={<Clock size={20} className="text-amber-600" />}
          value="--"
          label="Puntualidad"
          accent="bg-amber-50"
        />
      </div>

      <ProfileInfoCard
        title="Datos de la cuenta"
        rows={[
          { icon: <IdCard size={16} />, label: 'Nombre completo', value: fullName },
          { icon: <Mail size={16} />, label: 'Correo institucional', value: email || '—' },
          { icon: <ShieldCheck size={16} />, label: 'Rol', value: ROLE_LABEL[role] ?? role },
          { icon: <ShieldCheck size={16} />, label: 'Estado de la cuenta', value: 'Activa' },
        ]}
      />
    </div>
  );
}
