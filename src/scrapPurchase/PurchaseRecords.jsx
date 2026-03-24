import React, { useState, useEffect } from 'react'
import { Card, Typography, Alert, Dropdown, Modal, Descriptions, Tag, Button, Space, Form, InputNumber, message, Row, Col, Input } from 'antd'
import { MoreOutlined, EditOutlined, EyeOutlined, RollbackOutlined, DeleteOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { usePurchaseRecords } from '../api/usePurchaseRecords'
import { usePurchaseActions } from '../api/usePurchaseActions'
import DataTableWithPagination from '../components/DataTableWithPagination'
import { formatDate } from '../utils/dateFormatter'
import MultiSelectInput from '../components/MultiSelectInput'
import FileUploadInput from '../components/FileUploadInput'
import SelectInput from '../components/SelectInput'

const { Title, Text } = Typography

const PurchaseRecords = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewRecord, setViewRecord] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [showId, setShowId] = useState(false)

  const [wasteModalOpen, setWasteModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [wasteForm] = Form.useForm()

  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusForm] = Form.useForm()
  const [statusOptions, setStatusOptions] = useState([])
  const [modalMode, setModalMode] = useState('bulk') // 'bulk' or 'single'
  const [loadingStatuses, setLoadingStatuses] = useState(false)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const { records, total, loading, error, refresh } = usePurchaseRecords({ page, pageSize })
  const { addWasteDeduction, changeGrnStatus, rollbackGrnStatus, deleteGrnRecord, fetchStatusList, isSubmitting } = usePurchaseActions()

  // Initial load of status options
  useEffect(() => {
    loadStatusOptions()
  }, [])

  const loadStatusOptions = async () => {
    setLoadingStatuses(true)
    try {
      const list = await fetchStatusList()
      if (list && Array.isArray(list)) {
        setStatusOptions(list)
      }
    } catch (err) {
      console.error('Error in status fetching:', err)
    } finally {
      setLoadingStatuses(false)
    }
  }

  const onSelectionChange = (keys) => {
    setSelectedRowKeys(keys)
  }

  const handleView = (record) => {
    setViewRecord(record)
    setViewModalOpen(true)
  }

  const handleAddWaste = (record) => {
    setSelectedRecord(record)
    setWasteModalOpen(true)
    wasteForm.resetFields()
    wasteForm.setFieldsValue({ waste: 0 })
  }

  const handleOpenStatusModal = async (record = null) => {
    // If we don't have status options yet, ensure we try to load them
    if (statusOptions.length === 0) {
      await loadStatusOptions()
    }

    statusForm.resetFields()
    if (record) {
      setModalMode('single')
      statusForm.setFieldsValue({ record_no: record.record_no })
    } else {
      setModalMode('bulk')
      const selectedNos = records
        .filter(r => selectedRowKeys.includes(r._id))
        .map(r => r.record_no)
      statusForm.setFieldsValue({ record_no: selectedNos })
    }
    setStatusModalOpen(true)
  }

  const onWasteFinish = async (values) => {
    try {
      const res = await addWasteDeduction({
        record_no: selectedRecord.record_no,
        waste: values.waste
      })
      message.success(res.message || 'Waste deduction successfully added.')
      setWasteModalOpen(false)
      refresh()
    } catch (err) {
      message.error(err.message)
    }
  }

  const onStatusFinish = async (values) => {
    try {
      // Backend expects record_no to be an ARRAY
      const recordNoArray = Array.isArray(values.record_no) ? values.record_no : [values.record_no]

      const res = await changeGrnStatus({
        ...values,
        record_no: recordNoArray
      })

      const { updated_records = [], skipped_records = [] } = res.data || {}
      if (updated_records.length > 0) {
        message.success(`Updated ${updated_records.length} records.`)
      }
      if (skipped_records.length > 0) {
        message.warning(`Skipped ${skipped_records.length} records.`)
      }

      setStatusModalOpen(false)
      statusForm.resetFields()
      setSelectedRowKeys([])
      refresh()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleRollback = (recordNos) => {
    const nos = Array.isArray(recordNos) ? recordNos : [recordNos]
    if (nos.length === 0) return

    Modal.confirm({
      title: 'Rollback Status',
      content: `Are you sure you want to rollback the status for ${nos.length === 1 ? `record ${nos[0]}` : `${nos.length} records`}?`,
      okText: 'Rollback',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await rollbackGrnStatus({ record_nos: nos })
          const { rollback_records = [], skipped_records = [] } = res.data || {}
          
          if (rollback_records.length > 0) {
            message.success(`Rolled back ${rollback_records.length} records.`)
          }
          if (skipped_records.length > 0) {
            message.warning(`Skipped ${skipped_records.length} records.`)
          }
          
          setSelectedRowKeys([])
          refresh()
        } catch (err) {
          message.error(err.message || 'Rollback failed')
        }
      }
    })
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Purchase Record',
      content: `Are you sure you want to delete record "${record.record_no}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteGrnRecord(record._id)
          message.success('Record deleted successfully.')
          refresh()
        } catch (err) {
          message.error(err.message || 'Failed to delete record')
        }
      }
    })
  }

  const getActionItems = (record) => [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
      onClick: () => handleView(record)
    },
    {
      key: 'waste',
      label: 'Add Waste Deduction',
      icon: <EditOutlined />,
      onClick: () => handleAddWaste(record)
    },
    {
      key: 'edit',
      label: 'Change Status',
      icon: <EditOutlined />,
      onClick: () => handleOpenStatusModal(record)
    },
    {
      key: 'rollback',
      label: 'Roll Back Status',
      icon: <RollbackOutlined />,
      onClick: () => handleRollback(record.record_no)
    },
    {
      key: 'delete',
      label: 'Delete Record',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record)
    },
  ]

  const columns = [
    {
      title: 'Record No',
      dataIndex: 'record_no',
      key: 'record_no',
      width: 100,
      fixed: 'left',
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'Plate No',
      dataIndex: 'plate_no',
      key: 'plate_no',
      width: 110,
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'Net Weight (Kg)',
      dataIndex: 'net_weight',
      key: 'net_weight',
      render: (v) => <Text strong>{v ? Number(v).toLocaleString() : '-'}</Text>,
      width: 130,
    },
    {
      title: 'Waste Deduction (Kg)',
      dataIndex: 'waste_deduction',
      key: 'waste_deduction',
      width: 160,
      render: (v) => (
        <Text strong style={{ color: Number(v) > 0 ? '#fa8c16' : 'inherit' }}>
          {v ? Number(v).toLocaleString() : '0'}
        </Text>
      )
    },
    {
      title: 'Net Price (Br.)',
      dataIndex: 'net_price',
      key: 'net_price',
      width: 140,
      render: (v) => (
        <Text strong style={{ color: '#52c41a' }}>
          {v ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
        </Text>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 140,
      ellipsis: true,
      render: (v) => <Text strong>{v ?? '-'}</Text>
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 140,
      render: (v) => (
        <Tag color="blue" style={{ textTransform: 'uppercase', fontWeight: 600 }}>
          {v || 'N/A'}
        </Tag>
      )
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
        if (['completed', 'active', 'approved', 'paid', 'verified'].includes(status)) color = 'success'
        if (['pending', 'new'].includes(status)) color = 'processing'
        if (['cancelled', 'declined'].includes(status)) color = 'error'
        return (
          <Tag color={color} style={{ fontWeight: 600 }}>
            {v.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Recorded On',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (v) => <Text strong>{formatDate(v)}</Text>
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      )
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>Purchase Records</Title>
              <Text type="secondary">
                Comprehensive list of GRN records, weights, material types, and pricing information.
              </Text>
              {selectedRowKeys.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ color: 'rgb(245, 34, 45)' }}>
                    {selectedRowKeys.length} records selected
                  </Text>
                </div>
              )}
            </div>

            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  icon={<RollbackOutlined />}
                  onClick={() => {
                    const selectedNos = records
                      .filter(r => selectedRowKeys.includes(r._id))
                      .map(r => r.record_no)
                    handleRollback(selectedNos)
                  }}
                  style={{ borderRadius: 6 }}
                >
                  Rollback Status
                </Button>
              )}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => handleOpenStatusModal()}
                style={{ borderRadius: 6, background: 'rgb(245, 34, 45)' }}
              >
                Change Status
              </Button>
            </Space>
          </div>

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
              onSelectionChange={onSelectionChange}
              columns={columns}
              dataSource={records}
              rowKey="_id"
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              scroll={{ x: 1300 }}
            />
          </Card>
        </div>
      </div>

      {/* View Record Modal */}
      <Modal
        title={
          <Space size={12}>
            <EyeOutlined style={{ color: 'rgb(245, 34, 45)' }} />
            <span style={{ fontWeight: 700, fontSize: 18 }}>Purchase Record Details</span>
            <Tag color="blue" style={{ marginLeft: 4 }}>{viewRecord?.record_no}</Tag>
          </Space>
        }
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false)
          setShowId(false) // Reset spoiler
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setViewModalOpen(false)}
            style={{ borderRadius: 6 }}
          >
            Close
          </Button>
        ]}
        width={700}
        centered
        styles={{
          header: { borderBottom: '1px solid #f0f0f0', paddingBottom: 16 },
          body: { paddingTop: 20 }
        }}
      >
        {viewRecord && (
          <div style={{ padding: '0 4px' }}>
            <Descriptions
              bordered
              column={2}
              size="middle"
              labelStyle={{ background: '#fafafa', fontWeight: 600, width: '160px' }}
              contentStyle={{ background: '#fff' }}
            >
              <Descriptions.Item label="Serial Number" span={1}>
                <Tag color="purple" style={{ fontWeight: 600 }}>{viewRecord.serial_no ?? '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Plate Number" span={1}>
                <Text strong>{viewRecord.plate_no ?? '-'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Customer" span={1}>
                <Text strong>{viewRecord.customer ?? '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Material Type" span={1}>
                <Tag color="cyan" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  {viewRecord.material_type || 'N/A'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Status" span={1}>
                {viewRecord.status ? (
                  <Tag
                    color={['completed', 'active', 'approved', 'paid', 'verified'].includes(viewRecord.status.toLowerCase()) ? 'success' : 'processing'}
                    style={{ fontWeight: 700 }}
                  >
                    {viewRecord.status.toUpperCase()}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Recorded On" span={1}>
                <Text>{formatDate(viewRecord.created_at)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="First Weight" span={1}>
                <Text>{viewRecord.first_weight?.toLocaleString() ?? '-'} kg</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Second Weight" span={1}>
                <Text>{viewRecord.second_weight?.toLocaleString() ?? '-'} kg</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Net Weight" span={1}>
                <Text strong style={{ fontSize: 14 }}>
                  {viewRecord.net_weight?.toLocaleString() ?? '-'} kg
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Waste Deduction" span={1}>
                <Text strong style={{ fontSize: 14, color: '#fa8c16' }}>
                  {viewRecord.waste_deduction?.toLocaleString() ?? '0'} kg
                </Text>
              </Descriptions.Item>

              {/* Grade Breakdown */}
              <Descriptions.Item label="Heavy (Qty / Rate)" span={1}>
                <Space direction="vertical" size={0}>
                  <Text strong>{viewRecord.heavy_grade && Number(viewRecord.heavy_grade) > 0 ? `${Number(viewRecord.heavy_grade).toLocaleString()} kg` : '-'}</Text>
                  {viewRecord.heavy_rate && Number(viewRecord.heavy_rate) > 0 && <Text style={{ fontSize: 13 }}>Rate: {viewRecord.heavy_rate} Br.</Text>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Medium (Qty / Rate)" span={1}>
                <Space direction="vertical" size={0}>
                  <Text strong>{viewRecord.medium_grade && Number(viewRecord.medium_grade) > 0 ? `${Number(viewRecord.medium_grade).toLocaleString()} kg` : '-'}</Text>
                  {viewRecord.medium_rate && Number(viewRecord.medium_rate) > 0 && <Text style={{ fontSize: 13 }}>Rate: {viewRecord.medium_rate} Br.</Text>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Light (Qty / Rate)" span={1}>
                <Space direction="vertical" size={0}>
                  <Text strong>{viewRecord.light_grade && Number(viewRecord.light_grade) > 0 ? `${Number(viewRecord.light_grade).toLocaleString()} kg` : '-'}</Text>
                  {viewRecord.light_rate && Number(viewRecord.light_rate) > 0 && <Text style={{ fontSize: 13 }}>Rate: {viewRecord.light_rate} Br.</Text>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Fixed Rate" span={1}>
                <Text strong>{viewRecord.fixed_rate && Number(viewRecord.fixed_rate) > 0 ? `${viewRecord.fixed_rate} Br.` : '-'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Total Net Price" span={2}>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {viewRecord.net_price ? `${Number(viewRecord.net_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} Br.` : '-'}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                Internal Reference:
              </Text>
              <span
                onClick={() => setShowId(!showId)}
                title={showId ? 'Click to hide' : 'Click to reveal'}
                style={{
                  background: showId ? 'transparent' : '#f0f0f0',
                  color: showId ? '#8c8c8c' : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  filter: showId ? 'none' : 'blur(4px)',
                  userSelect: 'none',
                  minWidth: '200px',
                  textAlign: 'center'
                }}
              >
                {viewRecord._id}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Waste Deduction Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#fa8c16' }} />
            <span>Add Waste Deduction</span>
          </Space>
        }
        open={wasteModalOpen}
        onCancel={() => setWasteModalOpen(false)}
        onOk={() => wasteForm.submit()}
        confirmLoading={isSubmitting}
        okText="Save Deduction"
        okButtonProps={{ style: { background: '#fa8c16', borderColor: '#fa8c16' } }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Record No: </Text>
          <Text strong>{selectedRecord?.record_no}</Text>
        </div>
        <Form form={wasteForm} layout="vertical" onFinish={onWasteFinish}>
          <Form.Item
            name="waste"
            label="Waste Deduction Amount (Kg)"
            rules={[{ required: true, message: 'Please enter waste amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="e.g. 100"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: 'rgb(245, 34, 45)' }} />
            <span style={{ fontWeight: 700 }}>Change GRN Status</span>
          </Space>
        }
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false)
          statusForm.resetFields()
        }}
        onOk={() => statusForm.submit()}
        confirmLoading={isSubmitting}
        okText="Update Status"
        okButtonProps={{ style: { borderRadius: 6, background: 'rgb(245, 34, 45)' } }}
        width={600}
      >
        <Form form={statusForm} layout="vertical" onFinish={onStatusFinish}>
          <Form.Item
            key={`record-no-${modalMode}`}
            name="record_no"
            label={modalMode === 'bulk' ? 'Select Record Numbers' : 'Record Number'}
            rules={[{ required: true, message: 'At least one record must be selected' }]}
          >
            {modalMode === 'bulk' ? (
              <MultiSelectInput
                placeholder="Records to update..."
                options={records.map(r => ({ value: r.record_no, label: r.record_no }))}
              />
            ) : (
              <SelectInput
                options={records.map(r => ({ value: r.record_no, label: r.record_no }))}
                placeholder="Select record..."
              />
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="grn_no" label="GRN Number">
                <Input placeholder="Enter GRN #" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="target_status" label="Target Status">
                <SelectInput
                  loading={loadingStatuses}
                  options={statusOptions}
                  placeholder="Select new status..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 13, color: '#8c8c8c' }}>
            Image Proofs (Optional)
          </Text>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="scale_img" label="Scale Image">
                <FileUploadInput placeholder="Upload scale proof" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="grn_img" label="GRN Image">
                <FileUploadInput placeholder="Upload GRN copy" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="approve_img" label="Approve Image">
                <FileUploadInput placeholder="Upload approval" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default PurchaseRecords
