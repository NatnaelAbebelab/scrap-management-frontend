"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import {
  Input,
  Select,
  Button,
  Table,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Divider,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Avatar,
  Dropdown,
  message
} from "antd"
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
  ExportOutlined,
  ReloadOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  MoreOutlined,
  EyeOutlined,
  CheckOutlined,
  ArrowRightOutlined
} from "@ant-design/icons"
import Header from "../layouts/Header"
import Sidebar from "../layouts/Sidebar"
import { Link } from 'react-router-dom'
import { useComplaints, useUpdateComplaintToProgress, useComplaintDetails } from '../api/useComplaints'

const { Option } = Select
const { Title, Text } = Typography
const { TextArea } = Input

const statusOptions = [
  { value: 'SUBMITTED', label: 'Submitted', color: 'orange' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'CLOSED', label: 'Closed', color: 'green' }
]

const CustomerEngagement = () => {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [complaintDetails, setComplaintDetails] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const searchRef = useRef(null)

  // Map UI status to API status
  const apiStatus = statusFilter || undefined

  const { content: complaints, totalElements, loading, error, refetch } = useComplaints({
    status: apiStatus,
    customerName: searchText || undefined,
    pageNumber: page - 1,
    pageSize
  })

  const { updateToProgress, loading: progressLoading } = useUpdateComplaintToProgress()
  const { fetchComplaintDetails, loading: detailsLoading } = useComplaintDetails()

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    })
  }

  // Helper to get status display with better styling
  const getStatusDisplay = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status) || { color: 'default', label: status }
    return <Badge status={status === 'CLOSED' ? 'success' : status === 'IN_PROGRESS' ? 'processing' : 'warning'} text={<Text strong style={{ color: statusConfig.color === 'green' ? '#52c41a' : statusConfig.color === 'blue' ? '#1890ff' : '#faad14' }}>{statusConfig.label}</Text>} />
  }

  // Get statistics for the dashboard cards
  const getStatistics = () => {
    const submitted = complaints.filter(c => c.customerComplaintsStatus === 'SUBMITTED').length
    const inProgress = complaints.filter(c => c.customerComplaintsStatus === 'IN_PROGRESS').length
    const closed = complaints.filter(c => c.customerComplaintsStatus === 'CLOSED').length

    return { submitted, inProgress, closed, total: complaints.length }
  }

  const stats = getStatistics()

  // Handle view complaint details
  const handleView = async (record) => {
    setSelectedComplaint(record)
    setDetailsModalVisible(true)
    try {
      const details = await fetchComplaintDetails(record.customerComplaintsId)
      setComplaintDetails(details)
    } catch (error) {
      message.error(`Failed to fetch complaint details: ${error.message}`)
      setComplaintDetails(null)
    }
  }

  // Handle update to progress
  const handleUpdateToProgress = (record) => {
    setSelectedComplaint(record)
    setProgressModalVisible(true)
  }

  // Handle progress form submission
  const handleProgressSubmit = async (values) => {
    try {
      const complaintId = selectedComplaint.customerComplaintsId
      await updateToProgress(complaintId, values.remark || '')
      message.success('Complaint updated to progress successfully')
      setProgressModalVisible(false)
      setSelectedComplaint(null)
      form.resetFields()
      if (refetch) {
        refetch()
      }
    } catch (error) {
      message.error(`Failed to update complaint: ${error.message}`)
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
      key: 'status',
      width: 160,
      render: (_, record) => getStatusDisplay(record.customerComplaintsStatus)
    },
    {
      title: 'Material',
      dataIndex: 'purchasedMaterial',
      key: 'purchasedMaterial',
      width: 100,
      render: (material) => (
        <Text style={{ fontSize: '12px' }}>{material || '-'}</Text>
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
        const isSubmitted = record.customerComplaintsStatus === 'SUBMITTED'
        const isInProgress = record.customerComplaintsStatus === 'IN_PROGRESS'
        const isClosed = record.customerComplaintsStatus === 'CLOSED'

        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: () => handleView(record)
          },
          {
            key: 'progress',
            icon: <ArrowRightOutlined />,
            label: isInProgress ? 'Already In Progress' : isClosed ? 'Already Closed' : 'Update to Progress',
            disabled: isInProgress || isClosed,
            onClick: () => handleUpdateToProgress(record)
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
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Customer Complaints
              </Title>
            </div>
            <Text type="secondary">Manage and track all customer complaints</Text>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Complaints"
                  value={stats.total}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Submitted"
                  value={stats.submitted}
                  prefix={<Badge status="warning" />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="In Progress"
                  value={stats.inProgress}
                  prefix={<Badge status="processing" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Closed"
                  value={stats.closed}
                  prefix={<Badge status="success" />}
                  valueStyle={{ color: '#52c41a' }}
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
                <Text strong>Error loading complaints:</Text> {error}
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
                    value={statusFilter}
                    onChange={setStatusFilter}
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
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    prefix={<UserOutlined />}
                    ref={searchRef}
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
                        setStatusFilter('')
                        setSearchText('')
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
              dataSource={complaints}
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

      {/* Enhanced Details Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <Text strong>Complaint Details - #{selectedComplaint?.customerComplaintsId}</Text>
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false)
          setSelectedComplaint(null)
          setComplaintDetails(null)
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => {
            setDetailsModalVisible(false)
            setSelectedComplaint(null)
            setComplaintDetails(null)
          }}>
            Close
          </Button>
        ]}
        width={700}
        style={{ top: 20 }}
      >
        {detailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text>Loading complaint details...</Text>
          </div>
        ) : complaintDetails ? (
          <div>
            {/* Status Banner */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: complaintDetails.customerComplaintsStatus === 'CLOSED' ? '#f6ffed' :
                  complaintDetails.customerComplaintsStatus === 'IN_PROGRESS' ? '#e6f7ff' : '#fff7e6',
                border: `1px solid ${complaintDetails.customerComplaintsStatus === 'CLOSED' ? '#b7eb8f' :
                  complaintDetails.customerComplaintsStatus === 'IN_PROGRESS' ? '#91d5ff' : '#ffd591'}`
              }}
            >
              <Row justify="center" align="middle">
                <Col>
                  {getStatusDisplay(complaintDetails.customerComplaintsStatus)}
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
                  <Text strong style={{ fontSize: '16px' }}>{complaintDetails.customerName}</Text>
                  <Text type="secondary">{complaintDetails.customerEmail}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Shop/Branch</Text>}
                span={1}
              >
                <Text>{complaintDetails.shop || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Material</Text>}
                span={1}
              >
                <Text>{complaintDetails.purchasedMaterial || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong><CalendarOutlined /> Created</Text>}
                span={1}
              >
                <Text type="secondary">{formatDate(complaintDetails.createdDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Interaction Date</Text>}
                span={1}
              >
                <Text type="secondary">{formatDate(complaintDetails.interactionDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Last Modified</Text>}
                span={1}
              >
                <Text type="secondary">{formatDate(complaintDetails.lastModifiedDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Description</Text>}
                span={2}
              >
                <Text>{complaintDetails.description}</Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Attachments Section */}
            {complaintDetails.attachement && complaintDetails.attachement.length > 0 && (
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
                  dataSource={complaintDetails.attachement}
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

            {/* Remark Section */}
            {complaintDetails.remark && (
              <Card
                title={
                  <Space>
                    <Badge status="default" />
                    <Text strong>Remark</Text>
                  </Space>
                }
                size="small"
              >
                <div style={{
                  padding: 8,
                  background: '#f0f0f0',
                  borderRadius: 4,
                  border: '1px solid #d9d9d9'
                }}>
                  <Text>{complaintDetails.remark}</Text>
                </div>
              </Card>
            )}

            {/* Sales Person Section */}
            {complaintDetails.salesPerson && (
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Sales Person</Text>
                  </Space>
                }
                size="small"
                style={{ marginTop: 16 }}
              >
                <Text>{complaintDetails.salesPerson}</Text>
              </Card>
            )}
          </div>
        ) : selectedComplaint ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Failed to load complaint details</Text>
          </div>
        ) : null}
      </Modal>

      {/* Update to Progress Modal */}
      <Modal
        title={
          <Space>
            <ArrowRightOutlined style={{ color: '#1890ff' }} />
            <Text strong>Update Complaint to Progress</Text>
          </Space>
        }
        open={progressModalVisible}
        onCancel={() => {
          setProgressModalVisible(false)
          setSelectedComplaint(null)
          form.resetFields()
        }}
        footer={null}
        width={500}
        style={{ top: 50 }}
      >
        <Card style={{ background: '#fafafa', marginBottom: 16 }}>
          <Text type="secondary">
            You are about to update this complaint status to "In Progress". Please add any remarks if necessary.
          </Text>
        </Card>

        {selectedComplaint && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <Text strong>Complaint #{selectedComplaint.customerComplaintsId}</Text>
            <br />
            <Text type="secondary">{selectedComplaint.customerName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{selectedComplaint.description}</Text>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleProgressSubmit}
        >
          <Form.Item
            name="remark"
            label={<Text strong style={{ fontSize: '16px' }}>Remark (Optional)</Text>}
          >
            <TextArea
              rows={4}
              placeholder="Enter any remarks or comments for this status update..."
              maxLength={500}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setProgressModalVisible(false)
                  setSelectedComplaint(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={progressLoading}
                icon={<ArrowRightOutlined />}
                size="large"
                style={{ background: '#1890ff', borderColor: '#1890ff', minWidth: 140 }}
              >
                Update to Progress
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CustomerEngagement
