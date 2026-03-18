import { useEffect, useState, useMemo } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

// Fetch paginated GRN purchase records
export const usePurchaseRecords = ({ page = 1, pageSize = 5 } = {}) => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = new URL(`${API_BASE_URL}/grn/grn/`)
        url.searchParams.set('page', page)
        url.searchParams.set('page_size', pageSize)

        const res = await authFetch(url.toString(), {
          method: 'GET',
          signal: controller.signal,
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to fetch purchase records')
        }

        const json = await res.json()
        const data = json?.data || {}
        setRecords(data.results || [])
        setTotal(typeof data.count === 'number' ? data.count : 0)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch purchase records')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [page, pageSize, authFetch])

  return {
    records,
    total,
    loading,
    error,
  }
}
