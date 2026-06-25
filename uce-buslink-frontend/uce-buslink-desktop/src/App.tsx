import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react'

import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { RoutesPage } from './pages/RoutesPage'
import { RouteDetailPage } from './pages/RouteDetailPage'
import { SeatSelectionPage } from './pages/SeatSelectionPage'
import { TripsPage } from './pages/TripsPage'
import { MapPage } from './pages/MapPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminRoutesPage } from './pages/admin/AdminRoutesPage'
import { AdminBusesPage } from './pages/admin/AdminBusesPage'
import { AdminStopsPage } from './pages/admin/AdminStopsPage'
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage'
import { DriverTripDetailPage } from './pages/driver/DriverTripDetailPage'

import { SignInPage } from './pages/auth/SignInPage'
import { SignUpPage } from './pages/auth/SignUpPage'

import { useCurrentUser } from './context/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function StudentOnly({ element }: { element: React.ReactNode }) {
  const { user, syncDone } = useCurrentUser()
  if (!syncDone) return null
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user?.role === 'DRIVER') return <Navigate to="/driver" replace />
  return <>{element}</>
}

function DriverOnly({ element }: { element: React.ReactNode }) {
  const { user, syncDone } = useCurrentUser()
  if (!syncDone) return null
  if (user?.role !== 'DRIVER') return <Navigate to="/dashboard" replace />
  return <>{element}</>
}

function RootRedirect() {
  const { user, loading, syncDone } = useCurrentUser()

  if (loading || !syncDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <SignedIn>
        <Navigate to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'DRIVER' ? '/driver' : '/dashboard'} replace />
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  )
}

export default function App() {
  const { loading } = useCurrentUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Cargando sesión...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login/*" element={<SignInPage />} />
        <Route path="/register/*" element={<SignUpPage />} />

        {/* PRIVATE */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Student */}
          <Route path="/dashboard" element={<StudentOnly element={<DashboardPage />} />} />
          <Route path="/routes" element={<StudentOnly element={<RoutesPage />} />} />
          <Route path="/routes/:routeId" element={<StudentOnly element={<RouteDetailPage />} />} />
          <Route path="/routes/:routeId/seats/:tripId" element={<StudentOnly element={<SeatSelectionPage />} />} />
          <Route path="/trips" element={<StudentOnly element={<TripsPage />} />} />
          <Route path="/map" element={<StudentOnly element={<MapPage />} />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Driver */}
          <Route path="/driver" element={<DriverOnly element={<DriverDashboardPage />} />} />
          <Route path="/driver/trips/:tripId" element={<DriverOnly element={<DriverTripDetailPage />} />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/routes" element={<AdminRoutesPage />} />
          <Route path="/admin/routes/:routeId" element={<RouteDetailPage />} />
          <Route path="/admin/buses" element={<AdminBusesPage />} />
          <Route path="/admin/stops" element={<AdminStopsPage />} />
        </Route>

        {/* ROOT */}
        <Route path="/" element={<RootRedirect />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
