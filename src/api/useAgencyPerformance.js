import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import { INTERNAL_AGENCY_PERFORMANCE_URL } from './config'

export const useAgencyPerformance = ({ filters = {} } = {}) => {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)
  const [agencyInfo, setAgencyInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filters.tin) params.tin = filters.tin
      if (filters.plate_no) params.plate_no = filters.plate_no
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      
      const response = await apiRequest({
        url: INTERNAL_AGENCY_PERFORMANCE_URL,
        method: 'GET',
        params,
      })
      if (response.result === 'success') {
        setData(response.content?.data || [])
        setSummary(response.content?.summary || null)
        setAgencyInfo(response.content?.agency_info || null)
      } else {
        setError(response.message || 'Failed to fetch performance data')
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch performance data')
    } finally {
      setLoading(false)
    }
  }, [filters.tin, filters.plate_no, filters.start_date, filters.end_date])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    summary,
    agencyInfo,
    loading,
    error,
    refresh: fetchData
  }
}
