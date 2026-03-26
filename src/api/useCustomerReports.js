import { useState, useMemo } from 'react'
import { CUSTOMER_PLAIN_REPORT_URL, CUSTOMER_AGGREGATE_REPORT_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'
import { exportToExcel } from '../utils/exportToExcel'
import { formatDate } from '../utils/dateFormatter'

export const useCustomerReports = () => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  const fetchCustomerPlainReport = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = []
      if (filters.page) queryParams.push(`page=${filters.page}`)
      if (filters.page_size) queryParams.push(`page_size=${filters.page_size}`)
      if (filters.tin) queryParams.push(`tin=${encodeURIComponent(filters.tin)}`)
      
      const queryString = queryParams.length ? `?${queryParams.join('&')}` : ''
      const url = `${CUSTOMER_PLAIN_REPORT_URL}${queryString}`

      const response = await authFetch(url, { method: 'GET' })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch customer report')
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

  const exportCustomerPlainReport = async (filters, columns, summary) => {
    setExporting(true)
    setError(null)
    try {
      const queryParams = ['export=true']
      if (filters.tin) queryParams.push(`tin=${encodeURIComponent(filters.tin)}`)
      
      const queryString = `?${queryParams.join('&')}`
      const url = `${CUSTOMER_PLAIN_REPORT_URL}${queryString}`

      const response = await authFetch(url, { method: 'GET' })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch customer report for export')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      const flatRecords = Array.isArray(data.content?.records) 
        ? data.content.records 
        : data.content?.records?.results || []

      const exportColumns = columns
        .filter(col => col.dataIndex)
        .map(col => {
          let exportValue
          if (col.dataIndex === 'paid_amount' || col.dataIndex === 'remaining_amount') {
            exportValue = (v) => Number(v) || 0
          } else if (col.dataIndex === 'created_at') {
            exportValue = (v) => v ? formatDate(v) : ''
          } else if (['first_name', 'last_name', 'business_name'].includes(col.dataIndex)) {
            exportValue = (v) => typeof v === 'string' && v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : (v || '')
          }
          return {
            title: col.title,
            dataIndex: col.dataIndex,
            exportValue: exportValue
          }
        })

      const totalsMap = summary ? {
        paid_amount: summary.total_paid_amount,
        remaining_amount: summary.total_remaining_amount
      } : {}

      exportToExcel({
        columns: exportColumns,
        data: flatRecords,
        filename: 'Customer_Plain_Report',
        totals: totalsMap
      })

      return true
    } catch(err) {
      setError(err.message)
      throw err
    } finally {
      setExporting(false)
    }
  }

  const fetchCustomerAggregateReport = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = []
      if (filters.tin) queryParams.push(`tin=${encodeURIComponent(filters.tin)}`)
      
      const queryString = queryParams.length ? `?${queryParams.join('&')}` : ''
      const url = `${CUSTOMER_AGGREGATE_REPORT_URL}${queryString}`

      const response = await authFetch(url, { method: 'GET' })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch customer aggregate report')
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

  const exportCustomerAggregateReport = async (filters, columns, summary) => {
    setExporting(true)
    setError(null)
    try {
      const queryParams = ['export=true']
      if (filters.tin) queryParams.push(`tin=${encodeURIComponent(filters.tin)}`)
      
      const queryString = `?${queryParams.join('&')}`
      const url = `${CUSTOMER_AGGREGATE_REPORT_URL}${queryString}`

      const response = await authFetch(url, { method: 'GET' })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to trigger aggregate report export')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      const flatRecords = data.content?.records || []

      const exportColumns = columns
        .filter(col => col.dataIndex)
        .map(col => {
          let exportValue
          if (col.dataIndex === 'total_paid_amount' || col.dataIndex === 'total_remaining_amount' || col.dataIndex === 'customer_count') {
            exportValue = (v) => Number(v) || 0
          }
          return {
            title: col.title,
            dataIndex: col.dataIndex,
            exportValue: exportValue
          }
        })

      const totalsMap = summary ? {
        total_paid_amount: summary.total_paid_amount,
        total_remaining_amount: summary.total_remaining_amount
      } : {}

      exportToExcel({
        columns: exportColumns,
        data: flatRecords,
        filename: 'Customer_Aggregate_Report',
        totals: totalsMap
      })

      return true
    } catch(err) {
      setError(err.message)
      throw err
    } finally {
      setExporting(false)
    }
  }

  return {
    fetchCustomerPlainReport,
    exportCustomerPlainReport,
    fetchCustomerAggregateReport,
    exportCustomerAggregateReport,
    loading,
    exporting,
    error
  }
}
