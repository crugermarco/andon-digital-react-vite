import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMachines } from '../context/MachineContext'
import { RefreshCw, Clock, Activity, Wrench, Settings } from 'lucide-react'
import './Header.css'

const Header = ({ onOpenRequest, onOpenAdmin }) => {
  const { currentUser, isAuthorizedTech, isMarcoCruger } = useAuth()
  const { machines, lastUpdate, loadMachines } = useMachines()
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateClock = () => {
    const now = new Date()
    setCurrentTime(now.toLocaleString('es-MX', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }))
  }

  const mtCount = machines.filter(m => m.status === 'MT' && !m.reassigned).length
  const reassignedCount = machines.filter(m => m.reassigned).length

  return (
    <header className="andon-header">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">
            <Activity className="header-icon" size={28} />
            SISTEMA ANDON DIGITAL CRUGER 3.0
          </h1>
          <div className="header-badges">
            {isAuthorizedTech() && (
              <span className="tech-badge">
                <Wrench size={14} />
                Técnico
              </span>
            )}
            {isMarcoCruger() && (
              <span className="admin-badge">
                <Settings size={14} />
                Admin
              </span>
            )}
            <span className="user-badge">
              {currentUser?.name || 'Usuario'}
            </span>
          </div>
        </div>

        <div className="header-info">
          <div className="info-item">
            <Clock size={18} />
            <span>{currentTime}</span>
          </div>
          <div className="info-item">
            <Activity size={18} />
            <span>{machines.length} Máquinas</span>
          </div>
          {mtCount > 0 && (
            <div className="info-item info-item--alert">
              <span>🚨</span>
              <span>{mtCount} MT Activas</span>
            </div>
          )}
          {reassignedCount > 0 && (
            <div className="info-item info-item--reassigned">
              <span>📅</span>
              <span>{reassignedCount} Reasignadas</span>
            </div>
          )}
          <div className="info-item">
            <span>🔄</span>
            <span>Auto-actualización: 60s</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-refresh" onClick={loadMachines}>
            <RefreshCw size={18} />
            Actualizar
          </button>
          <button className="btn-request" onClick={onOpenRequest}>
            <span>✉️</span>
            Solicitar Mantenimiento
          </button>
          {isMarcoCruger() && (
            <button className="btn-admin" onClick={onOpenAdmin}>
              <Settings size={18} />
              Panel Admin
            </button>
          )}
        </div>
      </div>

      {lastUpdate && (
        <div className="last-update">
          Última actualización: {lastUpdate.toLocaleTimeString('es-MX')}
        </div>
      )}
    </header>
  )
}

export default Header