import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Map as MapIcon, Wifi, WifiOff, Users, Bus as BusIcon, AlertTriangle, Activity } from 'lucide-react-native';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';

interface LiveBus {
  busId: string;
  plateNumber: string;
  latitude: number;
  longitude: number;
  velocity: number;
  tripId: string;
  routeName: string;
  occupiedSeats: number;
  totalSeats: number;
  status: string;
  lastUpdate: number;
}

interface FleetStats {
  totalActiveBuses: number;
  totalStudentsOnBoard: number;
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
    delayedBuses: 0,
    availableNetworkSeats: 0,
  });

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
          {buses.map((bus) => (
            <Marker
              key={bus.busId}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`${bus.plateNumber} · ${bus.routeName}`}
              description={`${bus.velocity} km/h · ${bus.occupiedSeats}/${bus.totalSeats} pasajeros`}
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
            </Marker>
          ))}
        </MapView>

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
                <Text className="text-gray-500 text-xs font-medium">A Bordo</Text>
              </View>
              <Text className="font-bold text-emerald-600 text-sm">{stats.totalStudentsOnBoard}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-1.5">
                <AlertTriangle size={14} color="#6b7280" />
                <Text className="text-gray-500 text-xs font-medium">Retrasados</Text>
              </View>
              <Text className={`font-bold text-sm ${stats.delayedBuses > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {stats.delayedBuses}
              </Text>
            </View>
            <View className="border-t border-gray-100 pt-3 flex-row justify-between items-center">
              <Text className="text-gray-500 text-xs font-medium">Asientos Libres</Text>
              <Text className="font-bold text-blue-600 text-sm">{stats.availableNetworkSeats}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
