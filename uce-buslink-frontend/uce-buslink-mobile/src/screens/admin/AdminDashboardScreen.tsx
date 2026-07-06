import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Bus, Truck, MapPin, ChevronRight, CheckCircle, XCircle, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRoutes } from '../../hooks/useRoutes';
import { fetchBuses, fetchStops, fetchDailyRouteReports, type ApiBus } from '../../services/adminService';
import type { RouteDailyReport } from '../../services/adminService';
import { useCurrentUser } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { DrawerParamList } from '../../navigation/types';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

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
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-row items-center gap-4 ${onPress ? 'active:opacity-70' : ''}`}
    >
      <View className="w-14 h-14 bg-navy-50 rounded-2xl items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</Text>
        <Text className="text-3xl font-black text-navy-900 leading-none">{value}</Text>
        {sub ? <Text className="text-xs text-gray-500 mt-1.5 font-medium">{sub}</Text> : null}
      </View>
      {onPress && <ChevronRight size={20} color="#d1d5db" />}
    </Pressable>
  );
}

const MOCK_TREND_DATA = [
  { label: 'Lun', value: 450 },
  { label: 'Mar', value: 520 },
  { label: 'Mie', value: 480 },
  { label: 'Jue', value: 610 },
  { label: 'Vie', value: 590 },
  { label: 'Sab', value: 200 },
  { label: 'Dom', value: 150 },
];

export function AdminDashboardScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { user } = useCurrentUser();
  const { getToken } = useAuth();
  const { routes, loading: routesLoading } = useRoutes();

  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [stopCount, setStopCount] = useState<number | null>(null);
  const [reports, setReports] = useState<RouteDailyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive).length, [routes]);

  useEffect(() => {
    async function loadData() {
      const token = await getToken({ template: 'uce-buslink' }).catch(() => null);
      if (!token) return;

      fetchBuses(token, 0, 100).then((p) => setBuses(p.content)).catch(() => setBuses([]));
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

  const barChartData = useMemo(() => {
    const data: any[] = [];
    reports.forEach((report) => {
      const name = report.route_name.length > 10 ? `${report.route_name.substring(0, 10)}...` : report.route_name;
      data.push({ value: report.total_reservations, label: name, frontColor: '#1e3a8a', spacing: 2 });
      data.push({ value: report.total_trips, frontColor: '#10b981', spacing: 2 });
      data.push({ value: report.no_shows, frontColor: '#ef4444', spacing: 20 }); // larger spacing after each group
    });
    return data;
  }, [reports]);

  const fleetData = useMemo(() => {
    const counts = { OPERATIONAL: 0, MAINTENANCE: 0, OUT_OF_SERVICE: 0 };
    buses.forEach((b) => {
      if (counts[b.operationalStatus as keyof typeof counts] !== undefined) {
        counts[b.operationalStatus as keyof typeof counts]++;
      }
    });
    return [
      { value: counts.OPERATIONAL, color: '#10b981', text: 'Operativos' },
      { value: counts.MAINTENANCE, color: '#f59e0b', text: 'Mantenimiento' },
      { value: counts.OUT_OF_SERVICE, color: '#ef4444', text: 'Fuera de Servicio' },
    ].filter((d) => d.value > 0);
  }, [buses]);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-8">
          <Text className="text-3xl font-black text-navy-900 tracking-tight">
            Panel de Control
          </Text>
          <Text className="text-gray-500 text-sm mt-1.5 font-medium">
            Hola, {user?.firstName || 'Administrador'} — Aquí tienes un resumen del sistema UCE Bus-Link
          </Text>
        </View>

        <View className="gap-5 mb-8">
          <StatCard
            icon={<Bus size={26} color="#1a3a5c" />}
            label="Rutas activas"
            value={routesLoading ? '...' : activeRoutes}
            sub={`de ${routes.length} rutas totales registradas`}
            onPress={() => navigation.navigate('AdminRoutes')}
          />
          <StatCard
            icon={<Truck size={26} color="#1a3a5c" />}
            label="Flota de Buses"
            value={buses.length || '...'}
            sub="Unidades en el sistema"
            onPress={() => navigation.navigate('AdminBuses')}
          />
          <StatCard
            icon={<MapPin size={26} color="#1a3a5c" />}
            label="Paradas"
            value={stopCount ?? '...'}
            sub="Puntos georeferenciados"
            onPress={() => navigation.navigate('AdminStops')}
          />
        </View>

        <View className="gap-6">
          {/* GRÁFICA PRINCIPAL: BARRAS */}
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="p-2 bg-navy-50 rounded-lg">
                <BarChart2 size={18} color="#1a3a5c" />
              </View>
              <Text className="text-sm font-bold text-navy-900 uppercase tracking-wide">
                Rendimiento por Ruta (Hoy)
              </Text>
            </View>

            {reportsLoading ? (
              <View className="h-[220px] bg-gray-50 rounded-xl items-center justify-center">
                <Text className="text-gray-400 text-sm font-medium">Cargando métricas...</Text>
              </View>
            ) : barChartData.length === 0 ? (
              <View className="h-[220px] items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <Text className="text-gray-400 text-sm font-medium">No hay datos operativos para mostrar hoy</Text>
              </View>
            ) : (
              <View className="items-center">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={barChartData}
                    barWidth={18}
                    spacing={15}
                    roundedTop
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                    noOfSections={4}
                    hideRules
                    initialSpacing={10}
                    height={180}
                  />
                </ScrollView>
                <View className="flex-row justify-center gap-4 mt-6">
                  <View className="flex-row items-center gap-1.5"><View className="w-2.5 h-2.5 rounded-full bg-navy-800" /><Text className="text-xs text-gray-600 font-medium">Reservas</Text></View>
                  <View className="flex-row items-center gap-1.5"><View className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><Text className="text-xs text-gray-600 font-medium">Viajes</Text></View>
                  <View className="flex-row items-center gap-1.5"><View className="w-2.5 h-2.5 rounded-full bg-red-500" /><Text className="text-xs text-gray-600 font-medium">No Shows</Text></View>
                </View>
              </View>
            )}
          </View>

          {/* ESTADO DE FLOTA */}
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="p-2 bg-amber-50 rounded-lg">
                <PieChartIcon size={18} color="#d97706" />
              </View>
              <Text className="text-sm font-bold text-navy-900 uppercase tracking-wide">Estado de Flota</Text>
            </View>

            {buses.length === 0 ? (
              <View className="h-[220px] items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <Text className="text-gray-400 text-sm font-medium">Sin datos de buses</Text>
              </View>
            ) : (
              <View className="items-center justify-center relative min-h-[220px]">
                <PieChart
                  data={fleetData}
                  donut
                  innerRadius={55}
                  radius={85}
                  innerCircleColor={'#ffffff'}
                />
                <View className="absolute flex-col items-center justify-center">
                  <Text className="text-2xl font-black text-navy-900">{buses.length}</Text>
                  <Text className="text-xs text-gray-500 font-medium">Total</Text>
                </View>
                
                <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
                  {fleetData.map((d, i) => (
                    <View key={i} className="flex-row items-center gap-1.5">
                      <View style={{ backgroundColor: d.color }} className="w-2.5 h-2.5 rounded-full" />
                      <Text className="text-xs text-gray-600 font-medium">{d.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* RUTAS RÁPIDAS */}
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-sm font-bold text-navy-900 uppercase tracking-wide">Rutas Destacadas</Text>
              <Pressable onPress={() => navigation.navigate('AdminRoutes')} className="flex-row items-center gap-1">
                <Text className="text-xs text-navy-600 font-bold">Ver todas</Text>
                <ChevronRight size={14} color="#1a3a5c" />
              </Pressable>
            </View>

            {routesLoading ? (
              <View className="gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} className="h-12 bg-gray-50 rounded-xl" />
                ))}
              </View>
            ) : (
              <View className="gap-3">
                {routes.slice(0, 4).map((route) => (
                  <Pressable 
                    key={route.id} 
                    className="flex-row items-center justify-between p-3 rounded-xl bg-gray-50 active:bg-gray-100 border border-transparent"
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="w-8 h-8 rounded-lg bg-white shadow-sm items-center justify-center">
                        <MapPin size={14} color="#1a3a5c" />
                      </View>
                      <Text className="text-sm font-bold text-navy-900" numberOfLines={1}>{route.name}</Text>
                    </View>
                    <View className="ml-2">
                      {route.isActive ? (
                        <CheckCircle size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#d1d5db" />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* TENDENCIA DE PASAJEROS */}
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <View className="flex-row items-center gap-2 mb-6">
              <View className="p-2 bg-green-50 rounded-lg">
                <Activity size={18} color="#16a34a" />
              </View>
              <Text className="text-sm font-bold text-navy-900 uppercase tracking-wide">
                Tendencia (Semanal)
              </Text>
            </View>
            <View className="h-[250px] items-center">
               <LineChart
                data={MOCK_TREND_DATA}
                color="#10b981"
                thickness={4}
                dataPointsColor="#10b981"
                dataPointsRadius={4}
                hideRules
                yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
                yAxisThickness={0}
                xAxisThickness={0}
                initialSpacing={20}
                width={width - 100}
                height={200}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
