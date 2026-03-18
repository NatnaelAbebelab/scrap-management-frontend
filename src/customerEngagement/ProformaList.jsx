import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  Card,
  Select,
  Input,
  Button,
  Space,
  Modal,
  Descriptions,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Divider,
  Avatar,
  List,
  Dropdown,
  Menu,
  Form,
  message
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  PaperClipOutlined,
  MoreOutlined,
  EyeOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { useProformas } from '../api/useProformas'
import { useApproveProforma } from '../api/useApproveProforma'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { generateProformaPDF } from '../utils/generateProformaPDF'

const { Option } = Select
const { Title, Text } = Typography

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'orange' },
  { value: 'APPROVED', label: 'Approved', color: 'green' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' }
]

const ProformaList = () => {
  const [status, setStatus] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [salesPerson, setSalesPerson] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [approvalModalVisible, setApprovalModalVisible] = useState(false)
  const [selectedProforma, setSelectedProforma] = useState(null)

  const { content: proformas, totalElements, loading, error, refetch } = useProformas({
    status: status || undefined,
    customerName: customerName || undefined,
    salesPerson: salesPerson || undefined,
    pageNumber: page - 1,
    pageSize
  })

  const { approveMarketing, loading: approvalLoading } = useApproveProforma()

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    })
  }

  // Helper to get approval status display with better styling
  const getApprovalStatus = (record) => {
    const status = record?.proformaStatus || 'PENDING'
    const approvedBy = record?.approvedBy

    if (status === 'APPROVED' || approvedBy) {
      return <Badge status="success" text={<Text strong style={{ color: '#52c41a' }}>Approved</Text>} />
    } else if (status === 'MARKETING_APPROVED') {
      return <Badge status="warning" text={<Text strong style={{ color: '#fa8c16' }}>Marketing Approved</Text>} />
    } else if (status === 'PENDING') {
      return <Badge status="processing" text={<Text strong style={{ color: '#faad14' }}>Pending Approval</Text>} />
    } else if (status === 'REJECTED') {
      return <Badge status="error" text={<Text strong style={{ color: '#ff4d4f' }}>Rejected</Text>} />
    } else {
      return <Badge status="default" text={<Text>{status}</Text>} />
    }
  }

  // Get statistics for the dashboard cards
  const getStatistics = () => {
    const pending = proformas.filter(p => p.proformaStatus === 'PENDING').length
    const approved = proformas.filter(p => p.proformaStatus === 'APPROVED' || p.approvedBy).length
    const rejected = proformas.filter(p => p.proformaStatus === 'REJECTED').length

    return { pending, approved, rejected, total: proformas.length }
  }

  const stats = getStatistics()

  // Handle view proforma details
  const handleView = (record) => {
    setSelectedProforma(record)
    setViewModalVisible(true)
  }

  // Handle approve proforma
  const handleApprove = (record) => {
    setSelectedProforma(record)
    setApprovalModalVisible(true)
  }

  // Handle approval success
  const handleApprovalSuccess = (proformaId, approvalType, result) => {
    // Refresh the proformas list to show updated approval status
    if (refetch) {
      refetch()
    }
  }

  // Handle approval submission
  const handleApprovalSubmit = async (remark = '') => {
    try {
      const proformaId = selectedProforma.customerComplaintsId
      await approveMarketing(proformaId, remark)
      message.success('Marketing approval completed successfully')
      setApprovalModalVisible(false)
      setSelectedProforma(null)
      if (refetch) {
        refetch()
      }
    } catch (error) {
      message.error(`Failed to complete approval: ${error.message}`)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'customerComplaintsId',
      key: 'customerComplaintsId',
      width: 60,
      render: (id) => (
        <Text strong style={{ color: '#1890ff' }}>#{id}</Text>
      )
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200,
      render: (name, record) => (
        <div>
          <div><Text strong>{name}</Text></div>
          <div><Text type="secondary" style={{ fontSize: '11px' }}>{record.customerEmail}</Text></div>
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: true,
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          <Text>{description}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      key: 'approvalStatus',
      width: 160,
      render: (_, record) => getApprovalStatus(record)
    },
    {
      title: 'Deadline',
      dataIndex: 'deadlineDate',
      key: 'deadlineDate',
      width: 100,
      render: (date) => (
        <Text style={{ fontSize: '12px' }}>{formatDate(date)}</Text>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 100,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>{formatDate(date)}</Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      render: (_, record) => {
        const isApproved = record?.proformaStatus === 'APPROVED' || record?.approvedBy

        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: () => handleView(record)
          },
          {
            key: 'approve',
            icon: <CheckOutlined />,
            label: isApproved ? 'Already Approved' : 'Approve',
            disabled: isApproved,
            onClick: () => handleApprove(record)
          },
          {
            key: 'pdf',
            icon: <FileTextOutlined />,
            label: 'Generate PDF',
            // Enable for MARKETING_APPROVED or APPROVED status (case-insensitive)
            disabled: !['MARKETING_APPROVED', 'APPROVED'].includes(record?.proformaStatus?.toUpperCase()),
            onClick: () => generateProformaPDF(record)
          }
        ]

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              size="small"
              style={{ border: 'none' }}
            />
          </Dropdown>
        )
      }
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="proformas" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Proforma Management
              </Title>
            </div>
            <Text type="secondary">Manage and track all proforma requests</Text>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Proformas"
                  value={stats.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Pending Approval"
                  value={stats.pending}
                  prefix={<Badge status="processing" />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Approved"
                  value={stats.approved}
                  prefix={<Badge status="success" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Rejected"
                  value={stats.rejected}
                  prefix={<Badge status="error" />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Content Card */}
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e8e8e8'
            }}
          >
            {error && (
              <div style={{
                color: '#ff4d4f',
                marginBottom: 16,
                padding: 12,
                background: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 6
              }}>
                <Text strong>Error loading proformas:</Text> {error.message}
              </div>
            )}

            {/* Filters Section */}
            <Card
              size="small"
              style={{ marginBottom: 16, background: '#fafafa' }}
              title={
                <Space>
                  <SearchOutlined />
                  <Text strong>Filters</Text>
                </Space>
              }
            >
              <Row gutter={16}>
                <Col xs={24} sm={8} md={6}>
                  <Select
                    placeholder="Filter by Status"
                    style={{ width: '100%' }}
                    value={status}
                    onChange={setStatus}
                    allowClear
                  >
                    {statusOptions.map(opt => (
                      <Option key={opt.value} value={opt.value}>
                        <Tag color={opt.color} style={{ marginRight: 8 }}>
                          {opt.label}
                        </Tag>
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Input
                    placeholder="Search Customer Name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Input
                    placeholder="Search Sales Person"
                    value={salesPerson}
                    onChange={e => setSalesPerson(e.target.value)}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={() => { setPage(1) }}
                    >
                      Search
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setStatus('')
                        setCustomerName('')
                        setSalesPerson('')
                        setPage(1)
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={proformas}
              rowKey="customerComplaintsId"
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total: totalElements,
                onChange: (p, ps) => { setPage(p); setPageSize(ps) },
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
              }
            />
          </Card>
        </div>
      </div>

      {/* Enhanced View Proforma Details Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <Text strong>Proforma Details - #{selectedProforma?.customerComplaintsId}</Text>
          </Space>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button
            key="pdf"
            icon={<FileTextOutlined />}
            onClick={() => generateProformaPDF(selectedProforma)}
            disabled={!['MARKETING_APPROVED', 'APPROVED'].includes(selectedProforma?.proformaStatus?.toUpperCase())}
          >
            Generate PDF
          </Button>,
          <Button key="close" type="primary" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedProforma && (
          <div>
            {/* Status Banner */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: selectedProforma.proformaStatus === 'APPROVED' ? '#f6ffed' :
                  selectedProforma.proformaStatus === 'PENDING' ? '#fff7e6' : '#fff2f0',
                border: `1px solid ${selectedProforma.proformaStatus === 'APPROVED' ? '#b7eb8f' :
                  selectedProforma.proformaStatus === 'PENDING' ? '#ffd591' : '#ffb3b3'}`
              }}
            >
              <Row justify="center" align="middle">
                <Col>
                  {getApprovalStatus(selectedProforma)}
                </Col>
              </Row>
            </Card>

            {/* Main Details */}
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 2 }}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item
                label={<Text strong><UserOutlined /> Customer</Text>}
                span={1}
              >
                <Space orientation="vertical" size={0}>
                  <Text strong style={{ fontSize: '16px' }}>{selectedProforma.customerName}</Text>
                  <Text type="secondary">{selectedProforma.customerEmail}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>TIN Number</Text>}
                span={1}
              >
                <Text code>{selectedProforma.customers?.tin || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Company</Text>}
                span={1}
              >
                <Text>{selectedProforma.company?.companyName || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong><CalendarOutlined /> Deadline</Text>}
                span={1}
              >
                <Text strong style={{ color: '#faad14' }}>
                  {formatDate(selectedProforma.deadlineDate)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Created</Text>}
                span={1}
              >
                <Text type="secondary">{formatDate(selectedProforma.createdDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Description</Text>}
                span={2}
              >
                <Text>{selectedProforma.description}</Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Materials Section */}
            {selectedProforma.materials && selectedProforma.materials.length > 0 && (
              <Card
                title={
                  <Space>
                    <DollarOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Materials & Pricing</Text>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={selectedProforma.materials}
                  renderItem={(material, index) => (
                    <List.Item>
                      <Card
                        size="small"
                        style={{ width: '100%', background: '#fafafa' }}
                      >
                        <Row gutter={16} align="middle">
                          <Col xs={24} sm={8}>
                            <Text strong style={{ fontSize: '16px' }}>
                              {material.materialName}
                            </Text>
                          </Col>
                          <Col xs={12} sm={4}>
                            <Statistic
                              title="Quantity"
                              value={material.quantity}
                              suffix={material.uom}
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col xs={12} sm={4}>
                            <Statistic
                              title="Unit Price"
                              value={material.unitPrice}
                              prefix="$"
                              valueStyle={{ fontSize: '14px' }}
                            />
                          </Col>
                          <Col xs={24} sm={8}>
                            <Statistic
                              title="Total Price"
                              value={material.totalPrice}
                              prefix="$"
                              styles={{ content: { fontSize: '16px', color: '#52c41a', fontWeight: 'bold' } }}
                            />
                          </Col>
                        </Row>
                      </Card>
                    </List.Item>
                  )}
                />
                <Divider />
                <Row justify="end">
                  <Col>
                    <Statistic
                      title="Grand Total"
                      value={selectedProforma.materials.reduce((sum, m) => sum + (m.totalPrice || 0), 0)}
                      prefix="$"
                      styles={{ content: { fontSize: '20px', color: '#1890ff', fontWeight: 'bold' } }}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* Attachments Section */}
            {selectedProforma.attachement && selectedProforma.attachement.length > 0 && (
              <Card
                title={
                  <Space>
                    <PaperClipOutlined style={{ color: '#722ed1' }} />
                    <Text strong>Attachments</Text>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={selectedProforma.attachement}
                  renderItem={(attachment, index) => (
                    <List.Item>
                      <Space>
                        <Avatar icon={<PaperClipOutlined />} size="small" />
                        <Text>{attachment}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Approval Details */}
            {(selectedProforma.approvedBy || selectedProforma.remark) && (
              <Card
                title={
                  <Space>
                    <Badge status="success" />
                    <Text strong>Approval Details</Text>
                  </Space>
                }
                size="small"
              >
                {selectedProforma.approvedBy && (
                  <Descriptions.Item label="Approved By" span={1}>
                    <Space>
                      <Avatar icon={<UserOutlined />} size="small" />
                      <Text strong>{selectedProforma.approvedBy}</Text>
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedProforma.remark && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Remark:</Text>
                    <div style={{
                      marginTop: 4,
                      padding: 8,
                      background: '#f0f0f0',
                      borderRadius: 4,
                      border: '1px solid #d9d9d9'
                    }}>
                      <Text>{selectedProforma.remark}</Text>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Approve Proforma Request"
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false)
          setSelectedProforma(null)
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setApprovalModalVisible(false)
            setSelectedProforma(null)
          }}>
            Cancel
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={approvalLoading}
            onClick={() => handleApprovalSubmit()}
            icon={<CheckOutlined />}
          >
            Approve
          </Button>
        ]}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          <Text>Are you sure you want to approve this proforma request?</Text>
          {selectedProforma && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <Text strong>Proforma #{selectedProforma.customerComplaintsId}</Text>
              <br />
              <Text type="secondary">{selectedProforma.customerName}</Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ProformaList
