import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Bus, Truck, MapPin, ChevronRight, CheckCircle, XCircle, BarChart2 } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRoutes } from '../../hooks/useRoutes';
import { fetchBuses, fetchStops, fetchDailyRouteReports } from '../../services/adminService';
import type { RouteDailyReport } from '../../services/adminService';
import { useCurrentUser } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { DrawerParamList } from '../../navigation/types';

function StatCard({
  icon,
  label,
  value,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-row items-center gap-4"
    >
      <View className="w-12 h-12 bg-navy-50 rounded-xl items-center justify-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</Text>
        <Text className="text-2xl font-bold text-navy-900">{value}</Text>
        {sub ? <Text className="text-xs text-gray-400 mt-0.5">{sub}</Text> : null}
      </View>
      {onPress && <ChevronRight size={18} color="#d1d5db" />}
    </Pressable>
  );
}

const SERIES = [
  { key: 'Reservas', color: '#1e3a8a' },
  { key: 'Viajes', color: '#059669' },
  { key: 'No Shows', color: '#dc2626' },
] as const;

function MiniBarChart({ data }: { data: { name: string; Reservas: number; Viajes: number; 'No Shows': number }[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.Reservas, d.Viajes, d['No Shows']]));
  return (
    <View>
      {data.map((d, i) => (
        <View key={i} className="mb-4">
          <Text className="text-xs text-gray-600 mb-1">{d.name}</Text>
          {SERIES.map((s) => (
            <View key={s.key} className="flex-row items-center gap-2 mb-1">
              <View
                style={{ width: `${Math.round(((d as any)[s.key] / max) * 100)}%`, backgroundColor: s.color }}
                className="h-3 rounded"
              />
              <Text className="text-[10px] text-gray-400">{(d as any)[s.key]}</Text>
            </View>
          ))}
        </View>
      ))}
      <View className="flex-row gap-4 mt-2">
        {SERIES.map((s) => (
          <View key={s.key} className="flex-row items-center gap-1.5">
            <View style={{ backgroundColor: s.color }} className="w-2.5 h-2.5 rounded-full" />
            <Text className="text-xs text-gray-500">{s.key}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AdminDashboardScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { user } = useCurrentUser();
  const { getToken } = useAuth();
  const { routes, loading: routesLoading } = useRoutes();

  const [busCount, setBusCount] = useState<number | null>(null);
  const [stopCount, setStopCount] = useState<number | null>(null);
  const [reports, setReports] = useState<RouteDailyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive).length, [routes]);

  useEffect(() => {
    async function loadData() {
      const token = await getToken({ template: 'uce-buslink' }).catch(() => null);
      if (!token) return;

      fetchBuses(token, 0, 1).then((p) => setBusCount(p.totalElements)).catch(() => setBusCount(0));
      fetchStops(token).then((s) => setStopCount(s.length)).catch(() => setStopCount(0));

      setReportsLoading(true);
      fetchDailyRouteReports(token, 0, 5)
        .then((res) => setReports(res.content || []))
        .catch((err) => console.error('Error cargando reportes:', err))
        .finally(() => setReportsLoading(false));
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    return reports.map((report) => ({
      name: report.route_name.length > 15 ? `${report.route_name.substring(0, 15)}...` : report.route_name,
      Reservas: report.total_reservations,
      Viajes: report.total_trips,
      'No Shows': report.no_shows,
    }));
  }, [reports]);

  return (
    <ScreenContainer>
      <View className="mb-7">
        <Text className="text-2xl font-bold text-navy-900">
          Bienvenido, {user?.firstName || 'Administrador'}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">Panel de administración — UCE Bus-Link</Text>
      </View>

      <View className="gap-5 mb-8">
        <StatCard
          icon={<Bus size={22} color="#1a3a5c" />}
          label="Rutas activas"
          value={routesLoading ? '...' : activeRoutes}
          sub={`de ${routes.length} totales`}
          onPress={() => navigation.navigate('AdminRoutes')}
        />
        <StatCard
          icon={<Truck size={22} color="#d97706" />}
          label="Buses"
          value={busCount ?? '...'}
          sub="en flota"
          onPress={() => navigation.navigate('AdminBuses')}
        />
        <StatCard
          icon={<MapPin size={22} color="#16a34a" />}
          label="Paradas"
          value={stopCount ?? '...'}
          sub="registradas"
          onPress={() => navigation.navigate('AdminStops')}
        />
      </View>

      <View className="gap-6">
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <View className="flex-row items-center gap-2 mb-6">
            <BarChart2 size={18} color="#1a3a5c" />
            <Text className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
              Reporte Diario de Rutas
            </Text>
          </View>

          {reportsLoading ? (
            <View className="h-40 bg-gray-50 rounded-xl items-center justify-center">
              <Text className="text-gray-400 text-sm">Cargando métricas...</Text>
            </View>
          ) : chartData.length === 0 ? (
            <View className="h-40 items-center justify-center">
              <Text className="text-gray-400 text-sm">No hay datos para mostrar</Text>
            </View>
          ) : (
            <MiniBarChart data={chartData} />
          )}
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-sm font-semibold text-navy-900 uppercase tracking-wide">Rutas del sistema</Text>
            <Pressable onPress={() => navigation.navigate('AdminRoutes')} className="flex-row items-center gap-1">
              <Text className="text-xs text-navy-700 font-semibold">Ver todas</Text>
              <ChevronRight size={14} color="#1a3a5c" />
            </Pressable>
          </View>

          {routesLoading ? (
            <View className="gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} className="h-10 bg-gray-50 rounded-xl" />
              ))}
            </View>
          ) : (
            <View className="gap-2">
              {routes.slice(0, 5).map((route) => (
                <View key={route.id} className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Bus size={15} color="#1a3a5c" />
                    <Text className="text-sm font-medium text-navy-900" numberOfLines={1}>{route.name}</Text>
                  </View>
                  {route.isActive ? (
                    <View className="flex-row items-center gap-1">
                      <CheckCircle size={13} color="#16a34a" />
                      <Text className="text-xs text-green-600 font-medium">Activa</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <XCircle size={13} color="#9ca3af" />
                      <Text className="text-xs text-gray-400 font-medium">Inactiva</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
