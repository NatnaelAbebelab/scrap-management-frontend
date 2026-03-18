import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Typography,
  Alert,
  Tag,
  Space,
  Modal,
  Descriptions,
  Dropdown,
  Divider,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  BankOutlined,
  FileTextOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useAgencies } from '../api/useAgencies'

const { Title, Text } = Typography

const AgencyRegistration = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [agreementsModalOpen, setAgreementsModalOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [agreements, setAgreements] = useState([])
  const [agreementsLoading, setAgreementsLoading] = useState(false)
  const [agreementsError, setAgreementsError] = useState('')

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const {
    agencies,
    total,
    loading,
    error,
    fetchAgencies,
    registerAgency,
    updateAgency,
    deleteAgency,
    fetchAgreements,
  } = useAgencies({ page, pageSize })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      await registerAgency(values)
      setAddModalOpen(false)
      addForm.resetFields()
    } catch (err) {
      setFormError(err.message || 'Failed to register agency')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      await updateAgency(selectedAgency._id, values)
      setEditModalOpen(false)
      setSelectedAgency(null)
      editForm.resetFields()
    } catch (err) {
      setFormError(err.message || 'Failed to update agency')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Agency',
      content: `Are you sure you want to delete "${record.business_name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteAgency(record._id)
        } catch (err) {
          Modal.error({ title: 'Delete Failed', content: err.message })
        }
      },
    })
  }

  const openEdit = (record) => {
    setSelectedAgency(record)
    editForm.setFieldsValue({
      fname: record.fname,
      lname: record.lname,
      TIN: record.TIN,
      business_name: record.business_name,
    })
    setFormError('')
    setEditModalOpen(true)
  }

  const openView = (record) => {
    setSelectedAgency(record)
    setViewModalOpen(true)
  }

  const openAgreements = async (record) => {
    setSelectedAgency(record)
    setAgreements([])
    setAgreementsError('')
    setAgreementsModalOpen(true)
    setAgreementsLoading(true)
    try {
      const data = await fetchAgreements(record._id)
      setAgreements(Array.isArray(data) ? data : [])
    } catch (err) {
      setAgreementsError(err.message || 'Failed to load agreements')
    } finally {
      setAgreementsLoading(false)
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      title: 'Business Name',
      dataIndex: 'business_name',
      key: 'business_name',
      width: 160,
    },
    {
      title: 'First Name',
      dataIndex: 'fname',
      key: 'fname',
      width: 120,
    },
    {
      title: 'Last Name',
      dataIndex: 'lname',
      key: 'lname',
      width: 120,
    },
    {
      title: 'TIN',
      dataIndex: 'TIN',
      key: 'TIN',
      width: 120,
    },
    {
      title: 'Remaining Amount',
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      width: 160,
      render: (v) => (v !== null && v !== undefined ? `ETB ${Number(v).toLocaleString()}` : '-'),
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 140,
      render: (v) => (v !== null && v !== undefined ? `ETB ${Number(v).toLocaleString()}` : '-'),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (v) => v || '-',
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
                icon: <EyeOutlined />,
                onClick: () => openView(record),
              },
              {
                key: 'agreements',
                label: 'View Agreements',
                icon: <FileTextOutlined />,
                onClick: () => openAgreements(record),
              },
              {
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => openEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      ),
    },
  ]

  // ── Agency form fields (shared between Add and Edit) ──────────────────────

  const AgencyFormFields = () => (
    <>
      <Form.Item
        name="fname"
        label="First Name"
        rules={[{ required: true, message: 'Please enter first name' }]}
      >
        <Input placeholder="First name" />
      </Form.Item>
      <Form.Item
        name="lname"
        label="Last Name"
        rules={[{ required: true, message: 'Please enter last name' }]}
      >
        <Input placeholder="Last name" />
      </Form.Item>
      <Form.Item
        name="TIN"
        label="TIN"
        rules={[{ required: true, message: 'Please enter TIN number' }]}
      >
        <Input placeholder="Tax Identification Number" />
      </Form.Item>
      <Form.Item
        name="business_name"
        label="Business Name"
        rules={[{ required: true, message: 'Please enter business name' }]}
      >
        <Input placeholder="Business name" />
      </Form.Item>
    </>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="scrap-transport" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          {/* Page Header */}
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              Agency Registration
            </Title>
            <Text type="secondary">
              Manage scrap transport agencies — register, view, edit and remove agencies.
            </Text>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Card
            style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  <span>Agencies</span>
                  <Tag color="blue">{total}</Tag>
                </Space>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchAgencies}
                    loading={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setFormError(''); setAddModalOpen(true) }}
                    style={{ background: '#262626', borderColor: '#262626' }}
                  >
                    Register Agency
                  </Button>
                </Space>
              </div>
            }
          >
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={agencies}
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (t) => `Total ${t} agencies`,
                onChange: (p, ps) => { setPage(p); setPageSize(ps) },
              }}
              scroll={{ x: 1100 }}
              locale={{ emptyText: 'No agencies registered yet' }}
            />
          </Card>
        </div>
      </div>

      {/* ── Add Agency Modal ── */}
      <Modal
        open={addModalOpen}
        title={
          <Space>
            <PlusOutlined />
            Register New Agency
          </Space>
        }
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); setFormError('') }}
        footer={null}
        destroyOnClose
      >
        {formError && (
          <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />
        )}
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <AgencyFormFields />
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => { setAddModalOpen(false); addForm.resetFields(); setFormError('') }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              style={{ background: '#262626', borderColor: '#262626' }}
            >
              Register
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* ── Edit Agency Modal ── */}
      <Modal
        open={editModalOpen}
        title={
          <Space>
            <EditOutlined />
            Edit Agency
          </Space>
        }
        onCancel={() => { setEditModalOpen(false); setSelectedAgency(null); editForm.resetFields(); setFormError('') }}
        footer={null}
        destroyOnClose
      >
        {formError && (
          <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />
        )}
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <AgencyFormFields />
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => { setEditModalOpen(false); setSelectedAgency(null); editForm.resetFields(); setFormError('') }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              style={{ background: '#262626', borderColor: '#262626' }}
            >
              Update
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* ── View Agency Modal ── */}
      <Modal
        open={viewModalOpen}
        title={
          <Space>
            <EyeOutlined />
            Agency Details
          </Space>
        }
        onCancel={() => { setViewModalOpen(false); setSelectedAgency(null) }}
        footer={[
          <Button key="close" onClick={() => { setViewModalOpen(false); setSelectedAgency(null) }}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedAgency && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 8 }}>
            <Descriptions.Item label="Business Name" span={2}>
              {selectedAgency.business_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="First Name">{selectedAgency.fname || '-'}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{selectedAgency.lname || '-'}</Descriptions.Item>
            <Descriptions.Item label="TIN">{selectedAgency.TIN || '-'}</Descriptions.Item>
            <Descriptions.Item label="Remaining Amount">
              {selectedAgency.remaining_amount !== null
                ? `ETB ${Number(selectedAgency.remaining_amount).toLocaleString()}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Paid Amount">
              {selectedAgency.paid_amount !== null
                ? `ETB ${Number(selectedAgency.paid_amount).toLocaleString()}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">{selectedAgency.created_at || '-'}</Descriptions.Item>
            <Descriptions.Item label="Created By">{selectedAgency.created_by || '-'}</Descriptions.Item>
            <Descriptions.Item label="Updated At">{selectedAgency.updated_at || '-'}</Descriptions.Item>
            <Descriptions.Item label="Updated By">{selectedAgency.updated_by || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* ── Agreements Modal ── */}
      <Modal
        open={agreementsModalOpen}
        title={
          <Space>
            <FileTextOutlined />
            {selectedAgency ? `Agreements — ${selectedAgency.business_name}` : 'Agreements'}
          </Space>
        }
        onCancel={() => { setAgreementsModalOpen(false); setSelectedAgency(null); setAgreements([]) }}
        footer={[
          <Button key="close" onClick={() => { setAgreementsModalOpen(false); setSelectedAgency(null); setAgreements([]) }}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {agreementsError && (
          <Alert type="error" message={agreementsError} showIcon style={{ marginBottom: 12 }} />
        )}
        {agreementsLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : agreements.length === 0 ? (
          <Alert type="info" message="No agreements found for this agency." showIcon />
        ) : (
          agreements.map((agreement, idx) => (
            <div key={agreement._id} style={{ marginBottom: idx < agreements.length - 1 ? 24 : 0 }}>
              {/* Agreement header info */}
              <Descriptions
                bordered
                size="small"
                column={3}
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>{agreement.agreement_name || `Agreement ${idx + 1}`}</span>
                    <Tag color={agreement.status === 'active' ? 'success' : agreement.status === 'expired' ? 'error' : 'default'}>
                      {agreement.status || 'N/A'}
                    </Tag>
                  </Space>
                }
                style={{ marginBottom: 12 }}
              >
                <Descriptions.Item label="TIN">{agreement.TIN || '-'}</Descriptions.Item>
                <Descriptions.Item label="Material Type">{agreement.material_type || '-'}</Descriptions.Item>
                <Descriptions.Item label="Effective Date">{agreement.effective_date || '-'}</Descriptions.Item>
                <Descriptions.Item label="Duration (days)">{agreement.duration || '-'}</Descriptions.Item>
                <Descriptions.Item label="Created At">{agreement.created_at || '-'}</Descriptions.Item>
              </Descriptions>

              {/* Agreement ranges sub-table — filtered to this agency */}
              <Table
                rowKey="_id"
                size="small"
                dataSource={(agreement.agreement_ranges || []).filter(
                  (r) => !selectedAgency || r.agency === selectedAgency._id
                )}
                pagination={false}
                scroll={{ x: 500 }}
                locale={{ emptyText: 'No rate ranges defined' }}
                columns={[
                  {
                    title: 'Min Weight (kg)',
                    dataIndex: 'min_weight',
                    key: 'min_weight',
                    align: 'center',
                    render: (v) => (v !== null && v !== undefined ? Number(v).toLocaleString() : '-'),
                  },
                  {
                    title: 'Max Weight (kg)',
                    dataIndex: 'max_weight',
                    key: 'max_weight',
                    align: 'center',
                    render: (v) => {
                      if (v === null || v === undefined) return '-'
                      const n = Number(v)
                      // Very large float = "unlimited"
                      return n > 1e15 ? '∞ (Unlimited)' : n.toLocaleString()
                    },
                  },
                  {
                    title: 'Rate (ETB/kg)',
                    dataIndex: 'rate',
                    key: 'rate',
                    align: 'center',
                    render: (v) => (v !== null && v !== undefined ? `ETB ${Number(v).toLocaleString()}` : '-'),
                  },
                ]}
              />

              {idx < agreements.length - 1 && <Divider />}
            </div>
          ))
        )}
      </Modal>
    </div>
  )
}

export default AgencyRegistration
