import React, { useEffect, useState, useRef } from 'react'
import { X, AlertTriangle, CheckCircle, Clock, User, Wrench, Volume2, VolumeX } from 'lucide-react'
import { playNotificationSound } from '../utils/sound'
import './NotificationToast.css'

const NotificationToast = ({ machine, onAccept, onClose }) => {
  const [visible, setVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const soundIntervalRef = useRef(null)

  useEffect(() => {
    if (!soundEnabled) return

    playNotificationSound()
    soundIntervalRef.current = setInterval(() => {
      playNotificationSound()
    }, 3500)

    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current)
      }
    }
  }, [soundEnabled])

  const handleAccept = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
    }
    onAccept(machine.solicitudId)
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleClose = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
    }
    setVisible(false)
    setTimeout(onClose, 300)
  }

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isHovered])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
          <button 
            className="toast-sound-toggle" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <div className="toast-timer">
            <Clock size={14} />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <button className="toast-close" onClick={handleClose}>
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
            <span>Esperando: {formatTime(timeElapsed)}</span>
          </div>
        </div>
      </div>

      <div className="toast-footer">
        <button className="btn-accept-toast" onClick={handleAccept}>
          <CheckCircle size={16} />
          <span>Aceptar Trabajo</span>
        </button>
      </div>

      <div className="toast-progress toast-progress--infinite" />
    </div>
  )
}

export default NotificationToast