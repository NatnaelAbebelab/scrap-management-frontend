import { useState } from 'react'
import { apiRequest } from './core/apiRequest'
import { SCRAP_PURCHASE_UPLOAD_URL } from './config'

export const useUploadGrnCsv = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [summary, setSummary] = useState(null)

  const upload = async ({ file, date }) => {
    const formData = new FormData()
    formData.append('csv_file', file)
    if (date) formData.append('date', date)

    setIsUploading(true)
    try {
      const response = await apiRequest({
        url: SCRAP_PURCHASE_UPLOAD_URL,
        method: 'POST',
        data: formData
      })

      if (response.result === 'error') {
        throw new Error(response.message || 'Upload failed')
      }

      const data = response.content || {}
      const skipped = data.skipped_records || {}
      const totalGrns = data.total_grns
      const stockRecordsCreated = data.stock_records_created

      const mappedSummary = {
        message: response.message || 'File uploaded successfully',
        result: response.result,
        totalGrns: typeof totalGrns === 'number' ? totalGrns : null,
        stockRecordsCreated: typeof stockRecordsCreated === 'number' ? stockRecordsCreated : null,
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

