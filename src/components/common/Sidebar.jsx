import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Building2,
  FileText,
  GraduationCap,
  Users,
  BellRing,
  Link2,
  Phone,
  Briefcase,
  ClipboardList,
  X,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Menús según rol
  const menuItems = {
    admin: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/negocios', icon: Building2, label: 'Negocios' },
      { path: '/programas', icon: FileText, label: 'Programas' },
      { path: '/postulaciones', icon: ClipboardList, label: 'Postulaciones' },
      { path: '/cursos', icon: GraduationCap, label: 'Cursos' },
      { path: '/usuarios', icon: Users, label: 'Usuarios' },
      { path: '/avisos', icon: BellRing, label: 'Avisos' },
      { path: '/enlaces', icon: Link2, label: 'Recursos' },
      { path: '/contacto', icon: Phone, label: 'Contacto' }
    ],
    colaborador: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/negocios', icon: Building2, label: 'Negocios' },
      { path: '/programas', icon: FileText, label: 'Programas' },
      { path: '/postulaciones', icon: ClipboardList, label: 'Postulaciones' },
      { path: '/cursos', icon: GraduationCap, label: 'Cursos' },
      { path: '/avisos', icon: BellRing, label: 'Avisos' },
      { path: '/enlaces', icon: Link2, label: 'Recursos' }
    ],
    cliente: [
      { path: '/cliente/dashboard', icon: LayoutDashboard, label: 'Inicio' },
      { path: '/cliente/mis-negocios', icon: Building2, label: 'Mis Negocios' },
      { path: '/cliente/programas', icon: FileText, label: 'Programas' },
      { path: '/cliente/postulaciones', icon: ClipboardList, label: 'Mis Postulaciones' },
      { path: '/cliente/cursos', icon: GraduationCap, label: 'Cursos' },
      { path: '/cliente/financiamiento', icon: Briefcase, label: 'Financiamiento' },
      { path: '/cliente/avisos', icon: BellRing, label: 'Avisos' },
      { path: '/cliente/recursos', icon: Link2, label: 'Recursos' }
    ]
  };

  const currentMenu = menuItems[user?.rol] || menuItems.cliente;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          {/* Menú de navegación */}
          <ul className="space-y-2 font-medium">
            {currentMenu.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center p-3 rounded-lg transition-colors group ${
                      active
                        ? 'bg-capyme-blue text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition duration-75 ${
                        active
                          ? 'text-white'
                          : 'text-gray-500 group-hover:text-gray-900'
                      }`}
                    />
                    <span className="ml-3">{item.label}</span>
                    {active && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Información de contacto (solo para clientes) */}
          {user?.rol === 'cliente' && (
            <div className="mt-8 p-4 bg-gradient-to-br from-capyme-blue to-capyme-lightBlue rounded-lg text-white">
              <h3 className="text-sm font-semibold mb-2">¿Necesitas ayuda?</h3>
              <p className="text-xs mb-3 opacity-90">
                Contáctanos para recibir asesoría personalizada
              </p>
              <Link
                to="/cliente/contacto"
                onClick={onClose}
                className="block w-full px-3 py-2 text-xs text-center bg-white text-capyme-blue rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Contactar CAPYME
              </Link>
            </div>
          )}

          {/* Info del sistema */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between px-3 text-xs text-gray-500">
              <span>CAPYME Sistema</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;