import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

const GET_MELTING_PLANTS = `${API_BASE_URL}/material/get-melting-plants/`
const ADD_MELTING_PLANT = `${API_BASE_URL}/material/add-melting-plant/`
const EDIT_MELTING_PLANT = `${API_BASE_URL}/material/edit-melting-plant/`
const DELETE_MELTING_PLANT = (id) => `${API_BASE_URL}/material/delete-melting-plant/${id}/`

export const useMeltingPlants = ({ page = 1, pageSize = 10 } = {}) => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [plants, setPlants] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL(GET_MELTING_PLANTS)
      url.searchParams.set('page', page)
      url.searchParams.set('page_size', pageSize)

      const res = await authFetch(url.toString())
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch melting plants')
      }
      const json = await res.json()
      
      // Handle API response structure based on the provided reference
      let results = []
      let count = 0
      
      if (json?.content) {
        const rawResults = Array.isArray(json.content.results) ? json.content.results : []
        results = rawResults.map((item) => ({
          ...item,
          name: item.plant_name || item.name,
        }))
        count = json.content.count ?? 0
      } else if (Array.isArray(json?.content)) {
        results = json.content.map((item) => ({
          _id: item.value,
          id: item.value,
          name: item.label,
          code: item.value,
        }))
        count = results.length
      } else {
        const data = json?.data ?? json
        results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
        count = data?.count ?? results.length ?? 0
      }

      setPlants(results)
      setTotal(count)
    } catch (err) {
      setError(err.message || 'Failed to fetch melting plants')
      setPlants([])
    } finally {
      setLoading(false)
    }
  }, [authFetch, page, pageSize])

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  const addPlant = async (plantName) => {
    const payload = { plant: plantName }
    const res = await authFetch(ADD_MELTING_PLANT, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to add melting plant')
    }
    await fetchPlants()
    return res
  }

  const editPlant = async (id, newName) => {
    const payload = { _id: id, new_name: newName }
    const res = await authFetch(EDIT_MELTING_PLANT, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to update melting plant')
    }
    await fetchPlants()
    return res
  }

  const deletePlant = async (id) => {
    const res = await authFetch(DELETE_MELTING_PLANT(id), { method: 'DELETE' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to delete melting plant')
    }
    await fetchPlants()
    return res
  }

  return {
    plants,
    total,
    loading,
    error,
    fetchPlants,
    addPlant,
    editPlant,
    deletePlant,
  }
}
