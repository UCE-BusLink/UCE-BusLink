import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "../../hooks/useProfile";
import { fetchRoutes } from "../../services/routeService";
import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePushNotifications } from "../../hooks/usePushNotifications";

import { OnboardingModal } from "../organisms/OnboardingModal";
import { useCurrentUser } from "../../context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useRealtimeRoutes } from "../../hooks/useRealtimeRoutes";

export function AppLayout() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user, updateOnboardingStatus } = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  usePushNotifications();
  useRealtimeRoutes();

  const { data: profile, refetch } = useProfile();

  // Prefetching key data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getToken({ template: 'uce-buslink' }).then((token) => {
        if (token) {
          queryClient.prefetchQuery({
            queryKey: ['routes'],
            queryFn: () => fetchRoutes(token).then(res => res.content),
            staleTime: 1000 * 60 * 30, // 30 mins
          });
        }
      });
    }
  }, [isLoaded, isSignedIn, getToken, queryClient]);

  if (!isLoaded) return null;

  if (!isSignedIn) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Onboarding Modal Overlay */}
      {user?.needsOnboarding && profile && (
        <OnboardingModal profile={profile.usuario} onComplete={() => {
          refetch();
          updateOnboardingStatus(false);
        }} />
      )}
    </div>
  );
}