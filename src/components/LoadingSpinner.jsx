import React from 'react'
import './LoadingSpinner.css'

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <p>Cargando datos del sistema...</p>
    </div>
  )
}

export default LoadingSpinner