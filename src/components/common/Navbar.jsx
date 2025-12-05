import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleName = (rol) => {
    const roles = {
      admin: 'Administrador',
      colaborador: 'Colaborador',
      cliente: 'Cliente'
    };
    return roles[rol] || rol;
  };

  const getRoleBadgeColor = (rol) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      colaborador: 'bg-blue-100 text-blue-800',
      cliente: 'bg-green-100 text-green-800'
    };
    return colors[rol] || 'bg-gray-100 text-gray-800';
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo y menú hamburguesa */}
          <div className="flex items-center justify-start">
            {/* Botón hamburguesa (móvil) */}
            <button
              onClick={onMenuClick}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex ml-2 md:mr-24">
              <img
                src="/logo-capyme.png"
                className="h-10 mr-3"
                alt="CAPYME Logo"
              />
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-capyme-blue hidden sm:block">
                CAPYME
              </span>
            </Link>
          </div>

          {/* Right side - Notificaciones y usuario */}
          <div className="flex items-center gap-3">
            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <Bell className="w-6 h-6" />
                {/* Badge de notificaciones */}
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  3
                </span>
              </button>

              {/* Dropdown de notificaciones */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notificaciones
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Ejemplo de notificaciones */}
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Nueva postulación recibida
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hace 5 minutos
                      </p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Curso próximo a iniciar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hace 1 hora
                      </p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">
                        Nuevo programa disponible
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hace 3 horas
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-capyme-blue hover:text-capyme-dark font-medium w-full text-center">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.nombre} {user?.apellido}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.rol)}`}>
                    {getRoleName(user?.rol)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-capyme-blue flex items-center justify-center text-white font-semibold">
                  {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown de usuario */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Info del usuario en móvil */}
                  <div className="px-4 py-3 border-b border-gray-200 md:hidden">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.nombre} {user?.apellido}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${getRoleBadgeColor(user?.rol)}`}>
                      {getRoleName(user?.rol)}
                    </span>
                  </div>

                  <Link
                    to="/perfil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>

                  {user?.rol === 'admin' && (
                    <Link
                      to="/configuracion"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Configuración
                    </Link>
                  )}

                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;