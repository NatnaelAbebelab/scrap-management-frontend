import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import {
  RAW_MATERIAL_GET_PLANTS_URL,
  RAW_MATERIAL_REQUISITION_ADD_URL,
  RAW_MATERIAL_REQUISITION_GET_URL,
  RAW_MATERIAL_REQUISITION_DETAIL_URL,
  RAW_MATERIAL_REQUISITION_DELETE_URL,
  RAW_MATERIAL_REQUISITION_APPROVE_URL,
  RAW_MATERIAL_REQUISITION_EDIT_URL
} from './config'

export const useMaterialRequisition = ({ page = 1, pageSize = 10, filters = {} } = {}) => {
  const [requisitions, setRequisitions] = useState([])
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

  const fetchRequisitions = useCallback(async (customFilters = filters) => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: RAW_MATERIAL_REQUISITION_GET_URL,
        method: 'GET',
        params: {
          page,
          page_size: pageSize,
          plant: customFilters.plant || null,
          start_date: customFilters.start_date || null,
          end_date: customFilters.end_date || null,
          requisition_no: customFilters.requisition_no || null,
          status: customFilters.status || null
        }
      })

      if (response.result === 'success') {
        const content = response.content || {}
        setRequisitions(content.results || [])
        setTotal(content.count || 0)
      }
    } catch (e) {
      console.error('Failed to fetch requisitions', e)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => {
    fetchRequisitions()
  }, [fetchRequisitions])

  const addRequisition = async (data) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_REQUISITION_ADD_URL,
      method: 'POST',
      data
    })
    if (response.result === 'success') {
      await fetchRequisitions()
    }
    return response
  }

  const updateRequisition = async (id, data) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_REQUISITION_EDIT_URL,
      method: 'PUT', // Based on patterns in this project for "edit" endpoints
      data: { ...data, _id: id }
    })
    if (response.result === 'success') {
      await fetchRequisitions()
    }
    return response
  }

  const deleteRequisition = async (id) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_REQUISITION_DELETE_URL(id),
      method: 'DELETE'
    })
    if (response.result === 'success') {
      await fetchRequisitions()
    }
    return response
  }

  const approveRequisition = async (id) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_REQUISITION_APPROVE_URL(id),
      method: 'PATCH'
    })
    if (response.result === 'success') {
      await fetchRequisitions()
    }
    return response
  }

  const getRequisitionDetail = async (id) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_REQUISITION_DETAIL_URL(id),
      method: 'GET'
    })
    return response
  }

  return {
    requisitions,
    total,
    loading,
    plants,
    plantsLoading,
    fetchPlants,
    fetchRequisitions,
    addRequisition,
    updateRequisition,
    deleteRequisition,
    approveRequisition,
    getRequisitionDetail
  }
}
