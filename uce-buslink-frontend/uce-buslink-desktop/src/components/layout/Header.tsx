import { Bell, HelpCircle } from 'lucide-react';
import { mockUser } from '../../data/mockData';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
      <h1 className="text-navy-900 font-semibold text-base">Transporte Universitario</h1>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <Bell size={18} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <HelpCircle size={18} />
        </button>
        <div className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{mockUser.initials}</span>
        </div>
      </div>
    </header>
  );
}
