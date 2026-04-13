import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useMachines } from '../context/MachineContext'
import { Wrench, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react'
import './MachineCard.css'

const MachineCard = ({ machine, onTechAction }) => {
  const { currentUser, isAuthorizedTech } = useAuth()
  const { activeJob, acceptRequest } = useMachines()

  const getStatusConfig = () => {
    if (machine.reassigned) {
      return {
        class: 'status-reassigned',
        text: 'REASIGNADA',
        color: '#eab308',
        icon: Clock
      }
    }
    if (machine.status === 'MT') {
      return {
        class: 'status-mt',
        text: 'MT',
        color: '#ef4444',
        icon: AlertTriangle
      }
    }
    return {
      class: 'status-active',
      text: 'ACTIVA',
      color: '#10b981',
      icon: CheckCircle
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const canAccept = machine.status === 'MT' && 
                    !machine.acceptedBy && 
                    isAuthorizedTech() && 
                    !machine.reassigned &&
                    !activeJob

  const handleAccept = async (e) => {
    e.stopPropagation()
    if (!canAccept) return
    try {
      await acceptRequest(machine.solicitudId)
    } catch (error) {
      alert(error.message)
    }
  }

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMzAwIDE1MCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMxZTFiMmIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5TaW4gSW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='

  // Determinar si mostrar detalles (solo para MT o REASIGNADA)
  const showDetails = machine.status === 'MT' || machine.reassigned

  return (
    <div 
      className="machine-card shimmer-border"
      style={{ '--status-color': statusConfig.color }}
      data-reassigned={machine.reassigned}
    >
      {machine.status === 'MT' && !machine.acceptedBy && !machine.reassigned && (
        <div className="notification-indicator" title="Nueva solicitud sin asignar">
          🔔
        </div>
      )}

      <div className="machine-image">
        <img 
          src={machine.imagen_url || placeholderImage} 
          alt={machine.nombre}
          onError={(e) => e.target.src = placeholderImage}
        />
      </div>

      <h3 className="machine-name">{machine.nombre}</h3>

      <div className={`status-badge ${statusConfig.class}`}>
        <StatusIcon size={14} />
        {statusConfig.text}
      </div>

      {/* TÉCNICO - Solo visible si hay uno asignado */}
      {machine.acceptedBy && (
        <div className="technician-info">
          <User size={14} />
          <span>{machine.acceptedBy}</span>
        </div>
      )}

      {/* DETALLES - Solo visibles en MT o REASIGNADA */}
      {showDetails && (
        <div className="machine-details">
          {machine.description && (
            <div className="detail-item">
              <span>📝</span>
              <span>{machine.description}</span>
            </div>
          )}
          {machine.priority && (
            <div className="detail-item">
              <span>⚡</span>
              <span className={`priority-text priority-${machine.priority.toLowerCase()}`}>
                {machine.priority}
              </span>
            </div>
          )}
          {machine.responseTime && (
            <div className="detail-item">
              <span>⏱️</span>
              <span>{machine.responseTime} min</span>
            </div>
          )}
        </div>
      )}

      <div className="machine-actions">
        {canAccept && (
          <button className="btn-accept-card" onClick={handleAccept}>
            <CheckCircle size={14} />
            Aceptar Trabajo
          </button>
        )}
        <button 
          className="btn-tech-action"
          onClick={() => onTechAction(machine)}
        >
          <Wrench size={14} />
          Acciones Técnicas
        </button>
      </div>
    </div>
  )
}

export default MachineCard