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
  Select,
  Upload,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  MoreOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useUsers } from '../api/useUsers'
import DataTableWithPagination from '../components/DataTableWithPagination'
import RoleBasedComponentAccess from '../components/accessControl/RoleBasedComponentAccess'
import useRoleAccess from '../components/accessControl/useRoleAccess'

const { Title, Text } = Typography
const { Option } = Select

const UserManagement = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { hasAccess } = useRoleAccess()

  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const [fileList, setFileList] = useState([])

  const {
    users,
    roles,
    total,
    loading,
    rolesLoading,
    error,
    fetchUsers,
    registerUser,
    updateUser,
    deleteUser,
  } = useUsers({ page, pageSize })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      await registerUser(values, fileList)
      setAddModalOpen(false)
      addForm.resetFields()
      setFileList([])
    } catch (err) {
      setFormError(err.message || 'Failed to register user')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (values) => {
    setFormLoading(true)
    setFormError('')
    try {
      // Pass the user id explicitly along with values, fileList and the old signature
      await updateUser(selectedUser._id || selectedUser.id, values, fileList, selectedUser?.signature)
      setEditModalOpen(false)
      setSelectedUser(null)
      editForm.resetFields()
      setFileList([])
    } catch (err) {
      setFormError(err.message || 'Failed to update user')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete "${record.first_name || record.fname} ${record.last_name || record.lname}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteUser(record._id || record.id)
        } catch (err) {
          Modal.error({ title: 'Delete Failed', content: err.message })
        }
      },
    })
  }

  const openEdit = (record) => {
    setSelectedUser(record)
    editForm.setFieldsValue({
      fname: record.first_name || record.fname,
      lname: record.last_name || record.lname,
      email: record.email,
      phone: record.phone,
      role: record.role,
    })
    setFileList([])
    setFormError('')
    setEditModalOpen(true)
  }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      width: 120,
      render: (text, record) => text || record.fname,
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
      width: 120,
      render: (text, record) => text || record.lname,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        // Fallback or find matching label
        const matchedRole = roles.find(r => r.value === role)
        const labelText = matchedRole ? matchedRole.label : String(role || '').replace('_', ' ').toUpperCase()

        let color = 'default'
        switch (role) {
          case 'admin': color = 'blue'; break;
          case 'super_admin': color = 'volcano'; break;
          case 'weight_man': color = 'cyan'; break;
          case 'purchaser': color = 'green'; break;
          case 'store_keeper': color = 'green'; break;
          case 'inspector': color = 'geekblue'; break;
          case 'purchase_head': color = 'purple'; break;
          case 'supervisor': color = 'magenta'; break;
          case 'property_admin_finance': color = 'magenta'; break;
          case 'finance': color = 'gold'; break;
          case 'manager': color = 'red'; break;
        }
        return <Tag color={color}>{labelText}</Tag>
      },
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: 'rgb(245, 34, 45)' }} />}
            onClick={() => openEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ].filter(col => col.key !== 'action' || hasAccess(['super_admin', 'supervisor', 'property_admin_finance']))

  const props = {
    onRemove: (file) => {
      setFileList([])
    },
    beforeUpload: (file) => {
      setFileList([{ ...file, originFileObj: file }])
      return false
    },
    fileList,
  }

  const UserFormFields = ({ isEdit }) => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder="Email Address" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[{ required: true, message: 'Please enter phone number' }]}
        >
          <Input placeholder="Phone Number" />
        </Form.Item>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select placeholder="Select a role" loading={rolesLoading}>
            {roles.map((r) => (
              <Option key={r.value} value={r.value}>
                {r.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        )}
      </div>

      <Form.Item label="Signature (Image)">
        <Upload {...props} maxCount={1} accept="image/*">
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Form.Item>
    </>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          {/* Page Header */}
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              User Management
            </Title>
            <Text type="secondary">
              Manage system users — register, view, edit and manage roles.
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
                  <UserOutlined style={{ color: 'rgb(245, 34, 45)' }} />
                  <span>Users</span>
                  <Tag color="red">{total}</Tag>
                </Space>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchUsers}
                    loading={loading}
                    size="small"
                  >
                    Refresh
                  </Button>
                  <RoleBasedComponentAccess allowedRoles={['super_admin', 'supervisor', 'property_admin_finance']}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setFormError('')
                        setFileList([])
                        setAddModalOpen(true)
                      }}
                      style={{ background: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }}
                    >
                      Add User
                    </Button>
                  </RoleBasedComponentAccess>
                </Space>
              </div>
            }
          >
            <DataTableWithPagination
              rowKey={(record) => record._id || record.id}
              columns={columns}
              dataSource={users}
              loading={loading}
              page={page}
              pageSize={pageSize}
              total={total}
              onPaginationChange={(p, ps) => {
                setPage(p)
                setPageSize(ps)
              }}
              locale={{ emptyText: 'No users registered yet' }}
            />
          </Card>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      <Modal
        open={addModalOpen}
        title={
          <Space>
            <PlusOutlined />
            Register New User
          </Space>
        }
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); setFormError('') }}
        footer={null}
        destroyOnHidden
        width={700}
      >
        {formError && (
          <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />
        )}
        <Form form={addForm} layout="vertical" onFinish={handleAdd}>
          <UserFormFields isEdit={false} />
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button onClick={() => { setAddModalOpen(false); addForm.resetFields(); setFormError('') }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              style={{ background: '#262626', borderColor: '#262626' }}
            >
              Add User
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* ── Edit User Modal ── */}
      <Modal
        open={editModalOpen}
        title={
          <Space>
            <EditOutlined />
            Edit User
          </Space>
        }
        onCancel={() => { setEditModalOpen(false); setSelectedUser(null); editForm.resetFields(); setFormError('') }}
        footer={null}
        destroyOnHidden
        width={700}
      >
        {formError && (
          <Alert type="error" message={formError} showIcon style={{ marginBottom: 12 }} />
        )}
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <UserFormFields isEdit={true} />
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button onClick={() => { setEditModalOpen(false); setSelectedUser(null); editForm.resetFields(); setFormError('') }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              style={{ background: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }}
            >
              Update User
            </Button>
          </Space>
        </Form>
      </Modal>

    </div>
  )
}

export default UserManagement
