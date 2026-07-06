import { useEffect, useState } from 'react';
import {
    Map as MapIcon,
    Wifi,
    WifiOff,
    Users,
    Bus as BusIcon,
    AlertTriangle,
    Activity
} from 'lucide-react';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRoutes } from '../../hooks/useRoutes';
import { decodePolyline } from '../../utils/mapUtils';

// --- INTERFACES PARA TIPADO FUERTE ---
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
    totalStudentsOnBoard: number; // En el backend esto en realidad son asientos reservados
    totalBoardedStudents?: number; // Nueva variable de estudiantes que ya subieron
    delayedBuses: number;
    availableNetworkSeats: number;
}

// --- ICONO PERSONALIZADO PARA LOS BUSES ---
const createBusIcon = () => {
    return L.divIcon({
        className: 'custom-bus-icon',
        html: `
      <div style="
        background-color: #1e3a8a; 
        color: white; 
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 2px solid white; 
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16], // Centro exacto
        popupAnchor: [0, -16], // Popup aparece encima del icono
    });
};

export default function AdminMapPage() {
    const { client, isConnected } = useTrackingConnection();

    // Estados de datos en tiempo real
    const [buses, setBuses] = useState<LiveBus[]>([]);
    const [stats, setStats] = useState<FleetStats>({
        totalActiveBuses: 0,
        totalStudentsOnBoard: 0,
        totalBoardedStudents: 0,
        delayedBuses: 0,
        availableNetworkSeats: 0,
    });

    const { routes } = useRoutes();

    // Paleta de colores vibrantes para las rutas
    const ROUTE_COLORS = [
        '#2563EB', // Blue
        '#DC2626', // Red
        '#059669', // Emerald
        '#D97706', // Amber
        '#7C3AED', // Violet
        '#DB2777', // Pink
        '#0284C7', // Light Blue
        '#EA580C', // Orange
    ];

    // Centro inicial del mapa (Quito / UCE)
    const MAP_CENTER: [number, number] = [-0.1989, -78.5065];

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
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* --- CABECERA --- */}
            <div className="flex items-center justify-between mb-5 shrink-0">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
                        <MapIcon size={24} />
                        Monitoreo GPS Global
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Visualización en tiempo real de toda la flota de buses
                    </p>
                </div>

                {/* Indicador de Conexión */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    {isConnected ? 'Sistema en vivo' : 'Desconectado - Reconectando...'}
                </div>
            </div>

            {/* --- CONTENEDOR PRINCIPAL DEL MAPA --- */}
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm z-0">

                {/* Renderizado del Mapa Base */}
                <MapContainer
                    center={buses.length > 0 ? [buses[0].latitude, buses[0].longitude] : MAP_CENTER}
                    zoom={14}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Renderizado de Rutas del Sistema */}
                    {routes.filter(r => r.pathPolyline).map((route, index) => {
                        const pts = decodePolyline(route.pathPolyline as string);
                        const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
                        return (
                            <Polyline
                                key={route.id}
                                positions={pts}
                                pathOptions={{ color, weight: 4, opacity: 0.7 }}
                            >
                                <Tooltip sticky>
                                    <span className="font-bold">{route.name}</span>
                                </Tooltip>
                            </Polyline>
                        );
                    })}

                    {/* Renderizado dinámico de los Buses desde WebSockets */}
                    {buses.map((bus) => (
                        <Marker
                            key={bus.busId}
                            position={[bus.latitude, bus.longitude]}
                            icon={createBusIcon()}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1 min-w-[180px]">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                                        <span className="font-bold text-navy-900 text-sm">{bus.plateNumber}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bus.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {bus.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 text-xs text-gray-600">
                                        <p><span className="font-semibold">Ruta:</span> {bus.routeName}</p>
                                        <p><span className="font-semibold">Velocidad:</span> {bus.velocity} km/h</p>
                                        <div className="flex flex-col gap-1 mt-2 text-navy-600 bg-navy-50 p-1.5 rounded-lg">
                                            <div className="flex items-center gap-1">
                                                <Users size={12} />
                                                <span className="font-bold">{bus.occupiedSeats}</span> / {bus.totalSeats} reservados
                                            </div>
                                            {bus.boardedStudents !== undefined && (
                                                <div className="flex items-center gap-1 text-emerald-700">
                                                    <Users size={12} />
                                                    <span className="font-bold">{bus.boardedStudents}</span> a bordo
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* --- PANEL FLOTANTE DE ESTADÍSTICAS --- */}
                <div className="absolute top-4 right-4 z-[1000] w-64 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <div className="bg-navy-900 p-3 text-white">
                        <h3 className="text-sm font-bold flex items-center gap-1.5">
                            <Activity size={16} /> Estado de la Flota
                        </h3>
                    </div>

                    <div className="p-4 space-y-3.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium flex items-center gap-1.5"><BusIcon size={14} /> Buses Activos</span>
                            <span className="font-bold text-navy-900 text-sm">{stats.totalActiveBuses}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium flex items-center gap-1.5"><Users size={14} /> Asientos Reservados</span>
                            <span className="font-bold text-navy-900 text-sm">{stats.totalStudentsOnBoard}</span>
                        </div>

                        {stats.totalBoardedStudents !== undefined && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium flex items-center gap-1.5"><Users size={14} /> Estudiantes a Bordo</span>
                                <span className="font-bold text-emerald-600 text-sm">{stats.totalBoardedStudents}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium flex items-center gap-1.5"><AlertTriangle size={14} /> Buses Retrasados</span>
                            <span className={`font-bold text-sm ${stats.delayedBuses > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {stats.delayedBuses}
                            </span>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Asientos Libres Red</span>
                            <span className="font-bold text-blue-600 text-sm">{stats.availableNetworkSeats}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}