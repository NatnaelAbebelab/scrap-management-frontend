import { useState, useMemo } from 'react'
import { USER_UPDATE_PROFILE_URL, USER_CHANGE_PASSWORD_URL, USER_GET_ME_URL, FILE_UPLOAD_URL } from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'
import { useUpload } from './useUpload'

export const useProfile = () => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])
  const { uploadFile } = useUpload()

  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profileData, setProfileData] = useState(null)

  const fetchProfile = async (userId) => {
    if (!userId) return
    setProfileLoading(true)
    setError(null)
    try {
      const res = await authFetch(USER_GET_ME_URL(userId))
      if (!res.ok) {
        throw new Error('Failed to fetch profile data')
      }
      const json = await res.json()
      setProfileData(json?.data || null)
    } catch (err) {
      setError(err.message || 'Failed to open profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const updateProfile = async (values, fileList, existingSignature) => {
    setLoading(true)
    setError(null)
    try {
      let signatureFileName = existingSignature || ''
      if (fileList && fileList.length > 0) {
        const uploadResult = await uploadFile(fileList[0].originFileObj, FILE_UPLOAD_URL)
        signatureFileName = uploadResult?.file_name || ''
      }

      const payload = { ...values, signature: signatureFileName }

      const res = await authFetch(USER_UPDATE_PROFILE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        data = null
      }

      if (!res.ok || data?.result === 'error') {
        throw new Error(data?.message || text || 'Failed to update profile')
      }

      // Automatically refresh user data in the context if applicable
      // Not implemented here as it depends on AuthProvider structure, 
      // but ideally this triggers a user data reload.

      return await res.json()
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (values) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(USER_CHANGE_PASSWORD_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        data = null
      }

      if (!res.ok || data?.result === 'error') {
        throw new Error(data?.message || text || 'Failed to change password')
      }

      return data
    } catch (err) {
      setError(err.message || 'Failed to change password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchProfile,
    updateProfile,
    changePassword,
    profileData,
    profileLoading,
    loading,
    error,
  }
}
