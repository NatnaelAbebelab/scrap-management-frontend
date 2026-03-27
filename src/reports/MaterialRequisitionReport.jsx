import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Form, Input, Select, DatePicker, Button, Row, Col, Tag, message } from 'antd'
import { SearchOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import DataTableWithPagination from '../components/DataTableWithPagination'
import { useMaterialRequisitionReport } from '../api/useMaterialRequisitionReport'
import { exportToExcel } from '../utils/exportToExcel'
import { formatDate } from '../utils/dateFormatter'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const MaterialRequisitionReport = () => {
  const [form] = Form.useForm()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({})
  
  const {
    records,
    total,
    loading,
    plants,
    plantsLoading,
    fetchPlants,
    fetchReport
  } = useMaterialRequisitionReport({ page, pageSize, filters })

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const onFinish = (values) => {
    const newFilters = {
      requisition_no: values.requisition_no,
      melting_plant: values.melting_plant,
      min_quantity: values.min_quantity,
      max_quantity: values.max_quantity,
      status: values.status,
    }
    
    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.requisition_start_date = values.dateRange[0].format('YYYY-MM-DD')
      newFilters.requisition_end_date = values.dateRange[1].format('YYYY-MM-DD')
    }

    setFilters(newFilters)
    setPage(1)
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({})
    setPage(1)
  }

  const handleExport = async () => {
    try {
      const resp = await fetchReport({ ...filters, export: true })
      if (resp && resp.result === 'success') {
        const exportData = resp.content || []
        exportToExcel({
          filename: 'Material_Requisition_Report',
          sheetName: 'Requisitions',
          columns: [
            { title: 'Requisition Date', dataIndex: 'requisition_date' },
            { title: 'Requisition No', dataIndex: 'requisition_no' },
            { title: 'Status', dataIndex: 'requisition_status', exportValue: (v) => (v || '').toUpperCase() },
            { title: 'Quantity', dataIndex: 'total_requisition_quantity' },
            { title: 'Total Price', dataIndex: 'total_requisition_price' },
            { title: 'Melting Plant', dataIndex: 'melting_plant', exportValue: (v) => v?.plant_name || '-' }
          ],
          data: exportData
        })
        message.success('Report exported successfully')
      }
    } catch (e) {
      message.error('Failed to export report')
    }
  }

  const columns = [
    {
      title: 'Req No',
      dataIndex: 'requisition_no',
      key: 'requisition_no',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Melting Plant',
      dataIndex: ['melting_plant', 'plant_name'],
      key: 'melting_plant',
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>
    },
    {
      title: 'Requisition Date',
      dataIndex: 'requisition_date',
      key: 'requisition_date',
      render: (text) => <Text style={{ fontWeight: 600 }}>{formatDate(text)}</Text>
    },
    {
      title: 'Quantity',
      dataIndex: 'total_requisition_quantity',
      key: 'total_requisition_quantity',
      render: (text) => <Text style={{ fontWeight: 700 }}>{Number(text || 0).toLocaleString()}</Text>
    },
    {
      title: 'Price (ETB)',
      dataIndex: 'total_requisition_price',
      key: 'total_requisition_price',
      render: (val) => <Text style={{ fontWeight: 700 }}>{Number(val || 0).toLocaleString()}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'requisition_status',
      key: 'requisition_status',
      render: (status) => {
        let color = 'gold'
        let label = status
        if (status === 'request_issued') { color = 'blue'; label = 'Requested' }
        if (status === 'approved') { color = 'green'; label = 'Approved' }
        if (status === 'new') { color = 'cyan'; label = 'New' }
        return <Tag color={color}>{label?.toUpperCase() || ''}</Tag>
      }
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Material Requisition Report</Title>
              <Text type="secondary">In-depth analysis of raw material requisitions.</Text>
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={loading}
              style={{ height: '40px', borderRadius: '8px' }}
            >
              Export Excel
            </Button>
          </div>

          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="requisition_no" label="Requisition No">
                    <Input placeholder="REQ-001" size="large" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="melting_plant" label="Melting Plant">
                    <Select placeholder="Select Plant" size="large" allowClear loading={plantsLoading}>
                      {plants.map(p => (
                        <Option key={p._id} value={p._id}>{p.plant_name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="dateRange" label="Date Range">
                    <RangePicker size="large" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="status" label="Status">
                    <Select placeholder="Select Status" size="large" allowClear>
                      <Option value="new">New</Option>
                      <Option value="request_issued">Requested</Option>
                      <Option value="approved">Approved</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} align="bottom">
                <Col span={6}>
                  <Form.Item name="min_quantity" label="Min Quantity">
                    <Input type="number" size="large" placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="max_quantity" label="Max Quantity">
                    <Input type="number" size="large" placeholder="10000" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button size="large" icon={<ClearOutlined />} onClick={handleReset} style={{ borderRadius: '8px' }}>
                        Reset
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        htmlType="submit"
                        style={{ borderRadius: '8px', minWidth: '120px' }}
                      >
                        Search
                      </Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <DataTableWithPagination
              columns={columns}
              dataSource={records}
              rowKey="_id"
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => { setPage(p); setPageSize(ps) }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MaterialRequisitionReport
