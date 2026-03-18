import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

// Endpoints (base: http://192.168.25.51:8000/api/v1)
// GET    /internal/get-agencies/?page_number=1&page_size=20  → list agencies
// GET    /internal/get-agreements/?agency_id=<id>            → agency agreements
// POST   /internal/register-agency/                          → create agency
// PUT    /internal/update-agency/<id>/                       → update agency
// DELETE /internal/delete-agency/<id>/                       → delete agency

const AGENCIES_URL = `${API_BASE_URL}/internal/get-agencies/`
const AGREEMENTS_URL = `${API_BASE_URL}/internal/get-agreements/`
const REGISTER_URL = `${API_BASE_URL}/internal/register-agency/`
const UPDATE_URL = (id) => `${API_BASE_URL}/internal/update-agency/${id}/`
const DELETE_URL = (id) => `${API_BASE_URL}/internal/delete-agency/${id}/`

export const useAgencies = ({ page = 1, pageSize = 20 } = {}) => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [agencies, setAgencies] = useState([])
  const [materialTypes, setMaterialTypes] = useState({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAgencies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL(AGENCIES_URL)
      url.searchParams.set('page_number', page)
      url.searchParams.set('page_size', pageSize)

      const res = await authFetch(url.toString())
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch agencies')
      }
      const json = await res.json()
      setAgencies(json?.data?.results || [])
      setTotal(json?.data?.count || 0)
      setMaterialTypes(json?.material_types || {})
    } catch (err) {
      setError(err.message || 'Failed to fetch agencies')
    } finally {
      setLoading(false)
    }
  }, [authFetch, page, pageSize])

  useEffect(() => {
    fetchAgencies()
  }, [fetchAgencies])

  const registerAgency = async (values) => {
    const formData = new FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v)
    })
    const res = await authFetch(REGISTER_URL, { method: 'POST', body: formData })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to register agency')
    }
    await fetchAgencies()
    return res
  }

  const updateAgency = async (id, values) => {
    const formData = new FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v)
    })
    const res = await authFetch(UPDATE_URL(id), { method: 'PUT', body: formData })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to update agency')
    }
    await fetchAgencies()
    return res
  }

  const deleteAgency = async (id) => {
    const res = await authFetch(DELETE_URL(id), { method: 'DELETE' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to delete agency')
    }
    await fetchAgencies()
    return res
  }

  const fetchAgreements = async (agencyId) => {
    const url = new URL(AGREEMENTS_URL)
    url.searchParams.set('agency_id', agencyId)
    const res = await authFetch(url.toString())
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to fetch agreements')
    }
    const json = await res.json()
    const all = json?.data?.results || json?.data || []
    // Filter to only agreements that belong to this specific agency
    return Array.isArray(all) ? all.filter((a) => a.agency === agencyId) : all
  }

  return {
    agencies,
    materialTypes,
    total,
    loading,
    error,
    fetchAgencies,
    registerAgency,
    updateAgency,
    deleteAgency,
    fetchAgreements,
  }
}
