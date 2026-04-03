"use client"

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BellOutlined,
  ExpandOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons'
import {
  Input,
  Badge,
  Avatar,
  Dropdown,
  Typography,
  Button,
  Divider
} from 'antd'
import { useAuth } from '../auth/AuthProvider'
import { useLocation } from 'react-router-dom'

const { Text } = Typography
const { Search } = Input

const Header = ({ onMenuClick }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // NEW: Get user data from localStorage 'email' key as requested
  const getStoredUserData = () => {
    try {
      const stored = localStorage.getItem('ce_user')
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  }

  const storedUserData = getStoredUserData()
  const displayUser = storedUserData.email || auth?.user || {}

  // Format role: super_admin -> Super Admin
  const formatRole = (role) => {
    if (!role) return 'Administrator'
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const fullName = displayUser.first_name && displayUser.last_name
    ? `${displayUser.first_name} ${displayUser.last_name}`
    : (displayUser.name || 'User')

  const displayRole = formatRole(displayUser.role)

  const isPublicRoute = location.pathname === '/interactions/complaint' || location.pathname === '/interactions/performa'

  if (isPublicRoute) return null

  const handleLogout = async () => {
    try {
      // Made awaitable so the backend request fires reliably before unmount
      await auth.logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return 'Dashboard'
    if (path.startsWith('/interactions')) return 'Interactions'
    if (path.startsWith('/customer-engagement')) return 'Complaints'
    if (path.startsWith('/proformas')) return 'Proformas'
    if (path.startsWith('/settings/user-management')) return 'User Management'
    if (path.startsWith('/settings/materials')) return 'Material Management'
    if (path.startsWith('/settings/melting-plants')) return 'Melting Plant'
    if (path.startsWith('/settings/grn-serial')) return 'GRN Serial Number'
    if (path.startsWith('/settings/stock-beginning-balance')) return 'Stock Beginning Balance'
    if (path === '/settings') return 'Settings Dashboard'
    if (path.startsWith('/scrap-purchase/csv-excel-uploader')) return 'CSV/Excel Uploader'
    if (path.startsWith('/scrap-purchase/purchase-records')) return 'Purchase Records'
    if (path.startsWith('/scrap-purchase/material-rate')) return 'Material Rate'
    if (path.startsWith('/scrap-transport/agency-registration')) return 'Agency Registration'
    if (path.startsWith('/profile')) return 'User Profile'
    if (path.startsWith('/reports/raw-material/requisition-receipt')) return 'Requisition Receipt'
    if (path.startsWith('/reports/raw-material/issue-receipt')) return 'Issue Receipt'
    if (path.startsWith('/reports/raw-material/requisition')) return 'Material Requisition Report'
    if (path.startsWith('/reports/raw-material/issue-report')) return 'Material Issue Report'
    if (path.startsWith('/reports/grn-note-report')) return 'GRN Receipt'
    if (path.startsWith('/reports/approval-note-report')) return 'Approval Receipt'
    if (path.startsWith('/reports/scrap-transport/agency-performance')) return 'Agency Performance'
    if (path.startsWith('/reports/scrap-transport/raw-scrap-report')) return 'Raw Scrap Transport Report'
    if (path.startsWith('/reports')) return 'Report'
    if (path.startsWith('/customer-management')) return 'Customers'
    if (path.startsWith('/scrap-purchase/stock')) return 'Stock'
    if (path.startsWith('/scrap-transport/internal-agencies')) return 'Internal Agencies'
    if (path.startsWith('/scrap-transport/internal-agreements')) return 'Agencies Agreements'
    if (path.startsWith('/raw-material/requisition')) return 'Material Requisition'
    if (path.startsWith('/scrap-transport/upload-transport-data')) return 'Scrap Transport Data'
    if (path.startsWith('/scrap-transport/daily-aggregate')) return 'Daily Scrap Transport'
    return 'Scrap Transport'
  }

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true
    }
  ]

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div style={{
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 999
    }}>
      {/* Left Section - Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <Text strong style={{ fontSize: '18px', color: '#262626' }}>
            {getPageTitle()}
          </Text>
          {auth?.token && (
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
              Welcome back, {fullName}
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Search (Only show if logged in) */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px' }}>
        {auth?.token && (
          <Search
            placeholder="Search anything..."
            allowClear
            size="middle"
            style={{ width: '100%' }}
            onSearch={(value) => console.log('Search:', value)}
          />
        )}
      </div>

      {/* Right Section - Actions & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {auth?.token && (
          <>
            {/* Notifications */}
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                size="middle"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Badge>

            {/* Fullscreen Toggle */}
            <Button
              type="text"
              icon={<ExpandOutlined />}
              size="middle"
              onClick={toggleFullscreen}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />

            <Divider orientation="vertical" style={{ height: '24px' }} />

            {/* User Profile Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  backgroundColor: 'transparent',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Avatar
                  size={32}
                  style={{
                    background: 'linear-gradient(135deg, rgb(245, 34, 45) 0%, #D32F2F 100%)',
                    border: '2px solid #f0f0f0'
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <Text strong style={{ fontSize: '14px' }}>
                    {fullName}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {displayRole}
                  </Text>
                </div>
                <DownOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
              </div>
            </Dropdown>
          </>
        )}
      </div>
    </div>
  )
}

export default Header
