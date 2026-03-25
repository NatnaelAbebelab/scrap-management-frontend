import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Form, Input, Select, DatePicker, Button, Row, Col, Table, Tag, Statistic, Divider, message } from 'antd'
import { SearchOutlined, ClearOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useGrnReports } from '../api/useGrnReports'
import { usePurchaseActions } from '../api/usePurchaseActions'
import DataTableWithPagination from '../components/DataTableWithPagination'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const PlainGrnReport = () => {
  const [form] = Form.useForm()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [reportData, setReportData] = useState({ records: [], totals: {}, count: 0 })
  const [filters, setFilters] = useState({})

  const [statusOptions, setStatusOptions] = useState([])
  const [materialOptions, setMaterialOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const { fetchPlainReport, exportPlainReport, loading, exporting } = useGrnReports()
  const { fetchStatusList, fetchMaterialTypes } = usePurchaseActions()

  useEffect(() => {
    loadOptions()
  }, [])

  useEffect(() => {
    handleFetchReport(page, pageSize, filters)
  }, [page, pageSize, filters])

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

  const handleFetchReport = async (p, ps, currentFilters) => {
    try {
      const params = {
        page: p,
        page_size: ps,
        ...currentFilters
      }
      const data = await fetchPlainReport(params)
      setReportData({
        records: data.records.results || [],
        totals: data.totals || {},
        count: data.records.count || 0
      })
    } catch (err) {
      console.error('Failed to fetch report:', err)
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
    setPage(1) // Reset to first page on filter search
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({})
    setPage(1)
  }

  const handleExport = async () => {
    try {
      await exportPlainReport(filters, columns, reportData.totals)
      message.success('Report exported successfully!')
    } catch (err) {
      console.error('Export failed:', err)
      message.error(err.message || 'Failed to export report')
    }
  }

  const columns = [
    {
      title: 'Record No',
      dataIndex: 'record_no',
      key: 'record_no',
      width: 100,
      fixed: 'left',
      render: (v) => <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text>
    },
    {
      title: 'Plate No',
      dataIndex: 'plate_no',
      key: 'plate_no',
      width: 110,
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text>
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text>
    },
    {
      title: 'Net Weight (Kg)',
      dataIndex: 'net_weight',
      key: 'net_weight',
      width: 130,
      render: (v) => <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{Number(v).toLocaleString()}</Text>
    },
    {
      title: 'Net Price (Br.)',
      dataIndex: 'net_price',
      key: 'net_price',
      width: 140,
      render: (v) => (
        <Text strong style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>
          {Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      )
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 130,
      render: (v) => <Tag color="blue" style={{ borderRadius: 4 }}>{v?.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v) => {
        let color = 'gold'
        if (v === 'paid') color = 'success'
        if (v === 'new') color = 'processing'
        if (v === 'deleted') color = 'error'
        return <Tag color={color} style={{ borderRadius: 4 }}>{v?.toUpperCase()}</Tag>
      }
    },
    {
      title: 'GRN No',
      dataIndex: 'grn_no',
      key: 'grn_no',
      width: 120,
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text>
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_no',
      key: 'serial_no',
      width: 120,
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text>
    },
    {
      title: 'Recorded On',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{formatDate(v)}</Text>
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Plain GRN Report</Title>
              <Text type="secondary">Detailed purchase and weight report for scrap purchase records.</Text>
            </div>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>Export Excel</Button>
              <Button type="primary" icon={<PrinterOutlined />}>Print Report</Button>
            </Space>
          </div>

          <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="tin" label="Customer TIN">
                    <Input placeholder="Enter TIN" prefix={<SearchOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="plate_no" label="Plate Number">
                    <Input placeholder="Enter Plate #" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="material_type" label="Material Type">
                    <Select allowClear placeholder="Select material type" loading={loadingOptions}>
                      {Array.isArray(materialOptions) && materialOptions.map(opt => (
                        <Select.Option key={opt.id} value={opt.id}>{opt.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="status" label="Status">
                    <Select allowClear placeholder="Select status" loading={loadingOptions}>
                      {Array.isArray(statusOptions) && statusOptions.map(opt => (
                        <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} align="bottom">
                <Col span={12}>
                  <Form.Item name="dateRange" label="Date Range(YYYY-MM-DD)">
                    <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder={['Start Date', 'End Date']} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button icon={<ClearOutlined />} onClick={handleReset}>Reset Filters</Button>
                      <Button type="primary" icon={<SearchOutlined />} htmlType="submit" style={{ background: 'rgb(245, 34, 45)' }}>
                        Search Records
                      </Button>
                    </Space>
                  </Form.Item>
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
                  value={reportData.count || 0}
                  styles={{ content: { color: '#faad14', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <DataTableWithPagination
              columns={columns}
              dataSource={reportData.records}
              rowKey="_id"
              loading={loading}
              total={reportData.count}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              scroll={{ x: 1300 }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PlainGrnReport
