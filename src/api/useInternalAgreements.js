import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import {
  INTERNAL_AGREEMENTS_LIST_URL,
  INTERNAL_AGREEMENT_ADD_URL,
  INTERNAL_AGREEMENT_UPDATE_URL,
  INTERNAL_AGREEMENT_UPDATE_RANGE_URL,
  INTERNAL_AGREEMENT_DELETE_URL,
  INTERNAL_AGENCIES_GET_URL,
  MATERIAL_TYPES_GET_URL,
  FILE_UPLOAD_URL,
} from './config'
import { message } from 'antd'

export const useInternalAgreements = ({ page = 1, pageSize = 10 } = {}) => {
  const [agreements, setAgreements] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [agenciesOption, setAgenciesOption] = useState([])
  const [agenciesLoading, setAgenciesLoading] = useState(false)

  const [materialTypes, setMaterialTypes] = useState({})

  // ── Fetch Agreements ───────────────────────────────────────────────────────

  const fetchAgreements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRequest({
        url: INTERNAL_AGREEMENTS_LIST_URL,
        method: 'GET',
        params: { page, page_size: pageSize },
      })
      if (response.result === 'success') {
        const data = response.content?.data || response.content || {}
        setAgreements(data.results || [])
        setTotal(data.count || 0)
      } else {
        setError(response.message || 'Failed to fetch agreements')
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch agreements')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchAgreements()
  }, [fetchAgreements])

  // ── Options Fetch (Agencies & Materials) ───────────────────────────────────

  const fetchDependencies = useCallback(async () => {
    // 1. Fetch Agencies
    setAgenciesLoading(true)
    try {
      const respAgencies = await apiRequest({
        url: INTERNAL_AGENCIES_GET_URL,
        method: 'GET',
        params: { page: 1, page_size: 100 },
      })
      if (respAgencies.result === 'success') {
        const agData = respAgencies.content?.data || respAgencies.content || {}
        setAgenciesOption(agData.results || [])
      }

      // 2. Fetch Material Types
      const respMat = await apiRequest({ url: MATERIAL_TYPES_GET_URL, method: 'GET' })
      if (respMat.result === 'success') {
        setMaterialTypes(respMat.content?.data || {})
      }
    } catch (err) {
      console.error('Failed to fetch dependencies:', err)
    } finally {
      setAgenciesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDependencies()
  }, [fetchDependencies])

  // ── File Upload ────────────────────────────────────────────────────────────

  const uploadFile = async (file) => {
    const actualFile = file instanceof File || file instanceof Blob ? file : file?.originFileObj instanceof File ? file.originFileObj : null
    if (!actualFile) throw new Error('Invalid file')

    const formData = new FormData()
    formData.append('file', actualFile, actualFile.name || 'upload')

    const response = await apiRequest({ url: FILE_UPLOAD_URL, method: 'POST', data: formData })
    if (response.result !== 'success') throw new Error(response.message || 'File upload failed')
    return response.content?.file_name || response.content
  }

  // ── Agreement CRUD ─────────────────────────────────────────────────────────

  const addAgreement = async ({ agency, tin, name, material_type, contract_details, agreementsArray, proofFile }) => {
    let agreement_proof = undefined
    if (proofFile) {
      agreement_proof = await uploadFile(proofFile)
    }

    const response = await apiRequest({
      url: INTERNAL_AGREEMENT_ADD_URL,
      method: 'POST',
      data: {
        name,
        agency,
        tin,
        material_type,
        contract_details,
        agreements: agreementsArray,
        ...(agreement_proof !== undefined ? { agreement_proof } : {}),
      },
    })
    if (response.result === 'success') await fetchAgreements()
    return response
  }

  const updateAgreementRanges = async (agreementId, ranges) => {
    return await apiRequest({
      url: INTERNAL_AGREEMENT_UPDATE_RANGE_URL,
      method: 'PUT',
      data: { agreement: agreementId, ranges },
    })
  }

  const updateAgreement = async ({ agreementId, agency, tin, material_type, status, name, proofFile, ranges }) => {
    if (ranges && Object.keys(ranges).length > 0) {
      await updateAgreementRanges(agreementId, ranges)
    }

    let agreement_proof = null
    if (proofFile) {
      agreement_proof = await uploadFile(proofFile)
    }

    const response = await apiRequest({
      url: INTERNAL_AGREEMENT_UPDATE_URL,
      method: 'PUT',
      data: {
        agreement: agreementId,
        agency,
        tin,
        material_type,
        status: status || null,
        name: name || null,
        agreement_proof,
      },
    })
    if (response.result === 'success') await fetchAgreements()
    return response
  }

  const deleteAgreement = async (id) => {
    const response = await apiRequest({
      url: INTERNAL_AGREEMENT_DELETE_URL(id),
      method: 'DELETE',
    })
    if (response.result === 'success') {
      await fetchAgreements()
      message.success('Agreement deleted successfully')
    }
    return response
  }

  return {
    agreements,
    total,
    loading,
    error,
    agenciesOption,
    agenciesLoading,
    materialTypes,
    addAgreement,
    updateAgreement,
    deleteAgreement,
  }
}
