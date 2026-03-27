import React, { useState } from 'react'
import { Card, Button, Form, Input, Space, Modal, message, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useMeltingPlants } from '../api/useMeltingPlants'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'

const { Title, Text } = Typography

const MeltingPlants = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPlant, setEditingPlant] = useState(null)
  const [form] = Form.useForm()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    plants,
    total,
    loading,
    addPlant,
    updatePlant,
    deletePlant,
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleEditClick(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      )
    }
  ]

  const handleEditClick = (plant) => {
    setEditingPlant(plant)
    form.setFieldsValue({ plantName: plant.plant_name })
    setModalVisible(true)
  }

  const showDeleteConfirm = (plant) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this melting plant?',
      icon: <ExclamationCircleOutlined />,
      content: `Plant Name: ${plant.plant_name}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: async () => {
        try {
          const response = await deletePlant(plant._id)
          if (response.result === 'success') {
            message.success(response.message || 'Plant deleted successfully')
          } else {
            message.error(response.message || 'Failed to delete plant')
          }
        } catch (e) {
          message.error(e.message || 'Failed to delete plant')
        }
      },
    })
  }

  const handleSubmit = async (values) => {
    try {
      let response
      if (editingPlant) {
        response = await updatePlant(editingPlant._id, values.plantName)
      } else {
        response = await addPlant(values.plantName)
      }

      if (response.result === 'success') {
        message.success(response.message || `Plant ${editingPlant ? 'updated' : 'added'} successfully`)
        handleCloseModal()
      } else {
        message.error(response.message || `Failed to ${editingPlant ? 'update' : 'add'} plant`)
      }
    } catch (e) {
      message.error(e.message || `Failed to ${editingPlant ? 'update' : 'add'} plant`)
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setEditingPlant(null)
    form.resetFields()
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
            title={editingPlant ? "Edit Melting Plant" : "Add Melting Plant"}
            onCancel={handleCloseModal}
            footer={null}
            centered
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }}>
              <Form.Item
                name="plantName"
                label="Plant Name"
                rules={[{ required: true, message: 'Please enter a plant name' }]}
              >
                <Input placeholder="e.g., New Melting" style={{ height: '40px', borderRadius: '8px' }} />
              </Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'end', marginTop: 24 }}>
                <Button onClick={handleCloseModal} style={{ borderRadius: '8px' }}>Cancel</Button>
                <Button type="primary" htmlType="submit" style={{ borderRadius: '8px' }}>
                  {editingPlant ? "Update Plant" : "Create Plant"}
                </Button>
              </Space>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default MeltingPlants
