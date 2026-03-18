import React, { useState } from 'react'
import { Table, Card, Button, Form, Input, InputNumber, Select, Space, Modal, message, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, RetweetOutlined } from '@ant-design/icons'
import { useMaterialIssues } from '../api/useMaterialIssues'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import dayjs from 'dayjs'

const { Option } = Select

const MaterialIssue = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [editingIssue, setEditingIssue] = useState(null)
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const { 
    issues, 
    requisitions,
    total, 
    loading, 
    addIssue, 
    editIssue, 
    changeStatus 
  } = useMaterialIssues({ page, pageSize })

  const columns = [
    { title: 'Requisition No.', dataIndex: 'material_requisition_no', key: 'material_requisition_no' },
    { title: 'Issue No.', dataIndex: 'issue_no', key: 'issue_no' },
    { title: 'Issue Date', dataIndex: 'issue_date', key: 'issue_date' },
    { title: 'Weight', dataIndex: 'issue_weight', key: 'issue_weight' },
    { title: 'Remaining Qty', dataIndex: 'remaining_quantity', key: 'remaining_quantity' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingIssue(record)
              setEditModalVisible(true)
              editForm.setFieldsValue({
                material_requisition: record.material_requisition,
                issue_no: record.issue_no,
                issue_weight: record.issue_weight,
                issue_date: record.issue_date ? dayjs(record.issue_date) : null
              })
            }}
          />
          <Button 
            icon={<RetweetOutlined />} 
            onClick={() => handleChangeStatus(record)}
            title="Change Status"
          />
        </Space>
      )
    }
  ]

  const handleAddIssue = async (values) => {
    try {
      const payload = {
        material_requisition: values.material_requisition,
        issue_no: values.issue_no,
        issue_weight: values.issue_weight,
        issue_date: values.issue_date ? values.issue_date.format('YYYY-MM-DD') : null
      }
      await addIssue(payload)
      message.success('Issue added successfully')
      setModalVisible(false)
      form.resetFields()
    } catch (e) {
      message.error(e.message || 'Failed to add issue')
    }
  }

  const handleEditIssue = async (values) => {
    try {
      const payload = {
        _id: editingIssue._id || editingIssue.id,
        material_requisition: values.material_requisition,
        issue_no: values.issue_no,
        issue_weight: values.issue_weight,
        issue_date: values.issue_date ? values.issue_date.format('YYYY-MM-DD') : null
      }
      await editIssue(payload)
      message.success('Issue updated successfully')
      setEditModalVisible(false)
      setEditingIssue(null)
      editForm.resetFields()
    } catch (e) {
      message.error(e.message || 'Failed to update issue')
    }
  }

  const handleChangeStatus = (issue) => {
    Modal.confirm({
      title: 'Change Status',
      content: `Are you sure you want to change the status for issue "${issue.issue_no}"?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const id = issue._id || issue.id
          await changeStatus(id)
          message.success('Status changed successfully')
        } catch (e) {
          message.error(e.message || 'Failed to change status')
        }
      }
    })
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="material-management:issue" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <h2>Material Issue</h2>
          <Card>
            <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
              <PlusOutlined /> Add Issue
            </Button>
            <Table
              columns={columns}
              dataSource={issues}
              rowKey={(record) => record._id || record.id}
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
            title="Add Material Issue"
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleAddIssue}>
              <Form.Item name="material_requisition" label="Material Requisition" rules={[{ required: true, message: 'Please select a requisition' }]}>
                <Select placeholder="Select a requisition">
                  {requisitions.map(req => (
                    <Option key={req._id} value={req._id}>{req.requisition_no}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="issue_no" label="Issue No." rules={[{ required: true, message: 'Please enter issue number' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="issue_weight" label="Issue Weight" rules={[{ required: true, message: 'Please enter a valid weight' }]}>
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="issue_date" label="Issue Date" rules={[{ required: true, message: 'Please select an issue date' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'end' }}>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">Add</Button>
              </Space>
            </Form>
          </Modal>

          <Modal
            open={editModalVisible}
            title="Edit Material Issue"
            onCancel={() => { setEditModalVisible(false); setEditingIssue(null); }}
            footer={null}
          >
            <Form form={editForm} layout="vertical" onFinish={handleEditIssue}>
              <Form.Item name="material_requisition" label="Material Requisition" rules={[{ required: true }]}>
                <Select placeholder="Select a requisition">
                  {requisitions.map(req => (
                    <Option key={req._id} value={req._id}>{req.requisition_no}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="issue_no" label="Issue No." rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="issue_weight" label="Issue Weight" rules={[{ required: true }]}>
                <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="issue_date" label="Issue Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Space style={{ display: 'flex', justifyContent: 'end' }}>
                <Button onClick={() => { setEditModalVisible(false); setEditingIssue(null); }}>Cancel</Button>
                <Button type="primary" htmlType="submit">Update</Button>
              </Space>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default MaterialIssue
