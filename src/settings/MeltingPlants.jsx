import React, { useState } from 'react'
import { Card, Button, Form, Input, Space, Modal, message, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMeltingPlants } from '../api/useMeltingPlants'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'

const { Title, Text } = Typography

const MeltingPlants = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { 
    plants, 
    total, 
    loading, 
    addPlant, 
  } = useMeltingPlants({ page, pageSize })

  const columns = [
    { 
      title: 'Plant Name', 
      dataIndex: 'plant_name', 
      key: 'plant_name',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'ID', 
      dataIndex: '_id', 
      key: '_id',
      render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
    }
  ]

  const handleAddPlant = async (values) => {
    try {
      const response = await addPlant(values.plantName)
      if (response.result === 'success') {
        message.success(response.message || 'Plant added successfully')
        setModalVisible(false)
        form.resetFields()
      } else {
        message.error(response.message || 'Failed to add plant')
      }
    } catch (e) {
      message.error(e.message || 'Failed to add plant')
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <Title level={3}>Melting Plant Management</Title>
            <Text type="secondary">Manage the different melting plant locations within the system.</Text>
          </div>

          <Card style={{ borderRadius: '10px' }}>
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setModalVisible(true)}
                style={{ height: '40px', borderRadius: '8px' }}
              >
                Add New Melting Plant
              </Button>
            </div>

            <DataTableWithPagination
              columns={columns}
              dataSource={plants}
              rowKey="_id"
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              onSearch={setSearchTerm}
            />
          </Card>

          <Modal
            open={modalVisible}
            title="Add Melting Plant"
            onCancel={() => setModalVisible(false)}
            footer={null}
            centered
          >
            <Form form={form} layout="vertical" onFinish={handleAddPlant} style={{ marginTop: 12 }}>
              <Form.Item 
                name="plantName" 
                label="Plant Name" 
                rules={[{ required: true, message: 'Please enter a plant name' }]}
              >
                <Input placeholder="e.g., New Melting" style={{ height: '40px', borderRadius: '8px' }} />
              </Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'end', marginTop: 24 }}>
                <Button onClick={() => setModalVisible(false)} style={{ borderRadius: '8px' }}>Cancel</Button>
                <Button type="primary" htmlType="submit" style={{ borderRadius: '8px' }}>Create Plant</Button>
              </Space>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default MeltingPlants
