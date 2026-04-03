import React, { useState, useEffect } from 'react'
import { Card, Typography, Table, Space, Input, Button, message, Row, Col, Statistic } from 'antd'
import { SearchOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useCustomerReports } from '../api/useCustomerReports'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography

const capitalize = (s) => typeof s === 'string' && s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s

const CustomerPlainReport = () => {
  const { fetchCustomerPlainReport, exportCustomerPlainReport, loading, exporting } = useCustomerReports()

  const [reportData, setReportData] = useState({ data: [], summary: {} })
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTin, setSearchTin] = useState('')

  useEffect(() => {
    loadReport(currentPage, pageSize, searchTin)
  }, [currentPage, pageSize, searchTin])

  const loadReport = async (page, size, tin) => {
    try {
      const content = await fetchCustomerPlainReport({ page, page_size: size, tin })
      setReportData({
        data: content.records?.results || [],
        summary: content.summary || {}
      })
      setTotal(content.records?.count || 0)
    } catch (err) {
      console.error('Failed to load customer report:', err)
      message.error(err.message || 'Failed to load report')
    }
  }

  const handleSearch = (value) => {
    setSearchTin(value)
    setCurrentPage(1)
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  const columns = [
    {
      title: 'Customer Name',
      key: 'name',
      render: (_, record) => {
        const hasName = record.first_name || record.last_name
        const cFirst = capitalize(record.first_name)
        const cLast = capitalize(record.last_name)
        const cBusiness = capitalize(record.business_name)
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>
              {hasName ? `${cFirst || ''} ${cLast || ''}`.trim() : cBusiness || 'N/A'}
            </Text>
            {hasName && record.business_name && (
              <Text type="secondary" style={{ fontSize: 12 }}>{cBusiness}</Text>
            )}
          </Space>
        )
      }
    },
    {
      title: 'TIN',
      dataIndex: 'TIN',
      key: 'TIN',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v || 'N/A'}</Text>
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.phone && <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{record.phone}</Text>}
          {record.email && <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>}
          {!record.phone && !record.email && <Text type="secondary">N/A</Text>}
        </Space>
      )
    },
    {
      title: 'Paid Amount (Br.)',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      render: (v) => <Text strong style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>{Number(v || 0).toLocaleString()}</Text>
    },
    {
      title: 'Remaining Amount (Br.)',
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      render: (v) => <Text strong style={{ color: '#faad14', fontFamily: "'CircularStd', sans-serif" }}>{Number(v || 0).toLocaleString()}</Text>
    },
    {
      title: 'Registered On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v ? formatDate(v) : 'N/A'}</Text>
    }
  ]

  const handleExport = async () => {
    try {
      const exportCols = [
        { title: 'First Name', dataIndex: 'first_name' },
        { title: 'Last Name', dataIndex: 'last_name' },
        { title: 'Business Name', dataIndex: 'business_name' },
        { title: 'TIN', dataIndex: 'TIN' },
        { title: 'Phone Number', dataIndex: 'phone' },
        { title: 'Email Address', dataIndex: 'email' },
        { title: 'Paid Amount (Br.)', dataIndex: 'paid_amount' },
        { title: 'Remaining Amount (Br.)', dataIndex: 'remaining_amount' },
        { title: 'Registered On', dataIndex: 'created_at' }
      ]

      await exportCustomerPlainReport({ tin: searchTin }, exportCols, reportData.summary)
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
              <Title level={3} style={{ marginBottom: 4 }}>Customer Plain Report</Title>
              <Text type="secondary">View and export standard reports of registered customers and their associated balances.</Text>
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
              rowKey="_id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true
              }}
              onChange={handleTableChange}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerPlainReport
