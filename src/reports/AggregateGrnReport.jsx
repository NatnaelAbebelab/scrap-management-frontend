import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Form, Input, Select, DatePicker, Button, Row, Col, Table, Tag, Statistic, message } from 'antd'
import { SearchOutlined, ClearOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useGrnReports } from '../api/useGrnReports'
import { usePurchaseActions } from '../api/usePurchaseActions'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const periodOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
]

const AggregateGrnReport = () => {
  const [form] = Form.useForm()
  const [reportData, setReportData] = useState({ data: [], totals: {} })
  const [filters, setFilters] = useState({ period: 'daily' }) // default period

  const [statusOptions, setStatusOptions] = useState([])
  const [materialOptions, setMaterialOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const { fetchAggregateReport, exportAggregateReport, loading, exporting } = useGrnReports()
  const { fetchStatusList, fetchMaterialTypes } = usePurchaseActions()

  useEffect(() => {
    loadOptions()
    // Set initial form values
    form.setFieldsValue({ period: 'daily' })
  }, [])

  useEffect(() => {
    handleFetchReport(filters)
  }, [filters])

  const loadOptions = async () => {
    setLoadingOptions(true)
    try {
      const [statuses, materialsRaw] = await Promise.all([
        fetchStatusList(),
        fetchMaterialTypes()
      ])

      setStatusOptions(Array.isArray(statuses) ? statuses : [])

      if (typeof materialsRaw === 'object' && !Array.isArray(materialsRaw)) {
        const materialsArray = Object.entries(materialsRaw).map(([key, value]) => ({
          id: key,
          name: value
        }))
        setMaterialOptions(materialsArray)
      } else {
        setMaterialOptions(Array.isArray(materialsRaw) ? materialsRaw : [])
      }
    } catch (err) {
      console.error('Failed to load filter options:', err)
      setStatusOptions([])
      setMaterialOptions([])
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleFetchReport = async (currentFilters) => {
    try {
      const data = await fetchAggregateReport(currentFilters)
      setReportData({
        data: data.data || [],
        totals: data.totals || {}
      })
    } catch (err) {
      console.error('Failed to fetch aggregate report:', err)
      message.error(err.message || 'Failed to generate report')
    }
  }

  const onFinish = (values) => {
    const newFilters = { ...values }
    if (values.dateRange) {
      newFilters.start_date = values.dateRange[0]?.format('YYYY-MM-DD')
      newFilters.end_date = values.dateRange[1]?.format('YYYY-MM-DD')
      delete newFilters.dateRange
    }
    setFilters(newFilters)
  }

  const handleReset = () => {
    form.resetFields()
    // Keep 'daily' as default
    form.setFieldsValue({ period: 'daily' })
    setFilters({ period: 'daily' })
  }

  const columns = [
    {
      title: 'Period Date',
      dataIndex: 'period_date',
      key: 'period_date',
      width: 150,
      render: (v) => <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{formatDate(v)}</Text>
    },
    {
      title: 'Total Records',
      dataIndex: 'total_records',
      key: 'total_records',
      width: 150,
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{Number(v).toLocaleString()}</Text>
    },
    {
      title: 'Total Net Weight (Kg)',
      dataIndex: 'total_net_weight',
      key: 'total_net_weight',
      width: 200,
      render: (v) => <Text strong style={{ color: '#1890ff', fontFamily: "'CircularStd', sans-serif" }}>{Number(v).toLocaleString()}</Text>
    },
    {
      title: 'Total Net Price (Br.)',
      dataIndex: 'total_net_price',
      key: 'total_net_price',
      width: 200,
      render: (v) => (
        <Text strong style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>
          {Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      )
    }
  ]

  const handleExport = async () => {
    try {
      await exportAggregateReport(filters, columns, reportData.totals)
      message.success('Aggregate report exported successfully!')
    } catch (err) {
      console.error('Export failed:', err)
      message.error(err.message || 'Failed to export aggregate report')
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Aggregate Report</Title>
              <Text type="secondary">Summarised purchase records over varied time periods.</Text>
            </div>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>Export Excel</Button>
              {/* <Button type="primary" icon={<PrinterOutlined />}>Print Report</Button> */}
            </Space>
          </div>

          <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="period" label="Aggregation Period">
                    <Select placeholder="Select period" size="large">
                      {periodOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="tin" label="Customer TIN">
                    <Input placeholder="Enter TIN" prefix={<SearchOutlined />} size="large" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="plate_no" label="Plate Number">
                    <Input placeholder="Enter Plate #" size="large" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="material_type" label="Material Type">
                    <Select allowClear placeholder="Select material type" loading={loadingOptions} size="large">
                      {Array.isArray(materialOptions) && materialOptions.map(opt => (
                        <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="status" label="Status">
                    <Select allowClear placeholder="Select status" loading={loadingOptions} size="large">
                      {Array.isArray(statusOptions) && statusOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item name="dateRange" label="Date Range (YYYY-MM-DD)">
                    <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder={['Start Date', 'End Date']} size="large" />
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 24 }}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button icon={<ClearOutlined />} onClick={handleReset} size="large">Reset Filters</Button>
                    <Button type="primary" icon={<SearchOutlined />} htmlType="submit" style={{ background: 'rgb(245, 34, 45)' }} size="large">
                      Search
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
                <Statistic
                  title="Total Net Price"
                  value={reportData.totals.total_net_price || 0}
                  precision={2}
                  prefix="Br."
                  styles={{ content: { color: '#52c41a', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
                <Statistic
                  title="Total Net Weight"
                  value={reportData.totals.total_net_weight || 0}
                  suffix="Kg"
                  styles={{ content: { color: '#1890ff', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={{ borderRadius: 12, borderLeft: '4px solid #faad14' }}>
                <Statistic
                  title="Total Records"
                  value={reportData.totals.total_records || 0}
                  styles={{ content: { color: '#faad14', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <Table
              columns={columns}
              dataSource={reportData.data}
              rowKey="period_date"
              loading={loading}
              pagination={false}
              bordered
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AggregateGrnReport
