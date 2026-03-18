import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  InputNumber,
  Typography,
  Alert,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  Spin,
} from 'antd'
import { DollarOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useMaterialPrice } from '../api/useMaterialPrice'

const { Title, Text } = Typography

const CATEGORIES = [
  { key: 'heavy', label: 'Heavy', color: '#1890ff', description: 'Heavy scrap materials' },
  { key: 'medium', label: 'Medium', color: '#52c41a', description: 'Medium scrap materials' },
  { key: 'light', label: 'Light', color: '#faad14', description: 'Light scrap materials' },
]

const priceColumns = [
  {
    title: 'Heavy Rate',
    dataIndex: 'heavy_rate',
    key: 'heavy_rate',
    align: 'center',
    render: (v) => (v !== null && v !== undefined && v !== '' ? v : 'N/A'),
  },
  {
    title: 'Medium Rate',
    dataIndex: 'medium_rate',
    key: 'medium_rate',
    align: 'center',
    render: (v) => (v !== null && v !== undefined && v !== '' ? v : 'N/A'),
  },
  {
    title: 'Light Rate',
    dataIndex: 'light_rate',
    key: 'light_rate',
    align: 'center',
    render: (v) => (v !== null && v !== undefined && v !== '' ? v : 'N/A'),
  },
  {
    title: 'Fixed Rate',
    dataIndex: 'fixed_rate',
    key: 'fixed_rate',
    align: 'center',
    render: (v) => (v !== null && v !== undefined && v !== '' ? v : 'N/A'),
  },
  {
    title: 'Material Type',
    dataIndex: 'material_type',
    key: 'material_type',
    align: 'center',
    render: (v) => (v ? v : 'N/A'),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (v) => {
      if (!v) return 'N/A'
      const isActive = v.toLowerCase() === 'active'
      return <Tag color={isActive ? 'success' : 'default'}>{v}</Tag>
    },
  },
  {
    title: 'Expired Date',
    dataIndex: 'expired_date',
    key: 'expired_date',
    align: 'center',
    render: (v) => (v ? v : 'N/A'),
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    align: 'center',
    render: (v) => (v ? v : 'N/A'),
  },
  {
    title: 'Created By',
    dataIndex: 'created_by',
    key: 'created_by',
    align: 'center',
    render: (v) => (v ? v : 'N/A'),
  },
]

const MaterialPriceSetting = () => {
  const [form] = Form.useForm()
  const [shakeFields, setShakeFields] = useState({})

  const {
    priceHistory,
    loading,
    fetchLoading,
    error,
    success,
    setError,
    setSuccess,
    setPrices,
    fetchPriceHistory,
  } = useMaterialPrice()

  const handleSubmit = async (values) => {
    const { heavy, medium, light } = values

    // Validate all fields are filled
    const missing = {}
    if (!heavy && heavy !== 0) missing.heavy = true
    if (!medium && medium !== 0) missing.medium = true
    if (!light && light !== 0) missing.light = true

    if (Object.keys(missing).length > 0) {
      setShakeFields(missing)
      setError('Please enter valid prices for all categories.')
      setTimeout(() => setShakeFields({}), 500)
      return
    }

    const ok = await setPrices({ heavy, medium, light })
    if (ok) {
      form.resetFields()
      // Auto-clear success message after 4 seconds
      setTimeout(() => setSuccess(false), 4000)
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="scrap-purchase" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          {/* Page Header */}
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              Material Price Setting
            </Title>
            <Text type="secondary">
              Set and manage scrap material prices by category. Price history is shown below.
            </Text>
          </div>

          {/* Alerts */}
          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              closable
              onClose={() => setError('')}
              style={{ marginBottom: 16 }}
            />
          )}
          {success && (
            <Alert
              type="success"
              message="Prices updated successfully!"
              showIcon
              closable
              onClose={() => setSuccess(false)}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Price Input Card */}
          <Card
            title={
              <Space>
                <DollarOutlined style={{ color: '#1890ff' }} />
                <span>Set New Prices</span>
              </Space>
            }
            style={{
              marginBottom: 24,
              borderRadius: 10,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={24}>
                {CATEGORIES.map(({ key, label, color, description }) => (
                  <Col xs={24} sm={8} key={key}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: 8,
                        borderTop: `3px solid ${color}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        animation: shakeFields[key] ? 'shake 0.4s ease' : 'none',
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16, color }}>
                          {label}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {description}
                        </Text>
                      </div>
                      <Form.Item
                        name={key}
                        label={`${label} Rate (ETB/kg)`}
                        rules={[
                          { required: true, message: `Please enter ${label.toLowerCase()} rate` },
                          { type: 'number', min: 0, message: 'Rate must be a positive number' },
                        ]}
                        style={{ marginBottom: 0 }}
                        validateStatus={shakeFields[key] ? 'error' : undefined}
                      >
                        <InputNumber
                          min={0}
                          precision={2}
                          style={{ width: '100%' }}
                          placeholder={`Enter ${label.toLowerCase()} rate`}
                          prefix="ETB"
                          size="large"
                          status={shakeFields[key] ? 'error' : undefined}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Divider />

              <div style={{ textAlign: 'center' }}>
                <Space size="middle">
                  <Button
                    onClick={() => form.resetFields()}
                    size="large"
                    style={{ minWidth: 120 }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={loading ? <Spin size="small" /> : <SaveOutlined />}
                    disabled={loading}
                    style={{
                      minWidth: 160,
                      background: '#262626',
                      borderColor: '#262626',
                    }}
                  >
                    {loading ? 'Saving...' : 'Set Prices'}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>

          {/* Price History Table */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <span>Price History</span>
                </Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchPriceHistory}
                  loading={fetchLoading}
                  size="small"
                >
                  Refresh
                </Button>
              </div>
            }
            style={{
              borderRadius: 10,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            }}
          >
            <Table
              rowKey={(record, index) => record._id || index}
              columns={priceColumns}
              dataSource={priceHistory}
              loading={fetchLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
                showTotal: (total) => `Total ${total} records`,
              }}
              scroll={{ x: 900 }}
              locale={{ emptyText: 'No price history available' }}
            />
          </Card>
        </div>
      </div>

      {/* Shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}

export default MaterialPriceSetting
