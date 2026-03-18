import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { API_BASE_URL } from './config'

export function useProformas(params = {}) {
  const { token } = useAuth()
  const [data, setData] = useState({ content: [], totalElements: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL(API_BASE_URL + '/customer-engagement-service/api/v1/performa-request')
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value)
        }
      })
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) throw new Error('Failed to fetch proformas')
      const result = await response.json()
      
      // Handle the actual API response structure
      setData({
        content: result.content || [],
        totalElements: result.pageable?.totalElements || 0
      })
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [JSON.stringify(params), token])

  return { ...data, loading, error, refetch: fetchData }
}
