import { NavLink } from 'react-router-dom';
import { Bus, Home, Clock, Map, User, LogOut } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react'; // 1. Importamos el hook de Clerk

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/routes', icon: Bus, label: 'Rutas' },
  { to: '/trips', icon: Clock, label: 'Viajes', disabled: true },
  { to: '/map', icon: Map, label: 'Mapa', disabled: true },
  { to: '/profile', icon: User, label: 'Perfil', disabled: true },
];

export function Sidebar() {
  // 2. Extraemos signOut en lugar de useNavigate
  const { signOut } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-navy-900 flex flex-col flex-shrink-0">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bus size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">UCE Bus-Link</p>
            <p className="text-gray-400 text-xs">Night Transport</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, disabled }) =>
          disabled ? (
            <div
              key={to}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl mb-1 cursor-not-allowed select-none"
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </div>
          ) : (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
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
          )
        )}
      </nav>

      <div className="px-3 pb-6">
        {/* 3. Ejecutamos signOut y le indicamos a dónde redirigir al terminar */}
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