import React, { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MachineProvider, useMachines } from './context/MachineContext'
import Header from './components/Header'
import MachineGrid from './components/MachineGrid'
import RequestModal from './components/RequestModal'
import NotificationToast from './components/NotificationToast'
import AdminPanel from './components/AdminPanel'
import BackgroundEffect from './components/BackgroundEffect'
import { playNotificationSound } from './utils/sound'
import './App.css'

function AppContent() {
  const { machines, acceptRequest } = useMachines()
  const { currentUser, isAuthorizedTech } = useAuth()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifiedIds, setNotifiedIds] = useState(new Set())
  const previousMachinesRef = useRef([])

  useEffect(() => {
    // Solo para usuarios autorizados (Marco Cruger o Josue Chavez)
    if (!isAuthorizedTech()) return

    const previousMachines = previousMachinesRef.current
    const newMTMachines = machines.filter(m => {
      // Buscar máquinas que antes NO estaban en MT y ahora SÍ
      const previousMachine = previousMachines.find(pm => pm.nombre === m.nombre)
      const isNewMT = m.status === 'MT' && 
                      !m.acceptedBy && 
                      !m.reassigned && 
                      !m.notified &&
                      !notifiedIds.has(m.solicitudId)
      
      // Verificar si cambió de estado a MT
      const statusChangedToMT = previousMachine && 
                                previousMachine.status !== 'MT' && 
                                m.status === 'MT'
      
      return isNewMT || statusChangedToMT
    })

    if (newMTMachines.length > 0) {
      console.log('Nuevas solicitudes MT detectadas:', newMTMachines)
      
      // Reproducir sonido
      playNotificationSound()
      
      // Mostrar notificaciones
      setNotifications(prev => [...prev, ...newMTMachines])
      setNotifiedIds(prev => {
        const newSet = new Set(prev)
        newMTMachines.forEach(m => newSet.add(m.solicitudId))
        return newSet
      })
    }

    previousMachinesRef.current = machines
  }, [machines, isAuthorizedTech])

  const handleAcceptNotification = async (solicitudId) => {
    try {
      await acceptRequest(solicitudId)
    } catch (error) {
      alert(error.message)
    }
  }

  const removeNotification = (solicitudId) => {
    setNotifications(prev => prev.filter(n => n.solicitudId !== solicitudId))
  }

  return (
    <div className="app">
      <BackgroundEffect />
      
      <Header 
        onOpenRequest={() => setShowRequestModal(true)} 
        onOpenAdmin={() => setShowAdminPanel(true)}
      />
      
      <main className="app-main">
        <MachineGrid />
      </main>

      <RequestModal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)} 
      />

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {notifications.map(machine => (
        <NotificationToast
          key={machine.solicitudId}
          machine={machine}
          onAccept={handleAcceptNotification}
          onClose={() => removeNotification(machine.solicitudId)}
        />
      ))}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <MachineProvider>
        <AppContent />
      </MachineProvider>
    </AuthProvider>
  )
}

export default App