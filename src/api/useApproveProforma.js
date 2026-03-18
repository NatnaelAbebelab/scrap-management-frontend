import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { API_BASE_URL } from './config'

export function useApproveProforma() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const approveMarketing = async (id, remark = '') => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const url = `${API_BASE_URL}/customer-engagement-service/api/v1/performa-request/${id}/marketingApprove?remark=${encodeURIComponent(remark)}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to approve proforma for marketing')
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

  const approveManager = async (id, remark = '') => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const url = `${API_BASE_URL}/customer-engagement-service/api/v1/performa-request/${id}/managerApprove?remark=${encodeURIComponent(remark)}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to approve proforma for manager')
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

  return { approveMarketing, approveManager, loading, error, data }
}