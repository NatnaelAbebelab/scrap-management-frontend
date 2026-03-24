import { useState, useCallback } from 'react'
import { apiRequest } from './core/apiRequest'
import { GRN_SERIAL_GET_URL, GRN_SERIAL_INITIALIZE_URL } from './config'

export const useGrnSerial = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])

  const fetchSerialNumbers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiRequest({
        url: GRN_SERIAL_GET_URL,
        method: 'GET'
      })
      if (response.result === 'success') {
        setData(response.content || [])
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }, [])

  const initializeSerial = async (initialNumber) => {
    setIsLoading(true)
    try {
      const response = await apiRequest({
        url: GRN_SERIAL_INITIALIZE_URL,
        method: 'POST',
        data: { initial_serial_number: initialNumber }
      })
      if (response.result === 'success') {
        fetchSerialNumbers()
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    data,
    fetchSerialNumbers,
    initializeSerial
  }
}
