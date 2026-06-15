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
  Spin,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  MoreOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
  MinusOutlined,
  PlusSquareTwoTone,
  PlusCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useInternalAgencies } from '../api/useInternalAgencies'
import { UPLOADED_FILE_URL } from '../api/config'
import { useAuth } from '../auth/AuthProvider'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'

const { Title, Text } = Typography
const { Option } = Select

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtAmount = (v) => {
  if (v === null || v === undefined) return '-'
  const n = Number(v)
  return `Br. ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const fmtDate = (v) => {
  if (!v) return '-'
  try {
    return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return v
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const InternalAgencies = () => {
  const { user } = useAuth()
  const userRole = user?.role || user?.email?.role
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [agreementAddForm] = Form.useForm()
  const [agreementEditForm] = Form.useForm()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [agreementAddModalOpen, setAgreementAddModalOpen] = useState(false)
  const [agreementEditModalOpen, setAgreementEditModalOpen] = useState(false)

  const [selectedAgency, setSelectedAgency] = useState(null)
  const [selectedAgreement, setSelectedAgreement] = useState(null)

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // Proof file state
  const [addProofFile, setAddProofFile] = useState(null)
  const [editProofFile, setEditProofFile] = useState(null)

  // Editable ranges for edit agreement modal
  const [editRanges, setEditRanges] = useState([])

  // Agreements loaded for view details
  const [viewAgreements, setViewAgreements] = useState([])
  const [viewAgreementsLoading, setViewAgreementsLoading] = useState(false)

  const {
    agencies,
    total,
    loading,
    error,
    materialTypes,
    addAgency,
    updateAgency,
    deleteAgency,
    addAgreement,
    updateAgreement,
    getAgreements,
  } = useInternalAgencies({ page, pageSize })

  const materialTypeOptions = Object.entries(materialTypes || {}).map(([key, label]) => ({
    value: key,
    label,
  }))

  // ── Agency handlers ────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      const resp = await addAgency(values)
      if (resp.result === 'success') {
        setAddModalOpen(false)
        addForm.resetFields()
      } else {
        setFormError(resp.message || 'Failed to register agency')
      }
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
      const resp = await updateAgency(selectedAgency._id, values)
      if (resp.result === 'success') {
        setEditModalOpen(false)
        setSelectedAgency(null)
        editForm.resetFields()
      } else {
        setFormError(resp.message || 'Failed to update agency')
      }
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
          const resp = await deleteAgency(record._id)
          if (resp.result !== 'success') {
            Modal.error({ title: 'Delete Failed', content: resp.message })
          }
        } catch (err) {
          Modal.error({ title: 'Delete Failed', content: err.message })
        }
      },
    })
  }

  const openEdit = (record) => {
    setSelectedAgency(record)
    editForm.setFieldsValue({
      first_name: record.first_name,
      last_name: record.last_name,
      tin: record.TIN,
      business_name: record.business_name,
    })
    setFormError('')
    setEditModalOpen(true)
  }

  const openView = async (record) => {
    setSelectedAgency(record)
    setViewAgreements([])
    setViewModalOpen(true)
    setViewAgreementsLoading(true)
    try {
      const agreements = await getAgreements(record._id)
      setViewAgreements(agreements)
    } catch {
      setViewAgreements([])
    } finally {
      setViewAgreementsLoading(false)
    }
  }

  // ── Agreement handlers ─────────────────────────────────────────────────────

  const openAddAgreement = (record) => {
    setSelectedAgency(record)
    setFormError('')
    setAddProofFile(null)
    agreementAddForm.resetFields()
    // Seed one range row by default
    agreementAddForm.setFieldsValue({ agreements: [{ min_weight: 0 }] })
    setAgreementAddModalOpen(true)
  }

  const handleAddAgreement = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      const { name, material_type, effective_start_date, contract_duration_months, agreements } = values
      const resp = await addAgreement({
        agency: selectedAgency._id,
        tin: selectedAgency.TIN,
        name,
        material_type,
        contract_details: {
          effective_start_date: effective_start_date
            ? dayjs(effective_start_date).format('YYYY-MM-DD')
            : undefined,
          contract_duration_months: String(contract_duration_months),
        },
        agreements: (agreements || []).map((r) => ({
          min_weight: String(r.min_weight),
          max_weight: r.max_weight != null ? String(r.max_weight) : '',
          rate: String(r.rate),
        })),
        proofFile: addProofFile,
      })
      if (resp.result === 'success') {
        setAgreementAddModalOpen(false)
        agreementAddForm.resetFields()
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

  // Called from dropdown when agency already has an agreement
  const fetchAndOpenEditAgreement = async (record) => {
    setFormError('')
    setEditProofFile(null)
    setSelectedAgency(record)
    try {
      const agreements = await getAgreements(record._id)
      const agreement = agreements[0] // use the first/latest agreement
      if (!agreement) {
        Modal.info({ title: 'No Agreement Found', content: 'Could not load agreement details.' })
        return
      }
      setSelectedAgreement(agreement)
      const ranges = (agreement.agreement_ranges || []).map((r) => ({ ...r }))
      setEditRanges(ranges)
      agreementEditForm.setFieldsValue({
        material_type: agreement.material_type,
        status: agreement.status,
        name: agreement.agreement_name,
      })
      setAgreementEditModalOpen(true)
    } catch (err) {
      Modal.error({ title: 'Error', content: err.message || 'Failed to load agreement' })
    }
  }

  const openEditAgreement = (agency, agreement) => {
    setSelectedAgency(agency)
    setSelectedAgreement(agreement)
    setEditProofFile(null)
    setFormError('')
    // Populate ranges into local state for editing
    const ranges = (agreement.agreement_ranges || []).map((r) => ({ ...r }))
    setEditRanges(ranges)
    agreementEditForm.setFieldsValue({
      material_type: agreement.material_type,
      status: agreement.status,
    })
    setAgreementEditModalOpen(true)
  }

  const handleEditAgreement = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      // Build ranges map keyed by _id
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
        agency: selectedAgency._id,
        tin: selectedAgency.TIN,
        material_type: values.material_type,
        status: values.status || null,
        name: values.name || null,
        proofFile: editProofFile,
        ranges: rangesMap,
      })
      if (resp.result === 'success') {
        setAgreementEditModalOpen(false)
        setSelectedAgreement(null)
        agreementEditForm.resetFields()
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

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
    },
    {
      title: 'Business Name',
      dataIndex: 'business_name',
      key: 'business_name',
      width: 180,
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      width: 120,
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
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
      width: 170,
      align: 'right',
      render: fmtAmount,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 150,
      align: 'right',
      render: fmtAmount,
    },
    {
      title: 'Registered On',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: fmtDate,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      render: (_, record) => {
        const hasAgreement = record.agreement && record.agreement !== ''
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'View Details',
                  icon: <EyeOutlined />,
                  onClick: () => openView(record),
                },
                hasAgreement
                  ? {
                    key: 'agreement',
                    label: 'Edit Agreement',
                    icon: <FileTextOutlined />,
                    onClick: () => fetchAndOpenEditAgreement(record),
                    allowedRoles: ['super_admin', 'supervisor']
                  }
                  : {
                    key: 'agreement',
                    label: 'Add Agreement',
                    icon: <FileTextOutlined />,
                    onClick: () => openAddAgreement(record),
                    allowedRoles: ['super_admin', 'supervisor']
                  },
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <EditOutlined />,
                  onClick: () => openEdit(record),
                  allowedRoles: ['super_admin', 'supervisor']
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  label: 'Delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record),
                  allowedRoles: ['super_admin', 'supervisor']
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
        )
      },
    },
  ]

  // ── Shared agency form fields ──────────────────────────────────────────────

  const AgencyFormFields = ({ isEdit = false }) => (
    <>
      <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}>
        <Input placeholder="First name" />
      </Form.Item>
      <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}>
        <Input placeholder="Last name" />
      </Form.Item>
      <Form.Item
        name="tin"
        label="TIN"
        rules={isEdit ? [] : [{ required: true, message: 'Please enter TIN number' }]}
      >
        <Input placeholder="Tax Identification Number" />
      </Form.Item>
      <Form.Item
        name="business_name"
        label="Business Name"
        rules={isEdit ? [] : [{ required: true, message: 'Please enter business name' }]}
      >
        <Input placeholder="Business name" />
      </Form.Item>
    </>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="scrap-transport:internal-agencies" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ marginBottom: 4 }}>Internal Transport Agencies</Title>
            <Text type="secondary">Manage agencies involved in transporting issued raw materials.</Text>
          </div>

          {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

          <Card
            style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <span>Agencies</span>
                  <Tag color="red">{total}</Tag>
                </Space>
                <RoleBasedComponentAccess allowedRoles={['super_admin', 'supervisor']}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setFormError(''); setAddModalOpen(true) }}
                  >
                    Add Agency
                  </Button>
                </RoleBasedComponentAccess>
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

      {/* ── Add Agency Modal ──────────────────────────────────────────────── */}
      <Modal
        open={addModalOpen}
        title="Add New Agency"
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); setFormError('') }}
        footer={null}
        destroyOnClose
      >
        {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />}
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <AgencyFormFields />
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => { setAddModalOpen(false); addForm.resetFields(); setFormError('') }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>Register</Button>
          </Space>
        </Form>
      </Modal>

      {/* ── Edit Agency Modal ─────────────────────────────────────────────── */}
      <Modal
        open={editModalOpen}
        title="Edit Agency"
        onCancel={() => { setEditModalOpen(false); setSelectedAgency(null); editForm.resetFields(); setFormError('') }}
        footer={null}
        destroyOnClose
      >
        {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />}
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <AgencyFormFields isEdit />
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => { setEditModalOpen(false); setSelectedAgency(null); editForm.resetFields(); setFormError('') }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>Update</Button>
          </Space>
        </Form>
      </Modal>

      {/* ── View Agency Modal ─────────────────────────────────────────────── */}
      <Modal
        open={viewModalOpen}
        title="Agency Details"
        onCancel={() => { setViewModalOpen(false); setSelectedAgency(null); setViewAgreements([]) }}
        footer={[<Button key="close" onClick={() => { setViewModalOpen(false); setSelectedAgency(null); setViewAgreements([]) }}>Close</Button>]}
        width={1000}
        style={{ top: 20 }}
      >
        {selectedAgency && (
          <>
            <Descriptions
              bordered
              column={2}
              size="small"
              labelStyle={{ fontWeight: 600, color: '#000' }}
              contentStyle={{ fontWeight: 500, color: '#333' }}
            >
              <Descriptions.Item label="Business Name" span={2}>{selectedAgency.business_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="First Name">{selectedAgency.first_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{selectedAgency.last_name || '-'}</Descriptions.Item>
              <Descriptions.Item label="TIN">{selectedAgency.TIN || '-'}</Descriptions.Item>
              <Descriptions.Item label="Agreement">{viewAgreementsLoading ? '-' : viewAgreements.length}</Descriptions.Item>
              <Descriptions.Item label="Remaining Amount">{fmtAmount(selectedAgency.remaining_amount)}</Descriptions.Item>
              <Descriptions.Item label="Paid Amount">{fmtAmount(selectedAgency.paid_amount)}</Descriptions.Item>
              <Descriptions.Item label="Registered At">{fmtDate(selectedAgency.created_at)}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" orientationMargin={0} style={{ marginTop: 20 }}>Agreements</Divider>

            {viewAgreementsLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : viewAgreements.length === 0 ? (
              <Alert type="info" message="No agreements found for this agency." showIcon />
            ) : (
              <Table
                rowKey="_id"
                size="small"
                dataSource={viewAgreements}
                pagination={false}
                scroll={{ x: 800 }}
                columns={[
                  { title: 'Agreement Name', dataIndex: 'agreement_name', key: 'agreement_name', render: (v) => <span style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
                  { title: 'Material Type', dataIndex: 'material_type', key: 'material_type', render: (v) => <span style={{ textTransform: 'capitalize' }}>{v || '-'}</span> },
                  { title: 'Effective Date', dataIndex: 'effective_date', key: 'effective_date', render: fmtDate },
                  { title: 'Duration', dataIndex: 'duration', key: 'duration', render: (v) => v ? `${v} Months` : '-' },
                  {
                    title: 'Status', dataIndex: 'status', key: 'status', render: (v) => (
                      <Tag color={v === 'approved' ? 'success' : v === 'new' ? 'blue' : 'default'} style={{ textTransform: 'uppercase' }}>{v || 'N/A'}</Tag>
                    )
                  },
                  { title: 'Proof', dataIndex: 'agreement_proof', key: 'agreement_proof', render: (v) => v ? <a href={UPLOADED_FILE_URL(v)} target="_blank" rel="noreferrer">Download / View</a> : '-' },
                ]}
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
            )}
          </>
        )}
      </Modal>

      {/* ── Add Agreement Modal ───────────────────────────────────────────── */}
      <Modal
        open={agreementAddModalOpen}
        title={
          <Space>
            <FileTextOutlined />
            {selectedAgency ? `Add Agreement — ${selectedAgency.business_name}` : 'Add Agreement'}
          </Space>
        }
        onCancel={() => { setAgreementAddModalOpen(false); agreementAddForm.resetFields(); setFormError(''); setAddProofFile(null) }}
        footer={null}
        destroyOnClose
        width={720}
        style={{ top: 20 }}
      >
        {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />}

        {/* Agency info banner */}
        {selectedAgency && (
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">Agency: <strong>{selectedAgency.business_name}</strong></Text>
              <Text type="secondary">TIN: <strong>{selectedAgency.TIN}</strong></Text>
            </Space>
          </div>
        )}

        <Form form={agreementAddForm} layout="vertical" onFinish={handleAddAgreement}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Agreement Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Agreement Three Scrap" />
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

          {/* Proof upload */}
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

          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button onClick={() => { setAgreementAddModalOpen(false); agreementAddForm.resetFields(); setFormError(''); setAddProofFile(null) }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              Submit Agreement
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* ── Edit Agreement Modal ──────────────────────────────────────────── */}
      <Modal
        open={agreementEditModalOpen}
        title={
          <Space>
            <EditOutlined />
            {selectedAgreement ? `Edit Agreement — ${selectedAgreement.agreement_name}` : 'Edit Agreement'}
          </Space>
        }
        onCancel={() => { setAgreementEditModalOpen(false); setSelectedAgreement(null); agreementEditForm.resetFields(); setFormError(''); setEditRanges([]) }}
        footer={null}
        destroyOnClose
        width={760}
        style={{ top: 20 }}
      >
        {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />}

        {selectedAgency && (
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
            <Space split={<Divider type="vertical" />}>
              <Text type="secondary">Agency: <strong>{selectedAgency.business_name}</strong></Text>
              <Text type="secondary">TIN: <strong>{selectedAgency.TIN}</strong></Text>
            </Space>
          </div>
        )}

        <Form form={agreementEditForm} layout="vertical" onFinish={handleEditAgreement}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="material_type" label="Material Type" rules={[{ required: true, message: 'Required' }]}>
                <Select placeholder="Select material type">
                  {materialTypeOptions.length > 0
                    ? materialTypeOptions.map((o) => <Option key={o.value} value={o.value}>{o.label}</Option>)
                    : <Option value="scrap">Scrap</Option>}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Select status" allowClear>
                  <Option value="created">Created</Option>
                  <Option value="approved">Approved</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="New Proof File (optional)">
                <Upload
                  beforeUpload={(file) => { setEditProofFile(file); return false }}
                  onRemove={() => setEditProofFile(null)}
                  maxCount={1}
                  fileList={editProofFile ? [{ uid: '-1', name: editProofFile.name, status: 'done' }] : []}
                >
                  <Button icon={<UploadOutlined />} size="small">Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Editable ranges table */}
          {editRanges.length > 0 && (
            <>
              <Divider orientation="left" orientationMargin={0}>Rate Ranges</Divider>
              <Row gutter={8} style={{ fontWeight: 600, marginBottom: 6, paddingLeft: 4 }}>
                <Col span={7}><Text type="secondary">Min Weight (kg)</Text></Col>
                <Col span={7}><Text type="secondary">Max Weight (kg)</Text></Col>
                <Col span={7}><Text type="secondary">Rate (Br/kg)</Text></Col>
              </Row>
              {editRanges.map((range, idx) => (
                <Row key={range._id} gutter={8} style={{ marginBottom: 6 }}>
                  <Col span={7}>
                    <InputNumber
                      value={Number(range.min_weight)}
                      min={0}
                      style={{ width: '100%' }}
                      onChange={(v) => {
                        const next = [...editRanges]
                        next[idx] = { ...next[idx], min_weight: v }
                        setEditRanges(next)
                      }}
                    />
                  </Col>
                  <Col span={7}>
                    <InputNumber
                      value={Number(range.max_weight)}
                      min={0}
                      style={{ width: '100%' }}
                      onChange={(v) => {
                        const next = [...editRanges]
                        next[idx] = { ...next[idx], max_weight: v }
                        setEditRanges(next)
                      }}
                    />
                  </Col>
                  <Col span={7}>
                    <InputNumber
                      value={Number(range.rate)}
                      min={0}
                      style={{ width: '100%' }}
                      onChange={(v) => {
                        const next = [...editRanges]
                        next[idx] = { ...next[idx], rate: v }
                        setEditRanges(next)
                      }}
                    />
                  </Col>
                </Row>
              ))}
            </>
          )}

          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button onClick={() => { setAgreementEditModalOpen(false); setSelectedAgreement(null); agreementEditForm.resetFields(); setFormError(''); setEditRanges([]) }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={formLoading}>
              Save Changes
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}

export default InternalAgencies
