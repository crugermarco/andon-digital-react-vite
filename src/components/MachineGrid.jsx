import React, { useState } from 'react'
import { useMachines } from '../context/MachineContext'
import MachineCard from './MachineCard'
import LoadingSpinner from './LoadingSpinner'
import TechActionModal from './TechActionModal'
import './MachineGrid.css'

const MachineGrid = () => {
  const { machines, loading } = useMachines()
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [showTechModal, setShowTechModal] = useState(false)

  if (loading) return <LoadingSpinner />

  const reassignedMachines = machines.filter(m => m.reassigned)
  const mtMachines = machines.filter(m => m.status === 'MT' && !m.reassigned)
  const activeMachines = machines.filter(m => m.status === 'ACTIVA')
  const orderedMachines = [...reassignedMachines, ...mtMachines, ...activeMachines]

  const handleTechAction = (machine) => {
    setSelectedMachine(machine)
    setShowTechModal(true)
  }

  return (
    <>
      <div className="machine-grid">
        {orderedMachines.map(machine => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onTechAction={handleTechAction}
          />
        ))}
      </div>

      {orderedMachines.length === 0 && (
        <div className="empty-state">
          <p>No hay máquinas registradas</p>
        </div>
      )}

      {showTechModal && selectedMachine && (
        <TechActionModal
          machine={selectedMachine}
          onClose={() => {
            setShowTechModal(false)
            setSelectedMachine(null)
          }}
        />
      )}
    </>
  )
}

export default MachineGrid