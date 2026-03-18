/**
 * fetchWithAuth
 *
 * A thin wrapper around the native fetch() that:
 *  1. Attaches the current access token as a Bearer header.
 *  2. On a 401 response, attempts a silent token refresh using the stored
 *     refresh token (POST /api/v1/user/token/refresh/).
 *  3. If the refresh succeeds, retries the original request once with the
 *     new access token and updates localStorage + the auth context.
 *  4. If the refresh fails (or there is no refresh token), clears auth state
 *     and redirects to /login.
 *
 * Usage:
 *   import { createFetchWithAuth } from '../api/fetchWithAuth'
 *   const authFetch = createFetchWithAuth(auth)   // auth = useAuth() value
 *   const res = await authFetch('/some/url', { method: 'GET' })
 */

import { API_BASE_URL } from './config'

// Django URL conf shows: api/v1/user/ is the user service prefix
const TOKEN_REFRESH_URL = `${API_BASE_URL}/user/token/refresh/`

/**
 * @param {object} auth  – the value returned by useAuth()
 * @returns {function}   – an async function with the same signature as fetch()
 */
export const createFetchWithAuth = (auth) => {
  return async (url, options = {}) => {
    // Build headers with current access token
    const buildHeaders = (token, existingHeaders = {}) => {
      const headers = { ...existingHeaders }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      return headers
    }

    // First attempt
    let res = await fetch(url, {
      ...options,
      headers: buildHeaders(auth.token, options.headers),
    })

    // If not 401, return as-is
    if (res.status !== 401) return res

    // --- Token expired: try to refresh ---
    const storedRefresh =
      auth.refreshToken || localStorage.getItem('ce_refresh_token')

    if (!storedRefresh) {
      // No refresh token available – force logout
      auth.logout()
      window.location.href = '/login'
      return res
    }

    try {
      const refreshRes = await fetch(TOKEN_REFRESH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: storedRefresh }),
      })

      if (!refreshRes.ok) {
        throw new Error('Refresh failed')
      }

      const refreshData = await refreshRes.json()
      const newAccessToken = refreshData.access

      if (!newAccessToken) throw new Error('No access token in refresh response')

      // Persist the new access token
      localStorage.setItem('ce_token', newAccessToken)
      auth.setToken(newAccessToken)

      // If a new refresh token was also returned, persist it too
      if (refreshData.refresh) {
        localStorage.setItem('ce_refresh_token', refreshData.refresh)
        auth.setRefreshToken(refreshData.refresh)
      }

      // Retry the original request with the new token
      res = await fetch(url, {
        ...options,
        headers: buildHeaders(newAccessToken, options.headers),
      })

      return res
    } catch (_err) {
      // Refresh failed – force logout
      auth.logout()
      window.location.href = '/login'
      return res
    }
  }
}
