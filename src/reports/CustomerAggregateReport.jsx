import React, { useState, useEffect } from 'react'
import { Card, Typography, Table, Space, Input, Button, message, Row, Col, Statistic } from 'antd'
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useCustomerReports } from '../api/useCustomerReports'

const { Title, Text } = Typography

const CustomerAggregateReport = () => {
  const { fetchCustomerAggregateReport, exportCustomerAggregateReport, loading, exporting } = useCustomerReports()

  const [reportData, setReportData] = useState({ data: [], summary: {} })
  const [searchTin, setSearchTin] = useState('')

  useEffect(() => {
    loadReport(searchTin)
  }, [searchTin])

  const loadReport = async (tin) => {
    try {
      const content = await fetchCustomerAggregateReport({ tin })
      setReportData({
        data: content.records || [],
        summary: content.summary || {}
      })
    } catch (err) {
      console.error('Failed to load customer aggregate report:', err)
      message.error(err.message || 'Failed to load report')
    }
  }

  const handleSearch = (value) => {
    setSearchTin(value)
  }

  const columns = [
    {
      title: 'TIN',
      dataIndex: 'TIN',
      key: 'TIN',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v || 'N/A'}</Text>
    },
    {
      title: 'Customer Count',
      dataIndex: 'customer_count',
      key: 'customer_count',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v || 0}</Text>
    },
    {
      title: 'Total Paid Amount (Br.)',
      dataIndex: 'total_paid_amount',
      key: 'total_paid_amount',
      render: (v) => <Text strong style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>{Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
    },
    {
      title: 'Total Remaining Amount (Br.)',
      dataIndex: 'total_remaining_amount',
      key: 'total_remaining_amount',
      render: (v) => <Text strong style={{ color: '#faad14', fontFamily: "'CircularStd', sans-serif" }}>{Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
    }
  ]

  const handleExport = async () => {
    try {
      const exportCols = [
        { title: 'TIN', dataIndex: 'TIN' },
        { title: 'Customer Count', dataIndex: 'customer_count' },
        { title: 'Total Paid Amount (Br.)', dataIndex: 'total_paid_amount' },
        { title: 'Total Remaining Amount (Br.)', dataIndex: 'total_remaining_amount' }
      ]

      await exportCustomerAggregateReport({ tin: searchTin }, exportCols, reportData.summary)
      message.success('Report exported successfully!')
    } catch (err) {
      console.error('Export failed:', err)
      message.error(err.message || 'Export failed')
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
              <Title level={3} style={{ marginBottom: 4 }}>Customer Aggregated Report</Title>
              <Text type="secondary">View and export aggregated summaries of customer balances grouped by TIN.</Text>
            </div>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
                Export Excel
              </Button>
              {/* <Button type="primary" icon={<PrinterOutlined />}>Print Report</Button> */}
            </Space>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card style={{ borderRadius: 12, borderLeft: '4px solid #1890ff' }}>
                <Statistic
                  title="Total Customers"
                  value={reportData.summary.total_customers || 0}
                  styles={{ content: { color: '#1890ff', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
                <Statistic
                  title="Total Paid Amount"
                  value={reportData.summary.total_paid_amount || 0}
                  precision={2}
                  prefix="Br."
                  styles={{ content: { color: '#52c41a', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={{ borderRadius: 12, borderLeft: '4px solid #faad14' }}>
                <Statistic
                  title="Total Remaining Amount"
                  value={reportData.summary.total_remaining_amount || 0}
                  precision={2}
                  prefix="Br."
                  styles={{ content: { color: '#faad14', fontFamily: "'CircularStd', sans-serif" } }}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Input.Search
                placeholder="Search by TIN"
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={reportData.data}
              rowKey={(record, idx) => record.TIN || idx}
              loading={loading}
              pagination={false}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerAggregateReport
