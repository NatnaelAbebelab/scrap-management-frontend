import { useState } from 'react'
import apiClient from './core/apiClient'

export function useUpload() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const uploadFile = async (file, url) => {
    if (!file) {
      console.warn('uploadFile called with no file')
      return null
    }

    setLoading(true)
    setError(null)
    
    try {
      // Robust check for file type
      const actualFile = (file instanceof File || file instanceof Blob) 
        ? file 
        : (file?.originFileObj instanceof File ? file.originFileObj : file)

      if (!(actualFile instanceof File || actualFile instanceof Blob)) {
        console.error('Invalid file object passed to uploadFile:', actualFile)
        throw new Error('Selected data is not a valid file')
      }

      const formData = new FormData()
      formData.append('file', actualFile, actualFile.name || 'filename.png')

      const response = await apiClient.post(url, formData)

      // The backend returns { result: 'success', content: { file_name: '...' } }
      // or just { file_name: '...' }
      const data = response.data
      if (data?.result === 'error') {
        throw new Error(data.message || 'Failed to upload file')
      }
      
      return data?.content || data
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.detail || e.message || 'Upload failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { uploadFile, loading, error }
}
