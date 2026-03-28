import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import {
  INTERNAL_AGENCIES_GET_URL,
  INTERNAL_AGENCY_ADD_URL,
  INTERNAL_AGENCY_UPDATE_URL,
  INTERNAL_AGENCY_DELETE_URL,
  INTERNAL_AGREEMENTS_GET_URL,
  INTERNAL_AGREEMENT_ADD_URL,
  INTERNAL_AGREEMENT_UPDATE_URL,
  INTERNAL_AGREEMENT_UPDATE_RANGE_URL,
  MATERIAL_TYPES_GET_URL,
  FILE_UPLOAD_URL,
} from './config'

export const useInternalAgencies = ({ page = 1, pageSize = 10 } = {}) => {
  const [agencies, setAgencies] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [materialTypes, setMaterialTypes] = useState({})

  // ── Agencies ───────────────────────────────────────────────────────────────

  const fetchAgencies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRequest({
        url: INTERNAL_AGENCIES_GET_URL,
        method: 'GET',
        params: { page, page_size: pageSize },
      })
      if (response.result === 'success') {
        // apiRequest stores the full response body in `content`
        // GET /internal/get-agencies/ returns { data: { count, results } }
        const data = response.content?.data || response.content || {}
        setAgencies(data.results || [])
        setTotal(data.count || 0)
      } else {
        setError(response.message || 'Failed to fetch agencies')
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch agencies')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchAgencies()
  }, [fetchAgencies])

  // ── Material Types ─────────────────────────────────────────────────────────

  const fetchMaterialTypes = useCallback(async () => {
    try {
      const response = await apiRequest({ url: MATERIAL_TYPES_GET_URL, method: 'GET' })
      if (response.result === 'success') {
        setMaterialTypes(response.content?.data || {})
      }
    } catch (err) {
      console.error('Failed to fetch material types:', err)
    }
  }, [])

  useEffect(() => {
    fetchMaterialTypes()
  }, [fetchMaterialTypes])

  // ── File Upload ────────────────────────────────────────────────────────────

  const uploadFile = async (file) => {
    const actualFile =
      file instanceof File || file instanceof Blob
        ? file
        : file?.originFileObj instanceof File
        ? file.originFileObj
        : null

    if (!actualFile) throw new Error('Invalid file')

    const formData = new FormData()
    formData.append('file', actualFile, actualFile.name || 'upload')

    const response = await apiRequest({
      url: FILE_UPLOAD_URL,
      method: 'POST',
      data: formData,
    })

    if (response.result !== 'success') {
      throw new Error(response.message || 'File upload failed')
    }

    // Backend returns file_name inside content
    return response.content?.file_name || response.content
  }

  // ── Agency CRUD ────────────────────────────────────────────────────────────

  const addAgency = async ({ first_name, last_name, tin, business_name }) => {
    const response = await apiRequest({
      url: INTERNAL_AGENCY_ADD_URL,
      method: 'POST',
      data: { first_name, last_name, tin, business_name },
    })
    if (response.result === 'success') await fetchAgencies()
    return response
  }

  const updateAgency = async (id, { first_name, last_name, tin, business_name, agreement }) => {
    const response = await apiRequest({
      url: INTERNAL_AGENCY_UPDATE_URL,
      method: 'PUT',
      data: {
        agency: id,
        first_name,
        last_name,
        tin: tin || null,
        business_name: business_name || null,
        agreement: agreement || null,
      },
    })
    if (response.result === 'success') await fetchAgencies()
    return response
  }

  const deleteAgency = async (id) => {
    const response = await apiRequest({
      url: INTERNAL_AGENCY_DELETE_URL(id),
      method: 'DELETE',
    })
    if (response.result === 'success') await fetchAgencies()
    return response
  }

  // ── Agreement CRUD ─────────────────────────────────────────────────────────

  /**
   * Add a new agreement.
   * If proofFile is provided it is uploaded first and the returned file_name is
   * sent as `agreement_proof`.
   */
  const addAgreement = async ({ agency, tin, name, material_type, contract_details, agreements, proofFile }) => {
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
        agreements,
        ...(agreement_proof !== undefined ? { agreement_proof } : {}),
      },
    })
    return response
  }

  /**
   * Update agreement header info.
   * Process: first update ranges (if changed), then update the agreement.
   * If proofFile is provided it is uploaded before the update call.
   */
  const updateAgreementRanges = async (agreementId, ranges) => {
    // ranges: { [rangeId]: { _id, min_weight, max_weight, rate } }
    const response = await apiRequest({
      url: INTERNAL_AGREEMENT_UPDATE_RANGE_URL,
      method: 'PUT',
      data: { agreement: agreementId, ranges },
    })
    return response
  }

  const updateAgreement = async ({
    agreementId,
    agency,
    tin,
    material_type,
    status,
    name,
    proofFile,
    ranges, // optional range updates
  }) => {
    // Step 1: update ranges first if provided
    if (ranges && Object.keys(ranges).length > 0) {
      await updateAgreementRanges(agreementId, ranges)
    }

    // Step 2: upload proof file if provided
    let agreement_proof = null
    if (proofFile) {
      agreement_proof = await uploadFile(proofFile)
    }

    // Step 3: update agreement info
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
    return response
  }

  // ── Get Agreements for an agency ──────────────────────────────────────────

  const getAgreements = async (agencyId) => {
    const response = await apiRequest({
      url: INTERNAL_AGREEMENTS_GET_URL(agencyId),
      method: 'GET',
    })
    if (response.result === 'success') {
      const raw = response.content?.data?.results || response.content?.data || response.content || []
      return Array.isArray(raw) ? raw : []
    }
    return []
  }

  return {
    agencies,
    total,
    loading,
    error,
    materialTypes,
    addAgency,
    updateAgency,
    deleteAgency,
    addAgreement,
    updateAgreement,
    updateAgreementRanges,
    getAgreements,
  }
}
