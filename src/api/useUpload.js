import { useState, useMemo } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

export function useUpload() {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const uploadFile = async (file, url) => {
    if (!file) return null
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      // We use standard fetch with Authorization explicitly if we don't want to rely on authFetch for FormData
      // authFetch also works with FormData as seen in useAgencies.js
      const response = await authFetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || 'Failed to upload file')
      }
      
      const result = await response.json()
      return result
    } catch (e) {
      setError(e.message || 'Upload failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { uploadFile, loading, error }
}
