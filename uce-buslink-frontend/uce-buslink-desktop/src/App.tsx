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

export default function App() {

  const { user, loading } = useCurrentUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando sesión...</p>
      </div>
    )
  }

  console.log(user)

  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login/*" element={<SignInPage />} />

        <Route
          path="/register/*"
          element={<SignUpPage />} />

        {/* PRIVATE */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/routes" element={<RoutesPage />} />

          <Route
            path="/routes/:routeId"
            element={<RouteDetailPage />}
          />

          <Route
            path="/routes/:routeId/seats/:tripId"
            element={<SeatSelectionPage />}
          />

          <Route path="/trips" element={<TripsPage />} />

          <Route path="/map" element={<MapPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* ROOT */}
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>

              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}