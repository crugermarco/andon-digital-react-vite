import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Database, Wrench, Plus, Edit, Trash2, Save, X, Search,
  ChevronLeft, ChevronRight, Download, Upload, RefreshCw
} from 'lucide-react'
import './AdminPanel.css'

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('maquinas')
  const [maquinas, setMaquinas] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    imagen_url: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (activeTab === 'maquinas') fetchMaquinas()
    else fetchSolicitudes()
  }, [activeTab])

  const fetchMaquinas = async () => {
    setLoading(true)
    const { data } = await supabase.from('maquinas').select('*').order('nombre')
    if (data) setMaquinas(data)
    setLoading(false)
  }

  const fetchSolicitudes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('solicitudes')
      .select('*')
      .order('fecha_solicitud', { ascending: false })
      .limit(200)
    if (data) setSolicitudes(data)
    setLoading(false)
  }

  const handleSaveMaquina = async () => {
    if (!formData.nombre) return

    if (editingId) {
      await supabase.from('maquinas').update(formData).eq('id', editingId)
    } else {
      await supabase.from('maquinas').insert([formData])
    }
    
    resetForm()
    fetchMaquinas()
  }

  const handleDeleteMaquina = async (id) => {
    if (!window.confirm('Eliminar esta maquina?')) return
    await supabase.from('maquinas').delete().eq('id', id)
    fetchMaquinas()
  }

  const handleDeleteSolicitud = async (id) => {
    if (!window.confirm('Eliminar esta solicitud?')) return
    await supabase.from('solicitudes').delete().eq('id', id)
    fetchSolicitudes()
  }

  const handleEditMaquina = (maq) => {
    setEditingId(maq.id)
    setFormData({
      nombre: maq.nombre,
      imagen_url: maq.imagen_url || ''
    })
  }

  const handleUpdateSolicitud = async (id, updates) => {
    await supabase.from('solicitudes').update(updates).eq('id', id)
    fetchSolicitudes()
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ nombre: '', imagen_url: '' })
  }

  const exportToCSV = () => {
    const data = activeTab === 'maquinas' ? maquinas : solicitudes
    const headers = Object.keys(data[0] || {}).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    const csv = [headers, ...rows].join('\n')
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}.csv`
    a.click()
  }

  const filteredData = () => {
    const data = activeTab === 'maquinas' ? maquinas : solicitudes
    if (!searchTerm) return data
    
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  const paginatedData = () => {
    const filtered = filteredData()
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }

  const totalPages = Math.ceil(filteredData().length / itemsPerPage)

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Panel de Administracion</h2>
          <button className="admin-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'maquinas' ? 'active' : ''}`}
            onClick={() => { setActiveTab('maquinas'); setCurrentPage(1); }}
          >
            <Database size={18} />
            Maquinas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'solicitudes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('solicitudes'); setCurrentPage(1); }}
          >
            <Wrench size={18} />
            Solicitudes
          </button>
        </div>

        <div className="admin-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder={`Buscar ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="toolbar-actions">
            <button className="export-btn" onClick={exportToCSV}>
              <Download size={16} />
              Exportar CSV
            </button>
            <button className="refresh-btn" onClick={activeTab === 'maquinas' ? fetchMaquinas : fetchSolicitudes}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {activeTab === 'maquinas' && (
          <div className="maquinas-section">
            <div className="form-card">
              <h3>{editingId ? 'Editar Maquina' : 'Agregar Maquina'}</h3>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Nombre de la maquina"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="URL de la imagen (opcional)"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagen_url: e.target.value }))}
                />
                <button className="save-btn" onClick={handleSaveMaquina}>
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {editingId ? 'Actualizar' : 'Agregar'}
                </button>
                {editingId && (
                  <button className="cancel-btn" onClick={resetForm}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Imagen URL</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData().map(maq => (
                    <tr key={maq.id}>
                      <td>{maq.id}</td>
                      <td>{maq.nombre}</td>
                      <td className="url-cell">{maq.imagen_url || '-'}</td>
                      <td>{new Date(maq.created_at).toLocaleString('es-MX')}</td>
                      <td className="actions-cell">
                        <button className="edit-btn" onClick={() => handleEditMaquina(maq)}>
                          <Edit size={14} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteMaquina(maq.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'solicitudes' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Solicitud ID</th>
                  <th>Maquina</th>
                  <th>Usuario</th>
                  <th>Prioridad</th>
                  <th>Estatus</th>
                  <th>Tecnico</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData().map(sol => (
                  <tr key={sol.id}>
                    <td>{sol.id}</td>
                    <td className="code-cell">{sol.solicitud_id}</td>
                    <td>{sol.maquina_nombre}</td>
                    <td>{sol.usuario}</td>
                    <td>
                      <span className={`priority-badge priority-${sol.prioridad?.toLowerCase()}`}>
                        {sol.prioridad}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge-table status-${sol.estatus?.toLowerCase()}`}>
                        {sol.estatus}
                      </span>
                    </td>
                    <td>{sol.tecnico || sol.aceptado_por || '-'}</td>
                    <td className="actions-cell">
                      <button 
                        className="edit-btn"
                        onClick={() => handleUpdateSolicitud(sol.id, { 
                          estatus: sol.estatus === 'MT' ? 'ACTIVA' : 'MT' 
                        })}
                      >
                        <Edit size={14} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDeleteSolicitud(sol.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={16} />
            </button>
            <span>Pagina {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel