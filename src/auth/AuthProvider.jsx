import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { USER_LOGOUT_URL } from '../api/config'

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

  const logout = async () => {
    try {
      if (token) {
        // Extract Django CSRF token from cookies
        let csrfToken = null
        if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';')
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, 10) === 'csrftoken=') {
              csrfToken = decodeURIComponent(cookie.substring(10))
              break
            }
          }
        }

        const headers = {
          'Authorization': `Bearer ${token}`
        }
        if (csrfToken) {
          headers['X-CSRFToken'] = csrfToken
        }

        await fetch(USER_LOGOUT_URL, {
          method: 'POST',
          headers
        })
      }
    } catch (err) {
      console.error('Backend logout failed', err)
    }

    // Force clear state
    setToken(null)
    setRefreshToken(null)
    setUser(null)

    // Explicitly clear browser local storage to eliminate cached items
    localStorage.removeItem('ce_token')
    localStorage.removeItem('ce_refresh_token')
    localStorage.removeItem('ce_user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
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
