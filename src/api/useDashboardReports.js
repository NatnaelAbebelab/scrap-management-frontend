import { useEffect, useMemo, useState } from 'react'
import { DASHBOARD_YEARLY_PURCHASE_URL, DASHBOARD_GENERAL_METRICS_URL, DASHBOARD_SCRAP_GRADE_URL } from './config'
import { apiRequest } from './core/apiRequest'

export const useDashboardReports = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generalMetrics, setGeneralMetrics] = useState(null)
  const [yearlyPurchase, setYearlyPurchase] = useState(null)
  const [scrapGrades, setScrapGrades] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [yearlyRes, generalRes, scrapRes] = await Promise.all([
          apiRequest({ url: DASHBOARD_YEARLY_PURCHASE_URL, method: 'GET' }),
          apiRequest({ url: DASHBOARD_GENERAL_METRICS_URL, method: 'GET' }),
          apiRequest({ url: DASHBOARD_SCRAP_GRADE_URL, method: 'GET' })
        ])

        if (yearlyRes.result === 'error' || generalRes.result === 'error' || scrapRes.result === 'error') {
          throw new Error('Failed to fetch dashboard data')
        }

        const yearlyContent = yearlyRes.content
        const generalContent = generalRes.content
        const scrapContent = scrapRes.content

        setYearlyPurchase(yearlyContent?.data || yearlyContent || {})
        setGeneralMetrics(generalContent || {})

        const gradeData = scrapContent?.data || scrapContent || {}
        const numericGrades = {}
        Object.entries(gradeData).forEach(([k, v]) => {
          numericGrades[k] = typeof v === 'string' ? parseFloat(v) || 0 : v
        })
        setScrapGrades(numericGrades)
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

