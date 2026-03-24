import React, { useState, useEffect } from 'react'
import { Card, Typography, Form, InputNumber, Button, Table, message, Space, Tag } from 'antd'
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useGrnSerial } from '../api/useGrnSerial'

const { Title, Text } = Typography

const GrnSerialSettings = () => {
  const { isLoading, data, fetchSerialNumbers, initializeSerial } = useGrnSerial()
  const [form] = Form.useForm()

  useEffect(() => {
    fetchSerialNumbers()
  }, [fetchSerialNumbers])

  const onFinish = async (values) => {
    try {
      const response = await initializeSerial(values.initial_serial_number)
      if (response.result === 'success') {
        message.success(response.message || 'GRN Serial initialized successfully')
        form.resetFields()
      } else {
        message.error(response.message || 'Failed to initialize GRN Serial')
      }
    } catch (error) {
      console.error('Initialization error:', error)
      message.error('An error occurred during initialization')
    }
  }

  const columns = [
    {
      title: 'Initial Number',
      dataIndex: 'initial_number',
      key: 'initial_number'
    },
    {
      title: 'Last Used Number',
      dataIndex: 'last_used_number',
      key: 'last_used_number'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'grey'} icon={status === 'active' ? <CheckCircleOutlined /> : null}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <Title level={3}>GRN Serial Number Initializer</Title>
          <Text type="secondary">
            Set the starting number for Good Received Notes (GRN). This should only be done once or when a manual reset is required.
          </Text>

          <Card style={{ marginTop: 24, borderRadius: 10 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="initial_serial_number"
                label="Initial Serial Number"
                rules={[{ required: true, message: 'Please input the initial serial number' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="e.g., 5000" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={isLoading}
                  icon={<SyncOutlined spin={isLoading} />}
                >
                  Initialize Serial Number
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Current Serial Configurations" style={{ marginTop: 24, borderRadius: 10 }}>
            <Table
              dataSource={data}
              columns={columns}
              rowKey="_id"
              loading={isLoading}
              pagination={false}
              bordered
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GrnSerialSettings
