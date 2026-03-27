import { useEffect, useState, useMemo } from 'react'
import { API_BASE_URL, GRN_RECORDS_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

// Fetch paginated GRN purchase records with optional filters
export const usePurchaseRecords = ({
  page = 1,
  pageSize = 10,
  filters = {}
} = {}) => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)

  const triggerRefresh = () => setRefreshCount(prev => prev + 1)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = new URL(GRN_RECORDS_URL)
        url.searchParams.set('page', page)
        url.searchParams.set('page_size', pageSize)

        // Add filter params if provided
        if (filters.tin) url.searchParams.set('tin', filters.tin)
        if (filters.material_type) url.searchParams.set('material_type', filters.material_type)
        if (filters.status) url.searchParams.set('status', filters.status)
        if (filters.plate_no) url.searchParams.set('plate_no', filters.plate_no)
        if (filters.start_date) url.searchParams.set('start_date', filters.start_date)
        if (filters.end_date) url.searchParams.set('end_date', filters.end_date)

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
  }, [page, pageSize, authFetch, refreshCount, filters.tin, filters.material_type, filters.status, filters.plate_no, filters.start_date, filters.end_date])

  return {
    records,
    total,
    loading,
    error,
    refresh: triggerRefresh
  }
}
