import React, { useState, useEffect } from 'react'
import { Card, Typography, Table, Button, Space, Input, Modal, Form, Dropdown, message, Row, Col, Popconfirm, Select } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined, DollarOutlined } from '@ant-design/icons'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useCustomerManagement } from '../api/useCustomerManagement'
import { formatDate } from '../utils/dateFormatter'

const { Title, Text } = Typography

const capitalize = (s) => typeof s === 'string' && s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s

const CustomerList = () => {
  const [form] = Form.useForm()
  const [payForm] = Form.useForm()
  const { fetchCustomers, addCustomer, editCustomer, deleteCustomer, fetchCustomerGrns, payCustomer, loading } = useCustomerManagement()

  const [isPayModalVisible, setIsPayModalVisible] = useState(false)
  const [payGrnOptions, setPayGrnOptions] = useState([])
  const [loadingGrns, setLoadingGrns] = useState(false)

  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const [searchTin, setSearchTin] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)

  useEffect(() => {
    loadCustomers(currentPage, pageSize, searchTin)
  }, [currentPage, pageSize])

  const loadCustomers = async (page, size, tin) => {
    try {
      const data = await fetchCustomers(page, size, tin)
      setCustomers(data.results || [])
      setTotal(data.count || 0)
    } catch (err) {
      console.error('Failed to load customers:', err)
      message.error(err.message || 'Failed to load customers')
    }
  }

  const handleSearch = (value) => {
    setSearchTin(value)
    setCurrentPage(1)
    loadCustomers(1, pageSize, value)
  }

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setIsEditing(true)
      setCurrentCustomer(customer)
      form.setFieldsValue({
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        TIN: customer.TIN,
        business_name: customer.business_name
      })
    } else {
      setIsEditing(false)
      setCurrentCustomer(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    form.resetFields()
    setCurrentCustomer(null)
  }

  const handleSubmit = async (values) => {
    try {
      if (isEditing && currentCustomer) {
        await editCustomer(currentCustomer._id, values)
        message.success('Customer updated successfully')
      } else {
        await addCustomer(values)
        message.success('Customer added successfully')
      }
      handleCloseModal()
      loadCustomers(currentPage, pageSize, searchTin)
    } catch (err) {
      console.error('Form submission failed:', err)
      message.error(err.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id)
      message.success('Customer deleted successfully')
      loadCustomers(currentPage, pageSize, searchTin)
    } catch (err) {
      console.error('Failed to delete customer:', err)
      message.error(err.message || 'Failed to delete customer')
    }
  }

  const columns = [
    {
      title: 'Customer Name',
      key: 'name',
      render: (_, record) => {
        const hasName = record.first_name || record.last_name
        const cFirst = capitalize(record.first_name)
        const cLast = capitalize(record.last_name)
        const cBusiness = capitalize(record.business_name)
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>
              {hasName ? `${cFirst || ''} ${cLast || ''}`.trim() : cBusiness || 'N/A'}
            </Text>
            {hasName && record.business_name && (
              <Text type="secondary" style={{ fontSize: 12 }}>{cBusiness}</Text>
            )}
          </Space>
        )
      }
    },
    {
      title: 'TIN',
      dataIndex: 'TIN',
      key: 'TIN',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v || 'N/A'}</Text>
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.phone && <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{record.phone}</Text>}
          {record.email && <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>}
          {!record.phone && !record.email && <Text type="secondary">N/A</Text>}
        </Space>
      )
    },
    {
      title: 'Paid Amount (Br.)',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      render: (v) => <Text style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>{Number(v || 0).toLocaleString()}</Text>
    },
    {
      title: 'Remaining Amount (Br.)',
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      render: (v) => <Text style={{ color: '#faad14', fontFamily: "'CircularStd', sans-serif" }}>{Number(v || 0).toLocaleString()}</Text>
    },
    {
      title: 'Registered On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v) => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v ? formatDate(v) : 'N/A'}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => {
        // Hide edit/delete for filtered proxy rows that don't have a real UUID
        if (record._id === record.TIN) return null;
        
        const items = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Customer',
            onClick: () => handleOpenModal(record)
          },
          {
            key: 'delete',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            label: (
              <Popconfirm
                title="Delete the customer"
                description="Are you sure to delete this customer?"
                onConfirm={() => handleDelete(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <span style={{ color: '#ff4d4f' }}>Delete Customer</span>
              </Popconfirm>
            )
          }
        ]

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 18 }} />} />
          </Dropdown>
        )
      }
    }
  ]

  // Expanded row to show GRNs when filtering returns them
  const expandedRowRender = (record) => {
    if (!record.grns || record.grns.length === 0) return null
    const grnColumns = [
      { title: 'Date', dataIndex: 'created_at', render: v => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{formatDate(v)}</Text> },
      { title: 'Plate No', dataIndex: 'plate_no', render: v => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{v}</Text> },
      { title: 'Status', dataIndex: 'status', render: v => <Text style={{ fontFamily: "'CircularStd', sans-serif" }}>{String(v).toUpperCase()}</Text> },
      { title: 'Net Weight (Kg)', dataIndex: 'net_weight', render: v => <Text strong style={{ fontFamily: "'CircularStd', sans-serif" }}>{Number(v).toLocaleString()}</Text> },
      { title: 'Net Price (Br.)', dataIndex: 'net_price', render: v => (
        <Text strong style={{ color: '#52c41a', fontFamily: "'CircularStd', sans-serif" }}>
          {Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ) }
    ]
    return (
      <Card size="small" title="Recent GRNs" style={{ margin: '16px 0', backgroundColor: '#fafafa' }}>
        <Table
          columns={grnColumns}
          dataSource={record.grns}
          pagination={false}
          rowKey="_id"
          size="small"
        />
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Customer Management</Title>
              <Text type="secondary">Manage scrap sellers, their details, and review associated balances.</Text>
            </div>
            <Space>
              <Button 
                icon={<DollarOutlined />} 
                onClick={() => setIsPayModalVisible(true)}
              >
                Pay Customer
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => handleOpenModal()} 
                style={{ background: 'rgb(245, 34, 45)' }}
              >
                Add Customer
              </Button>
            </Space>
          </div>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Input.Search
                placeholder="Search by TIN (e.g. 88715644)"
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={customers}
              rowKey="_id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true
              }}
              onChange={handleTableChange}
              expandable={{
                expandedRowRender,
                rowExpandable: record => record.grns && record.grns.length > 0,
                // Auto-expand if grns exist (which happens on TIN search)
                defaultExpandAllRows: true
              }}
            />
          </Card>
        </div>
      </div>

      <Modal
        title={isEditing ? "Edit Customer" : "Add Customer"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="First Name">
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name">
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="+251..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input type="email" placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="TIN" label="TIN" rules={[{ required: true, message: 'TIN is required' }]}>
                <Input placeholder="Enter TIN" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="business_name" label="Business Name">
                <Input placeholder="Company / Business Name" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Space>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: 'rgb(245, 34, 45)' }}>
                {isEditing ? 'Save Changes' : 'Add Customer'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Pay Customer"
        open={isPayModalVisible}
        onCancel={() => {
          setIsPayModalVisible(false)
          payForm.resetFields()
          setPayGrnOptions([])
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={payForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await payCustomer(values.tin, values.record_nos)
              message.success('Payment recorded successfully')
              setIsPayModalVisible(false)
              payForm.resetFields()
              setPayGrnOptions([])
              loadCustomers(currentPage, pageSize, searchTin)
            } catch (err) {
              message.error(err.message || 'Payment failed')
            }
          }}
        >
          <Form.Item name="tin" label="Customer TIN" rules={[{ required: true, message: 'TIN is required' }]}>
            <Input 
              placeholder="Enter TIN" 
              onBlur={async (e) => {
                const tinValue = e.target.value
                if (!tinValue) {
                  setPayGrnOptions([])
                  payForm.setFieldsValue({ record_nos: [] })
                  return
                }
                setLoadingGrns(true)
                try {
                  const grns = await fetchCustomerGrns(tinValue)
                  const options = grns
                    .filter(g => g.status === 'approved')
                    .map(g => ({ value: g.record_no, label: g.record_no }))
                  setPayGrnOptions(options)
                } catch(err) {
                  setPayGrnOptions([])
                  message.error('Failed to load GRNs for TIN')
                } finally {
                  setLoadingGrns(false)
                }
              }} 
            />
          </Form.Item>
          <Form.Item name="record_nos" label="Select Records to Pay" rules={[{ required: true, message: 'Please select at least one record' }]}>
            <Select
              mode="multiple"
              placeholder="Select Record Nos"
              options={payGrnOptions}
              loading={loadingGrns}
              onDropdownVisibleChange={async (open) => {
                if (open) {
                  const tinValue = payForm.getFieldValue('tin')
                  if (!tinValue) {
                    message.warning('Please enter a TIN first')
                    return
                  }
                  setLoadingGrns(true)
                  try {
                    const grns = await fetchCustomerGrns(tinValue)
                    // Ensure the dropdown populates precisely with approved record_nos
                    const options = grns
                      .filter(g => g.status === 'approved')
                      .map(g => ({ value: String(g.record_no), label: String(g.record_no) }))
                    setPayGrnOptions(options)
                  } catch (err) {
                    setPayGrnOptions([])
                    message.error('Failed to load GRNs for TIN')
                  } finally {
                    setLoadingGrns(false)
                  }
                }
              }}
            />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Space>
              <Button onClick={() => {
                setIsPayModalVisible(false)
                payForm.resetFields()
                setPayGrnOptions([])
              }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} style={{ background: 'rgb(245, 34, 45)' }}>
                Process Payment
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default CustomerList
