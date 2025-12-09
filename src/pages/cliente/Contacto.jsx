import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../services/axios';
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
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ClienteContacto = () => {
  const [contacto, setContacto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarContacto();
  }, []);

  const cargarContacto = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacto');
      setContacto(response.data.data);
    } catch (error) {
      toast.error('Error al cargar información de contacto');
    } finally {
      setLoading(false);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacto CAPYME</h1>
          <p className="text-gray-600 mt-1">Estamos aquí para ayudarte</p>
        </div>

        <div className="bg-gradient-to-br from-[#2B5BA6] to-[#4A7BC8] rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">¿Necesitas Ayuda?</h2>
          <p className="text-blue-100 mb-6">
            Nuestro equipo está disponible para brindarte asesoría personalizada y resolver todas tus dudas sobre programas gubernamentales y apoyo empresarial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Información de Contacto</h3>
            
            <div className="space-y-4">
              {contacto?.telefono && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Phone className="w-6 h-6 text-[#2B5BA6]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Teléfono</p>
                    <a href={`tel:${contacto.telefono}`} className="text-lg text-gray-900 hover:text-[#2B5BA6]">
                      {contacto.telefono}
                    </a>
                  </div>
                </div>
              )}

              {contacto?.whatsapp && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${contacto.whatsapp.replace(/[^0-9]/g, '')}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-gray-900 hover:text-green-600"
                    >
                      {contacto.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {contacto?.email && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <a href={`mailto:${contacto.email}`} className="text-lg text-gray-900 hover:text-purple-600 break-all">
                      {contacto.email}
                    </a>
                  </div>
                </div>
              )}

              {contacto?.direccion && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dirección</p>
                    <p className="text-lg text-gray-900">{contacto.direccion}</p>
                  </div>
                </div>
              )}

              {contacto?.horarioAtencion && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Horario de Atención</p>
                    <p className="text-lg text-gray-900">{contacto.horarioAtencion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Síguenos en Redes Sociales</h3>
            
            <div className="space-y-4">
              {contacto?.sitioWeb && (
                <a
                  href={contacto.sitioWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sitio Web</p>
                    <p className="text-sm text-gray-600">{contacto.sitioWeb}</p>
                  </div>
                </a>
              )}

              {contacto?.facebookUrl && (
                <a
                  href={contacto.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Facebook className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Facebook</p>
                    <p className="text-sm text-gray-600">Síguenos en Facebook</p>
                  </div>
                </a>
              )}

              {contacto?.instagramUrl && (
                <a
                  href={contacto.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <Instagram className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instagram</p>
                    <p className="text-sm text-gray-600">Síguenos en Instagram</p>
                  </div>
                </a>
              )}

              {contacto?.linkedinUrl && (
                <a
                  href={contacto.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Linkedin className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">LinkedIn</p>
                    <p className="text-sm text-gray-600">Conéctate en LinkedIn</p>
                  </div>
                </a>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Nota:</span> Para una atención más rápida, te recomendamos contactarnos por WhatsApp o teléfono durante nuestro horario de atención.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClienteContacto;