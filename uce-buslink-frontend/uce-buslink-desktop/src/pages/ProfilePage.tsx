import { useUser } from '@clerk/clerk-react';
import {
  Mail,
  IdCard,
  ShieldCheck,
  Bus,
  Clock,
  Award,
} from 'lucide-react';
import { mockUser } from '../data/mockData';

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-navy-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user: clerkUser } = useUser();

  // Datos de Clerk con fallback a mock mientras el backend de perfil no esté listo.
  const firstName = clerkUser?.firstName ?? mockUser.name;
  const lastName = clerkUser?.lastName ?? mockUser.lastName;
  const fullName = `${firstName} ${lastName}`.trim();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ?? mockUser.email;
  const initials =
    (firstName?.[0] ?? '') + (lastName?.[0] ?? '') || mockUser.initials;
  const avatarUrl = clerkUser?.imageUrl;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tu información de estudiante y tu historial de viajes.
        </p>
      </div>

      <div className="bg-navy-900 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {initials.toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">{fullName}</h2>
            <p className="text-white/50 text-sm flex items-center gap-1.5 mt-1">
              <Mail size={14} />
              {email}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-green-500/15 text-green-400 px-3 py-1 rounded-full">
              <ShieldCheck size={13} />
              Estudiante verificado
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        <StatCard
          icon={<Award size={20} className="text-green-600" />}
          value={`${mockUser.trustScore}%`}
          label="Índice de confianza"
          accent="bg-green-50"
        />
        <StatCard
          icon={<Bus size={20} className="text-navy-700" />}
          value={`${mockUser.totalTrips}`}
          label="Viajes realizados"
          accent="bg-blue-50"
        />
        <StatCard
          icon={<Clock size={20} className="text-amber-600" />}
          value={`${mockUser.punctualityRate}%`}
          label="Puntualidad"
          accent="bg-amber-50"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-2">
          Datos de la cuenta
        </h3>
        <InfoRow
          icon={<IdCard size={16} />}
          label="Identificación universitaria"
          value={mockUser.universityId}
        />
        <InfoRow icon={<Mail size={16} />} label="Correo institucional" value={email} />
        <InfoRow
          icon={<ShieldCheck size={16} />}
          label="Estado de la cuenta"
          value="Activa"
        />
      </div>
    </div>
  );
}
