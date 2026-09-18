import { Routes, Route, Navigate } from 'react-router-dom';
import { useSesion } from './context/SesionContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MapaPage from './pages/MapaPage';
import CVPage from './pages/CVPage';
import EmpleadorPage from './pages/EmpleadorPage';

function RutaProtegida({ children, rolRequerido }) {
  const { rol } = useSesion();

  if (!rol) return <Navigate to="/login" replace />;
  if (rolRequerido && rol !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/mapa"
        element={
          <RutaProtegida>
            <MapaPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/cv"
        element={
          <RutaProtegida rolRequerido="empleado">
            <CVPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/empleador"
        element={
          <RutaProtegida rolRequerido="empleador">
            <EmpleadorPage />
          </RutaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}