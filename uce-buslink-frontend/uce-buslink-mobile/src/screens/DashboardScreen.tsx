import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Star, Bus, QrCode } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRoutes } from '../hooks/useRoutes';
import { useProfile } from '../hooks/useProfile';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { RouteCard } from '../components/molecules/RouteCard';
import { StatCard } from '../components/molecules/StatCard';
import { QrModal } from '../components/molecules/QrModal';
import { RouteCardSkeleton, TrustScoreRing, Button, Spinner } from '../components/atoms';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { ActiveReservationItem } from '../types';
import type { RootStackParamList } from '../navigation/types';

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
}

export function DashboardScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const greeting = getTimeGreeting();
    const { user: clerkUser } = useUser();
    const { routes, loading: routesLoading } = useRoutes();
    const { data: profile } = useProfile();
    const { items, loading: reservationLoading } = useActiveReservations();

    const [qrItem, setQrItem] = useState<ActiveReservationItem | null>(null);

    const displayRoutes = routes.slice(0, 3);

    const goRoute = (routeId: string) => navigation.navigate('RouteDetail', { routeId });

    return (
        <ScreenContainer>
            <View className="mb-7">
                <Text className="text-2xl font-bold text-navy-900">
                    {greeting}, {clerkUser?.firstName ?? '...'}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                    Aquí el resumen del día de tus viajes pendientes
                </Text>
            </View>

            <View className="gap-6">
                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
                        Tus reservas activas
                    </Text>

                    {reservationLoading ? (
                        <View className="items-center py-4">
                            <Spinner />
                        </View>
                    ) : items.length === 0 ? (
                        <View className="items-center justify-center py-6">
                            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                                <Bus size={20} color="#9ca3af" />
                            </View>
                            <Text className="text-sm font-semibold text-gray-500">Sin reservas activas</Text>
                            <Text className="text-xs text-gray-400 mt-1">Reserva un lugar en la sección de Rutas</Text>
                            <Button size="sm" onPress={() => navigation.navigate('Main', { screen: 'Routes' })} className="mt-4">
                                Ver rutas
                            </Button>
                        </View>
                    ) : (
                        <View>
                            {items.map((item) => (
                                <View
                                    key={item.reservation.id}
                                    className="flex-row items-center justify-between py-3 border-b border-gray-50"
                                >
                                    <View>
                                        <Text className="text-sm font-semibold text-navy-900">{item.route.name}</Text>
                                        <Text className="text-xs text-gray-400 mt-0.5">
                                            {formatTime(item.trip.departureTime)} · {formatDate(item.trip.departureTime)}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setQrItem(item)}
                                        className="flex-row items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5"
                                    >
                                        <QrCode size={13} color="#0a1628" />
                                        <Text className="text-xs font-semibold text-navy-900">Ver QR</Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View>
                    <Text className="text-base font-semibold text-navy-900 mb-4">Rutas disponibles hoy</Text>
                    {routesLoading ? (
                        <View className="gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <RouteCardSkeleton key={i} />
                            ))}
                        </View>
                    ) : displayRoutes.length > 0 ? (
                        <View className="gap-4">
                            {displayRoutes.map((route) => (
                                <RouteCard key={route.id} route={route} onSelect={() => goRoute(route.id)} />
                            ))}
                        </View>
                    ) : (
                        <View className="items-center py-8">
                            <Text className="text-sm text-gray-400">No hay rutas disponibles.</Text>
                        </View>
                    )}
                </View>

                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <View className="flex-row items-center gap-2 mb-1">
                        <Star size={15} color="#f59e0b" />
                        <Text className="text-sm font-semibold text-navy-900">Score de confianza</Text>
                    </View>
                    <Text className="text-xs text-gray-400 mb-5">Nivel: {profile?.puntuacionConfianza?.nivel ?? 'Desconocido'}</Text>
                    <TrustScoreRing score={profile?.puntuacionConfianza?.puntuacion ?? 0} />
                    <Text className="text-xs text-center text-gray-500 mt-3">
                        Mantén este nivel para prioridad de reserva
                    </Text>
                </View>

                <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                        Estadísticas
                    </Text>
                    <View className="gap-3">
                        <StatCard label="Viajes totales" value={profile?.estadisticas?.viajesTotales?.toString() ?? "0"} />
                        <StatCard label="Reservas completadas" value={profile?.puntuacionConfianza?.reservasCompletadas?.toString() ?? "0"} valueClassName="text-green-600" />
                        <StatCard label="No Shows" value={profile?.puntuacionConfianza?.noShows?.toString() ?? "0"} valueClassName="text-red-500" />
                    </View>
                </View>
            </View>

            {qrItem && (
                <QrModal
                    qrCode={qrItem.reservation.id}
                    title={qrItem.route.name}
                    subtitle={formatTime(qrItem.trip.departureTime) + ' · ' + formatDate(qrItem.trip.departureTime)}
                    onClose={() => setQrItem(null)}
                />
            )}
        </ScreenContainer>
    );
}
