import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:routeId" element={<RouteDetailPage />} />
          <Route path="/routes/:routeId/seats/:tripId" element={<SeatSelectionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
