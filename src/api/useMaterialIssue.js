import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import {
  RAW_MATERIAL_ISSUE_GET_URL,
  RAW_MATERIAL_ISSUE_ADD_URL,
  RAW_MATERIAL_ISSUE_EDIT_URL,
  RAW_MATERIAL_ISSUE_DELETE_URL,
  RAW_MATERIAL_ISSUE_DETAIL_URL,
  RAW_MATERIAL_ISSUE_CHANGE_STATUS_URL,
  RAW_MATERIAL_ISSUE_GET_APPROVED_REQUISITIONS_URL
} from './config'

export const useMaterialIssue = ({ page = 1, pageSize = 10, filters = {} } = {}) => {
  const [issues, setIssues] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [approvedRequisitions, setApprovedRequisitions] = useState([])
  const [requisitionsLoading, setRequisitionsLoading] = useState(false)

  const fetchApprovedRequisitions = useCallback(async () => {
    setRequisitionsLoading(true)
    try {
      const resp = await apiRequest({
        url: RAW_MATERIAL_ISSUE_GET_APPROVED_REQUISITIONS_URL,
        method: 'GET'
      })
      if (resp.result === 'success') {
        setApprovedRequisitions(resp.content || [])
      }
    } catch (e) {
      console.error('Failed to fetch approved requisitions', e)
    } finally {
      setRequisitionsLoading(false)
    }
  }, [])

  const fetchIssues = useCallback(async (customFilters = filters) => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: RAW_MATERIAL_ISSUE_GET_URL,
        method: 'GET',
        params: {
          page,
          page_size: pageSize,
          requisition_no: customFilters.requisition_no || '',
          issue_no: customFilters.issue_no || '',
          issue_status: customFilters.issue_status || '',
          start_date: customFilters.start_date || '',
          end_date: customFilters.end_date || ''
        }
      })

      if (response.result === 'success') {
        const content = response.content || {}
        setIssues(content.results || [])
        setTotal(content.count || 0)
      }
    } catch (e) {
      console.error('Failed to fetch issues', e)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, filters])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const addIssue = async (data) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_ISSUE_ADD_URL,
      method: 'POST',
      data
    })
    if (response.result === 'success') {
      await fetchIssues()
    }
    return response
  }

  const updateIssue = async (id, data) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_ISSUE_EDIT_URL,
      method: 'PUT',
      data: { ...data, _id: id }
    })
    if (response.result === 'success') {
      await fetchIssues()
    }
    return response
  }

  const deleteIssue = async (id) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_ISSUE_DELETE_URL(id),
      method: 'DELETE'
    })
    if (response.result === 'success') {
      await fetchIssues()
    }
    return response
  }

  const getIssueDetail = async (id) => {
    const response = await apiRequest({
      url: RAW_MATERIAL_ISSUE_DETAIL_URL(id),
      method: 'GET'
    })
    return response
  }

  const changeIssueStatus = async (ids, status) => {
    const idArray = Array.isArray(ids) ? ids : [ids]
    let lastResponse = null

    for (const id of idArray) {
      lastResponse = await apiRequest({
        url: RAW_MATERIAL_ISSUE_CHANGE_STATUS_URL(id),
        method: 'PATCH',
        data: { status }
      })
    }

    if (lastResponse && lastResponse.result === 'success') {
      await fetchIssues()
      await fetchApprovedRequisitions()
    }
    return lastResponse
  }

  return {
    issues,
    total,
    loading,
    approvedRequisitions,
    requisitionsLoading,
    fetchApprovedRequisitions,
    fetchIssues,
    addIssue,
    updateIssue,
    deleteIssue,
    getIssueDetail,
    changeIssueStatus
  }
}
