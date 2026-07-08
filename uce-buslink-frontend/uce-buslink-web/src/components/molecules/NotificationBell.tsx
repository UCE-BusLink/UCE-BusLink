import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';

interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function NotificationBell({
  onOpenNotification,
}: {
  onOpenNotification?: (notif: NotificationResponse) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  const { data, isLoading } = useQuery<PageResponse<NotificationResponse>>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const token = await getToken({ template: "uce-buslink" });
      if (!token) throw new Error("No auth token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/notifications/user?page=0&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Error fetching notifications');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const notifications = data?.content || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const setUnreadNotificationsCount = useAppStore((state) => state.setUnreadNotificationsCount);

  useEffect(() => {
    setUnreadNotificationsCount(unreadCount);
  }, [unreadCount, setUnreadNotificationsCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
      >
        <Bell className="w-5 h-5 text-gray-700" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-semibold text-white bg-black rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-5 py-4 flex justify-between">
            <h3 className="text-sm font-medium">Notificaciones</h3>
          </div>

          <div className="max-h-96 overflow-y-auto px-2 pb-2">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => onOpenNotification?.(notif)}
                    className={`px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50 ${!notif.isRead ? "bg-gray-50" : ""
                      }`}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">{notif.title}</h4>
                      <span className="text-[11px] text-gray-400">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-900"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}