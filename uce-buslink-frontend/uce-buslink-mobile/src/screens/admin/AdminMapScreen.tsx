import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Map as MapIcon, Wifi, WifiOff, Users, Bus as BusIcon, AlertTriangle, Activity } from 'lucide-react-native';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';
import { useRoutes } from '../../hooks/useRoutes';
import { decodePolyline } from '../../utils/mapUtils';
import { Polyline, Callout } from 'react-native-maps';

interface LiveBus {
  busId: string;
  plateNumber: string;
  latitude: number;
  longitude: number;
  velocity: number;
  tripId: string;
  routeName: string;
  occupiedSeats: number;
  boardedStudents?: number;
  totalSeats: number;
  status: string;
  lastUpdate: number;
}

interface FleetStats {
  totalActiveBuses: number;
  totalStudentsOnBoard: number; // Seats reserved
  totalBoardedStudents?: number; // Students boarded
  delayedBuses: number;
  availableNetworkSeats: number;
}

const MAP_CENTER = { latitude: -0.1989, longitude: -78.5065 };

export function AdminMapScreen() {
  const { client, isConnected } = useTrackingConnection();

  const [buses, setBuses] = useState<LiveBus[]>([]);
  const [stats, setStats] = useState<FleetStats>({
    totalActiveBuses: 0,
    totalStudentsOnBoard: 0,
    totalBoardedStudents: 0,
    delayedBuses: 0,
    availableNetworkSeats: 0,
  });

  const { routes } = useRoutes();
  const [selectedRouteName, setSelectedRouteName] = useState<string | null>(null);

  const ROUTE_COLORS = [
    '#2563EB', '#DC2626', '#059669', '#D97706',
    '#7C3AED', '#DB2777', '#0284C7', '#EA580C',
  ];

  useEffect(() => {
    if (!client || !isConnected) return;

    const subscription = client.subscribe('/topic/supervisor/all-buses', (message) => {
      if (message.body) {
        const payload = JSON.parse(message.body);
        if (payload.type === 'all_buses_update') {
          setBuses(payload.buses);
          setStats(payload.statisticsSnapshot);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [client, isConnected]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-start justify-between px-4 pt-4 pb-3">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2">
            <MapIcon size={22} color="#0a1628" />
            <Text className="text-2xl font-bold text-navy-900">Monitoreo GPS</Text>
          </View>
          <Text className="mt-1 text-sm text-gray-500">Flota de buses en tiempo real</Text>
        </View>

        <View
          className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${
            isConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}
        >
          {isConnected ? <Wifi size={16} color="#047857" /> : <WifiOff size={16} color="#b91c1c" />}
          <Text className={`text-xs font-bold ${isConnected ? 'text-emerald-700' : 'text-red-700'}`}>
            {isConnected ? 'En vivo' : 'Reconectando...'}
          </Text>
        </View>
      </View>

      <View className="flex-1 mx-4 mb-4 rounded-2xl border border-gray-100 bg-white overflow-hidden relative">
        <MapView
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: buses.length > 0 ? buses[0].latitude : MAP_CENTER.latitude,
            longitude: buses.length > 0 ? buses[0].longitude : MAP_CENTER.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}
        >
          {routes.filter(r => r.pathPolyline).map((route, index) => {
            const pts = decodePolyline(route.pathPolyline as string);
            const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
            return (
              <Polyline
                key={route.id}
                coordinates={pts}
                strokeColor={color}
                strokeWidth={4}
                tappable
                onPress={() => setSelectedRouteName(route.name)}
              />
            );
          })}

          {buses.map((bus) => (
            <Marker
              key={bus.busId}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#1e3a8a',
                  borderWidth: 2,
                  borderColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusIcon size={18} color="#ffffff" />
              </View>
              <Callout tooltip>
                <View className="bg-white rounded-xl shadow-xl p-3 border border-gray-100 min-w-[180px]">
                  <View className="flex-row justify-between items-center border-b border-gray-100 pb-2 mb-2">
                    <Text className="font-bold text-navy-900 text-sm">{bus.plateNumber}</Text>
                    <Text className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bus.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {bus.status}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-600 mb-1"><Text className="font-semibold">Ruta:</Text> {bus.routeName}</Text>
                  <Text className="text-xs text-gray-600 mb-2"><Text className="font-semibold">Velocidad:</Text> {bus.velocity} km/h</Text>
                  <View className="bg-navy-50 p-2 rounded-lg">
                    <Text className="text-xs text-navy-700 font-bold mb-1">{bus.occupiedSeats} / {bus.totalSeats} reservados</Text>
                    {bus.boardedStudents !== undefined && (
                      <Text className="text-xs text-emerald-700 font-bold">{bus.boardedStudents} a bordo</Text>
                    )}
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {selectedRouteName && (
          <View className="absolute bottom-6 left-4 right-4 bg-white p-3 rounded-xl shadow-lg flex-row justify-between items-center border border-gray-200">
            <Text className="text-sm font-bold text-navy-900 flex-1">Ruta: {selectedRouteName}</Text>
            <Text 
              onPress={() => setSelectedRouteName(null)}
              className="text-xs text-gray-400 font-bold px-2 py-1"
            >
              CERRAR
            </Text>
          </View>
        )}

        <View className="absolute top-4 right-4 w-56 rounded-xl border border-gray-100 bg-white overflow-hidden">
          <View className="bg-navy-900 p-3">
            <View className="flex-row items-center gap-1.5">
              <Activity size={16} color="#ffffff" />
              <Text className="text-sm font-bold text-white">Estado de la Flota</Text>
            </View>
          </View>
          <View className="p-4 gap-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <BusIcon size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs font-medium">Buses Activos</Text>
              </View>
              <Text className="font-bold text-navy-900 text-sm">{stats.totalActiveBuses}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <Users size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs font-medium">Asientos Reservados</Text>
              </View>
              <Text className="font-bold text-navy-900 text-sm">{stats.totalStudentsOnBoard}</Text>
            </View>
            {stats.totalBoardedStudents !== undefined && (
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-1.5">
                  <Users size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-xs font-medium">Estudiantes a Bordo</Text>
                </View>
                <Text className="font-bold text-emerald-600 text-sm">{stats.totalBoardedStudents}</Text>
              </View>
            )}
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <AlertTriangle size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs font-medium">Buses Retrasados</Text>
              </View>
              <Text className={`font-bold text-sm ${stats.delayedBuses > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {stats.delayedBuses}
              </Text>
            </View>
            <View className="border-t border-gray-100 pt-3 flex-row justify-between items-center">
              <Text className="text-gray-500 text-xs font-medium">Asientos Libres Red</Text>
              <Text className="font-bold text-blue-600 text-sm">{stats.availableNetworkSeats}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
