import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'

import { AppLayout } from './components/layout/AppLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import AdminMapPage from './pages/admin/AdminMapPage'
import { AdminRoutesPage } from './pages/admin/AdminRoutesPage'
import { AdminBusesPage } from './pages/admin/AdminBusesPage'
import { AdminStopsPage } from './pages/admin/AdminStopsPage'
import { AdminDriversPage } from './pages/admin/AdminDriversPage'
import { AdminTripsPage } from './pages/admin/AdminTripsPage'
import { RouteDetailPage } from './pages/RouteDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { SignInPage } from './pages/auth/SignInPage'
import { AccessDeniedPage } from './pages/AccessDeniedPage'

import { useCurrentUser } from './context/AuthContext'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user, syncDone } = useCurrentUser()
  if (!syncDone) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <AccessDeniedPage />
  return <>{children}</>
}

function LoginRoute() {
  return (
    <>
      <SignedIn>
        <Navigate to="/admin" replace />
      </SignedIn>
      <SignedOut>
        <SignInPage />
      </SignedOut>
    </>
  )
}

function RootRedirect() {
  return (
    <>
      <SignedIn>
        <Navigate to="/admin" replace />
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  )
}

export default function App() {
  const { loading } = useCurrentUser()

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login/*" element={<LoginRoute />} />

        <Route
          element={
            <AdminOnly>
              <AppLayout />
            </AdminOnly>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/map" element={<AdminMapPage />} />
          <Route path="/admin/routes" element={<AdminRoutesPage />} />
          <Route path="/admin/routes/:routeId" element={<RouteDetailPage />} />
          <Route path="/admin/buses" element={<AdminBusesPage />} />
          <Route path="/admin/stops" element={<AdminStopsPage />} />
          <Route path="/admin/drivers" element={<AdminDriversPage />} />
          <Route path="/admin/trips" element={<AdminTripsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
