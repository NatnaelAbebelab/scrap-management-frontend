import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Form, DatePicker, Button, Row, Col, Table, Tag, Statistic, message } from 'antd'
import { SearchOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useStockManagement } from '../api/useStockManagement'
import { formatDate } from '../utils/dateFormatter'
import { exportToExcel } from '../utils/exportToExcel'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const StockReport = () => {
  const [form] = Form.useForm()
  const [reportData, setReportData] = useState({ records: [], totals: {} })
  const [filters, setFilters] = useState({})
  
  const { fetchStockCard, loading } = useStockManagement()

  useEffect(() => {
    handleFetchReport(filters)
  }, [filters])

  const handleFetchReport = async (currentFilters) => {
    try {
      const data = await fetchStockCard(currentFilters)
      setReportData({
        records: data.stock_card || [],
        totals: data.totals || {}
      })
    } catch (err) {
      console.error('Failed to fetch stock report:', err)
      message.error(err.message || 'Failed to generate stock report')
    }
  }

  const onFinish = (values) => {
    const newFilters = {}
    if (values.dateRange) {
      newFilters.start_date = values.dateRange[0]?.format('YYYY-MM-DD')
      newFilters.end_date = values.dateRange[1]?.format('YYYY-MM-DD')
    }
    setFilters(newFilters)
  }

  const handleReset = () => {
    form.resetFields()
    setFilters({})
  }

  const handleExport = () => {
    exportToExcel({
      filename: 'Stock_Report',
      sheetName: 'Stock Card',
      columns: [
        { title: 'Date', dataIndex: 'weight_date', exportValue: (v) => v ? formatDate(v) : '-' },
        { title: 'GRN No', dataIndex: 'grn_no' },
        { title: 'Issue No', dataIndex: 'issue_no' },
        { title: 'Purchased Qty (Kg)', dataIndex: 'purchased_qty' },
        { title: 'Issued Qty (Kg)', dataIndex: 'issued_qty' },
        { title: 'Avg. Rate', dataIndex: 'average_rate' },
        { title: 'Purchased Value (Br.)', dataIndex: 'purchased_value' },
        { title: 'Issue Value (Br.)', dataIndex: 'issue_value' },
        { title: 'Remaining Qty (Kg)', dataIndex: 'remaining_qty' },
        { title: 'Remaining Value (Br.)', dataIndex: 'remaining_value' },
        { title: 'Plant', dataIndex: 'melting_plant' }
      ],
      data: reportData.records,
      totals: reportData.totals
    })
  }

  const columns = [
    {
      title: 'Weight Date',
      dataIndex: 'weight_date',
      key: 'weight_date',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v ? formatDate(v) : '-'}</Text>
    },
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
          {record.record_no && (
            <Text style={{ fontSize: 11, fontWeight: 700, fontFamily: "'CircularStd', sans-serif", color: '#595959' }}>
              Rec: {record.record_no}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Issue No',
      dataIndex: 'issue_no',
      key: 'issue_no',
      render: (v) => v || '-'
    },
    {
      title: 'Purchased Qty (Kg)',
      dataIndex: 'purchased_qty',
      key: 'purchased_qty',
      render: (v) => v > 0 ? <Text strong style={{ color: '#52c41a' }}>+{v.toLocaleString()}</Text> : '-'
    },
    {
      title: 'Avg. Rate',
      dataIndex: 'average_rate',
      key: 'average_rate',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>Br. {Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
    },
    {
      title: 'Purchased Value (Br.)',
      dataIndex: 'purchased_value',
      key: 'purchased_value',
      render: (v) => v > 0 ? <Text style={{ fontSize: 13, fontFamily: "'CircularStd', sans-serif" }}>{v.toLocaleString()}</Text> : '-'
    },
    {
      title: 'Issued Qty (Kg)',
      dataIndex: 'issued_qty',
      key: 'issued_qty',
      render: (v) => v > 0 ? <Text strong style={{ color: '#faad14' }}>-{v.toLocaleString()}</Text> : '-'
    },
    {
      title: 'Issued Value (Br.)',
      dataIndex: 'issue_value',
      key: 'issue_value',
      render: (v) => v > 0 ? <Text style={{ fontSize: 13, fontFamily: "'CircularStd', sans-serif" }}>{v.toLocaleString()}</Text> : '-'
    },
    {
      title: 'Remaining Qty (Kg)',
      dataIndex: 'remaining_qty',
      key: 'remaining_qty',
      render: (v) => <Text strong style={{ color: '#1890ff' }}>{v?.toLocaleString()}</Text>
    },
    {
      title: 'Remaining Value (Br.)',
      dataIndex: 'remaining_value',
      key: 'remaining_value',
      render: (v) => <Text strong style={{ color: '#1890ff' }}>{v?.toLocaleString()}</Text>
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
              <Title level={3} style={{ marginBottom: 4 }}>Stock Report</Title>
              <Text type="secondary">In-depth stock card analysis for the selected period.</Text>
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
            <Form form={form} layout="inline" onFinish={onFinish}>
              <Form.Item name="dateRange" label="Period">
                <RangePicker style={{ borderRadius: 6 }} size="large" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} style={{ borderRadius: 6, backgroundColor: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }} size="large">Search</Button>
                  <Button onClick={handleReset} icon={<ClearOutlined />} style={{ borderRadius: 6 }} size="large">Reset</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
             <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #52c41a' }}>
                  <Statistic
                    title="Total Purchases"
                    value={reportData.totals.total_purchase_qty || 0}
                    suffix="Kg"
                    valueStyle={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: "'CircularStd', sans-serif" }}>Value: Br. {reportData.totals.total_purchase_value?.toLocaleString()}</Text>
                </Card>
             </Col>
             <Col xs={24} sm={12} lg={6}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #faad14' }}>
                  <Statistic
                    title="Total Issues"
                    value={reportData.totals.total_issue_qty || 0}
                    suffix="Kg"
                    valueStyle={{ color: '#faad14', fontFamily: "'CircularStd', sans-serif" }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: 600, fontFamily: "'CircularStd', sans-serif" }}>Value: Br. {reportData.totals.total_issue_value?.toLocaleString()}</Text>
                </Card>
             </Col>
          </Row>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <Table
              columns={columns}
              dataSource={reportData.records}
              rowKey="_id"
              loading={loading}
              pagination={false}
              size="middle"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StockReport
