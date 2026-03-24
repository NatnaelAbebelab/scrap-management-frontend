import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import { RATE_ADD_URL, RATE_ARCHIVE_URL, MATERIAL_TYPES_GET_URL } from './config'

export const useMaterialRate = ({ page = 1, pageSize = 10 } = {}) => {
  const [loading, setLoading] = useState(false)
  const [rates, setRates] = useState([])
  const [materialTypes, setMaterialTypes] = useState({})
  const [total, setTotal] = useState(0)

  const fetchMaterialTypes = useCallback(async () => {
    try {
      const response = await apiRequest({
        url: MATERIAL_TYPES_GET_URL,
        method: 'GET'
      })
      if (response.result === 'success') {
        setMaterialTypes(response.content?.data || {})
      }
    } catch (err) {
      console.error('Failed to fetch material types:', err)
    }
  }, [])

  const fetchRates = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: RATE_ARCHIVE_URL,
        method: 'GET',
        params: { page, page_size: pageSize }
      })
      if (response.result === 'success') {
        const data = response.content?.data || {}
        setRates(data.results || [])
        setTotal(data.count || 0)
        // Optionally update material types from here too if available
        if (response.content?.material_types) {
          setMaterialTypes(response.content.material_types)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchMaterialTypes()
  }, [fetchMaterialTypes])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const addRate = async (values) => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: RATE_ADD_URL,
        method: 'POST',
        data: values
      })
      if (response.result === 'success') {
        await fetchRates()
      }
      return response
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    rates,
    total,
    materialTypes,
    fetchRates,
    addRate
  }
}
