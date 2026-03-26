import { useState, useMemo } from 'react'
import { STOCK_SUMMARY_GET_URL, STOCK_BALANCE_GET_URL, STOCK_AGGREGATED_REPORT_URL, STOCK_CARD_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

export const useStockManagement = () => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStockSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(STOCK_SUMMARY_GET_URL, { method: 'GET' })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch stock summary')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchStockBalance = async (page = 1, pageSize = 20, filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${STOCK_BALANCE_GET_URL}?page=${page}&page_size=${pageSize}`

      const body = {
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        type: filters.type === 'all' ? null : filters.type || null
      }

      const response = await authFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch stock balance records')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchStockAggregatedReport = async (page = 1, pageSize = 20, filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${STOCK_AGGREGATED_REPORT_URL}?page=${page}&page_size=${pageSize}`

      const body = {
        start_date: filters.start_date || null,
        end_date: filters.end_date || null,
        type: filters.type === 'all' ? null : filters.type || null,
        period: filters.period || 'daily'
      }

      const response = await authFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch stock aggregated report')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)
      
      return data.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchStockCard = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(STOCK_CARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: filters.start_date || null,
          end_date: filters.end_date || null
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch stock card')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data.content
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchStockSummary,
    fetchStockBalance,
    fetchStockAggregatedReport,
    fetchStockCard,
    loading,
    error
  }
}
