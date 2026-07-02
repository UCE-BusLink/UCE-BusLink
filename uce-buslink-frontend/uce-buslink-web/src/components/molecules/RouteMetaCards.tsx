import { Clock, MapPin, Bus } from 'lucide-react';
import { MetaCard } from '../atoms';
import type { ApiRoute } from '../../types';

interface RouteMetaCardsProps {
  route: ApiRoute | null;
  stopsCount: number;
}

export function RouteMetaCards({ route, stopsCount }: RouteMetaCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <MetaCard
        icon={<Clock size={16} className="text-navy-700" />}
        label="Duración est."
        value={route?.estimatedDurationMinutes ? `${route.estimatedDurationMinutes} min` : '--'}
      />
      <MetaCard
        icon={<MapPin size={16} className="text-navy-700" />}
        label="Paradas"
        value={`${stopsCount}`}
      />
      <MetaCard
        icon={<Bus size={16} className="text-navy-700" />}
        label="Estado"
        value={route?.isActive ? 'Activa' : route ? 'Inactiva' : '--'}
      />
    </div>
  );
}
