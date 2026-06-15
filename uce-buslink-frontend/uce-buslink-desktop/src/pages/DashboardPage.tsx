import { useNavigate } from 'react-router-dom';
import { Bus, Calendar, Armchair, ChevronRight, Star } from 'lucide-react';
import { mockUser, upcomingReservation, routes } from '../data/mockData';



function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function TrustScoreRing({ score }: { score: number }) {
  const RADIUS = 45;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="12"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-navy-900">{score}%</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const greeting = getTimeGreeting();

  // ################################################## PRUEBA API #####################################################################

  // ################################################## PRUEBA API #####################################################################

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">
          {greeting}, {mockUser.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Aquí el resumen del día de tus viajes pendientes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
              Tu próxima reserva
            </p>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Bus size={14} className="text-amber-600" />
                  </div>
                  <span className="font-semibold text-navy-900">
                    {upcomingReservation.routeName}
                  </span>
                </div>
                <p className="text-5xl font-bold text-navy-900">{upcomingReservation.time}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{upcomingReservation.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Armchair size={14} />
                    <span>{upcomingReservation.seat}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Conductor</p>
                <p className="text-sm font-semibold text-navy-900">
                  {upcomingReservation.driver}
                </p>
                <p className="text-xs text-gray-400 mt-2 mb-0.5">Unidad</p>
                <p className="text-sm font-semibold text-navy-900">
                  {upcomingReservation.unit}
                </p>
              </div>
            </div>
            <button className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-amber-600 transition-colors">
              Pase de abordar
              <ChevronRight size={16} />
            </button>
          </div>

          <div>
            <h2 className="text-base font-semibold text-navy-900 mb-4">
              Rutas disponibles hoy
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <Bus size={12} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-semibold text-navy-900 truncate">
                      {route.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{route.destination}</p>
                  <div className="mb-3">
                    {route.availableSeats > 0 ? (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {route.availableSeats} asientos
                      </span>
                    ) : (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                        Sin asientos
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/routes/${route.id}`)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${route.availableSeats > 0
                      ? 'bg-navy-900 text-white hover:bg-navy-800'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
                  >
                    {route.availableSeats > 0 ? 'Reservar lugar' : 'Ver viajes'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star size={15} className="text-amber-500" />
              <p className="text-sm font-semibold text-navy-900">Score de confianza</p>
            </div>
            <p className="text-xs text-gray-400 mb-5">Pasajero excelente</p>
            <TrustScoreRing score={mockUser.trustScore} />
            <p className="text-xs text-center text-gray-500 mt-3">
              Mantén este nivel para prioridad de reserva
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Estadísticas
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Viajes totales</span>
                <span className="text-sm font-bold text-navy-900">{mockUser.totalTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Puntualidad</span>
                <span className="text-sm font-bold text-green-600">
                  {mockUser.punctualityRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Destino frecuente</span>
                <span className="text-sm font-bold text-navy-900">Carcelén</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}