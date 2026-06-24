import React, { useState } from 'react'
import { Card, Typography, Form, Input, Select, DatePicker, Button, Space, message, Modal, Tag, Alert, Dropdown } from 'antd'
import { SearchOutlined, ClearOutlined, CheckCircleOutlined, DollarOutlined, MoreOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import DataTableWithPagination from '../components/DataTableWithPagination'
import { useDailyTransportAggregate } from '../api/useDailyTransportAggregate'
import { formatDate } from '../utils/dateFormatter'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'
import useRoleAccess from '../components/accessControl/useRoleAccess'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const DailyTransportAggregate = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({})
  const [filterForm] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const { filterByRole } = useRoleAccess()

  const {
    records,
    total,
    loading,
    error,
    submitting,
    materialTypes,
    approveRecords,
    payRecords,
    refresh
  } = useDailyTransportAggregate({ page, pageSize, filters })

  const materialOptions = Object.entries(materialTypes || {}).map(([val, label]) => ({
    value: val,
    label: (label || val).toUpperCase()
  }))

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilters({})
    setPage(1)
  }

  const handleFilterApply = (values) => {
    const { dates, ...rest } = values
    const newFilters = { ...rest }
    if (dates && dates.length === 2) {
      newFilters.start_date = dates[0].format('YYYY-MM-DD')
      newFilters.end_date = dates[1].format('YYYY-MM-DD')
    }
    // Clean up empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key]) delete newFilters[key]
    })
    setFilters(newFilters)
    setPage(1)
  }

  const handleApproveAction = async (ids) => {
    Modal.confirm({
      title: `Approve Records`,
      content: `Are you sure you want to approve ${ids.length} daily scrap mov't records?`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await approveRecords(ids)
          if (res.result === 'success') {
            message.success(res.message)
            setSelectedRowKeys([])
            refresh()
          } else {
            message.error(res.message || 'Operation failed')
          }
        } catch (err) {
          message.error(err.message || 'Operation failed')
        }
      }
    })
  }

  const handlePayAction = async (ids) => {
    Modal.confirm({
      title: `Pay Records`,
      content: `Are you sure you want to pay ${ids.length} records?`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await payRecords(ids)
          if (res.result === 'success') {
            message.success(res.message)
            setSelectedRowKeys([])
            refresh()
          } else {
            message.error(res.message || 'Operation failed')
          }
        } catch (err) {
          message.error(err.message || 'Operation failed')
        }
      }
    })
  }

  const getActionItems = (record) => {
    const items = [
      {
        key: 'approve',
        label: 'Approve',
        icon: <CheckCircleOutlined />,
        disabled: record.status !== 'new',
        onClick: () => handleApproveAction([record._id]),
        allowedRoles: ['super_admin', 'supervisor', 'property_admin_finance']
      },
      {
        key: 'pay',
        label: 'Pay',
        icon: <DollarOutlined />,
        disabled: record.status !== 'approved',
        onClick: () => handlePayAction([record._id]),
        allowedRoles: ['super_admin', 'finance']
      }
    ]
    return filterByRole(items)
  }

  const columns = [
    {
      title: 'TIN',
      dataIndex: 'TIN',
      key: 'TIN',
      width: 110,
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 130,
      render: (v) => (
        <Tag color="blue" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {v || '-'}
        </Tag>
      )
    },
    {
      title: 'Daily Net Weight (Kg)',
      dataIndex: 'daily_net_weight',
      key: 'daily_net_weight',
      width: 160,
      render: (v) => <Text strong>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (v) => <Text>{v ? Number(v).toLocaleString() : '-'}</Text>
    },
    {
      title: 'Net Price (Br.)',
      dataIndex: 'net_price',
      key: 'net_price',
      width: 140,
      render: (v) => <Text strong style={{ color: '#52c41a' }}>{v ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</Text>
    },
    {
      title: 'Weight Date',
      dataIndex: 'weight_date',
      key: 'weight_date',
      width: 130,
      render: (v) => <Text>{v ? formatDate(v) : '-'}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v) => {
        if (!v) return '-'
        const status = v.toLowerCase()
        let color = 'gold'
        if (['approved', 'paid', 'verified'].includes(status)) color = 'success'
        if (['new', 'pending'].includes(status)) color = 'processing'

        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {v.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      )
    }
  ]

  const selectedRecords = records.filter(r => selectedRowKeys.includes(r._id))
  const anyNew = selectedRecords.some(r => r.status === 'new')
  const allApproved = selectedRowKeys.length > 0 && selectedRecords.every(r => r.status === 'approved')
  const allPaid = selectedRowKeys.length > 0 && selectedRecords.every(r => r.status === 'paid')

  const showBulkApprove = selectedRowKeys.length > 0 && anyNew && !allPaid
  const showBulkPay = selectedRowKeys.length > 0 && allApproved && !allPaid

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Daily Aggregated Scrap Transport</Title>
              <Text type="secondary">
                View and manage daily aggregated scrap transport metrics and payments.
              </Text>
            </div>
          </div>

          <Card style={{
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: 'none',
            marginBottom: 24
          }}>
            <Form form={filterForm} layout="vertical" onFinish={handleFilterApply}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
                <Form.Item name="tin" label="TIN" style={{ marginBottom: 16 }}>
                  <Input placeholder="Search TIN" size="large" style={{ borderRadius: 6, width: 250 }} />
                </Form.Item>
                <Form.Item name="material_type" label="Material Type" style={{ marginBottom: 16 }}>
                  <Select
                    placeholder="Select Material"
                    size="large"
                    style={{ borderRadius: 6, width: 250 }}
                    allowClear
                    options={materialOptions}
                  />
                </Form.Item>
                <Form.Item name="status" label="Status" style={{ marginBottom: 16 }}>
                  <Select placeholder="Filter Status" size="large" style={{ borderRadius: 6, width: 180 }} allowClear>
                    <Option value="new">New</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="paid">Paid</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="dates" label="Weight Date Range" style={{ marginBottom: 16 }}>
                  <RangePicker size="large" style={{ borderRadius: 6, width: 300 }} />
                </Form.Item>
                <div style={{ marginBottom: 16 }}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                      style={{ borderRadius: 6, background: 'rgb(245, 34, 45)' }}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={handleFilterReset}
                      icon={<ClearOutlined />}
                      style={{ borderRadius: 6 }}
                    >
                      Reset Filters
                    </Button>
                  </Space>
                </div>
              </div>
            </Form>
          </Card>

          {(showBulkApprove || showBulkPay) && (
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                {showBulkApprove && (
                  <RoleBasedComponentAccess allowedRoles={['super_admin', 'supervisor']}>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApproveAction(selectedRowKeys)}
                      style={{ borderRadius: 6, background: '#13c2c2', borderColor: '#13c2c2' }}
                    >
                      Bulk Approve ({selectedRowKeys.length})
                    </Button>
                  </RoleBasedComponentAccess>
                )}
                {showBulkPay && (
                  <RoleBasedComponentAccess allowedRoles={['super_admin', 'finance']}>
                    <Button
                      type="primary"
                      icon={<DollarOutlined />}
                      onClick={() => handlePayAction(selectedRowKeys)}
                      style={{ borderRadius: 6, background: '#52c41a', borderColor: '#52c41a' }}
                    >
                      Bulk Pay ({selectedRowKeys.length})
                    </Button>
                  </RoleBasedComponentAccess>
                )}
              </Space>
            </div>
          )}

          <Card
            style={{
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: 'none'
            }}
          >
            {error && (
              <Alert
                type="error"
                message="Data Load Error"
                description={error}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <DataTableWithPagination
              selectable={true}
              selectedRowKeys={selectedRowKeys}
              onSelectionChange={setSelectedRowKeys}
              columns={columns}
              dataSource={records}
              rowKey="_id"
              loading={loading || submitting}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DailyTransportAggregate
