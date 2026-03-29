import React, { useState } from 'react'
import { Card, Typography, Form, Input, DatePicker, Button, Space, Table, Row, Col, Alert, Descriptions, Statistic } from 'antd'
import { SearchOutlined, ClearOutlined, FileExcelOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useAgencyPerformance } from '../api/useAgencyPerformance'
import * as XLSX from 'xlsx'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const AgencyPerformanceReport = () => {
  const [filters, setFilters] = useState({})
  const [filterForm] = Form.useForm()

  const {
    data,
    summary,
    agencyInfo,
    loading,
    error,
    refresh
  } = useAgencyPerformance({ filters })

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilters({})
  }

  const handleFilterApply = (values) => {
    const { dates, ...rest } = values
    const newFilters = { ...rest }
    if (dates && dates.length === 2) {
      newFilters.start_date = dates[0].format('YYYY-MM-DD')
      newFilters.end_date = dates[1].format('YYYY-MM-DD')
    }
    // Clean empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key]) delete newFilters[key]
    })
    setFilters(newFilters)
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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      'Plate No': item.plate_no,
      'Weight Date': formatDateDisplay(item.first_date),
      'Total First Weight (Kg)': item.total_first_weight,
      'Total Second Weight (Kg)': item.total_second_weight,
      'Total Net Weight (Kg)': item.total_net_weight,
      'Total Records': item.total_records,
      'Drivers': item.driver_names?.join(', ')
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance')
    XLSX.writeFile(workbook, `Agency_Performance_Report_${new Date().toLocaleDateString()}.xlsx`)
  }

  const columns = [
    {
      title: 'Plate No',
      dataIndex: 'plate_no',
      key: 'plate_no',
      width: 180,
      render: (v) => <Text strong>{v}</Text>
    },
    {
      title: 'Weight Date',
      dataIndex: 'first_date',
      key: 'first_date',
      width: 180,
      render: formatDateDisplay
    },
    {
      title: 'Total First Weight (Kg)',
      dataIndex: 'total_first_weight',
      key: 'total_first_weight',
      width: 200,
      render: (v) => Number(v || 0).toLocaleString()
    },
    {
      title: 'Total Second Weight (Kg)',
      dataIndex: 'total_second_weight',
      key: 'total_second_weight',
      width: 200,
      render: (v) => Number(v || 0).toLocaleString()
    },
    {
      title: 'Total Net Weight (Kg)',
      dataIndex: 'total_net_weight',
      key: 'total_net_weight',
      width: 200,
      render: (v) => <Text strong style={{ color: '#fa8c16' }}>{Number(v || 0).toLocaleString()}</Text>
    },
    {
      title: 'Total Records',
      dataIndex: 'total_records',
      key: 'total_records',
      width: 140,
    },
    {
      title: 'Drivers',
      dataIndex: 'driver_names',
      key: 'driver_names',
      width: 300,
      render: (drivers) => drivers?.join(', ') || '-'
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
              <Title level={3} style={{ marginBottom: 4 }}>Agency Performance Report</Title>
              <Text type="secondary">
                Detailed performance metrics for transport agencies by plate number and date.
              </Text>
            </div>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              disabled={!data || data.length === 0}
              style={{ borderRadius: 6, background: 'rgb(245, 34, 45)', color: 'white', borderColor: 'rgb(245, 34, 45)' }}
            >
              Export Excel
            </Button>
          </div>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', marginBottom: 24 }}>
            <Form form={filterForm} layout="vertical" onFinish={handleFilterApply}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
                <Form.Item name="tin" label="TIN" style={{ marginBottom: 16 }}>
                  <Input placeholder="Search TIN" size="large" style={{ borderRadius: 6, width: 300 }} />
                </Form.Item>
                <Form.Item name="plate_no" label="Plate No" style={{ marginBottom: 16 }}>
                  <Input placeholder="Search Plate No" size="large" style={{ borderRadius: 6, width: 300 }} />
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

          {agencyInfo && (
            <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Descriptions title={<Text strong style={{ fontSize: 16 }}>Agency Information</Text>} bordered size="small">
                <Descriptions.Item label="Business Name" span={2}>{agencyInfo.business_name}</Descriptions.Item>
                <Descriptions.Item label="TIN">{agencyInfo.TIN}</Descriptions.Item>
                <Descriptions.Item label="Full Name">{agencyInfo.first_name} {agencyInfo.last_name}</Descriptions.Item>
                <Descriptions.Item label="Remaining Amount">
                  <Text strong>{Number(agencyInfo.remaining_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} Br.</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Paid Amount">
                  <Text strong style={{ color: '#52c41a' }}>{Number(agencyInfo.paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} Br.</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {summary && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Total Records" value={summary.total_records} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Total First Weight (Kg)" value={summary.total_first_weight} valueStyle={{ fontSize: 18 }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic title="Total Second Weight (Kg)" value={summary.total_second_weight} valueStyle={{ fontSize: 18 }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ borderRadius: 8 }}>
                  <Statistic
                    title="Total Net Weight (Kg)"
                    value={summary.total_net_weight}
                    valueStyle={{ color: '#fa8c16', fontSize: 20, fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            {error && <Alert type="error" message="Load Error" description={error} showIcon style={{ marginBottom: 16 }} />}
            <Table
              columns={columns}
              dataSource={data}
              rowKey={(r) => `${r.plate_no}_${r.first_date}`}
              loading={loading}
              pagination={false}
              scroll={{ x: 1000 }}
              bordered
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgencyPerformanceReport
