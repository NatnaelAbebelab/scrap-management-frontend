import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

const GET_ISSUES = `${API_BASE_URL}/material/get-raw-material-issues/`
const ADD_ISSUE = `${API_BASE_URL}/material/add-raw-material-issue/`
const EDIT_ISSUE = `${API_BASE_URL}/material/edit-raw-material-issue/`
const CHANGE_STATUS = (id) => `${API_BASE_URL}/material/change-status-issue/${id}/`
const GET_REQUISITIONS = `${API_BASE_URL}/material/get-approved-requisitions/`

export const useMaterialIssues = ({ page = 1, pageSize = 10 } = {}) => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [issues, setIssues] = useState([])
  const [requisitions, setRequisitions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL(GET_ISSUES)
      url.searchParams.set('page', page)
      url.searchParams.set('page_size', pageSize)

      const res = await authFetch(url.toString())
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch material issues')
      }
      const json = await res.json()
      
      let results = []
      let count = 0
      
      if (json?.content) {
        results = Array.isArray(json.content.results) ? json.content.results : []
        count = json.content.count ?? 0
      } else {
        const data = json?.data ?? json
        const dataResults = data?.results ?? data ?? []
        results = Array.isArray(dataResults) ? dataResults : []
        count = data?.count ?? results.length ?? 0
      }

      setIssues(results)
      setTotal(count)
    } catch (err) {
      setError(err.message || 'Failed to fetch material issues')
      setIssues([])
    } finally {
      setLoading(false)
    }
  }, [authFetch, page, pageSize])

  const fetchRequisitions = useCallback(async () => {
    try {
      const res = await authFetch(GET_REQUISITIONS)
      if (!res.ok) return // Silently fail for dropdowns as per common practice, or handle error
      const json = await res.json()
      
      let results = []
      if (json?.content) {
        const contentResults = json.content.results ?? json.content
        results = Array.isArray(contentResults) ? contentResults : []
      } else {
        const data = json?.data ?? json
        const dataResults = data?.results ?? data ?? []
        results = Array.isArray(dataResults) ? dataResults : []
      }
      setRequisitions(results)
    } catch (err) {
      console.error("Failed to fetch approved requisitions:", err)
    }
  }, [authFetch])

  useEffect(() => {
    fetchIssues()
    fetchRequisitions()
  }, [fetchIssues, fetchRequisitions])

  const addIssue = async (payload) => {
    const res = await authFetch(ADD_ISSUE, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    })
    const json = await res.json().catch(() => ({}))
    
    if (!res.ok || json?.result === 'error') {
      const apiMessage = json?.message || 'Failed to add material issue'
      throw new Error(apiMessage)
    }
    await fetchIssues()
    return res
  }

  const editIssue = async (payload) => {
    const res = await authFetch(EDIT_ISSUE, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok || json?.result === 'error') {
      const apiMessage = json?.message || 'Failed to update material issue'
      throw new Error(apiMessage)
    }
    await fetchIssues()
    return res
  }

  const changeStatus = async (id) => {
    const res = await authFetch(CHANGE_STATUS(id), { method: 'PATCH' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to change issue status')
    }
    await fetchIssues()
    return res
  }

  return {
    issues,
    requisitions,
    total,
    loading,
    error,
    fetchIssues,
    addIssue,
    editIssue,
    changeStatus,
  }
}
