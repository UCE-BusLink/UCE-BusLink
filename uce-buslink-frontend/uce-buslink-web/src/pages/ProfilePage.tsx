import { useUser, useAuth } from '@clerk/clerk-react';
import { useCurrentUser } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../services/api';
import { Mail, IdCard, ShieldCheck, Bus, Clock, Award, Phone, MapPin, GraduationCap, Calendar, Hash, Bell, Eye, Navigation, AlertTriangle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ProfileHeroCard, ProfileStatCard, ProfileInfoCard } from '../components/molecules';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  STUDENT: 'Estudiante verificado',
  DRIVER: 'Conductor',
};

export function ProfilePage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { user, syncDone } = useCurrentUser();
  const { getToken } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = await getToken({ template: "uce-buslink" });
      if (!token) throw new Error("No token");
      return getUserProfile(token);
    },
    enabled: isLoaded && isSignedIn && syncDone,
  });

  const firstName = profile?.usuario?.nombres || clerkUser?.firstName || '';
  const lastName = profile?.usuario?.apellidos || clerkUser?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Sin nombre';
  const email = profile?.usuario?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?';
  const avatarUrl = profile?.usuario?.fotoPerfil || clerkUser?.imageUrl;
  const role = profile?.usuario?.rol || user?.role || 'STUDENT';

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <ProfileStatCard
          icon={<Award size={20} className="text-green-600" />}
          value={profile ? `${profile.puntuacionConfianza.puntuacion}/100` : "--"}
          label="Índice de confianza"
          accent="bg-green-50"
        />
        <ProfileStatCard
          icon={<Bus size={20} className="text-navy-700" />}
          value={profile?.estadisticas?.viajesTotales?.toString() || "--"}
          label="Viajes realizados"
          accent="bg-blue-50"
        />
        <ProfileStatCard
          icon={<Clock size={20} className="text-amber-600" />}
          value={profile ? `${profile.estadisticas.tiempoPromedioEspera} min` : "--"}
          label="Espera promedio"
          accent="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ProfileInfoCard
            title="Datos de la cuenta"
            rows={[
              { icon: <IdCard size={16} />, label: 'Nombre completo', value: fullName },
              { icon: <Mail size={16} />, label: 'Correo institucional', value: email || '—' },
              { icon: <ShieldCheck size={16} />, label: 'Rol', value: ROLE_LABEL[role] ?? role },
              { icon: <ShieldCheck size={16} />, label: 'Estado de la cuenta', value: profile?.usuario?.estado === 'ACTIVE' ? 'Activa' : (profile?.usuario?.estado || 'Desconocido') },
            ]}
          />

          <ProfileInfoCard
            title="Información Personal"
            rows={[
              { icon: <GraduationCap size={16} />, label: 'Carrera', value: profile?.usuario?.carrera || 'No especificada' },
              { icon: <Phone size={16} />, label: 'Teléfono', value: profile?.usuario?.telefonoContacto || 'No especificado' },
              { icon: <MapPin size={16} />, label: 'Dirección', value: profile?.usuario?.direccion || 'No especificada' },
              { icon: <Hash size={16} />, label: 'Documento', value: profile?.usuario?.numeroDocumento || 'No especificado' },
              { icon: <Calendar size={16} />, label: 'Fecha de Nacimiento', value: profile?.usuario?.fechaNacimiento || 'No especificada' },
            ]}
          />
        </div>

        <div className="space-y-6">
          <ProfileInfoCard
            title="Detalles de Confianza"
            rows={[
              { icon: <Award size={16} />, label: 'Nivel actual', value: profile?.puntuacionConfianza?.nivel || 'No definido' },
              { icon: <CheckCircle size={16} />, label: 'Reservas completadas', value: `${profile?.puntuacionConfianza?.reservasCompletadas || 0} / ${profile?.puntuacionConfianza?.reservasTotales || 0}` },
              { icon: <XCircle size={16} />, label: 'No Shows', value: (profile?.puntuacionConfianza?.noShows || 0).toString() },
              { icon: <AlertTriangle size={16} />, label: 'Cancelaciones (30 días)', value: (profile?.puntuacionConfianza?.cancelacionesUltimo30dias || 0).toString() },
              { icon: <TrendingUp size={16} />, label: 'Tendencia (7 días)', value: `${profile?.puntuacionConfianza?.trendultimos7dias || 0 > 0 ? '+' : ''}${profile?.puntuacionConfianza?.trendultimos7dias || 0} pts` },
            ]}
          />

          <ProfileInfoCard
            title="Estadísticas de Viaje"
            rows={[
              { icon: <Navigation size={16} />, label: 'Distancia total (km)', value: (profile?.estadisticas?.kmTotalesViajados || 0).toString() },
              { icon: <Clock size={16} />, label: 'Horas en tránsito', value: (profile?.estadisticas?.horasTotalesEnTransito || 0).toString() },
              { icon: <Calendar size={16} />, label: 'Días activo', value: (profile?.estadisticas?.diasActivo || 0).toString() },
            ]}
          />
          
          <ProfileInfoCard
            title="Preferencias del Sistema"
            rows={[
              { icon: <Bell size={16} />, label: 'Notificaciones Push', value: profile?.preferencias?.notificacionesHabilitadas ? 'Sí' : 'No' },
              { icon: <Mail size={16} />, label: 'Notificaciones Email', value: profile?.preferencias?.notificacionesEmail ? 'Sí' : 'No' },
              { icon: <MapPin size={16} />, label: 'Compartir ubicación', value: profile?.preferencias?.compartirUbicacion ? 'Sí' : 'No' },
              { icon: <Eye size={16} />, label: 'Visibilidad de perfil', value: profile?.preferencias?.visibilidadPerfil === 'PUBLIC' ? 'Público' : 'Privado' },
            ]}
          />
        </div>
      </div>

      {profile?.puntuacionConfianza?.penalizacionesActivas && profile.puntuacionConfianza.penalizacionesActivas.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-bold text-navy-900">Penalizaciones Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.puntuacionConfianza.penalizacionesActivas.map((pen) => (
              <div key={pen.id} className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-red-900">{pen.tipo}</p>
                  <p className="text-xs text-red-700 mt-1">{pen.razon}</p>
                  <p className="text-xs text-red-600 mt-2 font-medium">-{pen.puntosRestados} pts (Vence: {pen.fechaExpiracion ? new Date(pen.fechaExpiracion).toLocaleDateString() : 'Indefinido'})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile?.puntuacionConfianza?.historico && profile.puntuacionConfianza.historico.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Historial de Confianza</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {profile.puntuacionConfianza.historico.map((hist, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-navy-900">{hist.evento}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(hist.fecha).toLocaleString()}</p>
                  </div>
                  <div className={`text-sm font-bold ${hist.cambio >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {hist.cambio >= 0 ? '+' : ''}{hist.cambio} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
