import React, { useState } from 'react'
import { Card, Typography, Form, InputNumber, Button, message, Space, Descriptions, Tag, Alert } from 'antd'
import { SyncOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useStockBalance } from '../api/useStockBalance'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography

const StockBeginningBalance = () => {
  const { loading, activeBalance, addBeginningBalance } = useStockBalance()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      const response = await addBeginningBalance(values)
      if (response.result === 'success') {
        message.success(response.message || 'Beginning balance added successfully')
        form.resetFields()
      } else {
        message.error(response.message || 'Failed to add beginning balance')
      }
    } catch (error) {
      console.error('Submission error:', error)
      message.error(error.message || 'An error occurred during submission')
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <Title level={3}>Stock Beginning Balance</Title>
            <Text type="secondary">Initialize or update the starting inventory quantities and values.</Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: '24px' }}>
            {/* Form Section */}
            <Card title="Initialize New Balance" style={{ borderRadius: 10 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item
                  name="beginning_qty"
                  label="Beginning Quantity"
                  rules={[{ required: true, message: 'Please input the beginning quantity' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 100000"
                    min={0}
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="beginning_value"
                  label="Beginning Value"
                  rules={[{ required: true, message: 'Please input the beginning value' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="e.g., 500000"
                    min={0}
                    size="large"
                  />
                </Form.Item>
                <Form.Item style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SyncOutlined spin={loading} />}
                    block
                    size="large"
                    style={{ borderRadius: '8px' }}
                  >
                    Submit Beginning Balance
                  </Button>
                </Form.Item>
              </Form>
              <Alert
                title="Note"
                showIcon
                description="Initializing a new balance will set the current stock state. Only use this when starting a new period or correcting overall stock."
                type="info"
                icon={<InfoCircleOutlined />}
                style={{ marginTop: 16 }}
              />
            </Card>

            {/* Current Status Section */}
            <Card
              title={
                <Space>
                  <span>Active Stock Balance</span>
                  {activeBalance && <Tag color="green" icon={<CheckCircleOutlined />}>ACTIVE</Tag>}
                </Space>
              }
              style={{ borderRadius: 10 }}
              loading={loading && !activeBalance}
            >
              {activeBalance ? (
                <Descriptions bordered column={1} labelStyle={{ fontWeight: 600, width: '200px' }}>
                  <Descriptions.Item label="Beginning Quantity">
                    <Text strong>{activeBalance.beginning_qty.toLocaleString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Beginning Value">
                    <Text strong>{activeBalance.beginning_value.toLocaleString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Quantity">
                    <Text type="success" strong>{activeBalance.current_qty.toLocaleString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Value">
                    <Text type="success" strong>{activeBalance.current_value.toLocaleString()}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Set on">
                    {formatDate(activeBalance.created_at)}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">No active beginning balance found.</Text>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockBeginningBalance
