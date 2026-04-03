import { useState } from 'react'
import {
  Card,
  Button,
  Form,
  InputNumber,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  message,
} from 'antd'
import { DollarOutlined, SaveOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'
import SelectInput from '../components/SelectInput'
import { useMaterialRate } from '../api/useMaterialRate'
import { formatDate } from '../utils/dateFormatter'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'

const { Title, Text } = Typography

const MaterialRate = () => {
  const [form] = Form.useForm()
  const materialType = Form.useWatch('material_type', form)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const {
    loading,
    rates,
    total,
    materialTypes,
    addRate,
  } = useMaterialRate({ page, pageSize })

  const columns = [
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      render: (v) => (
        <Tag color="geekblue" style={{ textTransform: 'uppercase' }}>
          {materialTypes[v] || v}
        </Tag>
      ),
    },
    {
      title: 'Heavy Rate',
      dataIndex: 'heavy_rate',
      key: 'heavy_rate',
      render: (v) => <Text strong>{v ? `${v} ETB` : '-'}</Text>,
    },
    {
      title: 'Medium Rate',
      dataIndex: 'medium_rate',
      key: 'medium_rate',
      render: (v) => <Text strong>{v ? `${v} ETB` : '-'}</Text>,
    },
    {
      title: 'Light Rate',
      dataIndex: 'light_rate',
      key: 'light_rate',
      render: (v) => <Text strong>{v ? `${v} ETB` : '-'}</Text>,
    },
    {
      title: 'Fixed Rate',
      dataIndex: 'fixed_rate',
      key: 'fixed_rate',
      render: (v) => <Text strong>{v ? `${v} ETB` : '-'}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => (
        <Tag color={v === 'active' ? 'success' : 'default'} style={{ textTransform: 'capitalize' }}>
          {v || 'Expired'}
        </Tag>
      ),
    },
    {
      title: 'Set on',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => formatDate(v),
    },
  ]

  const onFinish = async (values) => {
    try {
      const response = await addRate(values)
      if (response.result === 'success') {
        message.success(response.message || 'Rates saved successfully')
        form.resetFields(['heavy_rate', 'medium_rate', 'light_rate', 'fixed_rate'])
      } else {
        message.error(response.message || 'Failed to save rates')
      }
    } catch (error) {
      console.error('Submission error:', error)
      message.error('An error occurred during submission')
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <Title level={3}>Material Rate Management</Title>
            <Text type="secondary">Define and manage purchase rates for different material categories.</Text>
          </div>
          <RoleBasedComponentAccess allowedRoles={['super_admin', 'manager']}>
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Configure Material Rates</span>
                </Space>
              }
              style={{ marginBottom: 24, borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ material_type: 'scrap' }}>
                <Row gutter={24}>
                  <Col xs={24} md={12} lg={10}>
                    <Form.Item
                      name="material_type"
                      rules={[{ required: true, message: 'Please select a material type' }]}
                    >
                      <SelectInput
                        label="Material Type"
                        placeholder="Search or select a material..."
                        options={materialTypes}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider dashed />

                <Row gutter={24}>
                  {materialType === 'scrap' ? (
                    <>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="heavy_rate" label="Heavy Rate (ETB)">
                          <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="e.g. 21" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="medium_rate" label="Medium Rate (ETB)">
                          <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="e.g. 15" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="light_rate" label="Light Rate (ETB)">
                          <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="e.g. 10" />
                        </Form.Item>
                      </Col>
                    </>
                  ) : (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="fixed_rate" label="Fixed Rate (ETB)">
                        <InputNumber size="large" style={{ width: '100%' }} min={0} placeholder="e.g. 29" />
                      </Form.Item>
                    </Col>
                  )}
                </Row>

                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ minWidth: 160, borderRadius: '8px' }}
                  >
                    Save Material Rate
                  </Button>
                </div>
              </Form>
            </Card>
          </RoleBasedComponentAccess>

          <Card title="Rate History Archive" style={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <DataTableWithPagination
              columns={columns}
              dataSource={rates}
              rowKey="_id"
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MaterialRate
