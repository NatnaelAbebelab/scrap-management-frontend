import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Row, Col, Space, Spin, Typography } from 'antd'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useDashboardReports } from '../api/useDashboardReports'

const { Text } = Typography

const formatCompact = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '-'
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${Math.round(n)}`
}

const useElementWidth = () => {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      const w = entry?.contentRect?.width || 0
      setWidth(w)
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

// Better line chart (responsive + grid + smooth line + area fill + tooltip)
const LineChart = ({ points, labels, height = 220, color = '#7539FF' }) => {
  const [wrapRef, wrapWidth] = useElementWidth()
  const [hoverIndex, setHoverIndex] = useState(null)

  const padding = { top: 16, right: 16, bottom: 36, left: 48 }
  const innerWidth = Math.max(0, (wrapWidth || 520) - padding.left - padding.right)
  const innerHeight = Math.max(0, height - padding.top - padding.bottom)

  const safePoints = Array.isArray(points) ? points : []
  if (safePoints.length === 0) return <div ref={wrapRef} />

  const max = Math.max(...safePoints)
  const min = Math.min(...safePoints)
  const range = max - min || 1

  const coords = safePoints.map((v, i) => {
    const x =
      safePoints.length === 1
        ? innerWidth / 2
        : (i / Math.max(safePoints.length - 1, 1)) * innerWidth
    const y = innerHeight - ((v - min) / range) * innerHeight
    return { x, y, v }
  })

  // Smooth path using quadratic curves through midpoints
  const linePath = (() => {
    if (coords.length === 1) {
      return `M ${coords[0].x} ${coords[0].y}`
    }
    let d = `M ${coords[0].x} ${coords[0].y}`
    for (let i = 1; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2
      const yc = (coords[i].y + coords[i + 1].y) / 2
      d += ` Q ${coords[i].x} ${coords[i].y} ${xc} ${yc}`
    }
    d += ` Q ${coords[coords.length - 1].x} ${coords[coords.length - 1].y} ${coords[coords.length - 1].x} ${coords[coords.length - 1].y}`
    return d
  })()

  const areaPath = (() => {
    const last = coords[coords.length - 1]
    const first = coords[0]
    return `${linePath} L ${last.x} ${innerHeight} L ${first.x} ${innerHeight} Z`
  })()

  const yTicks = 5
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const t = i / yTicks
    const y = innerHeight - t * innerHeight
    const value = min + t * range
    return { y, value }
  })

  const nearestIndexFromX = (x) => {
    if (coords.length === 1) return 0
    const step = innerWidth / Math.max(coords.length - 1, 1)
    const idx = Math.round(x / step)
    return Math.min(coords.length - 1, Math.max(0, idx))
  }

  const tooltip = hoverIndex !== null ? coords[hoverIndex] : null
  const tooltipLabel = labels && labels[hoverIndex] ? labels[hoverIndex] : `#${hoverIndex + 1}`

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${Math.max(1, innerWidth + padding.left + padding.right)} ${height}`}
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const px = e.clientX - rect.left
          const vx = (px / rect.width) * (innerWidth + padding.left + padding.right)
          const xIn = vx - padding.left
          if (xIn < 0 || xIn > innerWidth) return
          setHoverIndex(nearestIndexFromX(xIn))
        }}
      >
        <defs>
          <linearGradient id="lineAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid + Y axis labels */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1="0"
                x2={innerWidth}
                y1={t.y}
                y2={t.y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
              <text
                x={-10}
                y={t.y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#8c8c8c"
                fontSize="11"
              >
                {formatCompact(t.value)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#lineAreaFill)" />

          {/* Smooth line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

          {/* Points */}
          {coords.map((p, idx) => {
            const isActive = hoverIndex === idx
            return (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={isActive ? 5 : 3.5}
                fill={isActive ? '#fff' : color}
                stroke={color}
                strokeWidth={isActive ? 3 : 0}
              />
            )
          })}

          {/* X axis month labels (show up to 6 labels for readability) */}
          {(() => {
            const n = coords.length
            const maxLabels = 6
            const step = Math.ceil(n / maxLabels)
            return coords.map((p, idx) => {
              if (n > maxLabels && idx % step !== 0 && idx !== n - 1) return null
              const lbl = labels && labels[idx] ? labels[idx] : `${idx + 1}`
              return (
                <text
                  key={`x-${idx}`}
                  x={p.x}
                  y={innerHeight + 22}
                  textAnchor="middle"
                  fill="#8c8c8c"
                  fontSize="11"
                >
                  {lbl}
                </text>
              )
            })
          })()}

          {/* Hover crosshair */}
          {tooltip && (
            <line
              x1={tooltip.x}
              x2={tooltip.x}
              y1={0}
              y2={innerHeight}
              stroke="#d9d9d9"
              strokeDasharray="4 4"
            />
          )}
        </g>
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: padding.left + tooltip.x,
            top: padding.top + tooltip.y - 44,
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid #f0f0f0',
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            borderRadius: 10,
            padding: '8px 10px',
            pointerEvents: 'none',
            minWidth: 140
          }}
        >
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>{tooltipLabel}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#262626' }}>{formatCompact(tooltip.v)}</div>
        </div>
      )}
    </div>
  )
}

// Simple pie chart using stroke segments
const PieChart = ({ data, size = 180 }) => {
  const entries = Object.entries(data || {})
  if (!entries.length) return null

  const values = entries.map(([, v]) => v)
  const total = values.reduce((sum, v) => sum + v, 0) || 1

  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius

  const colors = {
    H: '#52c41a',
    M: '#faad14',
    L: '#f5222d'
  }

  let offset = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
          {entries.map(([key, rawValue]) => {
            const value = rawValue
            const fraction = value / total
            const strokeLength = fraction * circumference
            const circle = (
              <circle
                key={key}
                r={radius}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={colors[key] || '#1890ff'}
                strokeWidth={22}
                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                strokeDashoffset={-offset}
              />
            )
            offset += strokeLength
            return circle
          })}
        </g>
      </svg>

      <div>
        {entries.map(([key, rawValue]) => {
          const value = rawValue
          const percent = ((value / total) * 100).toFixed(1)
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: colors[key] || '#1890ff',
                  marginRight: 8
                }}
              />
              <Text style={{ marginRight: 8 }}>{key}</Text>
              <Text type="secondary">{percent}%</Text>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Dashboard = () => {
  const {
    isLoading,
    error,
    generalMetrics,
    scrapGrades,
    yearlyLabels,
    lineValues,
    latestMonth
  } = useDashboardReports()

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h2>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <Spin size="large" />
            </div>
          ) : error ? (
            <Card style={{ marginTop: 16, borderRadius: 10 }}>
              <Text type="danger">{error}</Text>
            </Card>
          ) : (
            <>
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                    <Space orientation="vertical">
                      <Text type="secondary">Weekly Purchase</Text>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {generalMetrics?.weekly_purchase_text ?? generalMetrics?.weekly_purchase ?? '-'}
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                    <Space orientation="vertical">
                      <Text type="secondary">Total Vendors</Text>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {generalMetrics?.total_vendors_text ?? generalMetrics?.total_vendors ?? '-'}
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                    <Space orientation="vertical">
                      <Text type="secondary">Total GRN</Text>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {generalMetrics?.total_grn_text ?? generalMetrics?.total_grn ?? '-'}
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                    <Space orientation="vertical">
                      <Text type="secondary">Total Paid Amount</Text>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>
                        {generalMetrics?.total_paid_amount_text ?? generalMetrics?.total_paid_amount ?? '-'}
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col xs={24} md={12}>
                  <Card
                    title="Yearly Purchase Trend"
                    style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
                  >
                    {lineValues && lineValues.length > 0 ? (
                      <LineChart points={lineValues} labels={yearlyLabels} />
                    ) : (
                      <Text type="secondary">No yearly purchase data available.</Text>
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card
                    title="Scrap Grades Percentage"
                    style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
                  >
                    {scrapGrades ? (
                      <PieChart data={scrapGrades} />
                    ) : (
                      <Text type="secondary">No scrap grades data available.</Text>
                    )}
                  </Card>
                </Col>
              </Row>

              {latestMonth && (
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col xs={24}>
                    <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
                      <Space orientation="vertical">
                        <Text type="secondary">
                          Latest Month Summary ({latestMonth.month} {latestMonth.year})
                        </Text>
                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                          <div>
                            <Text type="secondary">Total Net Price</Text>
                            <div style={{ fontSize: 20, fontWeight: 600 }}>
                              {latestMonth.format_total_net_price || latestMonth.total_net_price}
                            </div>
                          </div>
                          <div>
                            <Text type="secondary">Total Net Weight</Text>
                            <div style={{ fontSize: 20, fontWeight: 600 }}>
                              {latestMonth.format_net_weight || latestMonth.total_net_weight}
                            </div>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
