import { useState, useCallback } from 'react'
import { apiRequest } from './core/apiRequest'
import { MATERIAL_ISSUE_REPORT_URL, RAW_MATERIAL_GET_PLANTS_URL } from './config'

export const useMaterialIssueReport = ({ page = 1, pageSize = 10, filters = {} } = {}) => {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [plants, setPlants] = useState([])
  const [plantsLoading, setPlantsLoading] = useState(false)

  const fetchPlants = useCallback(async () => {
    setPlantsLoading(true)
    try {
      const response = await apiRequest({
        url: RAW_MATERIAL_GET_PLANTS_URL,
        method: 'GET'
      })
      if (response.result === 'success') {
        setPlants(response.content || [])
      }
    } catch (e) {
      console.error('Failed to fetch plants', e)
    } finally {
      setPlantsLoading(false)
    }
  }, [])

  const fetchReport = useCallback(async (customFilters = filters) => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: MATERIAL_ISSUE_REPORT_URL,
        method: 'GET',
        params: {
          page,
          page_size: pageSize,
          issue_no: customFilters.issue_no || '',
          issue_start_date: customFilters.issue_start_date || '',
          issue_end_date: customFilters.issue_end_date || '',
          issue_status: customFilters.issue_status || '',
          melting_plant: customFilters.melting_plant || '',
          min_weight: customFilters.min_weight || '',
          max_weight: customFilters.max_weight || '',
          export: customFilters.export || false
        }
      })

      if (response.result === 'success') {
        if (customFilters.export) {
          return response
        }
        const content = response.content || {}
        setRecords(content.results || [])
        setTotal(content.count || 0)
      }
    } catch (e) {
      console.error('Failed to fetch report', e)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  return {
    records,
    total,
    loading,
    plants,
    plantsLoading,
    fetchPlants,
    fetchReport
  }
}
