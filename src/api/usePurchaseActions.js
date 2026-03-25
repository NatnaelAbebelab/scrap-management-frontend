import { useState } from 'react'
import { apiRequest } from './core/apiRequest'
import { GRN_ADD_WASTE_URL, GRN_CHANGE_STATUS_URL, GRN_STATUS_LIST_URL, FILE_UPLOAD_URL, GRN_ROLLBACK_STATUS_URL, GRN_PAY_CUSTOMER_URL, GRN_DELETE_URL, MATERIAL_TYPES_GET_URL } from './config'
import { useUpload } from './useUpload'

export const usePurchaseActions = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { uploadFile } = useUpload()

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

  const changeGrnStatus = async (values) => {
    setIsSubmitting(true)
    try {
      const { scale_img, grn_img, approve_img, ...otherValues } = values

      let scaleFilename = (typeof scale_img === 'string') ? scale_img : undefined
      let grnFilename = (typeof grn_img === 'string') ? grn_img : undefined
      let approveFilename = (typeof approve_img === 'string') ? approve_img : undefined

      // Perform uploads if they are files
      if (scale_img && typeof scale_img !== 'string') {
        const res = await uploadFile(scale_img, FILE_UPLOAD_URL)
        scaleFilename = res.file_name || res.filename
      }

      if (grn_img && typeof grn_img !== 'string') {
        const res = await uploadFile(grn_img, FILE_UPLOAD_URL)
        grnFilename = res.file_name || res.filename
      }

      if (approve_img && typeof approve_img !== 'string') {
        const res = await uploadFile(approve_img, FILE_UPLOAD_URL)
        approveFilename = res.file_name || res.filename
      }

      const payload = {
        ...otherValues,
        scale_img: scaleFilename,
        grn_img: grnFilename,
        approve_img: approveFilename
      }

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

  const payCustomer = async ({ record_no }) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest({
        url: GRN_PAY_CUSTOMER_URL,
        method: 'POST',
        data: { record_no }
      })
      if (response.result === 'error') throw new Error(response.message)
      return response
    } finally {
      setIsSubmitting(false)
    }
  }

  const rollbackGrnStatus = async ({ record_nos }) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest({
        url: GRN_ROLLBACK_STATUS_URL,
        method: 'PATCH',
        data: { record_nos }
      })
      if (response.result === 'error') throw new Error(response.message)
      return response
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteGrnRecord = async (id) => {
    setIsSubmitting(true)
    try {
      const response = await apiRequest({
        url: GRN_DELETE_URL(id),
        method: 'DELETE'
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
      // Based on provided response structure, the array is in response.content.data
      return response.content?.data || []
    } catch (err) {
      console.error('Failed to fetch status list:', err)
      return []
    }
  }

  const fetchMaterialTypes = async () => {
    try {
      const response = await apiRequest({
        url: MATERIAL_TYPES_GET_URL,
        method: 'GET'
      })
      if (response.result === 'error') throw new Error(response.message)
      // Based on provided response structure, this is an object: { key: value }
      return response.content?.data || {}
    } catch (err) {
      console.error('Failed to fetch material types:', err)
      return {}
    }
  }

  return {
    addWasteDeduction,
    changeGrnStatus,
    rollbackGrnStatus,
    payCustomer,
    deleteGrnRecord,
    fetchStatusList,
    fetchMaterialTypes,
    isSubmitting
  }
}
