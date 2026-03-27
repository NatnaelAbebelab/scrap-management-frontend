import React, { useState, useEffect } from 'react'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Card, Button, Form, Input, Space, Modal, message, Typography, Table, Tag, DatePicker, Select, Divider, Dropdown } from 'antd'
import { useMaterialRequisition } from '../api/useMaterialRequisition'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'
import dayjs from 'dayjs'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const MaterialRequisition = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingRequisition, setEditingRequisition] = useState(null)
  const [selectedRequisition, setSelectedRequisition] = useState(null)
  const [form] = Form.useForm()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    plant: null,
    start_date: null,
    end_date: null,
    requisition_no: null,
    status: null
  })
  const [tempFilters, setTempFilters] = useState({ ...filters })

  const {
    requisitions,
    total,
    loading,
    plants,
    plantsLoading,
    fetchPlants,
    addRequisition,
    updateRequisition,
    deleteRequisition,
    approveRequisition,
    getRequisitionDetail
  } = useMaterialRequisition({ page, pageSize, filters })

  useEffect(() => {
    fetchPlants()
  }, [fetchPlants])

  const columns = [
    {
      title: 'Req No',
      dataIndex: 'requisition_no',
      key: 'requisition_no',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Melting Plant',
      dataIndex: ['melting_plant', 'plant_name'],
      key: 'melting_plant',
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>
    },
    {
      title: 'Requisition Date',
      dataIndex: 'requisition_date',
      key: 'requisition_date',
      render: (text) => <Text style={{ fontWeight: 600 }}>{formatDate(text)}</Text>
    },
    {
      title: 'Quantity',
      dataIndex: 'total_requisition_quantity',
      key: 'total_requisition_quantity',
      render: (text) => <Text style={{ fontWeight: 700 }}>{Number(text).toFixed(2)}</Text>
    },
    {
      title: 'Price (ETB)',
      dataIndex: 'total_requisition_price',
      key: 'total_requisition_price',
      render: (val) => <Text style={{ fontWeight: 700 }}>{Number(val).toLocaleString()}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'requisition_status',
      key: 'requisition_status',
      render: (status) => {
        let color = 'gold'
        let label = status
        if (status === 'request_issued') { color = 'blue'; label = 'Requested' }
        if (status === 'approved') { color = 'green'; label = 'Approved' }
        if (status === 'new') { color = 'cyan'; label = 'New' }
        return <Tag color={color}>{label.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => handleViewDetail(record)
          }
        ];

        if (record.requisition_status === 'new') {
          items.push(
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined />,
              onClick: () => handleEditClick(record)
            },
            {
              key: 'approve',
              label: 'Approve',
              icon: <CheckCircleOutlined />,
              onClick: () => showApproveConfirm(record)
            }
          );
        }

        if (record.requisition_status === 'request_issued') {
          items.push(
            {
              key: 'delete',
              label: 'Delete',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => showDeleteConfirm(record)
            }
          );
        }

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ]

  const handleEditClick = (record) => {
    setEditingRequisition(record)
    // Pre-fill form
    // Note: User said items include IT001/Item 1 etc., but in form only quantity/price shown?
    // Let's assume we take the first item's values if there is only one
    const firstItem = record.items && record.items.length > 0 ? record.items[0] : {}
    form.setFieldsValue({
      plant: record.melting_plant?._id,
      requisition_date: dayjs(record.requisition_date),
      requisition_no: record.requisition_no,
      quantity: firstItem.quantity,
      unit_price: firstItem.unit_price
    })
    setModalVisible(true)
  }

  const handleViewDetail = async (record) => {
    try {
      const resp = await getRequisitionDetail(record._id)
      if (resp.result === 'success') {
        setSelectedRequisition(resp.content)
        setDetailVisible(true)
      } else {
        message.error(resp.message || 'Failed to fetch details')
      }
    } catch (e) {
      message.error('Err fetching details')
    }
  }

  const showApproveConfirm = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to approve this requisition?',
      icon: <ExclamationCircleOutlined />,
      content: `Requisition: ${record.requisition_no}`,
      okText: 'Approve',
      onOk: async () => {
        try {
          const res = await approveRequisition(record._id)
          if (res.result === 'success') message.success('Requisition approved')
          else message.error(res.message || 'Approval failed')
        } catch (e) { message.error('Approval error') }
      }
    })
  }

  const showDeleteConfirm = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this requisition?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await deleteRequisition(record._id)
          if (res.result === 'success') message.success('Requisition deleted')
          else message.error(res.message || 'Deletion failed')
        } catch (e) { message.error('Delete error') }
      }
    })
  }

  const handleSubmit = async (values) => {
    // Prep payload based on user requirements
    const payload = {
      plant: values.plant,
      requisition_date: values.requisition_date.format('YYYY-MM-DD'),
      requisition_no: values.requisition_no,
      items: [
        {
          item_code: "SC001",
          item_name: "Scrap",
          quantity: values.quantity,
          unit_price: values.unit_price || 0.0
        }
      ]
    }

    try {
      let resp
      if (editingRequisition) {
        resp = await updateRequisition(editingRequisition._id, payload)
      } else {
        resp = await addRequisition(payload)
      }

      if (resp.result === 'success') {
        message.success(resp.message || 'Saved successfully')
        handleCloseModal()
      } else {
        message.error(resp.message || 'Failed to save')
      }
    } catch (e) {
      message.error('An error occurred')
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setEditingRequisition(null)
    form.resetFields()
  }

  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setTempFilters(prev => ({
        ...prev,
        start_date: dates[0].format('YYYY-MM-DD'),
        end_date: dates[1].format('YYYY-MM-DD')
      }))
    } else {
      setTempFilters(prev => ({ ...prev, start_date: null, end_date: null }))
    }
  }

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters })
    setPage(1)
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3}>Material Requisition Management</Title>
              <Text type="secondary">Create and manage raw material requisitions for melting plants.</Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ height: '40px', borderRadius: '8px' }}
            >
              Add Requisition
            </Button>
          </div>

          <Card style={{ borderRadius: '10px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Melting Plant:</Text>
                <Select
                  placeholder="Filter by Plant"
                  style={{ width: '100%' }}
                  allowClear
                  size="large"
                  value={tempFilters.plant}
                  onChange={(val) => handleFilterChange('plant', val)}
                  loading={plantsLoading}
                >
                  {plants.map(p => (
                    <Option key={p._id} value={p._id}>{p.plant_name}</Option>
                  ))}
                </Select>
              </div>
              <div style={{ flex: '1 1 250px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Date Range:</Text>
                <RangePicker
                  size="large"
                  style={{ width: '100%' }}
                  value={tempFilters.start_date ? [dayjs(tempFilters.start_date), dayjs(tempFilters.end_date)] : null}
                  onChange={handleDateRangeChange}
                />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Req No:</Text>
                <Input
                  size="large"
                  placeholder="Requisition No"
                  value={tempFilters.requisition_no}
                  onChange={(e) => handleFilterChange('requisition_no', e.target.value)}
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Status:</Text>
                <Select
                  placeholder="Status"
                  style={{ width: '100%' }}
                  allowClear
                  size="large"
                  value={tempFilters.status}
                  onChange={(val) => handleFilterChange('status', val)}
                >
                  <Option value="new">New</Option>
                  <Option value="request_issued">Requested</Option>
                  <Option value="approved">Approved</Option>
                </Select>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                style={{ borderRadius: '8px', minWidth: '120px' }}
              >
                Search
              </Button>
            </div>
          </Card>

          <Card style={{ borderRadius: '10px' }}>
            <DataTableWithPagination
              columns={columns}
              dataSource={requisitions}
              rowKey="_id"
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => { setPage(p); setPageSize(ps) }}
            />
          </Card>

          {/* Add/Edit Modal */}
          <Modal
            open={modalVisible}
            title={editingRequisition ? "Edit Material Requisition" : "Add Material Requisition"}
            onCancel={handleCloseModal}
            footer={null}
            centered
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name="plant"
                  label="Melting Plant"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select placeholder="Select Plant" loading={plantsLoading}>
                    {plants.map(p => (
                      <Option key={p._id} value={p._id}>{p.plant_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="requisition_date"
                  label="Requisition Date"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="requisition_no"
                label="Requisition Number"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="REQ-001" />
              </Form.Item>

              <Divider orientation="left">Item Details (Scrap)</Divider>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input type="number" step="0.01" placeholder="500.00" />
                </Form.Item>
                <Form.Item
                  name="unit_price"
                  label="Unit Price (ETB)"
                  rules={[{ required: false, message: 'Required' }]}
                >
                  <Input type="number" step="0.01" placeholder="10.00" />
                </Form.Item>
              </div>

              <Space style={{ display: 'flex', justifyContent: 'end', marginTop: 24 }}>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingRequisition ? "Update Requisition" : "Create Requisition"}
                </Button>
              </Space>
            </Form>
          </Modal>

          {/* View Modal */}
          <Modal
            open={detailVisible}
            title="Material Requisition Detail"
            onCancel={() => setDetailVisible(false)}
            footer={[<Button key="close" onClick={() => setDetailVisible(false)}>Close</Button>]}
            centered
            width={700}
          >
            {selectedRequisition && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Req No:</Text>
                    <Title level={5} style={{ marginTop: 4 }}>{selectedRequisition.requisition_no}</Title>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Status:</Text>
                    <div style={{ marginTop: 4 }}>
                      {columns[5].render(selectedRequisition.requisition_status)}
                    </div>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Plant:</Text>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{selectedRequisition.melting_plant?.plant_name}</div>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Date:</Text>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{formatDate(selectedRequisition.requisition_date)}</div>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Total Quantity:</Text>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{Number(selectedRequisition.total_requisition_quantity).toFixed(2)}</div>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Total Price:</Text>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{selectedRequisition.total_requisition_price?.toLocaleString()} ETB</div>
                  </div>
                </div>

                <Divider />
                <Title level={5}>Items</Title>
                <Table
                  dataSource={selectedRequisition.items}
                  pagination={false}
                  rowKey="_id"
                  size="middle"
                  bordered
                  columns={[
                    { title: 'Item Code', dataIndex: 'item_code', key: 'item_code', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Item Name', dataIndex: 'item_name', key: 'item_name', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price', render: (t) => <Text strong>{t}</Text> },
                    { title: 'Total', dataIndex: 'total_price', key: 'total_price', render: (t) => <Text strong>{t}</Text> },
                  ]}
                />
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default MaterialRequisition
