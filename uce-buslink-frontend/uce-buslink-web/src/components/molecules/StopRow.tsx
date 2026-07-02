import { Navigation, Flag, MapPin } from 'lucide-react';
import type { RouteStopDetail, StopType } from '../../types';

const STOP_DOT: Record<StopType, string> = {
  origin: 'bg-green-500 ring-green-100',
  stop: 'bg-navy-700 ring-navy-100',
  destination: 'bg-amber-500 ring-amber-100',
};

function StopDotIcon({ type }: { type: StopType }) {
  if (type === 'origin') return <Navigation size={13} className="text-white" />;
  if (type === 'destination') return <Flag size={13} className="text-white" />;
  return <MapPin size={11} className="text-white" />;
}

interface StopRowProps {
  stop: RouteStopDetail;
  isLast: boolean;
}

export function StopRow({ stop, isLast }: StopRowProps) {
  const label =
    stop.type === 'origin' ? 'Origen' :
    stop.type === 'destination' ? 'Destino' : 'Parada';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-4 ${STOP_DOT[stop.type]}`}>
          <StopDotIcon type={stop.type} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>
      <div className={isLast ? '' : 'pb-6'}>
        <p className="text-xs text-gray-400">{stop.order}. {label}</p>
        <p className="text-sm font-semibold text-navy-900">{stop.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <MapPin size={11} />
          {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
        </p>
      </div>
    </div>
  );
}
