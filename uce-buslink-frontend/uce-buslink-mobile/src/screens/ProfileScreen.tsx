import { View, Text, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useCurrentUser } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { Mail, IdCard, ShieldCheck, Bus, Clock, Award, Phone, MapPin, GraduationCap, Calendar, Hash, Bell, Eye, Navigation, AlertTriangle, TrendingUp, CheckCircle, XCircle } from 'lucide-react-native';
import { ProfileHeroCard, ProfileStatCard, ProfileInfoCard } from '../components/molecules';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Spinner } from '../components/atoms';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  STUDENT: 'Estudiante verificado',
  DRIVER: 'Conductor',
};

export function ProfileScreen() {
  const { user: clerkUser } = useUser();
  const { user } = useCurrentUser();
  
  const { data: profile, isLoading } = useProfile();

  const firstName = profile?.usuario?.nombres || clerkUser?.firstName || '';
  const lastName = profile?.usuario?.apellidos || clerkUser?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Sin nombre';
  const email = profile?.usuario?.email || clerkUser?.primaryEmailAddress?.emailAddress || '';
  const initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '?';
  const avatarUrl = profile?.usuario?.fotoPerfil || clerkUser?.imageUrl;
  const role = profile?.usuario?.rol || user?.role || 'STUDENT';

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

      {isLoading ? (
        <View className="items-center py-10"><Spinner /></View>
      ) : (
        <View>
          <View className="flex-row gap-3 mb-6">
            <ProfileStatCard
              icon={<Award size={20} color="#16a34a" />}
              value={profile ? `${profile.puntuacionConfianza.puntuacion}/100` : "--"}
              label="Confianza"
              accent="bg-green-50"
            />
            <ProfileStatCard
              icon={<Bus size={20} color="#1a3a5c" />}
              value={profile?.estadisticas?.viajesTotales?.toString() || "--"}
              label="Viajes"
              accent="bg-blue-50"
            />
            <ProfileStatCard
              icon={<Clock size={20} color="#d97706" />}
              value={profile ? `${profile.estadisticas.tiempoPromedioEspera} min` : "--"}
              label="Espera med."
              accent="bg-amber-50"
            />
          </View>

          <View className="gap-6 mb-6">
            <ProfileInfoCard
              title="Datos de la cuenta"
              rows={[
                { icon: <IdCard size={16} color="#6b7280" />, label: 'Nombre completo', value: fullName },
                { icon: <Mail size={16} color="#6b7280" />, label: 'Correo institucional', value: email || '—' },
                { icon: <ShieldCheck size={16} color="#6b7280" />, label: 'Rol', value: ROLE_LABEL[role] ?? role },
                { icon: <ShieldCheck size={16} color="#6b7280" />, label: 'Estado de la cuenta', value: profile?.usuario?.estado === 'ACTIVE' ? 'Activa' : (profile?.usuario?.estado || 'Desconocido') },
              ]}
            />

            <ProfileInfoCard
              title="Información Personal"
              rows={[
                { icon: <GraduationCap size={16} color="#6b7280" />, label: 'Carrera', value: profile?.usuario?.carrera || 'No especificada' },
                { icon: <Phone size={16} color="#6b7280" />, label: 'Teléfono', value: profile?.usuario?.telefonoContacto || 'No especificado' },
                { icon: <MapPin size={16} color="#6b7280" />, label: 'Dirección', value: profile?.usuario?.direccion || 'No especificada' },
                { icon: <Hash size={16} color="#6b7280" />, label: 'Documento', value: profile?.usuario?.numeroDocumento || 'No especificado' },
                { icon: <Calendar size={16} color="#6b7280" />, label: 'Fecha de Nacimiento', value: profile?.usuario?.fechaNacimiento || 'No especificada' },
              ]}
            />

            <ProfileInfoCard
              title="Detalles de Confianza"
              rows={[
                { icon: <Award size={16} color="#6b7280" />, label: 'Nivel actual', value: profile?.puntuacionConfianza?.nivel || 'No definido' },
                { icon: <CheckCircle size={16} color="#6b7280" />, label: 'Reservas completadas', value: `${profile?.puntuacionConfianza?.reservasCompletadas || 0} / ${profile?.puntuacionConfianza?.reservasTotales || 0}` },
                { icon: <XCircle size={16} color="#6b7280" />, label: 'No Shows', value: (profile?.puntuacionConfianza?.noShows || 0).toString() },
                { icon: <AlertTriangle size={16} color="#6b7280" />, label: 'Cancelaciones (30 días)', value: (profile?.puntuacionConfianza?.cancelacionesUltimo30dias || 0).toString() },
                { icon: <TrendingUp size={16} color="#6b7280" />, label: 'Tendencia (7 días)', value: `${profile?.puntuacionConfianza?.trendultimos7dias || 0 > 0 ? '+' : ''}${profile?.puntuacionConfianza?.trendultimos7dias || 0} pts` },
              ]}
            />

            <ProfileInfoCard
              title="Estadísticas de Viaje"
              rows={[
                { icon: <Navigation size={16} color="#6b7280" />, label: 'Distancia total (km)', value: (profile?.estadisticas?.kmTotalesViajados || 0).toString() },
                { icon: <Clock size={16} color="#6b7280" />, label: 'Horas en tránsito', value: (profile?.estadisticas?.horasTotalesEnTransito || 0).toString() },
                { icon: <Calendar size={16} color="#6b7280" />, label: 'Días activo', value: (profile?.estadisticas?.diasActivo || 0).toString() },
              ]}
            />
            
            <ProfileInfoCard
              title="Preferencias del Sistema"
              rows={[
                { icon: <Bell size={16} color="#6b7280" />, label: 'Notificaciones Push', value: profile?.preferencias?.notificacionesHabilitadas ? 'Sí' : 'No' },
                { icon: <Mail size={16} color="#6b7280" />, label: 'Notificaciones Email', value: profile?.preferencias?.notificacionesEmail ? 'Sí' : 'No' },
                { icon: <MapPin size={16} color="#6b7280" />, label: 'Compartir ubicación', value: profile?.preferencias?.compartirUbicacion ? 'Sí' : 'No' },
                { icon: <Eye size={16} color="#6b7280" />, label: 'Visibilidad de perfil', value: profile?.preferencias?.visibilidadPerfil === 'PUBLIC' ? 'Público' : 'Privado' },
              ]}
            />
          </View>

          {profile?.puntuacionConfianza?.penalizacionesActivas && profile.puntuacionConfianza.penalizacionesActivas.length > 0 && (
            <View className="mb-6 gap-4">
              <Text className="text-lg font-bold text-navy-900">Penalizaciones Activas</Text>
              {profile.puntuacionConfianza.penalizacionesActivas.map((pen) => (
                <View key={pen.id} className="bg-red-50 p-4 rounded-xl border border-red-100 flex-row gap-3">
                  <AlertTriangle color="#ef4444" size={20} className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-red-900">{pen.tipo}</Text>
                    <Text className="text-xs text-red-700 mt-1">{pen.razon}</Text>
                    <Text className="text-xs text-red-600 mt-2 font-medium">-{pen.puntosRestados} pts (Vence: {pen.fechaExpiracion ? new Date(pen.fechaExpiracion).toLocaleDateString() : 'Indefinido'})</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {profile?.puntuacionConfianza?.historico && profile.puntuacionConfianza.historico.length > 0 && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-navy-900 mb-4">Historial de Confianza</Text>
              <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {profile.puntuacionConfianza.historico.map((hist, idx) => (
                  <View key={idx} className={`p-4 flex-row items-center justify-between ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                    <View>
                      <Text className="text-sm font-medium text-navy-900">{hist.evento}</Text>
                      <Text className="text-xs text-gray-500 mt-1">{new Date(hist.fecha).toLocaleString()}</Text>
                    </View>
                    <Text className={`text-sm font-bold ${hist.cambio >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {hist.cambio >= 0 ? '+' : ''}{hist.cambio} pts
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
