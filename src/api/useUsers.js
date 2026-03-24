import { useState, useEffect, useCallback } from 'react'
import { USERS_GET_URL, USER_ADD_URL, USER_UPDATE_URL, USER_DELETE_URL, USER_GET_ROLES_URL, FILE_UPLOAD_URL } from './config'
import { useUpload } from './useUpload'
import { apiRequest } from './core/apiRequest'

export const useUsers = ({ page = 1, pageSize = 10 } = {}) => {
  const { uploadFile } = useUpload()

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRequest({
        url: USERS_GET_URL,
        method: 'GET',
        pagination: { page, page_size: pageSize }
      })

      if (response.result === 'error') {
        throw new Error(response.message || 'Failed to fetch users')
      }

      const content = response.content
      // API typically returns results in `content.results` or `content.data.results`
      let userList = []
      let count = 0

      if (content?.results && Array.isArray(content.results)) {
        userList = content.results
        count = content.count || content.total || 0
      } else if (content?.data?.results && Array.isArray(content.data.results)) {
        userList = content.data.results
        count = content.data.count || content.data.total || 0
      } else if (content?.data && Array.isArray(content.data)) {
        userList = content.data
        count = content.count || content.total || userList.length || 0
      } else if (Array.isArray(content)) {
        userList = content
        count = userList.length
      }

      setUsers(userList)
      setTotal(count)
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const fetchRoles = useCallback(async () => {
    setRolesLoading(true)
    try {
      const response = await apiRequest({
        url: USER_GET_ROLES_URL,
        method: 'GET'
      })
      if (response.result === 'success') {
        const content = response.content
        let roleList = []
        if (content?.roles && Array.isArray(content.roles)) {
          roleList = content.roles
        } else if (Array.isArray(content)) {
          roleList = content
        }
        setRoles(roleList)
      }
    } catch (e) {
      console.error('Failed to fetch roles', e)
    } finally {
      setRolesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const registerUser = async (values, fileList) => {
    let signatureFileName = ''
    if (fileList && fileList.length > 0) {
      const uploadResult = await uploadFile(fileList[0].originFileObj, FILE_UPLOAD_URL)
      signatureFileName = uploadResult?.file_name || ''
    }
    const payload = { ...values, signature: signatureFileName }

    const response = await apiRequest({
      url: USER_ADD_URL,
      method: 'POST',
      data: payload,
    })

    if (response.result === 'error') {
      throw new Error(response.message || 'Failed to register user')
    }
    await fetchUsers()
    return response
  }

  const updateUser = async (id, values, fileList, existingSignature) => {
    let signatureFileName = existingSignature || ''
    if (fileList && fileList.length > 0) {
      const uploadResult = await uploadFile(fileList[0].originFileObj, FILE_UPLOAD_URL)
      signatureFileName = uploadResult?.file_name || ''
    }

    // Map fields matching the backend schema
    const payload = {
      _id: id,
      first_name: values.fname,
      last_name: values.lname,
      email: values.email,
      phone: values.phone || null,
      role: values.role || null,
      signature: signatureFileName || null
    }

    const response = await apiRequest({
      url: USER_UPDATE_URL,
      method: 'PUT',
      data: payload,
    })

    if (response.result === 'error') {
      throw new Error(response.message || 'Failed to update user')
    }
    await fetchUsers()
    return response
  }

  const deleteUser = async (id) => {
    const targetUrl = USER_DELETE_URL(id)
    const response = await apiRequest({
      url: targetUrl,
      method: 'DELETE',
    })

    if (response.result === 'error') {
      throw new Error(response.message || 'Failed to delete user')
    }
    await fetchUsers()
    return response
  }

  return {
    users,
    roles,
    total,
    loading,
    rolesLoading,
    error,
    fetchUsers,
    fetchRoles,
    registerUser,
    updateUser,
    deleteUser,
  }
}
