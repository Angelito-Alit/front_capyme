import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { programasService } from '../../services/programasService';
import { postulacionesService } from '../../services/postulacionesService';
import { negociosService } from '../../services/negociosService';
import { 
  FileText, 
  Search, 
  Calendar,
  DollarSign,
  CheckCircle,
  X,
  ExternalLink,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProgramasDisponibles = () => {
  const [programas, setProgramas] = useState([]);
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrograma, setSelectedPrograma] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  const [formData, setFormData] = useState({
    negocioId: '',
    programaId: '',
    respuestas: []
  });

  useEffect(() => {
    cargarDatos();
  }, [filterCategoria]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = { activo: true };
      if (filterCategoria) params.categoriaId = filterCategoria;

      const [programasRes, negociosRes] = await Promise.all([
        programasService.getAll(params),
        negociosService.getMisNegocios()
      ]);

      setProgramas(programasRes.data);
      setNegocios(negociosRes.data);
    } catch (error) {
      toast.error('Error al cargar programas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (programa) => {
    try {
      setSelectedPrograma(programa);
      
      const preguntasRes = await programasService.getPreguntas(programa.id);
      const preguntasFormato = preguntasRes.data.map(pp => ({
        preguntaId: pp.pregunta.id,
        pregunta: pp.pregunta.pregunta,
        tipoRespuesta: pp.pregunta.tipoRespuesta,
        obligatoria: pp.pregunta.obligatoria,
        opciones: pp.pregunta.opcionesRespuesta,
        respuesta: ''
      }));

      setFormData({
        negocioId: '',
        programaId: programa.id,
        respuestas: preguntasFormato
      });
      setShowModal(true);
    } catch (error) {
      toast.error('Error al cargar formulario');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrograma(null);
  };

  const handleRespuestaChange = (index, valor) => {
    const nuevasRespuestas = [...formData.respuestas];
    nuevasRespuestas[index].respuesta = valor;
    setFormData({ ...formData, respuestas: nuevasRespuestas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.negocioId) {
      toast.error('Selecciona un negocio');
      return;
    }

    const respuestasObligatorias = formData.respuestas.filter(r => r.obligatoria);
    const respuestasIncompletas = respuestasObligatorias.filter(r => !r.respuesta);
    
    if (respuestasIncompletas.length > 0) {
      toast.error('Por favor completa todas las preguntas obligatorias');
      return;
    }

    try {
      await postulacionesService.create({
        negocioId: parseInt(formData.negocioId),
        programaId: formData.programaId,
        respuestas: formData.respuestas.map(r => ({
          preguntaId: r.preguntaId,
          respuesta: r.respuesta
        }))
      });
      
      toast.success('Postulación enviada exitosamente');
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar postulación');
    }
  };

  const programasFiltrados = programas.filter(programa =>
    programa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-gray-900">Programas Disponibles</h1>
          <p className="text-gray-600 mt-1">Explora programas gubernamentales para tu negocio</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar programa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
            />
          </div>

          {programasFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programasFiltrados.map((programa) => (
                <div key={programa.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{programa.nombre}</h3>
                        {programa.tipoPrograma && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {programa.tipoPrograma}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {programa.descripcion || 'Sin descripción'}
                    </p>

                    <div className="space-y-2 mb-4">
                      {programa.montoApoyo && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 font-semibold">
                            {formatCurrency(programa.montoApoyo)}
                          </span>
                        </div>
                      )}

                      {programa.fechaCierre && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            Cierra: {formatDate(programa.fechaCierre)}
                          </span>
                        </div>
                      )}
                    </div>

                    {programa.linkInformacion && (
                      <a
                        href={programa.linkInformacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#2B5BA6] hover:underline mb-4"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Más información
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenModal(programa)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Postularme
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron programas disponibles</p>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedPrograma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Postular a {selectedPrograma.nombre}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecciona el negocio
                </label>
                <select
                  required
                  value={formData.negocioId}
                  onChange={(e) => setFormData({ ...formData, negocioId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                >
                  <option value="">Selecciona un negocio</option>
                  {negocios.map(negocio => (
                    <option key={negocio.id} value={negocio.id}>
                      {negocio.nombreNegocio}
                    </option>
                  ))}
                </select>
              </div>

              {formData.respuestas.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Formulario de postulación</h3>
                  {formData.respuestas.map((resp, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {resp.pregunta} {resp.obligatoria && <span className="text-red-500">*</span>}
                      </label>
                      
                      {resp.tipoRespuesta === 'texto_corto' && (
                        <input
                          type="text"
                          required={resp.obligatoria}
                          value={resp.respuesta}
                          onChange={(e) => handleRespuestaChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                        />
                      )}

                      {resp.tipoRespuesta === 'texto_largo' && (
                        <textarea
                          rows="3"
                          required={resp.obligatoria}
                          value={resp.respuesta}
                          onChange={(e) => handleRespuestaChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                        />
                      )}

                      {resp.tipoRespuesta === 'numero' && (
                        <input
                          type="number"
                          required={resp.obligatoria}
                          value={resp.respuesta}
                          onChange={(e) => handleRespuestaChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                        />
                      )}

                      {resp.tipoRespuesta === 'si_no' && (
                        <select
                          required={resp.obligatoria}
                          value={resp.respuesta}
                          onChange={(e) => handleRespuestaChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5BA6] focus:border-transparent"
                        >
                          <option value="">Seleccionar</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2B5BA6] text-white rounded-lg hover:bg-[#1E3A5F] transition-colors"
                >
                  Enviar Postulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProgramasDisponibles;