import { useState } from 'react'
import { apiRequest } from './core/apiRequest'
import { GRN_ADD_WASTE_URL, GRN_CHANGE_STATUS_URL, GRN_STATUS_LIST_URL } from './config'

export const usePurchaseActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addWasteDeduction = async ({ record_no, waste }) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest({
        url: GRN_ADD_WASTE_URL,
        method: 'POST',
        data: { record_no, waste }
      })
      if (response.result === 'error') throw new Error(response.message)
      return response
    } finally {
      setIsSubmitting(false)
    }
  }

  const changeGrnStatus = async (payload) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest({
        url: GRN_CHANGE_STATUS_URL,
        method: 'PATCH',
        data: payload
      })
      if (response.result === 'error') throw new Error(response.message)
      return response
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchStatusList = async () => {
    try {
      const response = await apiRequest({
        url: GRN_STATUS_LIST_URL,
        method: 'GET'
      })
      if (response.result === 'error') throw new Error(response.message)
      return response.content.data || []
    } catch (err) {
      console.error('Failed to fetch status list:', err)
      return []
    }
  }

  return {
    addWasteDeduction,
    changeGrnStatus,
    fetchStatusList,
    isSubmitting
  }
}
