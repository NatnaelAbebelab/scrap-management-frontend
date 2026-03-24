import { useState, useCallback, useEffect } from 'react'
import { apiRequest } from './core/apiRequest'
import { STOCK_BEGINNING_BALANCE_URL, STOCK_SUMMARY_GET_URL } from './config'

export const useStockBalance = () => {
  const [loading, setLoading] = useState(false)
  const [activeBalance, setActiveBalance] = useState(null)

  const fetchStockSummary = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: STOCK_SUMMARY_GET_URL,
        method: 'GET'
      })
      if (response.result === 'success') {
        const data = response.content || {}
        setActiveBalance(data.active_balance || null)
      }
      return response
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStockSummary()
  }, [fetchStockSummary])

  const addBeginningBalance = async (payload) => {
    setLoading(true)
    try {
      const response = await apiRequest({
        url: STOCK_BEGINNING_BALANCE_URL,
        method: 'POST',
        data: payload
      })
      if (response.result === 'success') {
        await fetchStockSummary()
      }
      return response
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    activeBalance,
    fetchStockSummary,
    addBeginningBalance
  }
}
