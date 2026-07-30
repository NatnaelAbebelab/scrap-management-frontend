import React, { useState } from 'react'
import { Card, Typography, Form, Input, Select, DatePicker, Button, Space, message, Modal, Upload, Row, Col, Tag, Alert } from 'antd'
import { SearchOutlined, ClearOutlined, UploadOutlined, FileExcelOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'
import { useTransportData } from '../api/useTransportData'
import { formatDate } from '../utils/dateFormatter'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { Dragger } = Upload

const UploadTransportData = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({})
  const [filterForm] = Form.useForm()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const {
    records,
    total,
    loading,
    error,
    materialTypes,
    uploadTransportDataCsv,
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

  const handleUploadClick = () => {
    setUploadFile(null)
    setUploadResult(null)
    setUploadModalOpen(true)
  }

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      message.error('Please select a CSV file to upload')
      return
    }

    setUploading(true)
    setUploadResult(null)
    try {
      const response = await uploadTransportDataCsv(uploadFile)

      // Handle complex skipped_records structure
      let skippedCount = 0
      if (typeof response.content.skipped_records === 'number') {
        skippedCount = response.content.skipped_records
      } else if (response.content.skipped_records && typeof response.content.skipped_records === 'object') {
        const dropped = response.content.skipped_records.dropped_rows?.length || 0
        const invalid = response.content.skipped_records.invalid_data?.length || 0
        skippedCount = dropped + invalid
      }

      setUploadResult({
        type: 'success',
        message: response.message || 'File uploaded successfully',
        created: response.content.created_records || 0,
        skipped: skippedCount,
      })
      message.success(response.message || 'File uploaded successfully')
    } catch (err) {
      setUploadResult({
        type: 'error',
        message: err.message || 'Upload failed. Please check your connection and try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  const uploadProps = {
    onRemove: () => setUploadFile(null),
    beforeUpload: (file) => {
      const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')
      if (!isCsv) {
        message.error('You can only upload excel files!')
        return Upload.LIST_IGNORE
      }
      setUploadFile(file)
      return false // Prevent default automatic upload
    },
    fileList: uploadFile ? [uploadFile] : [],
    maxCount: 1,
    accept: '.csv',
    disabled: uploading
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
      width: 110,
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'TIN',
      dataIndex: 'agency',
      key: 'agency',
      width: 110,
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 130,
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
      width: 140,
      render: (v) => <Text>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Second Weight (Kg)',
      dataIndex: 'second_weight',
      key: 'second_weight',
      width: 150,
      render: (v) => <Text>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Net Weight (Kg)',
      dataIndex: 'net_weight',
      key: 'net_weight',
      width: 130,
      render: (v) => <Text strong style={{ color: '#fa8c16' }}>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Driver Name',
      dataIndex: 'driver_name',
      key: 'driver_name',
      width: 150,
      ellipsis: true,
      render: (v) => <Text>{v ?? '-'}</Text>
    },
    {
      title: 'Weight Date',
      dataIndex: 'first_date',
      key: 'first_date',
      width: 120,
      render: (v) => {
        if (!v) return <Text>-</Text>
        const parts = v.split('.')
        if (parts.length === 3) {
          const date = new Date(parts[2], parts[1] - 1, parts[0])
          return <Text>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        }
        return <Text>{v}</Text>
      }
    },
    {
      title: 'Uploaded Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (v) => <Text>{formatDate(v)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
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
              <Title level={3} style={{ marginBottom: 4 }}>Raw Scrap Transport Data</Title>
              <Text type="secondary">
                Upload raw factory scrap records via CSV and view the imported data.
              </Text>
            </div>
            <RoleBasedComponentAccess allowedRoles={['super_admin', 'weight_man']}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUploadClick}
                style={{
                  borderRadius: 6,
                  background: 'rgb(245, 34, 45)',
                  marginTop: 4
                }}
              >
                Upload CSV
              </Button>
            </RoleBasedComponentAccess>
          </div>

          <Card style={{
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: 'none',
            marginBottom: 24
          }}>
            <Form form={filterForm} layout="vertical" onFinish={handleFilterApply}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
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
                <Form.Item label=" " colon={false} style={{ marginBottom: 16 }}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                      style={{ borderRadius: 6, background: 'rgb(245, 34, 45)' }}
                    >
                      Search Records
                    </Button>
                    <Button
                      onClick={handleFilterReset}
                      icon={<ClearOutlined />}
                      style={{ borderRadius: 6 }}
                    >
                      Reset Filters
                    </Button>
                  </Space>
                </Form.Item>
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
            />
          </Card>
        </div>
      </div>

      {/* Upload CSV Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined style={{ color: 'rgb(245, 34, 45)' }} />
            <span style={{ fontWeight: 700 }}>Upload CSV Transport Data</span>
          </Space>
        }
        open={uploadModalOpen}
        onCancel={() => {
          if (!uploading) setUploadModalOpen(false)
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => setUploadModalOpen(false)}
            disabled={uploading}
            style={{ borderRadius: 6 }}
          >
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            onClick={handleUploadSubmit}
            loading={uploading}
            disabled={!uploadFile}
            style={{ borderRadius: 6, background: 'rgb(245, 34, 45)' }}
          >
            {uploading ? 'Uploading...' : 'Upload Data'}
          </Button>
        ]}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          {uploadResult && (
            <Alert
              type={uploadResult.type}
              message={uploadResult.type === 'success' ? 'Upload Successful' : 'Upload Failed'}
              description={
                uploadResult.type === 'success' ? (
                  <div>
                    <Text>{uploadResult.message}</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      <li><Text type="success" strong>Created Records: {uploadResult.created}</Text></li>
                      <li><Text type="warning" strong>Skipped Records: {uploadResult.skipped}</Text></li>
                    </ul>
                  </div>
                ) : (
                  uploadResult.message
                )
              }
              showIcon
              style={{ marginBottom: 20 }}
            />
          )}

          <Dragger {...uploadProps} style={{ padding: 24, background: '#fafafa', borderColor: '#d9d9d9' }}>
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ color: 'rgb(245, 34, 45)', fontSize: 48 }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500, color: '#262626' }}>
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ color: '#8c8c8c', marginBottom: 16 }}>
              Only .csv files are supported. Ensure strictly formatted data.
            </p>
            <Button icon={<UploadOutlined />} style={{ borderRadius: 6 }}>
              Select File
            </Button>
          </Dragger>
        </div>
      </Modal>
    </div>
  )
}

export default UploadTransportData
