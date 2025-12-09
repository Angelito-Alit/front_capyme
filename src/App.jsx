import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Negocios from './pages/Negocios';
import Programas from './pages/Programas';
import Cursos from './pages/Cursos';
import Postulaciones from './pages/Postulaciones';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import Avisos from './pages/Avisos';
import Financiamiento from './pages/Financiamiento';

import ClienteDashboard from './pages/cliente/Dashboard';
import MisNegocios from './pages/cliente/MisNegocios';
import ProgramasDisponibles from './pages/cliente/ProgramasDisponibles';
import MisPostulaciones from './pages/cliente/MisPostulaciones';
import CursosDisponibles from './pages/cliente/CursosDisponibles';
import ClienteFinanciamiento from './pages/cliente/Financiamiento';
import ClienteAvisos from './pages/cliente/Avisos';
import ClienteRecursos from './pages/cliente/Recursos';
import ClienteContacto from './pages/cliente/Contacto';
import Enlaces from './pages/Enlaces';
import Contacto from './pages/Contacto';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        <Route
          path="/avisos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Avisos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/financiamiento"
          element={
            <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
              <Financiamiento />
            </ProtectedRoute>
          }
        />

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
        <Route
          path="/cliente/financiamiento"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <ClienteFinanciamiento />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;