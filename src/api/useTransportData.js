import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import {
  INTERNAL_FACTORY_SCRAP_RECORDS_URL,
  INTERNAL_UPLOAD_CSV_URL,
  MATERIAL_TYPES_GET_URL
} from './config'

export const useTransportData = ({ page = 1, pageSize = 10, filters = {} } = {}) => {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [materialTypes, setMaterialTypes] = useState({})
  
  // ── Fetch Transport Data ───────────────────────────────────────────────────
  const fetchTransportData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, page_size: pageSize }
      if (filters.tin) params.tin = filters.tin
      if (filters.material_type) params.material_type = filters.material_type
      if (filters.status) params.status = filters.status
      if (filters.plate_no) params.plate_no = filters.plate_no
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      const response = await apiRequest({
        url: INTERNAL_FACTORY_SCRAP_RECORDS_URL,
        method: 'GET',
        params,
      })
      if (response.result === 'success') {
        const data = response.content?.data || response.content || {}
        setRecords(data.results || [])
        setTotal(data.count || 0)
      } else {
        setError(response.message || 'Failed to fetch transport data')
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch transport data')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters.tin, filters.material_type, filters.status, filters.plate_no, filters.start_date, filters.end_date])

  useEffect(() => {
    fetchTransportData()
  }, [fetchTransportData])

  // ── Fetch Material Types ───────────────────────────────────────────────────
  const fetchMaterialTypes = useCallback(async () => {
    try {
      const respMat = await apiRequest({ url: MATERIAL_TYPES_GET_URL, method: 'GET' })
      if (respMat.result === 'success') {
        setMaterialTypes(respMat.content?.data || {})
      }
    } catch (err) {
      console.error('Failed to fetch material types:', err)
    }
  }, [])

  useEffect(() => {
    fetchMaterialTypes()
  }, [fetchMaterialTypes])

  // ── Upload Transport Data ──────────────────────────────────────────────────
  const uploadTransportDataCsv = async (file) => {
    const actualFile = file instanceof File || file instanceof Blob ? file : file?.originFileObj instanceof File ? file.originFileObj : null
    if (!actualFile) throw new Error('Invalid file')

    const formData = new FormData()
    formData.append('csv_file', actualFile, actualFile.name || 'upload.csv')

    const response = await apiRequest({ 
      url: INTERNAL_UPLOAD_CSV_URL, 
      method: 'POST', 
      data: formData 
    })
    
    // As per user requirement, expected response is:
    // { result: "success", message: "...", created_records: X, skipped_records: Y }
    if (response.result !== 'success') {
      throw new Error(response.message || 'File upload failed')
    }
    
    // Refresh records after successful upload
    await fetchTransportData()
    
    return response
  }

  const exportRecords = async () => {
    try {
      const params = { ...filters, export: true }
      // The API should return the data or a formatted response for export when this is true
      const resp = await apiRequest({
        url: INTERNAL_FACTORY_SCRAP_RECORDS_URL,
        method: 'GET',
        params
      })
      return resp
    } catch (err) {
      console.error('Export failed:', err)
      throw err
    }
  }

  return {
    records,
    total,
    loading,
    error,
    materialTypes,
    uploadTransportDataCsv,
    exportRecords,
    refresh: fetchTransportData
  }
}
