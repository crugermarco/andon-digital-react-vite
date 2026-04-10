import React, { useState, useEffect } from 'react'
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
  const { isMarcoCruger } = useAuth()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifiedIds, setNotifiedIds] = useState(new Set())

  useEffect(() => {
    const newMTMachines = machines.filter(m => 
      m.status === 'MT' && 
      !m.acceptedBy && 
      !m.reassigned && 
      !m.notified &&
      !notifiedIds.has(m.solicitudId)
    )

    if (newMTMachines.length > 0) {
      setNotifications(prev => [...prev, ...newMTMachines])
      setNotifiedIds(prev => {
        const newSet = new Set(prev)
        newMTMachines.forEach(m => newSet.add(m.solicitudId))
        return newSet
      })
    }
  }, [machines])

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