"use client"

import React from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { Menu, Typography } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import {
  MessageOutlined,
  SettingOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons'

const { Text, Title } = Typography

const Sidebar = ({ selected }) => {
  const location = useLocation()
  const path = location.pathname || ''
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const isPublicRoute = path === '/interactions/complaint' || path === '/interactions/performa'

  if (!token || isPublicRoute) return null

  const inferred =
    path.startsWith('/dashboard') ? 'dashboard'
      : path.startsWith('/scrap-purchase') ? 'scrap-purchase'
        : path.startsWith('/scrap-transport') ? 'scrap-transport'
          : path.startsWith('/material-management') ? 'material-management'
            : path.startsWith('/reports') ? 'reports'
              : path.startsWith('/settings') ? 'settings'
                : 'dashboard'

  const activeKey = selected || inferred

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/dashboard" style={{ textDecoration: 'none' }}>Dashboard</Link>
    },
    {
      key: 'scrap-purchase',
      icon: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
      label: 'Scrap Purchase',
      children: [
        {
          key: 'scrap-purchase:csv-uploader',
          label: <Link to="/scrap-purchase/csv-excel-uploader" style={{ textDecoration: 'none' }}>CSV/Excel Uploader</Link>
        },
        {
          key: 'scrap-purchase:purchase-records',
          label: <Link to="/scrap-purchase/purchase-records" style={{ textDecoration: 'none' }}>Purchase Records</Link>
        },
        {
          key: 'scrap-purchase:material-price-setting',
          label: <Link to="/scrap-purchase/material-price-setting" style={{ textDecoration: 'none' }}>Material Price Setting</Link>
        },
        {
          key: 'scrap-purchase:stock',
          label: <Link to="/scrap-purchase/stock" style={{ textDecoration: 'none' }}>Stock</Link>
        }
      ]
    },
    {
      key: 'scrap-transport',
      icon: <CarOutlined style={{ fontSize: '16px' }} />,
      label: 'Scrap Transport',
      children: [
        {
          key: 'scrap-transport:agency-registration',
          label: <Link to="/scrap-transport/agency-registration" style={{ textDecoration: 'none' }}>Agency Registration</Link>
        },
        {
          key: 'scrap-transport:internal-csv-upload',
          label: <Link to="/scrap-transport/internal-csv-upload" style={{ textDecoration: 'none' }}>Internal CSV upload</Link>
        },
        {
          key: 'scrap-transport:movers-approval',
          label: <Link to="/scrap-transport/scrap-movers-approval" style={{ textDecoration: 'none' }}>Scrap Movers Approval</Link>
        },
        {
          key: 'scrap-transport:movers-payment',
          label: <Link to="/scrap-transport/scrap-movers-payment" style={{ textDecoration: 'none' }}>Scrap Movers Payment</Link>
        }
      ]
    },
    {
      key: 'material-management',
      icon: <DatabaseOutlined style={{ fontSize: '16px' }} />,
      label: 'Material Management',
      children: [
        {
          key: 'material-management:requisition',
          label: <Link to="/material-management/requisition" style={{ textDecoration: 'none' }}>Material Requisition</Link>
        },
        {
          key: 'material-management:issue',
          label: <Link to="/material-management/issue" style={{ textDecoration: 'none' }}>Material Issue</Link>
        }
      ]
    },
    {
      key: 'reports',
      icon: <BarChartOutlined style={{ fontSize: '16px' }} />,
      label: 'Reports',
      children: [
        {
          key: 'reports:aggregate-purchase',
          label: <Link to="/reports/aggregate-purchase" style={{ textDecoration: 'none' }}>Aggregate Purchase Report</Link>
        },
        {
          key: 'reports:daily-purchase-performance',
          label: <Link to="/reports/daily-purchase-performance" style={{ textDecoration: 'none' }}>Daily Purchase Performance Report</Link>
        },
        {
          key: 'reports:daily-scrap-move-aggregate',
          label: <Link to="/reports/daily-scrap-move-aggregate" style={{ textDecoration: 'none' }}>Daily Scrap Move Aggregate Report</Link>
        },
        {
          key: 'reports:agency-performance',
          label: <Link to="/reports/agency-performance" style={{ textDecoration: 'none' }}>Agency Performance Report</Link>
        },
        {
          key: 'reports:stock',
          label: <Link to="/reports/stock" style={{ textDecoration: 'none' }}>Stock Report</Link>
        },
        {
          key: 'reports:material-requisition',
          label: <Link to="/reports/material-requisition" style={{ textDecoration: 'none' }}>Material Requisition Report</Link>
        },
        {
          key: 'reports:material-issue',
          label: <Link to="/reports/material-issue" style={{ textDecoration: 'none' }}>Material Issue</Link>
        },
        {
          key: 'reports:grn-receipt',
          label: <Link to="/reports/grn-receipt" style={{ textDecoration: 'none' }}>GRN Receipt</Link>
        },
        {
          key: 'reports:scrap-purchase-approval-receipt',
          label: <Link to="/reports/scrap-purchase-approval-receipt" style={{ textDecoration: 'none' }}>Scrap Purchase Approval Receipt</Link>
        }
      ]
    },
    {
      key: 'settings:user-management',
      icon: <UserOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/settings/user-management" style={{ textDecoration: 'none' }}>User Management</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ fontSize: '16px' }} />,
      label: 'Settings',
      children: [
        {
          key: 'settings:plants-management',
          label: <Link to="/settings/plants-management" style={{ textDecoration: 'none' }}>Plants Management</Link>
        },
        {
          key: 'settings:initialize-grn',
          label: <Link to="/settings/initialize-grn" style={{ textDecoration: 'none' }}>Initialize GRN</Link>
        }
      ]
    }
  ]

  return (
    <div style={{
      width: 220,
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'white',
      borderRight: '1px solid #f0f0f0',
      boxShadow: '2px 0 8px rgba(0,0,0,0.06)'
    }}>
      {/* Logo/Brand Section */}
      <div style={{
        padding: '24px 16px',
        textAlign: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '8px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}>
          <img
            src="/steely.jpg"
            alt="Steely Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
        <Title level={4} style={{
          color: '#262626',
          margin: 0,
          fontSize: '16px',
          fontWeight: 600
        }}>
          Steely RMI
        </Title>
        <Text style={{
          color: '#8c8c8c',
          fontSize: '12px',
          display: 'block',
          marginTop: '4px'
        }}>
          Scrap Management System
        </Text>
      </div>

      {/* Navigation Menu */}
      <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          style={{
            borderRight: 0,
            background: 'transparent',
            fontSize: '14px'
          }}
          theme="light"
        />
      </div>

      {/* Bottom Section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Menu
          mode="inline"
          style={{
            borderRight: 0,
            background: 'transparent'
          }}
          theme="light"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined style={{ fontSize: '16px' }} />,
              label: 'Logout',
              onClick: () => { logout(); navigate('/login') },
              style: {
                color: 'rgb(245, 34, 45)',
                borderRadius: '6px',
                margin: '0 8px'
              }
            }
          ]}
        />

        <div style={{
          textAlign: 'center',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Text style={{
            color: '#8c8c8c',
            fontSize: '11px'
          }}>
            © 2026 Steely RMI
          </Text>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
