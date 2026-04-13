import React, { useState, useEffect, useRef } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { MachineProvider, useMachines } from './context/MachineContext'
import Header from './components/Header'
import MachineGrid from './components/MachineGrid'
import RequestModal from './components/RequestModal'
import NotificationToast from './components/NotificationToast'
import AdminPanel from './components/AdminPanel'
import BackgroundEffect from './components/BackgroundEffect'
import './App.css'

function AppContent() {
  const { machines, acceptRequest } = useMachines()
  const { isAuthorizedTech } = useAuth()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [notifications, setNotifications] = useState([])
  const previousMachinesRef = useRef([])

  useEffect(() => {
    if (!isAuthorizedTech()) return
  
    const previousMachines = previousMachinesRef.current
    
    const machinesToRemove = previousMachines.filter(pm => {
      const currentMachine = machines.find(m => m.nombre === pm.nombre)
      return !currentMachine || 
             currentMachine.status !== 'MT' || 
             currentMachine.acceptedBy || 
             currentMachine.reassigned
    })
  
    if (machinesToRemove.length > 0) {
      setNotifications(prev => 
        prev.filter(n => 
          !machinesToRemove.some(m => m.solicitudId === n.solicitudId)
        )
      )
    }
  
    const newMTMachines = machines.filter(m => {
      const previousMachine = previousMachines.find(pm => pm.nombre === m.nombre)
      const isNewMT = m.status === 'MT' && 
                      !m.acceptedBy && 
                      !m.reassigned && 
                      !m.notified
      
      const statusChangedToMT = previousMachine && 
                                previousMachine.status !== 'MT' && 
                                m.status === 'MT'
      
      return isNewMT || statusChangedToMT
    })
  
    if (newMTMachines.length > 0) {
      setNotifications(prev => {
        const existingIds = prev.map(n => n.solicitudId)
        const toAdd = newMTMachines.filter(m => !existingIds.includes(m.solicitudId))
        return [...prev, ...toAdd]
      })
    }
  
    previousMachinesRef.current = machines
  }, [machines, isAuthorizedTech])

  const handleAcceptNotification = async (solicitudId) => {
    try {
      await acceptRequest(solicitudId)
      setNotifications(prev => prev.filter(n => n.solicitudId !== solicitudId))
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