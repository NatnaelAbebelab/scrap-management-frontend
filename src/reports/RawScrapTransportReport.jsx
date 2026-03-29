import React, { useState } from 'react'
import { Card, Typography, Form, Input, Select, DatePicker, Button, Space, message, Tag, Alert } from 'antd'
import { SearchOutlined, ClearOutlined, FileExcelOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'
import { useTransportData } from '../api/useTransportData'
import { formatDate } from '../utils/dateFormatter'
import * as XLSX from 'xlsx'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const RawScrapTransportReport = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({})
  const [filterForm] = Form.useForm()

  const {
    records,
    total,
    loading,
    error,
    materialTypes,
    exportRecords,
    refresh
  } = useTransportData({ page, pageSize, filters })

  const materialOptions = Object.entries(materialTypes || {}).map(([val, label]) => ({
    value: val,
    label: (label || val).toUpperCase()
  }))

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilters({})
    setPage(1)
  }

  const handleFilterApply = (values) => {
    const { dates, ...rest } = values
    const newFilters = { ...rest }
    if (dates && dates.length === 2) {
      newFilters.start_date = dates[0].format('YYYY-MM-DD')
      newFilters.end_date = dates[1].format('YYYY-MM-DD')
    }
    // Clean up empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key]) delete newFilters[key]
    })
    setFilters(newFilters)
    setPage(1)
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-'
    const parts = dateStr.split('.')
    if (parts.length === 3) {
      const date = new Date(parts[2], parts[1] - 1, parts[0])
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return dateStr
  }

  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Preparing excel file...', key: 'export' })
      const resp = await exportRecords()
      if (resp && resp.result === 'success') {
        const fullData = resp.content?.data || resp.content?.results || resp.content || []
        const wsData = fullData.map(item => ({
          'Record No': item.record_no,
          'Plate No': item.plate_no,
          'TIN': item.agency,
          'Material Type': (item.material_type || '').toUpperCase(),
          'First Weight (Kg)': item.first_weight,
          'Second Weight (Kg)': item.second_weight,
          'Net Weight (Kg)': item.net_weight,
          'Driver Name': item.driver_name,
          'Weight Date': formatDateDisplay(item.first_date),
          'Uploaded Date': formatDate(item.created_at),
          //'Status': (item.status || '').toUpperCase()
        }))
        const ws = XLSX.utils.json_to_sheet(wsData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'RawScrap')
        XLSX.writeFile(wb, `Raw_Scrap_Report_${new Date().toLocaleDateString()}.xlsx`)
        message.success({ content: 'Export complete!', key: 'export' })
      } else {
        message.error({ content: 'Export failed!', key: 'export' })
      }
    } catch (err) {
      message.error({ content: err.message, key: 'export' })
    }
  }

  const columns = [
    {
      title: 'Record No',
      dataIndex: 'record_no',
      key: 'record_no',
      width: 100,
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'Plate No',
      dataIndex: 'plate_no',
      key: 'plate_no',
      width: 120,
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'TIN',
      dataIndex: 'agency',
      key: 'agency',
      width: 120,
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 140,
      render: (v) => (
        <Tag color="blue" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {v || '-'}
        </Tag>
      )
    },
    {
      title: 'First Weight (Kg)',
      dataIndex: 'first_weight',
      key: 'first_weight',
      width: 150,
      render: (v) => <Text>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Second Weight (Kg)',
      dataIndex: 'second_weight',
      key: 'second_weight',
      width: 160,
      render: (v) => <Text>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Net Weight (Kg)',
      dataIndex: 'net_weight',
      key: 'net_weight',
      width: 140,
      render: (v) => <Text strong style={{ color: '#fa8c16' }}>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Driver Name',
      dataIndex: 'driver_name',
      key: 'driver_name',
      width: 180,
      ellipsis: true,
      render: (v) => <Text>{v ?? '-'}</Text>
    },
    {
      title: 'Weight Date',
      dataIndex: 'first_date',
      key: 'first_date',
      width: 150,
      render: (v) => formatDateDisplay(v)
    },
    {
      title: 'Uploaded Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (v) => <Text>{formatDate(v)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v) => {
        if (!v) return '-'
        const status = v.toLowerCase()
        let color = 'gold'
        if (['approved', 'paid', 'verified'].includes(status)) color = 'success'
        if (['new', 'pending'].includes(status)) color = 'processing'
        if (['processed'].includes(status)) color = 'cyan'

        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {v.toUpperCase()}
          </Tag>
        )
      }
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Raw Scrap Transport Report</Title>
              <Text type="secondary">
                View and filter factory scrap records with detailed reporting.
              </Text>
            </div>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              disabled={!records || records.length === 0}
              style={{
                borderRadius: 6,
                background: 'rgb(245, 34, 45)', // Custom requested color
                color: 'white',
                borderColor: 'rgb(245, 34, 45)'
              }}
            >
              Export Excel
            </Button>
          </div>

          <Card style={{
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: 'none',
            marginBottom: 24
          }}>
            <Form form={filterForm} layout="vertical" onFinish={handleFilterApply}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
                <Form.Item name="tin" label="TIN" style={{ marginBottom: 16 }}>
                  <Input placeholder="Search TIN" size="large" style={{ borderRadius: 6, width: 300 }} />
                </Form.Item>
                <Form.Item name="plate_no" label="Plate No" style={{ marginBottom: 16 }}>
                  <Input placeholder="Search Plate No" size="large" style={{ borderRadius: 6, width: 300 }} />
                </Form.Item>
                <Form.Item name="material_type" label="Material Type" style={{ marginBottom: 16 }}>
                  <Select
                    placeholder="Select Material"
                    size="large"
                    style={{ borderRadius: 6, width: 300 }}
                    allowClear
                    options={materialOptions}
                  />
                </Form.Item>
                <Form.Item name="status" label="Status" style={{ marginBottom: 16 }}>
                  <Select placeholder="Filter Status" size="large" style={{ borderRadius: 6, width: 200 }} allowClear>
                    <Option value="new">New</Option>
                    <Option value="processed">Processed</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="paid">Paid</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="dates" label="Weight Date Range" style={{ marginBottom: 16 }}>
                  <RangePicker size="large" style={{ borderRadius: 6, width: 300 }} />
                </Form.Item>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                      style={{ borderRadius: 6, background: 'rgb(245, 34, 45)' }}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={handleFilterReset}
                      icon={<ClearOutlined />}
                      style={{ borderRadius: 6 }}
                    >
                      Reset
                    </Button>
                  </Space>
                </div>
              </div>
            </Form>
          </Card>

          <Card
            style={{
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none'
            }}
          >
            {error && (
              <Alert
                type="error"
                message="Data Load Error"
                description={error}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <DataTableWithPagination
              columns={columns}
              dataSource={records}
              rowKey={(record) => record._id || record.id || Math.random().toString()}
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              scroll={{ x: 1000 }}
              bordered
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RawScrapTransportReport
