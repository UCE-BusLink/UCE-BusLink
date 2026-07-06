import { UserButton } from '@clerk/clerk-react'
import { Menu } from 'lucide-react'
import logoHorizontal from '../../assets/brand/LogoHorizontal.png'
import { NotificationBell } from '../molecules'
import { useClerk, useAuth } from '@clerk/clerk-react'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const handleSignOut = async () => {
    try {
      const fcmToken = localStorage.getItem('fcmToken');
      const jwtToken = await getToken({ template: "uce-buslink" });
      
      if (fcmToken && jwtToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notifications/unregister-device/${fcmToken}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        });
      }
    } catch (e) {
      console.error("Error al desregistrar dispositivo:", e);
    }
    
    // Luego signOut standard
    await signOut();
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <img
          src={logoHorizontal}
          alt="UCE Bus-Link"
          className="h-10 md:h-16 w-auto object-contain hidden md:block"
        />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <button 
          onClick={handleSignOut}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <UserButton afterSignOutUrl="/login" />
      </div>
    </header>
  )
}
