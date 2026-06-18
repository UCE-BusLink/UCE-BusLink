import { NavLink } from 'react-router-dom';
import { Bus, Home, Clock, Map, User, LogOut, LayoutDashboard, Truck, MapPin, Settings } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useCurrentUser } from '../../context/AuthContext';
import brandIcon from '../../assets/brand/Icon.png';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const STUDENT_NAV: NavItem[] = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/routes', icon: Bus, label: 'Rutas' },
  { to: '/trips', icon: Clock, label: 'Viajes' },
  { to: '/map', icon: Map, label: 'Mapa' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/routes', icon: Bus, label: 'Rutas' },
  { to: '/admin/buses', icon: Truck, label: 'Buses' },
  { to: '/admin/stops', icon: MapPin, label: 'Paradas' },
  { to: '/profile', icon: Settings, label: 'Cuenta' },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  return (
    <aside className="w-60 min-h-screen bg-navy-900 flex flex-col flex-shrink-0">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={brandIcon} alt="UCE Bus-Link" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">UCE Bus-Link</p>
            <p className="text-gray-400 text-xs">{isAdmin ? 'Administración' : 'Night Transport'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
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
          onClick={() => signOut({ redirectUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
