import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { REFRESH_INTERVAL } from '../utils/constants'

const MachineContext = createContext()

export const useMachines = () => {
  const context = useContext(MachineContext)
  if (!context) throw new Error('useMachines must be used within MachineProvider')
  return context
}

export const MachineProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeJob, setActiveJob] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const channelRef = useRef(null)

  const loadMachines = async () => {
    try {
      const { data: maquinasData, error: maquinasError } = await supabase
        .from('maquinas')
        .select('*')
        .order('nombre')

      if (maquinasError) throw maquinasError

      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from('solicitudes')
        .select('*')
        .order('fecha_solicitud', { ascending: false })

      if (solicitudesError) throw solicitudesError

      const machinesWithStatus = maquinasData.map(machine => {
        const latestRequest = solicitudesData.find(s => s.maquina_nombre === machine.nombre)
        
        return {
          ...machine,
          status: latestRequest?.estatus || 'ACTIVA',
          description: latestRequest?.descripcion || '',
          solicitudId: latestRequest?.solicitud_id || '',
          acceptedBy: latestRequest?.aceptado_por || '',
          reassigned: latestRequest?.reasignado || false,
          notified: latestRequest?.notificado || false,
          responseTime: latestRequest?.tiempo_respuesta_minutos || null,
          priority: latestRequest?.prioridad || null
        }
      })

      setMachines(machinesWithStatus)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading machines:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkActiveJob = async () => {
    if (!currentUser?.name) return null

    const { data } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('aceptado_por', currentUser.name)
      .eq('estatus', 'MT')
      .limit(1)
      .maybeSingle()

    setActiveJob(data)
    return data
  }

  useEffect(() => {
    loadMachines()
    if (currentUser) checkActiveJob()

    const interval = setInterval(loadMachines, REFRESH_INTERVAL)

    channelRef.current = supabase
      .channel('machine-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maquinas' }, loadMachines)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, loadMachines)
      .subscribe()

    return () => {
      clearInterval(interval)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [currentUser])

  const createRequest = async (requestData) => {
    const solicitudId = 'MT-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    
    const { data, error } = await supabase
      .from('solicitudes')
      .insert([{
        solicitud_id: solicitudId,
        maquina_nombre: requestData.machine,
        usuario: currentUser.name,
        prioridad: requestData.priority,
        descripcion: requestData.problemDescription,
        estatus: 'MT',
        fecha_solicitud: new Date().toISOString()
      }])
      .select()

    if (error) throw error
    await loadMachines()
    return data[0]
  }

  const acceptRequest = async (solicitudId) => {
    const active = await checkActiveJob()
    if (active) throw new Error('Ya tienes un trabajo activo')

    const { error } = await supabase
      .from('solicitudes')
      .update({
        aceptado_por: currentUser.name,
        notificado: true
      })
      .eq('solicitud_id', solicitudId)

    if (error) throw error
    await loadMachines()
    await checkActiveJob()
  }

  const updateMachineStatus = async (solicitudId, updateData) => {
    const updates = {
      accion_realizada: updateData.actionTaken,
      tecnico: updateData.technician || currentUser.name,
      estatus: updateData.status === 'TRUE' ? 'ACTIVA' : 'MT'
    }

    if (updateData.status === 'TRUE') {
      updates.fecha_respuesta = new Date().toISOString()
      
      const { data: solicitud } = await supabase
        .from('solicitudes')
        .select('fecha_solicitud')
        .eq('solicitud_id', solicitudId)
        .single()
      
      if (solicitud) {
        updates.tiempo_respuesta_minutos = Math.round(
          (new Date() - new Date(solicitud.fecha_solicitud)) / (1000 * 60)
        )
      }
    }

    const { error } = await supabase
      .from('solicitudes')
      .update(updates)
      .eq('solicitud_id', solicitudId)

    if (error) throw error
    await loadMachines()
    if (updateData.status === 'TRUE') setActiveJob(null)
  }

  const reassignRequest = async (solicitudId) => {
    const { error } = await supabase
      .from('solicitudes')
      .update({
        reasignado: true,
        estatus: 'REASIGNADA'
      })
      .eq('solicitud_id', solicitudId)

    if (error) throw error
    await loadMachines()
  }

  const value = {
    machines,
    loading,
    lastUpdate,
    activeJob,
    loadMachines,
    checkActiveJob,
    createRequest,
    acceptRequest,
    updateMachineStatus,
    reassignRequest
  }

  return (
    <MachineContext.Provider value={value}>
      {children}
    </MachineContext.Provider>
  )
}