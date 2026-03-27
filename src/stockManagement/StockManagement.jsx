import React, { useState, useEffect } from 'react'
import { Card, Typography, Table, Space, Form, DatePicker, Select, Row, Col, Statistic, Tag, message } from 'antd'
import { InboxOutlined, ShoppingCartOutlined, BarChartOutlined, SwapOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useStockManagement } from '../api/useStockManagement'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const StockManagement = () => {
  const { fetchStockSummary, fetchStockBalance, loading } = useStockManagement()

  const [summary, setSummary] = useState(null)
  const [balanceRecords, setBalanceRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    type: 'all'
  })

  useEffect(() => {
    loadSummary()
  }, [])

  useEffect(() => {
    loadBalance(currentPage, pageSize, filters)
  }, [currentPage, pageSize, filters])

  const loadSummary = async () => {
    try {
      const data = await fetchStockSummary()
      setSummary(data)
    } catch (err) {
      console.error('Failed to load stock summary:', err)
      message.error('Failed to load summary statistics')
    }
  }

  const loadBalance = async (page, size, f) => {
    try {
      const data = await fetchStockBalance(page, size, f)
      setBalanceRecords(data.results || [])
      setTotal(data.count || 0)
    } catch (err) {
      console.error('Failed to load stock balance:', err)
      message.error(err.message || 'Failed to load stock records')
    }
  }

  const handleFilterChange = (changedValues, allValues) => {
    const newFilters = {
      ...filters,
      start_date: allValues.dateRange?.[0] ? allValues.dateRange[0].format('YYYY-MM-DD') : null,
      end_date: allValues.dateRange?.[1] ? allValues.dateRange[1].format('YYYY-MM-DD') : null,
      type: allValues.type
    }
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const columns = [
    {
      title: 'Trans. Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (type) => (
        <Tag color={type === 'purchase' ? 'green' : 'orange'} style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {type}
        </Tag>
      )
    },
    {
      title: 'GRN / Record No',
      key: 'grn_record',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.grn_no && <Text style={{ fontSize: 13, fontFamily: "'CircularStd', sans-serif" }}>GRN: {record.grn_no}</Text>}
          {record.record_no && <Text style={{ fontSize: 11, fontWeight: 700, fontFamily: "'CircularStd', sans-serif", color: '#595959' }}>Rec: {record.record_no}</Text>}
          {record.issue_no && <Text style={{ fontSize: 13, fontFamily: "'CircularStd', sans-serif" }}>Issue: {record.issue_no}</Text>}
        </Space>
      )
    },
    {
      title: 'Purchased',
      key: 'purchased',
      render: (_, record) => {
        if (record.purchased_qty <= 0) return '-'
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>
              +{record.purchased_qty?.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 400 }}>Kg</span>
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 600 }}>Br. {record.purchased_value?.toLocaleString()}</Text>
          </Space>
        )
      }
    },
    {
      title: 'Issued',
      key: 'issued',
      render: (_, record) => {
        if (record.issued_qty <= 0) return '-'
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: '#faad14', fontFamily: "'CircularStd', sans-serif" }}>
              -{record.issued_qty?.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 400 }}>Kg</span>
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 600 }}>Br. {record.issue_value?.toLocaleString()}</Text>
          </Space>
        )
      }
    },
    {
      title: 'Avg. Rate',
      dataIndex: 'average_rate',
      key: 'average_rate',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>Br. {Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
    },
    {
      title: 'Plant',
      dataIndex: 'melting_plant',
      key: 'melting_plant',
      render: (v) => v || '-'
    },
    {
      title: 'Remaining Balance',
      key: 'balance',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1890ff', fontFamily: "'CircularStd', sans-serif" }}>
            {record.remaining_qty?.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 400 }}>Kg</span>
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 600 }}>Value: Br. {record.remaining_value?.toLocaleString()}</Text>
        </Space>
      )
    },
    {
      title: 'Date',
      dataIndex: 'weight_date',
      key: 'weight_date',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{formatDate(v)}</Text>
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
              <Title level={3} style={{ marginBottom: 4 }}>Inventory & Stock Management</Title>
              <Text type="secondary">Review the flow of scrap materials from purchasing to melting plant issues.</Text>
            </div>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #1890ff' }}>
                <Statistic
                  title="Beginning Stock"
                  value={summary?.active_balance?.beginning_qty || 0}
                  suffix="Kg"
                  prefix={<InboxOutlined style={{ marginRight: 8, color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontFamily: "'CircularStd', sans-serif" }}
                />
                <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: "'CircularStd', sans-serif" }}>Value: Br. {summary?.active_balance?.beginning_value?.toLocaleString()}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #52c41a' }}>
                <Statistic
                  title="Total Sourced"
                  value={summary?.totals?.total_purchase_qty || 0}
                  suffix="Kg"
                  prefix={<ShoppingCartOutlined style={{ marginRight: 8, color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}
                />
                <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: "'CircularStd', sans-serif" }}>Value: Br. {summary?.totals?.total_purchase_value?.toLocaleString()}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #faad14' }}>
                <Statistic
                  title="Total Issued"
                  value={summary?.totals?.total_issued_qty || 0}
                  suffix="Kg"
                  prefix={<SwapOutlined style={{ marginRight: 8, color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontFamily: "'CircularStd', sans-serif" }}
                />
                <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: "'CircularStd', sans-serif" }}>Value: Br. {summary?.totals?.total_issued_value?.toLocaleString()}</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid rgb(245, 34, 45)' }}>
                <Statistic
                  title="Net Stock (Current)"
                  value={summary?.active_balance?.current_qty || 0}
                  suffix="Kg"
                  prefix={<BarChartOutlined style={{ marginRight: 8, color: 'rgb(245, 34, 45)' }} />}
                  valueStyle={{ color: 'rgb(245, 34, 45)', fontFamily: "'CircularStd', sans-serif" }}
                />
                <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: "'CircularStd', sans-serif" }}>Value: Br. {summary?.active_balance?.current_value?.toLocaleString()}</Text>
              </Card>
            </Col>
          </Row>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', marginBottom: 16 }}>
            <Form layout="inline" onValuesChange={handleFilterChange} initialValues={{ type: 'all' }}>
              <Form.Item name="dateRange" label="Material Input/Output Period">
                <RangePicker style={{ borderRadius: 6 }} size="large" />
              </Form.Item>
              <Form.Item name="type" label="Flow Type">
                <Select style={{ width: 140 }} size="large">
                  <Select.Option value="all">All Transactions</Select.Option>
                  <Select.Option value="purchase">Purchases Only</Select.Option>
                  <Select.Option value="issue" disabled>Plant Issues Only</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <Table
              columns={columns}
              dataSource={balanceRecords}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                pageSizeOptions: ['20', '50', '100']
              }}
              onChange={(pagination) => {
                setCurrentPage(pagination.current)
                setPageSize(pagination.pageSize)
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StockManagement
