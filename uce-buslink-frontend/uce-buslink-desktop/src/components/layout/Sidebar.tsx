import { NavLink } from 'react-router-dom';
import { Bus, Map, LogOut, LayoutDashboard, Truck, MapPin, Settings, Users, CalendarClock } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import brandIcon from '../../assets/brand/Icon.png';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/map', icon: Map, label: 'Mapa GPS' },
  { to: '/admin/routes', icon: Bus, label: 'Rutas' },
  { to: '/admin/buses', icon: Truck, label: 'Buses' },
  { to: '/admin/stops', icon: MapPin, label: 'Paradas' },
  { to: '/admin/drivers', icon: Users, label: 'Choferes' },
  { to: '/admin/trips', icon: CalendarClock, label: 'Viajes' },
  { to: '/profile', icon: Settings, label: 'Cuenta' },
];

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const { signOut } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-navy-900 flex flex-col flex-shrink-0">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={brandIcon} alt="UCE Bus-Link" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">UCE Bus-Link</p>
            <p className="text-gray-400 text-xs">Administración</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        {ADMIN_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white border-l-2 border-amber-400 pl-[14px]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
