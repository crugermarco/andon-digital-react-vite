export const formatDate = (date) => {
    const pad = num => num.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
  
  export const formatDateTime = (timestamp) => {
    if (!timestamp) return '--'
    return new Date(timestamp).toLocaleString('es-MX', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }
  
  export const generateRequestId = () => {
    return 'MT-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  }
  
  export const calculateResponseTime = (requestTime, responseTime) => {
    if (!requestTime || !responseTime) return null
    const diff = new Date(responseTime) - new Date(requestTime)
    return Math.round(diff / (1000 * 60))
  }
  
  export const isSaturday = () => {
    return new Date().getDay() === 6
  }
  
  export const canCloseReassigned = (userName) => {
    return isSaturday() || AUTHORIZED_TECHS.includes(userName)
  }