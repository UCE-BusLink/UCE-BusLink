import { UserButton } from '@clerk/clerk-react'
import { Menu } from 'lucide-react'
import logoHorizontal from '../../assets/brand/LogoHorizontal.png'

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0">
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

      <UserButton afterSignOutUrl="/" />
    </header>
  )
}
