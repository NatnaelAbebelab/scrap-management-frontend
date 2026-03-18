import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('ce_token') || localStorage.getItem('authToken') || null
  })
  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('ce_refresh_token') || null
  })
  const [user, setUser] = useState(() => {
    try {
      const ce = localStorage.getItem('ce_user')
      if (ce) return JSON.parse(ce)
      const au = localStorage.getItem('authUser')
      if (au) return JSON.parse(au)
      return null
    } catch (e) { return null }
  })

  useEffect(() => {
    if (token) localStorage.setItem('ce_token', token)
    else localStorage.removeItem('ce_token')
  }, [token])

  useEffect(() => {
    if (refreshToken) localStorage.setItem('ce_refresh_token', refreshToken)
    else localStorage.removeItem('ce_refresh_token')
  }, [refreshToken])

  useEffect(() => {
    if (user) localStorage.setItem('ce_user', JSON.stringify(user))
    else localStorage.removeItem('ce_user')
  }, [user])

  const login = ({ token: t, refreshToken: rt, user: u }) => {
    setToken(t)
    if (rt) setRefreshToken(rt)
    setUser(u)
  }

  const logout = () => {
    setToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, refreshToken, user, login, logout, setToken, setRefreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

export const RequireAuth = ({ children }) => {
  const auth = useAuth()
  const { pathname } = window.location
  if (!auth?.token) {
    return <Navigate to="/login" replace state={{ from: pathname }} />
  }
  return children
}

export default AuthContext
