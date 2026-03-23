import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Tabs,
  Upload,
  Divider,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useProfile } from '../api/useProfile'
import { useAuth } from '../auth/AuthProvider'

const { Title, Text } = Typography

const Profile = () => {
  const auth = useAuth()
  const user = auth?.user

  const navigate = useNavigate()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const { fetchProfile, updateProfile, changePassword, profileData, profileLoading, loading, error } = useProfile()

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    // Fetch user details using the ID from localStorage key 'ce_user'
    try {
      const storedData = localStorage.getItem('ce_user')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        const userId = parsed?.email?.id || parsed?.email?._id
        if (userId) {
          fetchProfile(userId)
        }
      }
    } catch (e) {
      console.error('Failed to parse user from local storage:', e)
    }
  }, [])

  useEffect(() => {
    // Once the GET API responds with detailed full profileData, update the form
    if (profileData) {
      profileForm.setFieldsValue({
        fname: profileData.first_name || '',
        lname: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
      })
    }
  }, [profileData, profileForm])

  const handleProfileSubmit = async (values) => {
    setFormError('')
    setFormSuccess('')
    try {
      // Pass the values, current file upload, and the existing signature coming from the detailed GET API
      const existingSignature = profileData?.signature || null
      await updateProfile(values, fileList, existingSignature)
      setFormSuccess('Profile updated successfully!')
      setFileList([])
      // Refresh the detailed specific user data
      if (user?.id || user?._id) fetchProfile(user.id || user._id)
    } catch (err) {
      setFormError(err.message || 'Failed to update profile')
    }
  }

  const handlePasswordSubmit = async (values) => {
    setFormError('')
    setFormSuccess('')
    try {
      if (values.new_password !== values.confirm_password) {
        throw new Error('New passwords do not match')
      }

      const payload = {
        old_password: values.old_password,
        new_password: values.new_password,
      }

      await changePassword(payload)
      setFormSuccess('Password changed successfully! Redirecting to login...')
      passwordForm.resetFields()

      setTimeout(async () => {
        if (auth?.logout) {
          await auth.logout()
        } else {
          localStorage.removeItem('ce_user')
        }
        navigate('/login')
      }, 1500)

    } catch (err) {
      setFormError(err.message || 'Failed to change password')
    }
  }

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      setFileList([{ ...file, originFileObj: file }])
      return false
    },
    fileList,
  }

  const items = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          Account Information
        </span>
      ),
      children: (
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSubmit}
          style={{ maxWidth: 600, marginTop: 16 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="fname"
              label="First Name"
              rules={[{ required: true, message: 'Please enter your first name' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
            <Form.Item
              name="lname"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter your last name' }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Email Address" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: false, message: 'Please enter your phone number' }]}
          >
            <Input placeholder="Phone Number" />
          </Form.Item>

          <Form.Item label="Update Signature">
            <Upload {...uploadProps} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Select New Signature</Button>
            </Upload>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{ background: '#262626', borderColor: '#262626' }}
            >
              Save Profile Changes
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <LockOutlined />
          Security & Password
        </span>
      ),
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
          style={{ maxWidth: 500, marginTop: 16 }}
        >
          <Form.Item
            name="old_password"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="New Password"
            rules={[{ required: true, message: 'Please enter your new password' }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[{ required: true, message: 'Please confirm your new password' }]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{ background: '#262626', borderColor: '#262626' }}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex' }}>
      {/* Assuming we keep them on whichever sidebar they navigated from, or fallback to settings */}
      <Sidebar selected="settings" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              My Profile
            </Title>
            <Text type="secondary">Update your personal account details and security preferences.</Text>
          </div>

          {(formError || error) && (
            <Alert
              type="error"
              message={formError || error}
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setFormError('')}
            />
          )}

          {formSuccess && (
            <Alert
              type="success"
              message={formSuccess}
              showIcon
              style={{ marginBottom: 16 }}
              closable
              onClose={() => setFormSuccess('')}
            />
          )}

          <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
