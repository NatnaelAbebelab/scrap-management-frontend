import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import {
  INTERNAL_DAILY_TRANSPORT_AGGREGATE_URL,
  INTERNAL_DAILY_TRANSPORT_APPROVE_URL,
  INTERNAL_DAILY_TRANSPORT_PAY_URL,
  MATERIAL_TYPES_GET_URL
} from './config'

export const useDailyTransportAggregate = ({ page = 1, pageSize = 10, filters = {} } = {}) => {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [materialTypes, setMaterialTypes] = useState({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: pageSize }
      if (filters.tin) params.tin = filters.tin
      if (filters.material_type) params.material_type = filters.material_type
      if (filters.status) params.status = filters.status
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      const response = await apiRequest({
        url: INTERNAL_DAILY_TRANSPORT_AGGREGATE_URL,
        method: 'GET',
        params,
      })
      if (response.result === 'success') {
        const data = response.content?.data || response.content || {}
        setRecords(data.results || [])
        setTotal(data.count || 0)
      } else {
        setError(response.message || 'Failed to fetch aggregate data')
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch aggregate data')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.tin, filters.material_type, filters.status, filters.start_date, filters.end_date])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Material Types
  useEffect(() => {
    const fetchMat = async () => {
      try {
        const resp = await apiRequest({ url: MATERIAL_TYPES_GET_URL, method: 'GET' })
        if (resp.result === 'success') setMaterialTypes(resp.content?.data || {})
      } catch (e) { }
    }
    fetchMat()
  }, [])

  const approveRecords = async (ids) => {
    setSubmitting(true)
    try {
      const response = await apiRequest({
        url: INTERNAL_DAILY_TRANSPORT_APPROVE_URL,
        method: 'PATCH',
        data: { data: ids }
      })
      if (response.result === 'success') {
        await fetchData()
      }
      return response
    } finally {
      setSubmitting(false)
    }
  }

  const payRecords = async (ids) => {
    setSubmitting(true)
    try {
      const response = await apiRequest({
        url: INTERNAL_DAILY_TRANSPORT_PAY_URL,
        method: 'PATCH',
        data: { data: ids }
      })
      if (response.result === 'success') {
        await fetchData()
      }
      return response
    } finally {
      setSubmitting(false)
    }
  }

  return {
    records,
    total,
    loading,
    error,
    submitting,
    materialTypes,
    approveRecords,
    payRecords,
    refresh: fetchData
  }
}
