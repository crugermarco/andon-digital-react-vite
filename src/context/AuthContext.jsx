import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userParam = urlParams.get('user')
    
    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem('userSession', JSON.stringify(user))
        setUserData(user)
        setCurrentUser({
          name: user.USUARIO || user.usuario || user.name || 'Usuario',
          email: user.email || user.CORREO || '',
          role: user.ROL || user.ROLL || 'user'
        })
        window.history.replaceState({}, document.title, window.location.pathname)
        setLoading(false)
        return
      } catch (error) {
        console.error('Error parsing user from URL:', error)
      }
    }
    
    const userSession = localStorage.getItem('userSession')
    
    if (userSession) {
      try {
        const user = JSON.parse(userSession)
        setUserData(user)
        setCurrentUser({
          name: user.USUARIO || user.usuario || user.name || 'Usuario',
          email: user.email || user.CORREO || '',
          role: user.ROL || user.ROLL || 'user'
        })
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        setCurrentUser({ name: 'Usuario Demo', role: 'user' })
        setUserData(null)
      }
    } else {
      setCurrentUser({ name: 'Usuario Demo', role: 'user' })
      setUserData(null)
    }
    
    setLoading(false)
  }, [])

  const isAuthorizedTech = () => {
    if (!currentUser || !currentUser.name) return false
    const authorizedUsers = ['Marco Cruger', 'Josue Chavez']
    return authorizedUsers.includes(currentUser.name)
  }

  const isMarcoCruger = () => {
    if (!currentUser || !currentUser.name) return false
    return currentUser.name === 'Marco Cruger'
  }

  const logout = () => {
    localStorage.removeItem('userSession')
    setCurrentUser({ name: 'Usuario Demo', role: 'user' })
    setUserData(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  const value = {
    currentUser,
    userData,
    loading,
    isAuthorizedTech,
    isMarcoCruger,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}