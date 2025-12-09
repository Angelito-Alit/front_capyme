import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import api from '../services/axios';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Linkedin,
  Globe,
  MessageSquare,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Contacto = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    telefono: '',
    email: '',
    direccion: '',
    horarioAtencion: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    sitioWeb: ''
  });

  useEffect(() => {
    cargarContacto();
  }, []);

  const cargarContacto = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacto');
      if (response.data.data) {
        setFormData({
          telefono: response.data.data.telefono || '',
          email: response.data.data.email || '',
          direccion: response.data.data.direccion || '',
          horarioAtencion: response.data.data.horarioAtencion || '',
          whatsapp: response.data.data.whatsapp || '',
          facebookUrl: response.data.data.facebookUrl || '',
          instagramUrl: response.data.data.instagramUrl || '',
          linkedinUrl: response.data.data.linkedinUrl || '',
          sitioWeb: response.data.data.sitioWeb || ''
        });
      }
    } catch (error) {
      toast.error('Error al cargar información de contacto');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/contacto', formData);
      toast.success('Información actualizada exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar información');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B5BA6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Información de Contacto CAPYME</h1>
          <p className="text-gray-600 mt-1">Gestiona la información de contacto visible para los usuarios</p>
        </div>

        <div className="bg-gradient-to-br from-[#2B5BA6] to-[#4A7BC8] rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Vista Previa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.telefono && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>{formData.telefono}</span>
              </div>
            )}
            {formData.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>{formData.email}</span>
              </div>
            )}
            {formData.direccion && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>{formData.direccion}</span>
              </div>
            )}
            {formData.horarioAtencion && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>{formData.horarioAtencion}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="+52 442 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="+52 442 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="contacto@capyme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horario de Atención
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.horarioAtencion}
                    onChange={(e) => setFormData({ ...formData, horarioAtencion: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="Lunes a Viernes 9:00 - 18:00"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="Calle, Número, Colonia, Ciudad, Estado"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales y Sitio Web</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio Web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.sitioWeb}
                    onChange={(e) => setFormData({ ...formData, sitioWeb: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://www.capyme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://facebook.com/capyme"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://instagram.com/capyme"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                    placeholder="https://linkedin.com/company/capyme"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Contacto;