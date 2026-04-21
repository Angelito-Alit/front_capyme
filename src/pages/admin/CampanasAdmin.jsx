import React, { useState, useEffect } from 'react'
import {
  getCampanasAdmin,
  createCampanaAdmin,
  updateCampanaAdmin,
  deleteCampanaAdmin,
  getNegociosSelect
} from '../../services/campanasAdminService'

const initialForm = {
  titulo: '',
  descripcion: '',
  metaRecaudacion: '',
  montoRecaudado: '0',
  fechaInicio: '',
  fechaCierre: '',
  negocioId: '',
  tipoCrowdfunding: 'donativo',
  estado: 'en_revision'
}

export default function CampanasAdmin() {
  const [campanas, setCampanas] = useState([])
  const [negocios, setNegocios] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [editId, setEditId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const campanasData = await getCampanasAdmin()
      const negociosData = await getNegociosSelect()
      setCampanas(campanasData)
      setNegocios(negociosData)
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const openModal = (campana = null) => {
    if (campana) {
      setFormData({
        titulo: campana.titulo,
        descripcion: campana.descripcion || '',
        metaRecaudacion: campana.metaRecaudacion,
        montoRecaudado: campana.montoRecaudado || '0',
        fechaInicio: campana.fechaInicio.split('T')[0],
        fechaCierre: campana.fechaCierre.split('T')[0],
        negocioId: campana.negocioId,
        tipoCrowdfunding: campana.tipoCrowdfunding,
        estado: campana.estado
      })
      setEditId(campana.id)
    } else {
      setFormData(initialForm)
      setEditId(null)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData(initialForm)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await updateCampanaAdmin(editId, formData)
      } else {
        await createCampanaAdmin(formData)
      }
      closeModal()
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta campaña?')) {
      try {
        await deleteCampanaAdmin(id)
        loadData()
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración de Crowdfunding (Manual)</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Nueva Campaña
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Negocio (Cliente)</th>
              <th className="px-6 py-4">Recaudado / Meta</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campanas.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{c.titulo}</td>
                <td className="px-6 py-4">
                  {c.negocio?.nombreNegocio} <br />
                  <span className="text-xs text-gray-500">
                    {c.negocio?.usuario?.nombre} {c.negocio?.usuario?.apellido}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-green-600">${c.montoRecaudado}</span> / ${c.metaRecaudacion}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    {c.estado}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize">{c.tipoCrowdfunding}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => openModal(c)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
            <h2 className="text-xl font-bold mb-4">
              {editId ? 'Editar Campaña' : 'Nueva Campaña'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Negocio Destino</label>
                <select
                  name="negocioId"
                  value={formData.negocioId}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-gray-300 rounded p-2"
                  required
                >
                  <option value="">Seleccione un negocio...</option>
                  {negocios.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.nombreNegocio} ({n.usuario?.nombre} {n.usuario?.apellido})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta de Recaudación</label>
                  <input
                    type="number"
                    step="0.01"
                    name="metaRecaudacion"
                    value={formData.metaRecaudacion}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto Recaudado (Manual)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="montoRecaudado"
                    value={formData.montoRecaudado}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded p-2 bg-green-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Cierre</label>
                  <input
                    type="date"
                    name="fechaCierre"
                    value={formData.fechaCierre}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    name="tipoCrowdfunding"
                    value={formData.tipoCrowdfunding}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded p-2"
                  >
                    <option value="donativo">Donativo</option>
                    <option value="inversion">Inversión</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded p-2"
                  >
                    <option value="en_revision">En Revisión</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="mt-1 w-full border border-gray-300 rounded p-2 h-24"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}