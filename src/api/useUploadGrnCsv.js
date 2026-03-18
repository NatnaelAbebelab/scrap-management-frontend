import { useState } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'

export const useUploadGrnCsv = () => {
  const auth = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [summary, setSummary] = useState(null)

  const upload = async ({ file, date }) => {
    const formData = new FormData()
    formData.append('csv_file', file)
    if (date) formData.append('date', date)

    setIsUploading(true)
    try {
      const headers = {}
      if (auth?.token) {
        headers.Authorization = `Bearer ${auth.token}`
      }

      const res = await fetch(`${API_BASE_URL}/grn/upload/`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Upload failed')
      }

      const data = await res.json()
      const skipped = data?.skipped_records || {}
      const total = data?.total_records

      const mappedSummary = {
        message: data?.message || 'File uploaded successfully',
        result: data?.result,
        totalRecords: typeof total === 'number' ? total : null,
        skipped
      }

      setSummary(mappedSummary)
      return mappedSummary
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    summary,
    setSummary,
    upload
  }
}

