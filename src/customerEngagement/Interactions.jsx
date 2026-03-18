import React from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button,
  Statistic,
  Badge
} from 'antd'
import { Link } from 'react-router-dom'
import { 
  ExclamationCircleOutlined, 
  FileTextOutlined, 
  InteractionOutlined,
  PlusOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'

const { Title, Text } = Typography

const Interactions = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="interactions" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
          {/* Header Section */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                <InteractionOutlined style={{ marginRight: 8 }} />
                Customer Interactions
              </Title>
            </div>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Create and manage customer interactions including complaints and proforma requisitions
            </Text>
          </div>

          {/* Main Interaction Cards */}
          <Row gutter={24}>
            <Col xs={24} sm={12} lg={12}>
              <Card
                hoverable
                style={{ 
                  height: '280px',
                  borderRadius: 12, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e8e8e8',
                  background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    background: '#fff2f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    border: '2px solid #ffccc7'
                  }}>
                    <ExclamationCircleOutlined style={{ fontSize: 36, color: '#ff4d4f' }} />
                  </div>
                  
                  <Title level={3} style={{ margin: '0 0 12px 0', color: '#ff4d4f' }}>
                    Customer Complaint
                  </Title>
                  
                  <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.6', display: 'block', marginBottom: 24 }}>
                    Report customer complaints with detailed information, attachments, and material selection for proper tracking and resolution.
                  </Text>
                  
                  <Link to="/interactions/complaint">
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<PlusOutlined />}
                      style={{ 
                        background: '#ff4d4f', 
                        borderColor: '#ff4d4f',
                        borderRadius: 8,
                        height: 44,
                        minWidth: 160
                      }}
                    >
                      Create Complaint
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={12}>
              <Card
                hoverable
                style={{ 
                  height: '280px',
                  borderRadius: 12, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e8e8e8',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    background: '#f6ffed', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    border: '2px solid #b7eb8f'
                  }}>
                    <FileTextOutlined style={{ fontSize: 36, color: '#52c41a' }} />
                  </div>
                  
                  <Title level={3} style={{ margin: '0 0 12px 0', color: '#52c41a' }}>
                    Proforma Requisition
                  </Title>
                  
                  <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.6', display: 'block', marginBottom: 24 }}>
                    Create proforma requisitions for different materials, track requests, and manage the approval workflow efficiently.
                  </Text>
                  
                  <Link to="/interactions/performa">
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<PlusOutlined />}
                      style={{ 
                        background: '#52c41a', 
                        borderColor: '#52c41a',
                        borderRadius: 8,
                        height: 44,
                        minWidth: 160
                      }}
                    >
                      Create Proforma
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quick Navigation */}
          <Card 
            style={{ 
              marginTop: 32,
              borderRadius: 12, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e8e8e8'
            }}
            title={
              <Space>
                <ArrowRightOutlined style={{ color: '#1890ff' }} />
                <Text strong>Quick Navigation</Text>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Link to="/customer-engagement">
                  <Card 
                    size="small" 
                    hoverable
                    style={{ textAlign: 'center', background: '#fafafa' }}
                  >
                    <ExclamationCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                    <div><Text strong>View Complaints</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>Manage existing complaints</Text></div>
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/proformas">
                  <Card 
                    size="small" 
                    hoverable
                    style={{ textAlign: 'center', background: '#fafafa' }}
                  >
                    <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                    <div><Text strong>View Proformas</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>Track proforma requests</Text></div>
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/dashboard">
                  <Card 
                    size="small" 
                    hoverable
                    style={{ textAlign: 'center', background: '#fafafa' }}
                  >
                    <InteractionOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                    <div><Text strong>Dashboard</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>Overview and analytics</Text></div>
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/settings">
                  <Card 
                    size="small" 
                    hoverable
                    style={{ textAlign: 'center', background: '#fafafa' }}
                  >
                    <Badge status="default" />
                    <div><Text strong>Settings</Text></div>
                    <div><Text type="secondary" style={{ fontSize: '12px' }}>System configuration</Text></div>
                  </Card>
                </Link>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Interactions
