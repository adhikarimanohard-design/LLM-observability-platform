import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('llm_obs_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('llm_obs_user')
    return raw ? JSON.parse(raw) : null
  })
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  useEffect(() => {
    async function verify() {
      if (!token) {
        setChecking(false)
        return
      }
      try {
        const { data } = await api.get('/api/auth/me')
        setUser(data)
        localStorage.setItem('llm_obs_user', JSON.stringify(data))
      } catch {
        logout()
      } finally {
        setChecking(false)
      }
    }
    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('llm_obs_token', data.access_token)
    localStorage.setItem('llm_obs_user', JSON.stringify(data.user))
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post('/api/auth/signup', { name, email, password })
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('llm_obs_token', data.access_token)
    localStorage.setItem('llm_obs_user', JSON.stringify(data.user))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('llm_obs_token')
    localStorage.removeItem('llm_obs_user')
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, checking, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}