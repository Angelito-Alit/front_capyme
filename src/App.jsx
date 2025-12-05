import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas Admin/Colaborador
import Dashboard from './pages/Dashboard';
import Negocios from './pages/Negocios';
import Programas from './pages/Programas';
import Cursos from './pages/Cursos';
import Postulaciones from './pages/Postulaciones';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';

// Páginas Cliente
import ClienteDashboard from './pages/cliente/Dashboard';
import MisNegocios from './pages/cliente/MisNegocios';
import ProgramasDisponibles from './pages/cliente/ProgramasDisponibles';
import MisPostulaciones from './pages/cliente/MisPostulaciones';
import CursosDisponibles from './pages/cliente/CursosDisponibles';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Admin/Colaborador */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/negocios"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Negocios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programas"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Programas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cursos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Cursos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postulaciones"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Postulaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Rutas Cliente */}
        <Route
          path="/cliente/dashboard"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/mis-negocios"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <MisNegocios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/programas"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <ProgramasDisponibles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/postulaciones"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <MisPostulaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/cursos"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <CursosDisponibles />
            </ProtectedRoute>
          }
        />

        {/* Ruta compartida */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        {/* Redireccionamiento */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;