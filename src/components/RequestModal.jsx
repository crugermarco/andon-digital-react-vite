import React, { useState } from 'react'
import { useMachines } from '../context/MachineContext'
import { X, Send, AlertCircle } from 'lucide-react'
import { PRIORITIES } from '../utils/constants'
import './RequestModal.css'

const RequestModal = ({ isOpen, onClose }) => {
  const { machines, createRequest } = useMachines()
  const [formData, setFormData] = useState({
    machine: '',
    priority: '',
    problemDescription: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.machine || !formData.priority || !formData.problemDescription.trim()) {
      setError('Todos los campos son obligatorios')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await createRequest(formData)
      setSuccess('Solicitud enviada correctamente')
      setFormData({ machine: '', priority: '', problemDescription: '' })
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 2000)
    } catch (error) {
      setError('Error al enviar la solicitud: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const machineNames = [...new Set(machines.map(m => m.nombre))]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="request-modal shimmer-border" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <AlertCircle size={20} />
            Solicitud de Mantenimiento
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-field">
            <label>Máquina</label>
            <select
              value={formData.machine}
              onChange={(e) => setFormData(prev => ({ ...prev, machine: e.target.value }))}
              required
            >
              <option value="">Seleccione una máquina</option>
              {machineNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Prioridad</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              required
            >
              <option value="">Seleccione prioridad</option>
              <option value={PRIORITIES.ALTA}>{PRIORITIES.ALTA}</option>
              <option value={PRIORITIES.MEDIA}>{PRIORITIES.MEDIA}</option>
              <option value={PRIORITIES.BAJA}>{PRIORITIES.BAJA}</option>
            </select>
          </div>

          <div className="form-field">
            <label>Descripción del Problema</label>
            <textarea
              value={formData.problemDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
              placeholder="Describa el problema detalladamente..."
              rows={4}
              required
            />
          </div>

          {error && <div className="modal-error">{error}</div>}
          {success && <div className="modal-success">{success}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send size={16} />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RequestModal