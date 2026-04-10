import React, { useEffect, useState } from 'react'
import { X, AlertTriangle, CheckCircle, Clock, User, Wrench } from 'lucide-react'
import { playNotificationSound } from '../utils/sound'
import './NotificationToast.css'

const NotificationToast = ({ machine, onAccept, onClose }) => {
  const [visible, setVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    playNotificationSound()
  }, [])

  useEffect(() => {
    if (isHovered) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setVisible(false)
          setTimeout(onClose, 300)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isHovered, onClose])

  const handleAccept = () => {
    onAccept(machine.solicitudId)
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const getPriorityColor = () => {
    switch (machine.priority) {
      case 'Alta': return '#ef4444'
      case 'Media': return '#eab308'
      case 'Baja': return '#10b981'
      default: return '#94a3b8'
    }
  }

  return (
    <div 
      className={`notification-toast ${visible ? 'notification-toast--visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--priority-color': getPriorityColor() }}
    >
      <div className="toast-glow" />
      
      <div className="toast-header">
        <div className="toast-title">
          <div className="toast-icon">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4>NUEVA SOLICITUD DE MANTENIMIENTO</h4>
            <span className="toast-priority" style={{ color: getPriorityColor() }}>
              Prioridad {machine.priority}
            </span>
          </div>
        </div>
        <div className="toast-actions">
          <div className="toast-timer">
            <Clock size={14} />
            <span>{timeLeft}s</span>
          </div>
          <button className="toast-close" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="toast-body">
        <div className="toast-machine-info">
          <Wrench size={16} />
          <span className="machine-name">{machine.nombre}</span>
        </div>
        
        <div className="toast-description">
          <p>{machine.description || 'Sin descripción'}</p>
        </div>

        <div className="toast-meta">
          <div className="meta-item">
            <User size={14} />
            <span>Solicitante: Sistema</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="toast-footer">
        <button className="btn-accept-toast" onClick={handleAccept}>
          <CheckCircle size={16} />
          <span>Aceptar Trabajo</span>
        </button>
      </div>

      <div className="toast-progress" style={{ '--progress': `${timeLeft * 3.33}%` }} />
    </div>
  )
}

export default NotificationToast