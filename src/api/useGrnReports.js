import { useState, useMemo } from 'react'
import { GRN_PLAIN_REPORT_URL, GRN_AGGREGATE_REPORT_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'
import { exportToExcel } from '../utils/exportToExcel'
import { formatDate } from '../utils/dateFormatter'

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })
  return query.toString()
}

export const useGrnReports = () => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlainReport = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQueryString(params)
      const response = await authFetch(`${GRN_PLAIN_REPORT_URL}?${qs}`, {
        method: 'GET'
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch plain report')
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

  /**
   * @param {object} filters  - current active filter values
   * @param {Array}  columns  - antd-style column defs from the report component
   * @param {object} totals   - summary totals keyed by dataIndex
   */
  const exportPlainReport = async (filters = {}, columns = [], totals = {}) => {
    setExporting(true)
    try {
      // export=true, no page/page_size
      const qs = buildQueryString({ ...filters, export: true })
      const response = await authFetch(`${GRN_PLAIN_REPORT_URL}?${qs}`, {
        method: 'GET'
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Export failed')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      const rawRecords = data.content?.records
      // Backend returns paginated shape {results:[]} OR flat array when export=true
      const records = Array.isArray(rawRecords) ? rawRecords : (rawRecords?.results || [])
      const responseTotals = data.content?.totals || {}

      // Build export-friendly column definitions from the datatable columns
      // Strip out render functions — use exportValue for special formatting
      const exportColumns = columns
        .filter(col => col.dataIndex)
        .map(col => {
          let exportValue
          if (col.dataIndex === 'created_at') {
            exportValue = (v) => (v ? formatDate(v) : '')
          } else if (col.dataIndex === 'net_price' || col.dataIndex === 'net_weight') {
            exportValue = (v) => Number(v) || 0
          } else if (col.dataIndex === 'material_type' || col.dataIndex === 'status') {
            exportValue = (v) => (v ? String(v).toUpperCase() : '')
          }
          return {
            title: col.title,
            dataIndex: col.dataIndex,
            ...(exportValue ? { exportValue } : {})
          }
        })

      // Map totals from API response to dataIndex keys
      const totalsMap = {
        net_weight: responseTotals.total_net_weight,
        net_price: responseTotals.total_net_price
      }

      exportToExcel({
        filename: 'plain_grn_report',
        sheetName: 'Detailed GRN Report',
        columns: exportColumns,
        data: records,
        totals: totalsMap
      })
    } catch (err) {
      throw err
    } finally {
      setExporting(false)
    }
  }

  const fetchAggregateReport = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQueryString(params)
      const response = await authFetch(`${GRN_AGGREGATE_REPORT_URL}?${qs}`, {
        method: 'GET'
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch aggregate report')
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

  const exportAggregateReport = async (filters = {}, columns = [], totals = {}) => {
    setExporting(true)
    try {
      const qs = buildQueryString({ ...filters, export: true })
      const response = await authFetch(`${GRN_AGGREGATE_REPORT_URL}?${qs}`, {
        method: 'GET'
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Export failed')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      const rawRecords = data.content?.data || []
      const records = Array.isArray(rawRecords) ? rawRecords : []
      const responseTotals = data.content?.totals || {}

      const exportColumns = columns
        .filter(col => col.dataIndex)
        .map(col => {
          let exportValue
          if (col.dataIndex === 'total_net_price' || col.dataIndex === 'total_net_weight' || col.dataIndex === 'total_records') {
            exportValue = (v) => Number(v) || 0
          } else if (col.dataIndex === 'period_date') {
            exportValue = (v) => (v ? formatDate(v) : '')
          }
          return {
            title: col.title,
            dataIndex: col.dataIndex,
            ...(exportValue ? { exportValue } : {})
          }
        })

      const totalsMap = {
        total_net_weight: responseTotals.total_net_weight,
        total_net_price: responseTotals.total_net_price,
        total_records: responseTotals.total_records
      }

      exportToExcel({
        filename: 'aggregate_grn_report',
        sheetName: 'Aggregate Report',
        columns: exportColumns,
        data: records,
        totals: totalsMap
      })
    } catch (err) {
      throw err
    } finally {
      setExporting(false)
    }
  }

  return {
    fetchPlainReport,
    exportPlainReport,
    fetchAggregateReport,
    exportAggregateReport,
    loading,
    exporting,
    error
  }
}
