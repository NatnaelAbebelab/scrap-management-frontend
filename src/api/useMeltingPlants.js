import { useState, useEffect, useCallback } from 'react'
import { apiRequest } from './core/apiRequest'
import { MELTING_PLANT_ADD_URL, MELTING_PLANT_GET_URL, MELTING_PLANT_EDIT_URL, MELTING_PLANT_DELETE_URL } from './config'

export const useMeltingPlants = ({ page = 1, pageSize = 10 } = {}) => {
  const [plants, setPlants] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRequest({
        url: MELTING_PLANT_GET_URL,
        method: 'GET',
        params: { page, page_size: pageSize }
      })

      if (response.result === 'error') {
        throw new Error(response.message || 'Failed to fetch melting plants')
      }

      const content = response.content || {}
      const results = Array.isArray(content.results) ? content.results : []
      const count = content.count ?? 0

      setPlants(results)
      setTotal(count)
    } catch (err) {
      setError(err.message || 'Failed to fetch melting plants')
      setPlants([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  const addPlant = async (plantName) => {
    const response = await apiRequest({
      url: MELTING_PLANT_ADD_URL,
      method: 'POST',
      data: { plant: plantName }
    })

    if (response.result === 'success') {
      await fetchPlants()
    }
    return response
  }

  const updatePlant = async (id, newName) => {
    const response = await apiRequest({
      url: MELTING_PLANT_EDIT_URL,
      method: 'PUT',
      data: { _id: id, new_name: newName }
    })

    if (response.result === 'success') {
      await fetchPlants()
    }
    return response
  }

  const deletePlant = async (id) => {
    const response = await apiRequest({
      url: MELTING_PLANT_DELETE_URL(id),
      method: 'DELETE'
    })

    if (response.result === 'success') {
      await fetchPlants()
    }
    return response
  }

  return {
    plants,
    total,
    loading,
    error,
    fetchPlants,
    addPlant,
    updatePlant,
    deletePlant,
  }
}
