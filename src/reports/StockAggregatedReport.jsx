import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Form, DatePicker, Button, Table, Tag, Row, Col, Statistic, Select, message } from 'antd'
import { SearchOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useStockManagement } from '../api/useStockManagement'
import { formatDate } from '../utils/dateFormatter'
import { exportToExcel } from '../utils/exportToExcel'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const StockAggregatedReport = () => {
  const [form] = Form.useForm()
  const [reportData, setReportData] = useState({ records: [], totalCount: 0 })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 })
  const [filters, setFilters] = useState({ type: 'all', period: 'daily' })

  const { fetchStockAggregatedReport, loading } = useStockManagement()

  useEffect(() => {
    handleFetchReport(pagination.current, pagination.pageSize, filters)
  }, [pagination.current, pagination.pageSize, filters])

  const handleFetchReport = async (page, pageSize, currentFilters) => {
    try {
      const data = await fetchStockAggregatedReport(page, pageSize, currentFilters)
      // The API returns the array directly in data.data
      setReportData({
        records: Array.isArray(data) ? data : [],
        totalCount: Array.isArray(data) ? data.length : 0
      })
    } catch (err) {
      console.error('Failed to fetch aggregated stock report:', err)
      message.error(err.message || 'Failed to generate aggregated stock report')
    }
  }

  const onFinish = (values) => {
    const newFilters = {
      type: values.type || 'all',
      period: values.period || 'daily'
    }
    if (values.dateRange) {
      newFilters.start_date = values.dateRange[0]?.format('YYYY-MM-DD')
      newFilters.end_date = values.dateRange[1]?.format('YYYY-MM-DD')
    }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({ type: 'all', period: 'daily' })
    setPagination({ current: 1, pageSize: 20 })
  }

  const handleTableChange = (newPagination) => {
    setPagination(newPagination)
  }

  const handleExport = () => {
    exportToExcel({
      filename: 'Stock_Aggregated_Report',
      sheetName: 'Aggregated Balance',
      columns: [
        { title: 'Period Group', dataIndex: 'period_group' },
        { title: 'Total Purchase', dataIndex: 'total_purchase' },
        { title: 'Total Purchase Value', dataIndex: 'total_purchase_value' },
        { title: 'Total Issue', dataIndex: 'total_issue' },
        { title: 'Total Issue Value', dataIndex: 'total_issue_value' }
      ],
      data: reportData.records
    })
  }

  const columns = [
    {
      title: 'Period Group',
      dataIndex: 'period_group',
      key: 'period_group',
      render: (v) => <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text>
    },
    {
      title: 'Purchases',
      children: [
        {
          title: 'Qty (Kg)',
          dataIndex: 'total_purchase',
          key: 'total_purchase',
          render: (v) => <Text strong style={{ color: '#52c41a' }}>{v?.toLocaleString()}</Text>
        },
        {
          title: 'Value (Br.)',
          dataIndex: 'total_purchase_value',
          key: 'total_purchase_value',
          render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        }
      ]
    },
    {
      title: 'Issues',
      children: [
        {
          title: 'Qty (Kg)',
          dataIndex: 'total_issue',
          key: 'total_issue',
          render: (v) => <Text strong style={{ color: '#faad14' }}>{v?.toLocaleString()}</Text>
        },
        {
          title: 'Value (Br.)',
          dataIndex: 'total_issue_value',
          key: 'total_issue_value',
          render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        }
      ]
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
              <Title level={3} style={{ marginBottom: 4 }}>Stock Aggregated Report</Title>
              <Text type="secondary">Summary of stock balances and movements across selected periods.</Text>
            </div>
            <Space>
              <Button
                type="primary"
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={loading}
              >
                Excel Export
              </Button>
            </Space>
          </div>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', marginBottom: 24 }}>
            <Form form={form} layout="inline" onFinish={onFinish} initialValues={{ type: 'all', period: 'daily' }}>
              <Form.Item name="dateRange" label="Period">
                <RangePicker style={{ borderRadius: 6 }} size="large" />
              </Form.Item>
              <Form.Item name="period" label="Group By">
                <Select style={{ width: 120, borderRadius: 6 }} size="large">
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
              <Form.Item name="type" label="Flow Type">
                <Select style={{ width: 140, borderRadius: 6 }} size="large">
                  <Option value="all">All Flows</Option>
                  <Option value="purchase">Purchases only</Option>
                  <Option value="issue">Issues only</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} style={{ borderRadius: 6, backgroundColor: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }} size="large">Generate</Button>
                  <Button onClick={handleReset} icon={<ClearOutlined />} style={{ borderRadius: 6 }} size="large">Reset</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <Table
              columns={columns}
              dataSource={reportData.records}
              rowKey="period_group"
              loading={loading}
              pagination={{
                ...pagination,
                total: reportData.totalCount,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              onChange={handleTableChange}
              size="middle"
              bordered
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StockAggregatedReport
