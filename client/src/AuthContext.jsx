import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(!!getToken())

  // Page reload pe token se user wapas laao
  useEffect(() => {
    if (!getToken()) return
    api
      .get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password })
    setToken(d.token)
    setUser(d.user)
  }

  const register = async (name, email, password) => {
    const d = await api.post('/auth/register', { name, email, password })
    setToken(d.token)
    setUser(d.user)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
