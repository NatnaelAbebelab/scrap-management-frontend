import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { API_BASE_URL } from './config'

const API_URL = API_BASE_URL + '/customer-engagement-service/api/v1/customer-complaint'

export function useComplaints({
  status,
  customerName,
  salesPerson,
  shopBranchId,
  customerId,
  closedBy,
  fromDate,
  toDate,
  pageNumber = 0,
  pageSize = 10,
} = {}) {
  const { token } = useAuth()
  const [data, setData] = useState({ content: [], totalElements: 0, loading: true, error: null })

  const fetchData = async () => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (customerName) params.append('customerName', customerName)
    if (salesPerson) params.append('salesPerson', salesPerson)
    if (shopBranchId) params.append('shopBranchId', shopBranchId)
    if (customerId) params.append('customerId', customerId)
    if (closedBy) params.append('closedBy', closedBy)
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)
    params.append('pageNumber', pageNumber)
    params.append('pageSize', pageSize)

    setData(d => ({ ...d, loading: true, error: null }))
    try {
      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }
      
      const json = await response.json()
      
      // Handle the actual API response structure
      setData({ 
        content: json.content || [], 
        totalElements: json.pageable?.totalElements || 0, 
        loading: false, 
        error: null 
      })
    } catch (err) {
      setData(d => ({ ...d, loading: false, error: err.message || 'Failed to fetch complaints' }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [status, customerName, salesPerson, shopBranchId, customerId, closedBy, fromDate, toDate, pageNumber, pageSize, token])

  return { ...data, refetch: fetchData }
}

export function useUpdateComplaintToProgress() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const updateToProgress = async (id, remark = '') => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const url = `${API_URL}/${id}/updateToProgress?remark=${encodeURIComponent(remark)}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update complaint to progress')
      }
      const result = await response.json()
      setData(result)
      return result
    } catch (e) {
      setError(e)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { updateToProgress, loading, error, data }
}

export function useComplaintDetails() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchComplaintDetails = async (id) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }
      
      const result = await response.json()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { fetchComplaintDetails, loading, error, data }
}
