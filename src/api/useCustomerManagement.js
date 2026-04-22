import { useState, useMemo } from 'react'
import {
  CUSTOMERS_GET_URL,
  CUSTOMER_ADD_URL,
  CUSTOMER_EDIT_URL,
  CUSTOMER_FILTER_URL,
  CUSTOMER_DELETE_URL,
  CUSTOMER_PAY_URL,
  CUSTOMER_PAYMENT_SUMMARY_URL,
  GET_CUSTOMER_GRN
} from './config'
import { useAuth } from '../auth/AuthProvider'
import { createFetchWithAuth } from './fetchWithAuth'

export const useCustomerManagement = () => {
  const auth = useAuth()
  const authFetch = useMemo(() => createFetchWithAuth(auth), [auth])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCustomers = async (page = 1, pageSize = 10, tin = '') => {
    setLoading(true)
    setError(null)
    try {
      const url = tin
        ? `${CUSTOMER_FILTER_URL}?tin=${encodeURIComponent(tin)}`
        : `${CUSTOMERS_GET_URL}?page=${page}&page_size=${pageSize}`

      const response = await authFetch(url, { method: 'GET' })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch customers')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      // When searching by TIN, map it into a shape similar to regular fetch
      if (tin) {
        return {
          results: [{
            _id: tin, // mock id, can't reliably get real id from filter endpoint if not provided
            TIN: tin,
            paid_amount: data.data.paid_amount,
            remaining_amount: data.data.remaining_payment,
            grns: data.data.grns,
            first_name: '',
            last_name: '',
            business_name: 'Filtered Data',
            email: '',
            phone: ''
          }],
          count: 1
        }
      }

      return {
        results: data.data?.results || [],
        count: data.data?.count || 0,
        next: data.data?.next,
        previous: data.data?.previous
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addCustomer = async (customerData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(CUSTOMER_ADD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to add customer')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const editCustomer = async (id, customerData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(CUSTOMER_EDIT_URL(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to edit customer')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(CUSTOMER_DELETE_URL(id), {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to delete customer')
      }

      const data = await response.json().catch(() => ({}))
      if (data && data.result === 'error') throw new Error(data.message)

      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerGrns = async (tin, status) => {
    try {
      let url = `${GET_CUSTOMER_GRN}?tin=${encodeURIComponent(tin)}`
      if (status) {
        url += `&status=${encodeURIComponent(status)}`
      }

      const response = await authFetch(url, { method: 'GET' })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Operation failed')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message || 'Operation failed')

      if (!data.data || data.data.length === 0) {
        throw new Error('There is no "' + status.toUpperCase() + '" GRN(s) that can be paid')
      }

      return data.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const payCustomer = async (tin, recordNos) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(CUSTOMER_PAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tin: tin,
          record_nos: recordNos
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to process payment')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getPaymentSummary = async (tin, recordNos) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authFetch(CUSTOMER_PAYMENT_SUMMARY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tin: tin,
          record_no: recordNos
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to fetch payment summary')
      }

      const data = await response.json()
      if (data.result === 'error') throw new Error(data.message)

      return data.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchCustomers,
    addCustomer,
    editCustomer,
    deleteCustomer,
    fetchCustomerGrns,
    payCustomer,
    getPaymentSummary,
    loading,
    error
  }
}
