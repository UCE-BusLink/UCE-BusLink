import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocateFixed, Bus } from 'lucide-react-native';
import type { ApiRoute } from '../../types';
import { UCE_CENTER, decodePolyline, deriveStopType, stopColor } from '../../utils/mapUtils';

interface LiveBusMarker {
  latitude: number;
  longitude: number;
  velocity?: number;
  etaMinutes?: number;
  nextStopName?: string;
}

interface LeafletMapProps {
  selectedRoute: ApiRoute | null;
  loading: boolean;
  liveBus?: LiveBusMarker | null;
  liveBusTitle?: string;
  showLocateButton?: boolean;
}

export function LeafletMap({ selectedRoute, loading, liveBus, liveBusTitle, showLocateButton }: LeafletMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ latitude: number; longitude: number } | null>(null);

  const sortedStops = (selectedRoute?.stops ?? [])
    .slice()
    .sort((a, b) => a.stopOrder - b.stopOrder)
    .filter((s) => s.latitude !== 0 || s.longitude !== 0);

  const polyPoints = selectedRoute?.pathPolyline ? decodePolyline(selectedRoute.pathPolyline) : [];
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const coords = polyPoints.length
      ? polyPoints
      : sortedStops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));

    if (coords.length > 0) {
      map.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: false,
      });
    }
  }, [selectedRoute, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !liveBus) return;
    map.animateCamera({ center: { latitude: liveBus.latitude, longitude: liveBus.longitude } });
  }, [liveBus]);

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserPos(point);
      mapRef.current?.animateCamera({ center: point, zoom: 15 });
    } catch (e) {
      console.error('[MAP] Error de geolocalización:', e);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 relative">
      <View className="h-[320px] rounded-xl overflow-hidden">
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: UCE_CENTER.latitude,
            longitude: UCE_CENTER.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          onMapReady={() => setMapReady(true)}
        >
          {sortedStops.map((stop, i) => {
            const type = deriveStopType(i, sortedStops.length);
            return (
              <Marker
                key={stop.stopId}
                coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                title={stop.stopName}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: stopColor(type),
                    borderWidth: 3,
                    borderColor: 'white',
                  }}
                />
              </Marker>
            );
          })}

          {polyPoints.length > 0 && (
            <Polyline coordinates={polyPoints} strokeColor="#f59e0b" strokeWidth={4} lineDashPattern={[6, 10]} />
          )}

          {liveBus && (
            <Marker
              coordinate={{ latitude: liveBus.latitude, longitude: liveBus.longitude }}
              title={liveBusTitle ?? 'Bus en camino'}
              description={[
                liveBus.nextStopName ? `Próxima parada: ${liveBus.nextStopName}` : '',
                liveBus.etaMinutes != null ? `Llega en: ${liveBus.etaMinutes} min` : '',
                liveBus.velocity != null ? `Velocidad: ${Math.round(liveBus.velocity)} km/h` : '',
              ].filter(Boolean).join(' · ')}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#1e3a8a',
                  borderWidth: 2,
                  borderColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bus size={16} color="#ffffff" />
              </View>
            </Marker>
          )}

          {userPos && (
            <Marker coordinate={userPos} title="Estás aquí" anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#2563eb',
                  borderWidth: 3,
                  borderColor: 'white',
                }}
              />
            </Marker>
          )}
        </MapView>
      </View>

      {loading && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-white/70 rounded-2xl">
          <ActivityIndicator size="large" color="#1a3a5c" />
        </View>
      )}

      {showLocateButton && (
        <Pressable
          onPress={handleLocate}
          className="absolute bottom-10 right-6 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-200"
        >
          {locating ? <ActivityIndicator size="small" color="#1a3a5c" /> : <LocateFixed size={18} color="#1a3a5c" />}
        </Pressable>
      )}
    </View>
  );
}
