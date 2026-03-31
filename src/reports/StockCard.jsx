import React, { useState, useEffect } from 'react'
import { Card, Typography, Space, Form, DatePicker, Button, Row, Col, Table, Tag, Statistic, message } from 'antd'
import { SearchOutlined, ClearOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useStockManagement } from '../api/useStockManagement'
import { formatDate } from '../utils/dateFormatter'
import { exportToExcel } from '../utils/exportToExcel'
import { pdf } from '@react-pdf/renderer'
import StockCardPDF from '../components/pdfComponent/StockCardPDF'

import * as XLSX from 'xlsx'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const StockCardReport = () => {
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
      console.error('Failed to fetch stock card:', err)
      message.error(err.message || 'Failed to generate stock card')
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

  const handlePDFExport = async () => {
    if (reportData.records.length === 0) {
      message.warning('No data to export')
      return
    }

    message.loading({ content: 'Generating PDF...', key: 'pdf_loading' })
    try {
      const blob = await pdf(<StockCardPDF records={reportData.records} totals={reportData.totals} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Stock_Card_${new Date().toISOString().slice(0, 10)}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      message.success({ content: 'PDF generated successfully!', key: 'pdf_loading', duration: 2 })
    } catch (error) {
      console.error('PDF generation error:', error)
      message.error({ content: 'Failed to generate PDF', key: 'pdf_loading' })
    }
  }

  const handleExport = () => {
    // 1. Prepare data rows (AOA style)
    const dataRows = reportData.records.map(record => [
      record.weight_date ? formatDate(record.weight_date) : '-',
      record.grn_no || '-',
      record.issue_no || '-',
      record.purchased_qty || 0,
      record.issued_qty || 0,
      record.remaining_qty || 0,
      '' // Remark
    ])

    // 2. Prepare hierarchical headers
    const headers = [
      ['Date', 'Receiving Report No', 'Issue Voucher No', '', 'Quantity', '', 'Remark'],
      ['', '', '', 'Receipt Qty', 'Issues', 'Balance', '']
    ]

    // 3. Add totals row if appropriate
    if (reportData.records.length > 0) {
      dataRows.push([]) // spacer
      dataRows.push([
        'TOTAL',
        '',
        '',
        reportData.totals.total_purchase_qty || 0,
        reportData.totals.total_issue_qty || 0,
        reportData.records[reportData.records.length - 1].remaining_qty || 0,
        ''
      ])
    }

    // 4. Create worksheet from arrays
    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...dataRows])

    // 5. Apply merges and widths
    // NOTE: For merges, SheetJS takes the value from the top-left cell. 
    // If we put data in Column E (index 4), we start merge at index 3 (D).
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Date
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Receiving Report NO
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Issue Voucher No
      { s: { r: 0, c: 3 }, e: { r: 0, c: 5 } }, // Parent Quantity (Merged D-F)
      { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }, // Remark
    ]

    // We manually set D1 to the value of E1 to ensure the merge has the label
    worksheet['D1'] = { v: 'Quantity', t: 's' }

    worksheet['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Card')

    const today = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `Stock_Card_${today}.xlsx`)
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
      title: 'GRN No',
      dataIndex: 'grn_no',
      key: 'grn_no',
      render: (v) => <Text style={{ fontWeight: 600 }}>{v || '-'}</Text>
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
      title: 'Issued Qty (Kg)',
      dataIndex: 'issued_qty',
      key: 'issued_qty',
      render: (v) => v > 0 ? <Text strong style={{ color: '#faad14' }}>-{v.toLocaleString()}</Text> : '-'
    },
    {
      title: 'Remaining Qty (Kg)',
      dataIndex: 'remaining_qty',
      key: 'remaining_qty',
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
              <Title level={3} style={{ marginBottom: 4 }}>Stock Card</Title>
              <Text type="secondary">Detailed chronological tracking of scrap inventory movement.</Text>
            </div>
            <Space>
              <Button
                type="primary"
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', borderRadius: 6 }}
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={loading}
              >
                Excel Export
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: '#f22f46', borderColor: '#f22f46', borderRadius: 6 }}
                icon={<FilePdfOutlined />}
                onClick={handlePDFExport}
                loading={loading}
              >
                Export PDF
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
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />} style={{ borderRadius: 6, backgroundColor: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }}>Search</Button>
                  <Button onClick={handleReset} icon={<ClearOutlined />} style={{ borderRadius: 6 }}>Reset</Button>
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

export default StockCardReport

