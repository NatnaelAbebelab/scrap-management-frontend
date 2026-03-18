import React, { useState } from 'react'
import { Table, Card, Button, Form, Input, Space, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMeltingPlants } from '../api/useMeltingPlants'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'

const MeltingPlants = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [editingPlant, setEditingPlant] = useState(null)
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { 
    plants, 
    total, 
    loading, 
    addPlant, 
    editPlant, 
    deletePlant 
  } = useMeltingPlants({ page, pageSize })

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (text, record) => record.id || record._id || text },
    { title: 'Plant Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingPlant(record)
              setEditModalVisible(true)
              editForm.setFieldsValue({ plantName: record.name })
            }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDeletePlant(record)}
          />
        </Space>
      )
    }
  ]

  const handleAddPlant = async (values) => {
    try {
      await addPlant(values.plantName)
      message.success('Plant added successfully')
      setModalVisible(false)
      form.resetFields()
    } catch (e) {
      message.error(e.message || 'Failed to add plant')
    }
  }

  const handleEditPlant = async (values) => {
    try {
      const id = editingPlant.id || editingPlant._id
      await editPlant(id, values.plantName)
      message.success('Plant updated successfully')
      setEditModalVisible(false)
      setEditingPlant(null)
      editForm.resetFields()
    } catch (e) {
      message.error(e.message || 'Failed to update plant')
    }
  }

  const handleDeletePlant = (plant) => {
    Modal.confirm({
      title: 'Delete Melting Plant',
      content: `Are you sure you want to delete "${plant.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const id = plant.id || plant._id
          await deletePlant(id)
          message.success('Plant deleted successfully')
        } catch (e) {
          message.error(e.message || 'Failed to delete plant')
        }
      }
    })
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="settings" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <h2>Melting Plants</h2>
          <Card>
            <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
              <PlusOutlined /> Add Plant
            </Button>
            <Table
              columns={columns}
              dataSource={plants}
              rowKey={(record) => record.id || record._id}
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total: total,
                onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                showSizeChanger: true,
              }}
            />
          </Card>

          <Modal
            open={modalVisible}
            title="Add Melting Plant"
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleAddPlant}>
              <Form.Item name="plantName" label="Plant Name" rules={[{ required: true, message: 'Please enter a plant name' }]}>
                <Input />
              </Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'end' }}>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Add</Button>
              </Space>
            </Form>
          </Modal>

          <Modal
            open={editModalVisible}
            title="Edit Melting Plant"
            onCancel={() => { setEditModalVisible(false); setEditingPlant(null); }}
            footer={null}
          >
            <Form form={editForm} layout="vertical" onFinish={handleEditPlant}>
              <Form.Item name="plantName" label="Plant Name" rules={[{ required: true, message: 'Please enter a plant name' }]}>
                <Input />
              </Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'end' }}>
                <Button onClick={() => { setEditModalVisible(false); setEditingPlant(null); }}>Cancel</Button>
                <Button type="primary" htmlType="submit">Update</Button>
              </Space>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default MeltingPlants
