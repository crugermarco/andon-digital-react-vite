import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMachines } from '../context/MachineContext'
import { X, Wrench, Save, Calendar, AlertTriangle } from 'lucide-react'
import { canCloseReassigned } from '../utils/helpers'
import './TechActionModal.css'

const TechActionModal = ({ machine, onClose }) => {
  const { currentUser, isAuthorizedTech } = useAuth()
  const { activeJob, updateMachineStatus, reassignRequest } = useMachines()
  const [formData, setFormData] = useState({
    actionTaken: '',
    technician: currentUser?.name || '',
    status: 'FALSE'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showRestriction, setShowRestriction] = useState(false)

  const canClose = !machine.reassigned || canCloseReassigned(currentUser?.name)
  const hasActiveJob = activeJob && activeJob.solicitud_id !== machine.solicitudId

  const handleReassign = async () => {
    if (!machine.solicitudId) return
    
    setLoading(true)
    setError('')
    
    try {
      await reassignRequest(machine.solicitudId)
      setSuccess('Solicitud reasignada para el sábado')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setError('Error al reasignar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthorizedTech()) {
      setShowRestriction(true)
      return
    }

    if (machine.reassigned && !canCloseReassigned(currentUser?.name)) {
      setError('Las solicitudes reasignadas solo pueden cerrarse en sábado')
      return
    }

    if (!formData.actionTaken.trim()) {
      setError('La acción realizada es obligatoria')
      return
    }

    setLoading(true)
    setError('')

    try {
      await updateMachineStatus(machine.solicitudId, formData)
      setSuccess('Datos técnicos actualizados correctamente')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setError('Error al actualizar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (showRestriction) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="tech-modal restriction-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              <AlertTriangle size={20} />
              Acceso Restringido
            </h2>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <p>Solo los usuarios Marco Cruger o Josue Chavez pueden usar esta función</p>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Entendido</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tech-modal shimmer-border" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Wrench size={20} />
            Acciones Técnicas - {machine.nombre}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {hasActiveJob && (
          <div className="warning-message">
            <AlertTriangle size={16} />
            <span>Ya estás atendiendo: "{activeJob.maquina_nombre}"</span>
          </div>
        )}

        {machine.acceptedBy && (
          <div className="accepted-info">
            <p>✅ Aceptado por: {machine.acceptedBy}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="tech-form">
          <div className="form-field">
            <label>Descripción del Problema</label>
            <textarea
              value={machine.description || 'Sin descripción'}
              disabled
              rows={3}
            />
          </div>

          <div className="form-field">
            <label>Acción Realizada</label>
            <input
              type="text"
              value={formData.actionTaken}
              onChange={(e) => setFormData(prev => ({ ...prev, actionTaken: e.target.value }))}
              placeholder="Describa la acción realizada"
              required
            />
          </div>

          <div className="form-field">
            <label>Técnico</label>
            <input
              type="text"
              value={formData.technician}
              onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
              required
            />
          </div>

          <div className="form-field">
            <label>Estatus</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              disabled={!canClose}
            >
              <option value="FALSE">MT (Mantenimiento)</option>
              <option value="TRUE">Activa</option>
            </select>
          </div>

          {machine.status === 'MT' && !machine.reassigned && !machine.acceptedBy && (
            <button
              type="button"
              className="btn-reassign"
              onClick={handleReassign}
              disabled={loading}
            >
              <Calendar size={16} />
              Reasignar para Sábado
            </button>
          )}

          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">{success}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading || !canClose}>
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save size={16} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TechActionModal