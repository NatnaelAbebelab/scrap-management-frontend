import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Steps,
  Divider,
  Alert,
  Modal,
  Result
} from 'antd'
import {
  InboxOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MailOutlined,
  ShopOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { usePostComplaint } from '../api/usePostComplaint'
import { useFileUpload } from '../api/useFileUpload'
import { useAuth } from '../auth/AuthProvider'
import { Link } from 'react-router-dom'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'

const { TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

const materials = [
  'rebar', 'roofing nails', 'common nails', 'barbed wire', 'binding wire', 'electronic galvanized wire', 'mesh wire', 'wire rods'
]

const CustomerComplaint = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false)
  const { user, token } = useAuth()
  const { postComplaint, loading: postLoading } = usePostComplaint()
  const { uploadFile, loading: uploadLoading } = useFileUpload()

  const loading = postLoading || uploadLoading

  const beforeUpload = (file) => {
    setFileList([file])
    return false
  }

  const handleFinish = async (values) => {
    try {
      let attachmentNames = []

      // Upload file if exists
      if (fileList.length > 0) {
        const file = fileList[0]
        const result = await uploadFile(file, values.email)
        // Assuming result is the filename or path returned by the server
        // If result is an object like { filePath: '...' }, use result.filePath
        attachmentNames = [typeof result === 'string' ? result : (result?.fileName || file.name)]
      }

      // Map form fields to API fields
      const payload = {
        interactionDate: new Date().toISOString(),
        customerName: values.buyerName,
        customerEmail: values.email,
        salesPerson: '',
        purchasedMaterial: values.materialType,
        tinNumber: '',
        branchShop: values.shopBranch,
        remark: '',
        attachement: attachmentNames,
        description: values.description,
        shopBranchId: 0 // TODO: map to real branch ID if available
      }
      await postComplaint(payload)
      setIsSuccessModalVisible(true)
      form.resetFields()
      setFileList([])
    } catch (e) {
      message.error(e.message || 'Failed to submit complaint')
    }
  }

  const isPublicRoute = window.location.pathname === '/interactions/complaint' || window.location.pathname === '/interactions/performa'

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: (token && !isPublicRoute) ? 220 : 0 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
          {/* Header Section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              {token && (
                <Link to="/interactions">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    style={{ marginRight: 16 }}
                  >
                    Back to Interactions
                  </Button>
                </Link>
              )}
              <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                Submit Customer Complaint
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Report customer complaints with detailed information and supporting documents
            </Text>
          </div>

          {/* Progress Steps */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Steps
              current={currentStep}
              items={[
                {
                  title: 'Customer Info',
                  description: 'Basic customer details',
                  icon: <UserOutlined />
                },
                {
                  title: 'Complaint Details',
                  description: 'Issue description and material',
                  icon: <FileTextOutlined />
                },
                {
                  title: 'Attachments',
                  description: 'Supporting documents',
                  icon: <PaperClipOutlined />
                }
              ]}
            />
          </Card>

          {/* Alert */}
          <Alert
            message="Important Information"
            description="Please provide accurate and detailed information to help us resolve your complaint efficiently. All fields marked with * are required."
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          {/* Main Form Card */}
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e8e8e8'
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              onValuesChange={() => {
                const values = form.getFieldsValue()
                if (values.email && values.shopBranch && values.buyerName) {
                  setCurrentStep(1)
                  if (values.description && values.materialType) {
                    setCurrentStep(2)
                  }
                } else {
                  setCurrentStep(0)
                }
              }}
            >
              {/* Customer Information Section */}
              <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Customer Information
                </Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="buyerName"
                      label={<Text strong>Customer Name *</Text>}
                      rules={[{ required: true, message: 'Please enter customer name' }]}
                    >
                      <Input
                        size="large"
                        prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Enter customer full name"
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label={<Text strong>Email Address *</Text>}
                      rules={[
                        { required: true, message: 'Please enter email address' },
                        { type: 'email', message: 'Please enter a valid email address' }
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="customer@example.com"
                        style={{ borderRadius: 8 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="shopBranch"
                  label={<Text strong>Shop / Branch *</Text>}
                  rules={[{ required: true, message: 'Please enter shop or branch name' }]}
                >
                  <Input
                    size="large"
                    prefix={<ShopOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Enter shop or branch location"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </div>

              <Divider />

              {/* Complaint Details Section */}
              <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  Complaint Details
                </Title>

                <Form.Item
                  name="materialType"
                  label={<Text strong>Material Type *</Text>}
                  rules={[{ required: true, message: 'Please select material type' }]}
                >
                  <Select
                    size="large"
                    placeholder="Select the material related to this complaint"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ borderRadius: 8 }}
                    dropdownStyle={{ borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
                  >
                    <Select.OptGroup label="🔗 Wires">
                      <Option value="barbed wire">Barbed Wire</Option>
                      <Option value="binding wire">Binding Wire</Option>
                      <Option value="electronic galvanized wire">Electronic Galvanized Wire</Option>
                      <Option value="mesh wire">Mesh Wire</Option>
                      <Option value="wire rods">Wire Rods</Option>
                    </Select.OptGroup>
                    <Select.OptGroup label="🔨 Nails">
                      <Option value="roofing nails">Roofing Nails</Option>
                      <Option value="common nails">Common Nails</Option>
                    </Select.OptGroup>
                    <Select.OptGroup label="🏗️ Steel">
                      <Option value="rebar">Rebar</Option>
                    </Select.OptGroup>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<Text strong>Complaint Description *</Text>}
                  rules={[{ required: true, message: 'Please describe the complaint' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Please provide a detailed description of the issue, including when it occurred, what happened, and any other relevant information..."
                    style={{ borderRadius: 8 }}
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </div>

              <Divider />

              {/* Attachments Section */}
              <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                  <PaperClipOutlined style={{ marginRight: 8 }} />
                  Supporting Documents
                </Title>

                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Upload photos, receipts, or other documents that support your complaint (optional)
                </Text>

                <Form.Item label={<Text strong>Attachments</Text>}>
                  <Upload.Dragger
                    beforeUpload={beforeUpload}
                    fileList={fileList}
                    onRemove={() => setFileList([])}
                    style={{ borderRadius: 8 }}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: 500 }}>
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                      Support for images, PDFs, and documents. Maximum file size: 10MB
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </div>

              {/* Submit Section */}
              <div style={{
                textAlign: 'center',
                padding: '24px 0',
                background: '#fafafa',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}>
                <Space size="large">
                  <Button
                    size="large"
                    onClick={() => {
                      form.resetFields();
                      setFileList([]);
                      setCurrentStep(0);
                    }}
                    disabled={loading}
                    style={{ minWidth: 120, borderRadius: 8 }}
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<CheckCircleOutlined />}
                    style={{
                      minWidth: 160,
                      borderRadius: 8,
                      background: '#ff4d4f',
                      borderColor: '#ff4d4f'
                    }}
                  >
                    Submit Complaint
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        </div>
      </div>

      <Modal
        open={isSuccessModalVisible}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
            Close
          </Button>,
          token && (
            <Button key="view" onClick={() => {
              setIsSuccessModalVisible(false);
              navigate('/interactions');
            }}>
              View Interactions
            </Button>
          )
        ].filter(Boolean)}
        centered
        width={500}
      >
        <Result
          status="success"
          title="Complaint Submitted Successfully!"
          subTitle="Thank you for your feedback. We have received your complaint and will review it shortly. You can track the status in the interactions section."
        />
      </Modal>
    </div>
  )
}

export default CustomerComplaint
