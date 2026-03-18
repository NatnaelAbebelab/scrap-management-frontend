import { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from './config'
import { useAuth } from '../auth/AuthProvider'

export const useDashboardReports = () => {
  const auth = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generalMetrics, setGeneralMetrics] = useState(null)
  const [yearlyPurchase, setYearlyPurchase] = useState(null)
  const [scrapGrades, setScrapGrades] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const base = `${API_BASE_URL}/report`
        const headers = {}
        if (auth?.token) {
          headers.Authorization = `Bearer ${auth.token}`
        }

        const [yearlyRes, generalRes, scrapRes] = await Promise.all([
          fetch(`${base}/yearly-purchase-report/`, { signal: controller.signal, headers }),
          fetch(`${base}/general-metrics/`, { signal: controller.signal, headers }),
          fetch(`${base}/scrap-grade-percentage/`, { signal: controller.signal, headers })
        ])

        if (!yearlyRes.ok || !generalRes.ok || !scrapRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const yearlyJson = await yearlyRes.json()
        const generalJson = await generalRes.json()
        const scrapJson = await scrapRes.json()

        setYearlyPurchase(yearlyJson?.data || {})
        setGeneralMetrics(generalJson || {})

        const gradeData = scrapJson?.data || {}
        const numericGrades = {}
        Object.entries(gradeData).forEach(([k, v]) => {
          numericGrades[k] = typeof v === 'string' ? parseFloat(v) || 0 : v
        })
        setScrapGrades(numericGrades)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [auth?.token])

  const monthIndex = (m) => {
    const map = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    }
    return map[String(m || '').toLowerCase()] || 0
  }

  const yearlyValues = useMemo(() => {
    if (!yearlyPurchase) return []
    return Object.values(yearlyPurchase).slice().sort((a, b) => {
      const ay = Number(a?.year) || 0
      const by = Number(b?.year) || 0
      if (ay !== by) return ay - by
      return monthIndex(a?.month) - monthIndex(b?.month)
    })
  }, [yearlyPurchase])

  const yearlyLabels = useMemo(
    () =>
      yearlyValues.map((it) => {
        const m = String(it?.month || '').toUpperCase()
        const y = it?.year ? String(it.year) : ''
        return y ? `${m} ${y}` : m || '-'
      }),
    [yearlyValues]
  )

  const lineValues = useMemo(() => {
    if (!yearlyValues.length) return []
    return yearlyValues.map((item) => {
      const v = item.total_net_price || '0'
      if (typeof v === 'string') {
        const cleaned = v.replace(/[^0-9.]/g, '')
        return parseFloat(cleaned) || 0
      }
      return Number(v) || 0
    })
  }, [yearlyValues])

  const latestMonth =
    yearlyValues.length > 0 ? yearlyValues[yearlyValues.length - 1] : null

  return {
    isLoading,
    error,
    generalMetrics,
    scrapGrades,
    yearlyValues,
    yearlyLabels,
    lineValues,
    latestMonth
  }
}

