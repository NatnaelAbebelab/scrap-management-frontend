import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { API_BASE_URL } from './config'

export function usePostComplaint() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const postComplaint = async (complaint) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const response = await fetch(API_BASE_URL + '/customer-engagement-service/api/v1/customer-complaint/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaint)
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to submit complaint')
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

  return { postComplaint, loading, error, data }
}
