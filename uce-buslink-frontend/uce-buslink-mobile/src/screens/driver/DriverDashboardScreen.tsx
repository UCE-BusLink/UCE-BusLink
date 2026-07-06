import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarOff, RefreshCw, Filter } from 'lucide-react-native';
import { useDriverTrips } from '../../hooks/useDriverTrips';
import { DriverTripCard } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { RootStackParamList } from '../../navigation/types';
import type { DriverTripView } from '../../types';

type FilterState = 'ALL' | 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export function DriverDashboardScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { trips, loading, error, refetch } = useDriverTrips();
    const [filter, setFilter] = useState<FilterState>('ALL');

    const filteredTrips = useMemo(() => {
        return trips.filter((trip) => {
            if (filter === 'ALL') return true;
            if (filter === 'PENDING') return trip.state === 'SCHEDULED' || trip.state === 'ONGOING';
            if (filter === 'ONGOING') return trip.state === 'ONGOING';
            if (filter === 'COMPLETED') return trip.state === 'COMPLETED';
            if (filter === 'CANCELLED') return trip.state === 'CANCELLED';
            return true;
        });
    }, [trips, filter]);

    const groupedTrips = useMemo(() => {
        const groups: Record<string, DriverTripView[]> = {};

        filteredTrips.forEach((trip) => {
            const date = new Date(trip.departureTime);
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            let dateLabel = '';
            if (date.toDateString() === today.toDateString()) {
                dateLabel = 'Hoy, ' + date.toLocaleDateString('es-EC', { day: 'numeric', month: 'long' });
            } else if (date.toDateString() === tomorrow.toDateString()) {
                dateLabel = 'Mañana, ' + date.toLocaleDateString('es-EC', { day: 'numeric', month: 'long' });
            } else {
                dateLabel = date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
                dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
            }

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(trip);
        });

        return groups;
    }, [filteredTrips]);

    const FilterButton = ({ state, label }: { state: FilterState; label: string }) => {
        const isActive = filter === state;
        return (
            <Pressable
                onPress={() => setFilter(state)}
                className={`px-3 py-1.5 rounded-lg mr-2 ${
                    isActive ? 'bg-navy-900' : 'bg-white border border-gray-200'
                }`}
            >
                <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {label}
                </Text>
            </Pressable>
        );
    };

    return (
        <ScreenContainer refreshing={loading} onRefresh={refetch}>
            <View className="mb-6">
                <Text className="text-2xl font-bold text-navy-900">Mis viajes</Text>
                <Text className="text-gray-500 text-sm mt-1">
                    Selecciona un viaje para ver detalles y pasajeros.
                </Text>
            </View>

            <View className="flex-row items-center mb-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mr-3">
                    <FilterButton state="ALL" label="Todos" />
                    <FilterButton state="PENDING" label="Pendientes" />
                    <FilterButton state="ONGOING" label="En curso" />
                    <FilterButton state="COMPLETED" label="Completados" />
                    <FilterButton state="CANCELLED" label="Cancelados" />
                </ScrollView>
                <Pressable
                    onPress={refetch}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-sm"
                >
                    <RefreshCw size={16} color="#4b5563" />
                </Pressable>
            </View>

            {loading ? (
                <View className="items-center py-12"><Spinner /></View>
            ) : error ? (
                <View className="bg-white rounded-2xl border border-red-100 p-6 items-center shadow-sm">
                    <Text className="text-sm text-red-500 text-center font-medium">{error}</Text>
                    <Pressable
                        onPress={refetch}
                        className="mt-4 px-6 py-2 bg-red-50 rounded-xl"
                    >
                        <Text className="text-red-600 font-medium">Intentar de nuevo</Text>
                    </Pressable>
                </View>
            ) : trips.length === 0 ? (
                <View className="bg-white rounded-3xl border border-dashed border-gray-200 p-8 items-center shadow-sm">
                    <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                        <CalendarOff size={28} color="#9ca3af" />
                    </View>
                    <Text className="font-bold text-navy-900 text-lg mb-1">Sin viajes asignados</Text>
                    <Text className="text-sm text-gray-400 text-center">Cuando el administrador te asigne un viaje aparecerá aquí.</Text>
                </View>
            ) : Object.keys(groupedTrips).length === 0 ? (
                <View className="bg-white rounded-3xl border border-dashed border-gray-200 p-8 items-center shadow-sm">
                    <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                        <Filter size={28} color="#9ca3af" />
                    </View>
                    <Text className="font-bold text-navy-900 text-lg mb-1">No hay viajes</Text>
                    <Text className="text-sm text-gray-400 text-center">Intenta cambiar el filtro para ver tus otros viajes.</Text>
                </View>
            ) : (
                <View className="gap-6 pb-6">
                    {Object.entries(groupedTrips).map(([dateLabel, tripsInDate]) => (
                        <View key={dateLabel}>
                            <View className="flex-row items-center gap-2 mb-3">
                                <View className="w-2 h-2 rounded-full bg-navy-900" />
                                <Text className="text-base font-bold text-navy-900">{dateLabel}</Text>
                            </View>
                            <View className="gap-3">
                                {tripsInDate.map((trip) => (
                                    <DriverTripCard
                                        key={trip.id}
                                        trip={trip}
                                        onClick={() => navigation.navigate('DriverTripDetail', { tripId: trip.id })}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScreenContainer>
    );
}
