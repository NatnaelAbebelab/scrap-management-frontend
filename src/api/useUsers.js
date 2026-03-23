import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE_URL, USERS_GET_URL, USER_ADD_URL, USER_UPDATE_URL, USER_DELETE_URL, USER_GET_ROLES_URL, FILE_UPLOAD_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'
import { useUpload } from './useUpload'

export const useUsers = ({ page = 1, pageSize = 10 } = {}) => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])
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
      // Note: the user endpoint gets paginated like /user/get?page=1&page_size=10
      const url = new URL(USERS_GET_URL)
      url.searchParams.set('page', page)
      url.searchParams.set('page_size', pageSize)

      const res = await authFetch(url.toString())
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to fetch users')
      }
      const json = await res.json()
      // API typically returns results in `data.results` and total in `data.count` or directly in `json`
      // Assumed standard DRF paginated response or custom response format
      setUsers(json?.data?.results || json?.results || json?.data || [])
      setTotal(json?.data?.count || json?.count || 0)
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [authFetch, page, pageSize])

  const fetchRoles = useCallback(async () => {
    setRolesLoading(true)
    try {
      const res = await authFetch(USER_GET_ROLES_URL)
      const data = await res.json()
      if (res.ok && data?.result === 'success') {
        setRoles(data.roles || [])
      }
    } catch (e) {
      console.error('Failed to fetch roles', e)
    } finally {
      setRolesLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  const registerUser = async (values, fileList) => {
    let signatureFileName = ''
    if (fileList && fileList.length > 0) {
      const uploadResult = await uploadFile(fileList[0].originFileObj, FILE_UPLOAD_URL)
      signatureFileName = uploadResult?.file_name || ''
    }
    const payload = { ...values, signature: signatureFileName }

    const res = await authFetch(USER_ADD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to register user')
    }
    await fetchUsers()
    return res
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

    const res = await authFetch(USER_UPDATE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to update user')
    }
    await fetchUsers()
    return res
  }

  const deleteUser = async (id) => {
    const targetUrl = USER_DELETE_URL(id)
    const res = await authFetch(targetUrl, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to delete user')
    }
    await fetchUsers()
    return res
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
