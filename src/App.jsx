import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Negocios from './pages/Negocios';
import Programas from './pages/Programas';
import Cursos from './pages/Cursos';
import Postulaciones from './pages/Postulaciones';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';
import Avisos from './pages/Avisos';
import AvisoDetalle from './pages/AvisoDetalle';
import Financiamiento from './pages/Financiamiento';
import Enlaces from './pages/Enlaces';
import Contacto from './pages/Contacto';
import Historial from './pages/Historial';

import ClienteDashboard from './pages/cliente/Dashboard';
import MisNegocios from './pages/cliente/MisNegocios';
import ProgramasDisponibles from './pages/cliente/ProgramasDisponibles';
import MisPostulaciones from './pages/cliente/MisPostulaciones';
import CursosDisponibles from './pages/cliente/CursosDisponibles';
import ClienteFinanciamiento from './pages/cliente/Financiamiento';
import ClienteAvisos from './pages/cliente/Avisos';
import ClienteRecursos from './pages/cliente/Recursos';
import ClienteContacto from './pages/cliente/Contacto';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff' },
          success: {
            duration: 3000,
            iconTheme: { primary: '#4ade80', secondary: '#fff' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ── Admin / Colaborador ── */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Dashboard /></ProtectedRoute>} />
        <Route path="/negocios" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Negocios /></ProtectedRoute>} />
        <Route path="/programas" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Programas /></ProtectedRoute>} />
        <Route path="/cursos" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Cursos /></ProtectedRoute>} />
        <Route path="/postulaciones" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Postulaciones /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Usuarios /></ProtectedRoute>} />
        <Route path="/financiamiento" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Financiamiento /></ProtectedRoute>} />
        <Route path="/avisos" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Avisos /></ProtectedRoute>} />
        <Route path="/avisos/:id" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><AvisoDetalle /></ProtectedRoute>} />
        <Route path="/enlaces" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Enlaces /></ProtectedRoute>} />
        <Route path="/contacto" element={<ProtectedRoute allowedRoles={['admin', 'colaborador']}><Contacto /></ProtectedRoute>} />
        <Route path="/historial" element={<ProtectedRoute allowedRoles={['admin']}><Historial /></ProtectedRoute>} />

        {/* ── Cliente ── */}
        <Route path="/cliente/dashboard" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteDashboard /></ProtectedRoute>} />
        <Route path="/cliente/mis-negocios" element={<ProtectedRoute allowedRoles={['cliente']}><MisNegocios /></ProtectedRoute>} />
        <Route path="/cliente/programas" element={<ProtectedRoute allowedRoles={['cliente']}><ProgramasDisponibles /></ProtectedRoute>} />
        <Route path="/cliente/postulaciones" element={<ProtectedRoute allowedRoles={['cliente']}><MisPostulaciones /></ProtectedRoute>} />
        <Route path="/cliente/cursos" element={<ProtectedRoute allowedRoles={['cliente']}><CursosDisponibles /></ProtectedRoute>} />
        <Route path="/cliente/financiamiento" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteFinanciamiento /></ProtectedRoute>} />
        <Route path="/cliente/avisos" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteAvisos /></ProtectedRoute>} />
        <Route path="/cliente/avisos/:id" element={<ProtectedRoute allowedRoles={['cliente']}><AvisoDetalle /></ProtectedRoute>} />
        <Route path="/cliente/recursos" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteRecursos /></ProtectedRoute>} />
        <Route path="/cliente/contacto" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteContacto /></ProtectedRoute>} />

        {/* ── Compartidas ── */}
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

        {/* ── Redirects ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;