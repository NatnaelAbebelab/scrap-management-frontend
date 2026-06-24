import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Typography,
  Alert,
  Tag,
  Space,
  Modal,
  Descriptions,
  Dropdown,
  Upload,
  Divider,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  UploadOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useInternalAgreements } from '../api/useInternalAgreements'
import { UPLOADED_FILE_URL } from '../api/config'
import { useAuth } from '../auth/AuthProvider'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'

const { Title, Text } = Typography
const { Option } = Select

const fmtDate = (v) => {
  if (!v) return '-'
  try {
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return v
  }
}

const InternalAgreements = () => {
  const { user } = useAuth()
  const userRole = user?.role || user?.email?.role
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const [selectedAgreement, setSelectedAgreement] = useState(null)

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [addProofFile, setAddProofFile] = useState(null)
  const [editProofFile, setEditProofFile] = useState(null)

  const [editRanges, setEditRanges] = useState([])

  const {
    agreements,
    total,
    loading,
    error,
    agenciesOption,
    agenciesLoading,
    materialTypes,
    addAgreement,
    updateAgreement,
    deleteAgreement,
  } = useInternalAgreements({ page, pageSize })

  const materialTypeOptions = Object.entries(materialTypes || {}).map(([key, label]) => ({
    value: key,
    label,
  }))

  const handleAgencySelect = (agencyId) => {
    const selected = agenciesOption.find((a) => a._id === agencyId)
    if (selected) {
      addForm.setFieldsValue({ tin: selected.TIN })
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAdd = () => {
    addForm.resetFields()
    setFormError('')
    setAddProofFile(null)
    addForm.setFieldsValue({ agreements: [{ min_weight: 0 }] })
    setAddModalOpen(true)
  }

  const handleAddSubmit = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      const { agency, tin, name, material_type, effective_start_date, contract_duration_months, agreements } = values
      const resp = await addAgreement({
        agency,
        tin,
        name,
        material_type,
        contract_details: {
          effective_start_date: effective_start_date ? dayjs(effective_start_date).format('YYYY-MM-DD') : undefined,
          contract_duration_months: String(contract_duration_months),
        },
        agreementsArray: (agreements || []).map((r) => ({
          min_weight: r.min_weight !== '' && r.min_weight != null ? Number(r.min_weight) : 0,
          max_weight: r.max_weight !== '' && r.max_weight != null ? Number(r.max_weight) : 'MAX_FLAG',
          rate: r.rate !== '' && r.rate != null ? Number(r.rate) : 0,
        })),
        proofFile: addProofFile,
      })
      if (resp.result === 'success') {
        setAddModalOpen(false)
        addForm.resetFields()
        setAddProofFile(null)
      } else {
        setFormError(resp.message || 'Failed to add agreement')
      }
    } catch (err) {
      setFormError(err.message || 'Failed to add agreement')
    } finally {
      setFormLoading(false)
    }
  }

  const openEdit = (record) => {
    setSelectedAgreement(record)
    setEditProofFile(null)
    setFormError('')

    const ranges = (record.agreement_ranges || []).map((r) => ({ ...r }))
    setEditRanges(ranges)

    editForm.setFieldsValue({
      name: record.agreement_name,
      material_type: record.material_type,
      status: record.status,
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      const rangesMap = {}
      editRanges.forEach((r) => {
        rangesMap[r._id] = {
          _id: r._id,
          min_weight: Number(r.min_weight),
          max_weight: Number(r.max_weight),
          rate: Number(r.rate),
        }
      })

      const resp = await updateAgreement({
        agreementId: selectedAgreement._id,
        agency: selectedAgreement.agency,
        tin: selectedAgreement.TIN,
        material_type: values.material_type,
        status: values.status || null,
        name: values.name || null,
        proofFile: editProofFile,
        ranges: rangesMap,
      })
      if (resp.result === 'success') {
        setEditModalOpen(false)
        setSelectedAgreement(null)
        editForm.resetFields()
        setEditRanges([])
      } else {
        setFormError(resp.message || 'Failed to update agreement')
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update agreement')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Agreement',
      content: `Are you sure you want to delete agreement "${record.agreement_name || record._id}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const resp = await deleteAgreement(record._id)
          if (resp.result !== 'success') {
            Modal.error({ title: 'Delete Failed', content: resp.message })
          }
        } catch (err) {
          Modal.error({ title: 'Delete Failed', content: err.message })
        }
      },
    })
  }

  const openView = (record) => {
    setSelectedAgreement(record)
    setViewModalOpen(true)
  }

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
    },
    {
      title: 'Agreement Name',
      dataIndex: 'agreement_name',
      key: 'agreement_name',
      render: (v) => <span style={{ textTransform: 'capitalize' }}>{v || '-'}</span>,
    },
    {
      title: 'TIN',
      dataIndex: 'TIN',
      key: 'TIN',
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      render: (v) => <span style={{ textTransform: 'capitalize' }}>{v || '-'}</span>,
    },
    {
      title: 'Effective Date',
      dataIndex: 'effective_date',
      key: 'effective_date',
      render: fmtDate,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (v) => v ? `${v} Months` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => (
        <Tag color={v === 'approved' ? 'success' : v === 'new' ? 'blue' : 'default'} style={{ textTransform: 'uppercase' }}>{v || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Proof',
      dataIndex: 'agreement_proof',
      key: 'agreement_proof',
      render: (v) => v ? <a href={UPLOADED_FILE_URL(v)} target="_blank" rel="noreferrer">Download / View</a> : '-',
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
              ...(record.status !== 'approved' ? [{
                key: 'edit',
                label: 'Edit',
                icon: <EditOutlined />,
                onClick: () => openEdit(record),
                allowedRoles: ['super_admin', 'supervisor', 'property_admin_finance']
              }] : []),
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record),
                allowedRoles: ['super_admin', 'supervisor', 'property_admin_finance']
              },
            ].filter(item => !item.allowedRoles || item.allowedRoles.includes(userRole)),
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="scrap-transport:internal-agreements" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ marginBottom: 4 }}>Agreement Management</Title>
            <Text type="secondary">Manage internal agency transport agreements and rates.</Text>
          </div>

          {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

          <Card
            style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <span>Agreements</span>
                  <Tag color="red">{total}</Tag>
                </Space>
                <RoleBasedComponentAccess allowedRoles={['super_admin', 'supervisor', 'property_admin_finance']}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                    Add Agreement
                  </Button>
                </RoleBasedComponentAccess>
              </div>
            }
          >
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={agreements}
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (t) => `Total ${t} agreements`,
                onChange: (p, ps) => { setPage(p); setPageSize(ps) },
              }}
              scroll={{ x: 1200 }}
              locale={{ emptyText: 'No agreements found' }}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) => {
                  const ranges = record.agreement_ranges || []
                  if (ranges.length === 0) return <span style={{ display: 'inline-block', width: 16 }}></span>
                  return expanded ? (
                    <MinusSquareOutlined style={{ color: '#f5222d', fontSize: 16, cursor: 'pointer', borderRadius: 4 }} onClick={e => onExpand(record, e)} />
                  ) : (
                    <PlusSquareOutlined style={{ color: '#f5222d', fontSize: 16, cursor: 'pointer', borderRadius: 4 }} onClick={e => onExpand(record, e)} />
                  )
                },
                expandedRowRender: (record) => {
                  const ranges = record.agreement_ranges || []
                  if (ranges.length === 0) return <Text type="secondary" style={{ marginLeft: 24 }}>No rate ranges defined.</Text>
                  return (
                    <div style={{ padding: '0 24px' }}>
                      <Table
                        rowKey="_id"
                        size="small"
                        dataSource={ranges}
                        pagination={false}
                        columns={[
                          { title: 'Min Weight (kg)', dataIndex: 'min_weight', key: 'min_weight', align: 'center', render: (v) => Number(v).toLocaleString() },
                          { title: 'Max Weight (kg)', dataIndex: 'max_weight', key: 'max_weight', align: 'center', render: (v) => { const n = Number(v); return n >= 999999 ? '∞' : n.toLocaleString() } },
                          { title: 'Rate (Br/kg)', dataIndex: 'rate', key: 'rate', align: 'center', render: (v) => Number(v).toLocaleString() },
                        ]}
                      />
                    </div>
                  )
                }
              }}
            />
          </Card>
        </div>
      </div>

      {/* ── Add Agreement Modal ───────────────────────────────────────────── */}
      <Modal
        open={addModalOpen}
        title="Add Agreement"
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); setFormError(''); setAddProofFile(null) }}
        footer={null}
        destroyOnClose
        width={720}
        style={{ top: 20 }}
      >
        {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />}

        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Agreement Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Agreement Three Scrap" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="agency" label="Business Name" rules={[{ required: true, message: 'Required' }]}>
                <Select
                  showSearch
                  placeholder="Select agency"
                  loading={agenciesLoading}
                  onChange={handleAgencySelect}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={agenciesOption.map(a => ({ value: a._id, label: a.business_name }))}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="tin" label="TIN" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="Auto-filled from agency" readOnly style={{ background: '#f5f5f5' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="material_type" label="Material Type" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select material type" loading={!materialTypes}>
                  {materialTypeOptions.length > 0
                    ? materialTypeOptions.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)
                    : <Option value="scrap">Scrap</Option>}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="effective_start_date" label="Effective Start Date" rules={[{ required: true, message: 'Required' }]}>
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contract_duration_months" label="Duration (months)" rules={[{ required: true, message: 'Required' }]}>
                <InputNumber min={1} placeholder="e.g. 16" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Agreement Proof (PDF/Image)">
            <Upload
              beforeUpload={(file) => { setAddProofFile(file); return false }}
              onRemove={() => setAddProofFile(null)}
              maxCount={1}
              fileList={addProofFile ? [{ uid: '-1', name: addProofFile.name, status: 'done' }] : []}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Divider orientation="left" orientationMargin={0}>Rate Ranges</Divider>

          <Form.List name="agreements" initialValue={[{ min_weight: 0 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 4 }}>
                    <Col span={7}>
                      <Form.Item {...restField} name={[name, 'min_weight']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                        <InputNumber placeholder="Min weight (kg)" style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item {...restField} name={[name, 'max_weight']} style={{ marginBottom: 0 }}>
                        <InputNumber placeholder="Max weight (kg) - optional" style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item {...restField} name={[name, 'rate']} rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: 0 }}>
                        <InputNumber placeholder="Rate (Br/kg)" style={{ width: '100%' }} min={0} />
                      </Form.Item>
                    </Col>
                    <Col span={3} style={{ textAlign: 'center' }}>
                      {fields.length > 1 && (
                        <MinusSquareOutlined
                          style={{ color: '#f5222d', fontSize: 18, cursor: 'pointer', marginRight: 8 }}
                          onClick={() => remove(name)}
                        />
                      )}
                      {name === fields.length - 1 && (
                        <PlusSquareOutlined
                          style={{ color: '#f5222d', fontSize: 18, cursor: 'pointer' }}
                          onClick={() => add()}
                        />
                      )}
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>

          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={() => { setAddModalOpen(false); addForm.resetFields(); setFormError(''); setAddProofFile(null) }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>Create Agreement</Button>
          </Space>
        </Form>
      </Modal>

      {/* ── Edit Agreement Modal ──────────────────────────────────────────── */}
      <Modal
        open={editModalOpen}
        title="Edit Agreement"
        onCancel={() => { setEditModalOpen(false); setSelectedAgreement(null); editForm.resetFields(); setFormError(''); setEditRanges([]) }}
        footer={null}
        destroyOnClose
        width={720}
        style={{ top: 20 }}
      >
        {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />}

        {selectedAgreement && (
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">Agreement: <strong>{selectedAgreement.agreement_name}</strong></Text>
              <Text type="secondary">Business: <strong>{agenciesOption.find(a => a._id === selectedAgreement.agency)?.business_name || selectedAgreement.agency}</strong></Text>
              <Text type="secondary">TIN: <strong>{selectedAgreement.TIN}</strong></Text>
            </Space>
          </div>
        )}

        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Agreement Name">
                <Input placeholder="Rename if needed" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="material_type" label="Material Type" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select material type" loading={!materialTypes}>
                  {materialTypeOptions.length > 0
                    ? materialTypeOptions.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)
                    : <Option value="scrap">Scrap</Option>}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Required' }]}>
                <Select>
                  <Option value="new">New</Option>
                  <Option value="approved">Approved</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Upload New Proof (Optional)">
            <Upload
              beforeUpload={(file) => { setEditProofFile(file); return false }}
              onRemove={() => setEditProofFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Document</Button>
            </Upload>
            {selectedAgreement?.agreement_proof && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Current file: </Text>
                <a href={UPLOADED_FILE_URL(selectedAgreement.agreement_proof)} target="_blank" rel="noreferrer">
                  File
                </a>
              </div>
            )}
          </Form.Item>

          <Divider orientation="left" orientationMargin={0}>Edit Rate Ranges</Divider>
          {editRanges.map((r, idx) => (
            <Row key={r._id} gutter={8} align="middle" style={{ marginBottom: 4 }}>
              <Col span={8}>
                <InputNumber
                  value={r.min_weight}
                  onChange={(val) => { const c = [...editRanges]; c[idx].min_weight = val; setEditRanges(c) }}
                  placeholder="Min weight"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  value={r.max_weight}
                  onChange={(val) => { const c = [...editRanges]; c[idx].max_weight = val; setEditRanges(c) }}
                  placeholder="Max weight"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  value={r.rate}
                  onChange={(val) => { const c = [...editRanges]; c[idx].rate = val; setEditRanges(c) }}
                  placeholder="Rate (Br/kg)"
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          ))}
          <Text type="secondary" style={{ fontSize: 12 }}>Inline range editing only updatess existing ranges. To add/remove ranges, please contact an admin or recreate.</Text>

          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button onClick={() => { setEditModalOpen(false); setSelectedAgreement(null); editForm.resetFields(); setFormError(''); setEditRanges([]) }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>Save Changes</Button>
          </Space>
        </Form>
      </Modal>

      {/* ── View Detail Modal ─────────────────────────────────────────────── */}
      <Modal
        open={viewModalOpen}
        title="Agreement Details"
        onCancel={() => { setViewModalOpen(false); setSelectedAgreement(null) }}
        footer={[<Button key="close" onClick={() => { setViewModalOpen(false); setSelectedAgreement(null) }}>Close</Button>]}
        width={720}
        style={{ top: 20 }}
      >
        {selectedAgreement && (
          <Descriptions
            bordered
            column={2}
            size="small"
            labelStyle={{ fontWeight: 600, color: '#000' }}
            contentStyle={{ fontWeight: 500, color: '#333' }}
          >
            <Descriptions.Item label="Agreement Name" span={2}>
              <span style={{ textTransform: 'capitalize' }}>{selectedAgreement.agreement_name || '-'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Business Name">
              {agenciesOption.find(a => a._id === selectedAgreement.agency)?.business_name || selectedAgreement.agency}
            </Descriptions.Item>
            <Descriptions.Item label="TIN">{selectedAgreement.TIN || '-'}</Descriptions.Item>
            <Descriptions.Item label="Material Type">
              <span style={{ textTransform: 'capitalize' }}>{selectedAgreement.material_type || '-'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedAgreement.status === 'approved' ? 'success' : selectedAgreement.status === 'new' ? 'blue' : 'default'} style={{ textTransform: 'uppercase' }}>
                {selectedAgreement.status || 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Effective Date">{fmtDate(selectedAgreement.effective_date)}</Descriptions.Item>
            <Descriptions.Item label="Duration">{selectedAgreement.duration ? `${selectedAgreement.duration} Months` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Proof">
              {selectedAgreement.agreement_proof ? (
                <a href={UPLOADED_FILE_URL(selectedAgreement.agreement_proof)} target="_blank" rel="noreferrer">Download / View</a>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Registered At">{fmtDate(selectedAgreement.created_at)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default InternalAgreements
