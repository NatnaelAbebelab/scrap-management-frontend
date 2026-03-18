import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

// Endpoints (base: http://192.168.25.51:8000/api/v1)
// GET  /rate/archive/   → price history
// POST /rate/set-price/ → set new price

const PRICE_ARCHIVE_URL = `${API_BASE_URL}/rate/archive/`
const SET_PRICE_URL = `${API_BASE_URL}/rate/set-price/`

export const useMaterialPrice = () => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchPriceHistory = useCallback(async () => {
    setFetchLoading(true)
    setError('')
    try {
      const res = await authFetch(PRICE_ARCHIVE_URL)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch price history')
      }
      const json = await res.json()
      // Response shape: { result, data: { count, next, previous, results: [...] } }
      if (json?.data?.results && Array.isArray(json.data.results)) {
        setPriceHistory(json.data.results)
      } else if (json && Array.isArray(json.data)) {
        setPriceHistory(json.data)
      } else if (Array.isArray(json)) {
        setPriceHistory(json)
      } else {
        setPriceHistory([])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch price history. Please try again later.')
    } finally {
      setFetchLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    fetchPriceHistory()
  }, [fetchPriceHistory])

  const setPrices = async ({ heavy, medium, light }) => {
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const formData = new FormData()
      formData.append('material_type', 'scrap')
      formData.append('heavy_rate', String(heavy))
      formData.append('medium_rate', String(medium))
      formData.append('light_rate', String(light))

      const res = await authFetch(SET_PRICE_URL, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to set prices')
      }
      setSuccess(true)
      await fetchPriceHistory()
      return true
    } catch (err) {
      setError(err.message || 'Failed to set prices. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    priceHistory,
    loading,
    fetchLoading,
    error,
    success,
    setError,
    setSuccess,
    setPrices,
    fetchPriceHistory,
  }
}
