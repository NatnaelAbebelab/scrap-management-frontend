import { useState, useEffect } from 'react'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MoreOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { Card, Button, Form, Input, Space, Modal, message, Typography, Table, Tag, DatePicker, Select, Divider, Dropdown, InputNumber } from 'antd'
import { useMaterialIssue } from '../api/useMaterialIssue'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'
import dayjs from 'dayjs'
import { formatDate } from '../utils/dateFormatter'
import { extractApiError } from '../utils/messageFormatter'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'
import useRoleAccess from '../components/accessControl/useRoleAccess'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const MaterialIssue = () => {
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingIssue, setEditingIssue] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [form] = Form.useForm()
  const { filterByRole } = useRoleAccess()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    requisition_no: '',
    issue_no: '',
    issue_status: null,
    start_date: null,
    end_date: null
  })
  const [tempFilters, setTempFilters] = useState({ ...filters })

  const {
    issues,
    total,
    loading,
    approvedRequisitions,
    requisitionsLoading,
    fetchApprovedRequisitions,
    fetchIssues,
    addIssue,
    updateIssue,
    deleteIssue,
    getIssueDetail,
    changeIssueStatus
  } = useMaterialIssue({ page, pageSize, filters })

  useEffect(() => {
    fetchApprovedRequisitions()
  }, [fetchApprovedRequisitions])

  const columns = [
    {
      title: 'Issue No',
      dataIndex: 'issue_no',
      key: 'issue_no',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Req No',
      dataIndex: ['material_requisition_detail', 'requisition_no'],
      key: 'requisition_no',
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>
    },
    {
      title: 'Melting Plant',
      dataIndex: ['material_requisition_detail', 'melting_plant', 'plant_name'],
      key: 'melting_plant',
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>
    },
    {
      title: 'Issue Date',
      dataIndex: 'issue_date',
      key: 'issue_date',
      render: (text) => <Text style={{ fontWeight: 600 }}>{formatDate(text)}</Text>
    },
    {
      title: 'Quantity (Kg)',
      dataIndex: 'issue_weight',
      key: 'issue_weight',
      render: (text) => <Text style={{ fontWeight: 700 }}>{Number(text).toLocaleString()}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'issue_status',
      key: 'issue_status',
      render: (status) => {
        let color = 'gold'
        if (status === 'issued') color = 'blue'
        if (status === 'approved') color = 'green'
        if (status === 'new') color = 'cyan'
        return <Tag color={color}>{status?.toUpperCase() || ''}</Tag>
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

        if (record.issue_status !== 'approved') {
          items.push(
            {
              key: 'edit',
              label: 'Edit',
              icon: <EditOutlined />,
              onClick: () => handleEditClick(record),
              allowedRoles: ['super_admin', 'supervisor']
            },
            {
              key: 'status',
              label: 'Change Status',
              icon: <CheckCircleOutlined />,
              onClick: () => handleChangeStatusPrompt([record._id]),
              allowedRoles: ['super_admin', 'supervisor']
            },
            {
              type: 'divider'
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: <DeleteOutlined />,
              danger: true,
              onClick: () => showDeleteConfirm(record),
              allowedRoles: ['super_admin', 'supervisor']
            }
          );
        }

        return (
          <Dropdown menu={{ items: filterByRole(items) }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ]

  const handleEditClick = (record) => {
    setEditingIssue(record)
    const req = record.material_requisition_detail
    setSelectedReq(req)
    form.setFieldsValue({
      material_requisition: req?._id,
      issue_no: record.issue_no,
      issue_date: dayjs(record.issue_date),
      issue_weight: record.issue_weight
    })
    setModalVisible(true)
  }

  const handleViewDetail = async (record) => {
    try {
      const resp = await getIssueDetail(record._id)
      if (resp.result === 'success') {
        setSelectedIssue(resp.content)
        setDetailVisible(true)
      } else {
        message.error(resp.message || 'Failed to fetch details')
      }
    } catch (e) {
      message.error('Err fetching details')
    }
  }

  const handleChangeStatusPrompt = (ids) => {
    Modal.confirm({
      title: 'Change Status',
      icon: <CheckCircleOutlined />,
      content: (
        <div style={{ marginTop: 16 }}>
          <Text>Select new status for {ids.length} item(s):</Text>
          <Select
            placeholder="Select Status"
            style={{ width: '100%', marginTop: 8 }}
            onChange={(val) => (window.tempStatus = val)}
            getPopupContainer={triggerNode => triggerNode.parentElement}
          >
            <Option value="new">New</Option>
            <Option value="issued">Issued</Option>
            <Option value="approved">Approved</Option>
          </Select>
        </div>
      ),
      onOk: async () => {
        if (!window.tempStatus) {
          message.warning('Please select a status')
          return Promise.reject()
        }
        try {
          const res = await changeIssueStatus(ids, window.tempStatus)
          if (res.result === 'success') {
            message.success('Status updated successfully')
            setSelectedRowKeys([])
          } else {
            message.error(extractApiError(res))
          }
        } catch (e) {
          message.error('Status update error')
        }
      }
    })
  }

  const showDeleteConfirm = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this issue?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await deleteIssue(record._id)
          if (res.result === 'success') message.success('Issue deleted')
          else message.error(extractApiError(res))
        } catch (e) { message.error('Delete error') }
      }
    })
  }

  const handleSubmit = async (values) => {
    const payload = {
      material_requisition: values.material_requisition,
      issue_no: values.issue_no,
      issue_date: values.issue_date.format('YYYY-MM-DD'),
      issue_weight: values.issue_weight
    }

    try {
      let resp
      if (editingIssue) {
        resp = await updateIssue(editingIssue._id, payload)
      } else {
        resp = await addIssue(payload)
      }

      if (resp.result === 'success') {
        message.success(resp.message || 'Saved successfully')
        handleCloseModal()
      } else {
        message.error(extractApiError(resp))
      }
    } catch (e) {
      message.error('An error occurred')
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setEditingIssue(null)
    setSelectedReq(null)
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

  const handleResetFilters = () => {
    const initialFilters = {
      requisition_no: '',
      issue_no: '',
      issue_status: null,
      start_date: null,
      end_date: null
    }
    setTempFilters(initialFilters)
    setFilters(initialFilters)
    setPage(1)
  }

  const onReqChange = (val) => {
    const req = approvedRequisitions.find(r => r._id === val)
    setSelectedReq(req)
    if (req) {
      form.setFieldsValue({ issue_weight: Math.min(form.getFieldValue('issue_weight') || 0, req.total_requisition_quantity) })
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={3}>Raw Material Issue Management</Title>
              <Text type="secondary">Track and manage raw material issues from requisitions.</Text>
            </div>
            <Space>
              {selectedRowKeys.length > 0 && (
                <RoleBasedComponentAccess allowedRoles={['super_admin', 'supervisor']}>
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleChangeStatusPrompt(selectedRowKeys)}
                  >
                    Change {selectedRowKeys.length} Statuses
                  </Button>
                </RoleBasedComponentAccess>
              )}
              <RoleBasedComponentAccess allowedRoles={['super_admin', 'supervisor']}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible(true)}
                  style={{ borderRadius: '8px' }}
                >
                  Add Material Issue
                </Button>
              </RoleBasedComponentAccess>
            </Space>
          </div>

          <Card style={{ borderRadius: '10px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Issue No:</Text>
                <Input
                  size="large"
                  placeholder="ISS-001"
                  value={tempFilters.issue_no}
                  onChange={(e) => handleFilterChange('issue_no', e.target.value)}
                />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Req No:</Text>
                <Input
                  size="large"
                  placeholder="REQ-001"
                  value={tempFilters.requisition_no}
                  onChange={(e) => handleFilterChange('requisition_no', e.target.value)}
                />
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
              <div style={{ flex: '1 1 150px' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Status:</Text>
                <Select
                  placeholder="Select Status"
                  style={{ width: '100%' }}
                  allowClear
                  size="large"
                  value={tempFilters.issue_status}
                  onChange={(val) => handleFilterChange('issue_status', val)}
                >
                  <Option value="new">New</Option>
                  <Option value="issued">Issued</Option>
                  <Option value="approved">Approved</Option>
                </Select>
              </div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilters}
                style={{ borderRadius: '8px', minWidth: '120px' }}
              >
                Search
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                style={{ borderRadius: '8px' }}
              >
                Reset Filters
              </Button>
            </div>
          </Card>

          <Card style={{ borderRadius: '10px' }}>
            <DataTableWithPagination
              columns={columns}
              dataSource={issues}
              rowKey="_id"
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => { setPage(p); setPageSize(ps) }}
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys)
              }}
            />
          </Card>

          {/* Add/Edit Modal */}
          <Modal
            open={modalVisible}
            title={editingIssue ? "Edit Material Issue" : "Add Material Issue"}
            onCancel={handleCloseModal}
            footer={null}
            centered
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 12 }}>
              <Form.Item
                name="material_requisition"
                label="Select Approved Requisition"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select
                  placeholder="Select Requisition"
                  loading={requisitionsLoading}
                  onChange={onReqChange}
                  disabled={!!editingIssue}
                >
                  {approvedRequisitions.map(r => (
                    <Option key={r._id} value={r._id}>
                      {r.requisition_no} - {formatDate(r.requisition_date)} (Qty: {r.total_requisition_quantity})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedReq && (
                <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <Text type="secondary">Available Requisition Quantity: </Text>
                  <Text strong>{selectedReq.total_requisition_quantity}</Text>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name="issue_no"
                  label="Issue Number"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="ISS-001" />
                </Form.Item>
                <Form.Item
                  name="issue_date"
                  label="Issue Date"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="issue_weight"
                label="Issue Quantity (Kg)"
                rules={[
                  { required: true, message: 'Required' },
                  {
                    validator: (_, value) => {
                      if (selectedReq && value > selectedReq.total_requisition_quantity) {
                        return Promise.reject(`Maximum allowed quantity is ${selectedReq.total_requisition_quantity}`)
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="500.00"
                  max={selectedReq ? selectedReq.total_requisition_quantity : undefined}
                />
              </Form.Item>

              <Space style={{ display: 'flex', justifyContent: 'end', marginTop: 24 }}>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingIssue ? "Update Issue" : "Issue Material"}
                </Button>
              </Space>
            </Form>
          </Modal>

          {/* View Modal */}
          <Modal
            open={detailVisible}
            title="Material Issue Detail"
            onCancel={() => setDetailVisible(false)}
            footer={[<Button key="close" onClick={() => setDetailVisible(false)}>Close</Button>]}
            centered
            width={700}
          >
            {selectedIssue && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Issue No:</Text>
                    <Title level={5} style={{ marginTop: 4 }}>{selectedIssue.issue_no}</Title>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Status:</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={selectedIssue.issue_status === 'approved' ? 'green' : selectedIssue.issue_status === 'issued' ? 'blue' : 'cyan'}>
                        {selectedIssue.issue_status?.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Date:</Text>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{formatDate(selectedIssue.issue_date)}</div>
                  </div>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Issued Quantity:</Text>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: '15px' }}>{Number(selectedIssue.issue_weight).toLocaleString()} Kg</div>
                  </div>
                </div>

                {selectedIssue.material_requisition_detail && (
                  <>
                    <Divider orientation="left">Requisition Reference</Divider>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <Text strong style={{ color: '#595959' }}>Req No:</Text>
                        <div style={{ fontWeight: 700, marginTop: 4 }}>{selectedIssue.material_requisition_detail.requisition_no}</div>
                      </div>
                      <div>
                        <Text strong style={{ color: '#595959' }}>Melting Plant:</Text>
                        <div style={{ fontWeight: 700, marginTop: 4 }}>{selectedIssue.material_requisition_detail.melting_plant?.plant_name}</div>
                      </div>
                      <div>
                        <Text strong style={{ color: '#595959' }}>Requisition Qty:</Text>
                        <div style={{ fontWeight: 700, marginTop: 4 }}>{selectedIssue.material_requisition_detail.total_requisition_quantity?.toLocaleString()} Kg</div>
                      </div>
                    </div>

                    <Divider orientation="left" style={{ margin: '32px 0 16px' }}>Requisition Items</Divider>
                    <Table
                      dataSource={selectedIssue.material_requisition_detail.items || []}
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
                  </>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default MaterialIssue
