import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { Menu, Typography, Tooltip } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import {
  SettingOutlined,
  DashboardOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  InboxOutlined,
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
    path === '/dashboard' ? 'dashboard'
      : path === '/scrap-purchase/csv-excel-uploader' ? 'scrap-purchase:csv-uploader'
        : path === '/scrap-purchase/purchase-records' ? 'scrap-purchase:purchase-records'
          : path === '/scrap-purchase/material-rate' ? 'scrap-purchase:material-rate'
            : path.startsWith('/scrap-purchase/stock') ? 'stock-management'
              : path.startsWith('/scrap-purchase') ? 'scrap-purchase'
                : path.startsWith('/customer-management') ? 'customer-management'
                  : path.startsWith('/scrap-transport/internal-agencies') ? 'scrap-transport:internal-agencies'
                    : path.startsWith('/scrap-transport/internal-agreements') ? 'scrap-transport:internal-agreements'
                      : path === '/scrap-transport/internal-csv-upload' ? 'scrap-transport:internal-csv-upload'
                        : path === '/scrap-transport/upload-transport-data' ? 'scrap-transport:upload-transport-data'
                          : path === '/scrap-transport/daily-aggregate' ? 'scrap-transport:daily-aggregate'
                            : path === '/scrap-transport/scrap-movers-approval' ? 'scrap-transport:movers-approval'
                              : path === '/scrap-transport/scrap-movers-payment' ? 'scrap-transport:movers-payment'
                                : path === '/raw-material/issue' ? 'raw-material:issue'
                                  : path === '/settings/user-management' ? 'settings:user-management'
                                    : path === '/settings/melting-plants' ? 'settings:melting-plants'
                                      : path === '/settings/grn-serial' ? 'settings:grn-serial'
                                        : path === '/settings/stock-beginning-balance' ? 'settings:stock-beginning-balance'
                                          : path === '/reports/plain-report' ? 'reports:purchase-grn:plain-report'
                                            : path === '/reports/aggregate-report' ? 'reports:purchase-grn:aggregate-report'
                                              : path === '/reports/customer-plain-report' ? 'reports:purchase-grn:customer-plain-report'
                                                : path === '/reports/customer-aggregate-report' ? 'reports:purchase-grn:customer-aggregate-report'
                                                  : path.startsWith('/reports/aggregate-purchase') ? 'reports:aggregate-purchase'
                                                    : path.startsWith('/reports/daily-purchase-performance') ? 'reports:daily-purchase-performance'
                                                      : path.startsWith('/reports/scrap-transport/agency-performance') ? 'reports:scrap-transport:agency-performance'
                                                        : path.startsWith('/reports/scrap-transport/raw-scrap-report') ? 'reports:scrap-transport:raw-scrap-report'
                                                          : path.startsWith('/reports/daily-scrap-move-aggregate') ? 'reports:daily-scrap-move-aggregate'
                                                            : path.startsWith('/reports/agency-performance') ? 'reports:agency-performance'
                                                              : path === '/reports/stock-report' ? 'reports:stock-reports:stock-report'
                                                                : path === '/reports/stock-card' ? 'reports:stock-reports:stock-card'
                                                                  : path === '/reports/stock-aggregated-report' ? 'reports:stock-reports:stock-aggregated-report'
                                                                    : path.startsWith('/reports/stock') ? 'reports:stock-reports'
                                                                      : path === '/reports/raw-material/requisition-receipt' ? 'reports:raw-material:requisition-receipt'
                                                                        : path === '/reports/raw-material/issue-receipt' ? 'reports:raw-material:issue-receipt'
                                                                          : path.startsWith('/reports/raw-material/requisition') ? 'reports:raw-material:requisition'
                                                                          : path.startsWith('/reports/raw-material/issue-report') ? 'reports:raw-material:issue'
                                                                            : path.startsWith('/reports/grn-note-report') ? 'reports:purchase-grn:grn-note-report'
                                                                              : path.startsWith('/reports/approval-note-report') ? 'reports:purchase-grn:approval-note-report'
                                                                                : path.startsWith('/reports/grn-receipt') ? 'reports:grn-receipt'
                                                                                  : path.startsWith('/reports/scrap-purchase-approval-receipt') ? 'reports:scrap-purchase-approval-receipt'
                                                                                    : path.startsWith('/reports') ? 'reports'
                                                                                      : path.startsWith('/settings') ? 'settings'
                                                                                        : 'dashboard'

  const activeKey = selected || inferred

  // Accordion: compute which root menu should be open based on active route
  const getDefaultOpenKeys = () => {
    if (!activeKey.includes(':')) return []
    const parts = activeKey.split(':')
    const keys = []
    let current = ''
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}:${parts[i]}` : parts[i]
      keys.push(current)
    }
    return keys
  }
  const [openKeys, setOpenKeys] = useState(getDefaultOpenKeys)

  React.useEffect(() => {
    setOpenKeys(prev => {
      const neededKeys = getDefaultOpenKeys()
      if (neededKeys.length === 0) return prev
      const rootKey = neededKeys[0]
      // keep only keys from the current root hierarchy
      return Array.from(new Set([...prev.filter(k => k.startsWith(rootKey)), ...neededKeys]))
    })
  }, [activeKey])

  const rootKeys = ['scrap-purchase', 'stock-management', 'customer-management', 'scrap-transport', 'raw-material', 'reports', 'settings']

  const onOpenChange = (keys) => {
    // Find which root key was newly opened
    const newlyOpened = keys.find(k => !openKeys.includes(k))
    if (newlyOpened && rootKeys.includes(newlyOpened)) {
      // Keep only this root key (and any child sub-menus under it)
      setOpenKeys(keys.filter(k => k.startsWith(newlyOpened)))
    } else {
      setOpenKeys(keys)
    }
  }

  const primaryColor = 'rgb(245, 34, 45)'
  const getStyle = (key) => {
    const isActive = activeKey === key || activeKey.startsWith(key + ':')
    return {
      color: isActive ? primaryColor : 'inherit',
      fontWeight: isActive ? 600 : 400,
      textDecoration: 'none'
    }
  }

  const withTooltip = (label, title) => (
    <Tooltip title={title} placement="right">
      {label}
    </Tooltip>
  )

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={getStyle('dashboard')} />,
      label: withTooltip(<Link to="/dashboard" style={getStyle('dashboard')}>Dashboard</Link>, 'Dashboard')
    },
    {
      key: 'scrap-purchase',
      icon: <ShoppingCartOutlined style={getStyle('scrap-purchase')} />,
      label: withTooltip(<span style={getStyle('scrap-purchase')}>Scrap Purchase</span>, 'Scrap Purchase'),
      children: [
        {
          key: 'scrap-purchase:csv-uploader',
          label: withTooltip(<Link to="/scrap-purchase/csv-excel-uploader" style={getStyle('scrap-purchase:csv-uploader')}>CSV/Excel Uploader</Link>, 'CSV/Excel Uploader')
        },
        {
          key: 'scrap-purchase:purchase-records',
          label: withTooltip(<Link to="/scrap-purchase/purchase-records" style={getStyle('scrap-purchase:purchase-records')}>Purchase Records</Link>, 'Purchase Records')
        },
        {
          key: 'scrap-purchase:material-rate',
          label: withTooltip(<Link to="/scrap-purchase/material-rate" style={getStyle('scrap-purchase:material-rate')}>Material Rate</Link>, 'Material Rate')
        }
      ]
    },
    {
      key: 'stock-management',
      icon: <InboxOutlined style={getStyle('stock-management')} />,
      label: withTooltip(<Link to="/scrap-purchase/stock" style={getStyle('stock-management')}>Stock Management</Link>, 'Stock Management')
    },
    {
      key: 'customer-management',
      icon: <TeamOutlined style={getStyle('customer-management')} />,
      label: withTooltip(<Link to="/customer-management" style={getStyle('customer-management')}>Customer Management</Link>, 'Customer Management')
    },
    {
      key: 'scrap-transport',
      icon: <CarOutlined style={getStyle('scrap-transport')} />,
      label: withTooltip(<span style={getStyle('scrap-transport')}>Scrap Transport</span>, 'Scrap Transport'),
      children: [
        {
          key: 'scrap-transport:agency-registration',
          label: withTooltip(<Link to="/scrap-transport/agency-registration" style={getStyle('scrap-transport:agency-registration')}>Agency Registration</Link>, 'Agency Registration')
        },
        {
          key: 'scrap-transport:internal-csv-upload',
          label: withTooltip(<Link to="/scrap-transport/internal-csv-upload" style={getStyle('scrap-transport:internal-csv-upload')}>Internal CSV upload</Link>, 'Internal CSV upload')
        },
        {
          key: 'scrap-transport:upload-transport-data',
          label: withTooltip(<Link to="/scrap-transport/upload-transport-data" style={getStyle('scrap-transport:upload-transport-data')}>Raw Scrap Transport Data</Link>, 'Raw Scrap Transport Data')
        },
        {
          key: 'scrap-transport:daily-aggregate',
          label: withTooltip(<Link to="/scrap-transport/daily-aggregate" style={getStyle('scrap-transport:daily-aggregate')}>Daily Transport Aggregate</Link>, 'Daily Transport Aggregate')
        },
        {
          key: 'scrap-transport:movers-approval',
          label: withTooltip(<Link to="/scrap-transport/scrap-movers-approval" style={getStyle('scrap-transport:movers-approval')}>Scrap Movers Approval</Link>, 'Scrap Movers Approval')
        },
        {
          key: 'scrap-transport:movers-payment',
          label: withTooltip(<Link to="/scrap-transport/scrap-movers-payment" style={getStyle('scrap-transport:movers-payment')}>Scrap Movers Payment</Link>, 'Scrap Movers Payment')
        },
        {
          key: 'scrap-transport:internal-agencies',
          label: withTooltip(<Link to="/scrap-transport/internal-agencies" style={getStyle('scrap-transport:internal-agencies')}>Internal Agencies</Link>, 'Internal Agencies')
        },
        {
          key: 'scrap-transport:internal-agreements',
          label: withTooltip(<Link to="/scrap-transport/internal-agreements" style={getStyle('scrap-transport:internal-agreements')}>Agencies Agreements</Link>, 'Agencies Agreements')
        },
      ]
    },
    {
      key: 'raw-material',
      icon: <DatabaseOutlined style={getStyle('raw-material')} />,
      label: withTooltip(<span style={getStyle('raw-material')}>Raw Material</span>, 'Raw Material'),
      children: [
        {
          key: 'raw-material:requisition',
          label: withTooltip(<Link to="/raw-material/requisition" style={getStyle('raw-material:requisition')}>Material Requisition</Link>, 'Material Requisition')
        },
        {
          key: 'raw-material:issue',
          label: withTooltip(<Link to="/raw-material/issue" style={getStyle('raw-material:issue')}>Raw Material Issue</Link>, 'Raw Material Issue')
        }
      ]
    },
    {
      key: 'reports',
      icon: <BarChartOutlined style={getStyle('reports')} />,
      label: withTooltip(<span style={getStyle('reports')}>Reports</span>, 'Reports'),
      children: [
        {
          key: 'reports:purchase-grn',
          label: withTooltip(<span style={getStyle('reports:purchase-grn')}>Purchase/GRN Reports</span>, 'Purchase/GRN Reports'),
          children: [
            {
              key: 'reports:purchase-grn:plain-report',
              label: withTooltip(<Link to="/reports/plain-report" style={getStyle('reports:purchase-grn:plain-report')}>Plain GRN Report</Link>, 'Plain GRN Report')
            },
            {
              key: 'reports:purchase-grn:aggregate-report',
              label: withTooltip(<Link to="/reports/aggregate-report" style={getStyle('reports:purchase-grn:aggregate-report')}>Aggregate Report</Link>, 'Aggregate Report')
            },
            {
              key: 'reports:purchase-grn:customer-plain-report',
              label: withTooltip(<Link to="/reports/customer-plain-report" style={getStyle('reports:purchase-grn:customer-plain-report')}>Customer Plain Report</Link>, 'Customer Plain Report')
            },
            {
              key: 'reports:purchase-grn:customer-aggregate-report',
              label: withTooltip(<Link to="/reports/customer-aggregate-report" style={getStyle('reports:purchase-grn:customer-aggregate-report')}>Customer Aggregated Report</Link>, 'Customer Aggregated Report')
            },
            {
              key: 'reports:purchase-grn:grn-note-report',
              label: withTooltip(<Link to="/reports/grn-note-report" style={getStyle('reports:purchase-grn:grn-note-report')}>GRN Note Report</Link>, 'GRN Note Report')
            },
            {
              key: 'reports:purchase-grn:approval-note-report',
              label: withTooltip(<Link to="/reports/approval-note-report" style={getStyle('reports:purchase-grn:approval-note-report')}>Approval Note Report</Link>, 'Approval Note Report')
            }
          ]
        },
        {
          key: 'reports:daily-purchase-performance',
          label: withTooltip(<Link to="/reports/daily-purchase-performance" style={getStyle('reports:daily-purchase-performance')}>Daily Purchase Performance Report</Link>, 'Daily Purchase Performance Report')
        },
        {
          key: 'reports:scrap-transport',
          label: withTooltip(<span style={getStyle('reports:scrap-transport')}>Scrap Transport Report</span>, 'Scrap Transport Report'),
          children: [
            {
              key: 'reports:scrap-transport:agency-performance',
              label: withTooltip(<Link to="/reports/scrap-transport/agency-performance" style={getStyle('reports:scrap-transport:agency-performance')}>Agency Performance</Link>, 'Agency Performance')
            },
            {
              key: 'reports:scrap-transport:raw-scrap-report',
              label: withTooltip(<Link to="/reports/scrap-transport/raw-scrap-report" style={getStyle('reports:scrap-transport:raw-scrap-report')}>Raw Scrap Transport Report</Link>, 'Raw Scrap Transport Report')
            }
          ]
        },
        {
          key: 'reports:daily-scrap-move-aggregate',
          label: withTooltip(<Link to="/reports/daily-scrap-move-aggregate" style={getStyle('reports:daily-scrap-move-aggregate')}>Daily Scrap Move Aggregate Report</Link>, 'Daily Scrap Move Aggregate Report')
        },
        {
          key: 'reports:agency-performance',
          label: withTooltip(<Link to="/reports/agency-performance" style={getStyle('reports:agency-performance')}>Agency Performance Report</Link>, 'Agency Performance Report')
        },
        {
          key: 'reports:stock-reports',
          label: withTooltip(<span style={getStyle('reports:stock-reports')}>Stock Reports</span>, 'Stock Reports'),
          children: [
            {
              key: 'reports:stock-reports:stock-report',
              label: withTooltip(<Link to="/reports/stock-report" style={getStyle('reports:stock-reports:stock-report')}>Stock Report</Link>, 'Stock Report')
            },
            {
              key: 'reports:stock-reports:stock-card',
              label: withTooltip(<Link to="/reports/stock-card" style={getStyle('reports:stock-reports:stock-card')}>Stock Card</Link>, 'Stock Card')
            },
            {
              key: 'reports:stock-reports:stock-aggregated-report',
              label: withTooltip(<Link to="/reports/stock-aggregated-report" style={getStyle('reports:stock-reports:stock-aggregated-report')}>Stock Aggregated Report</Link>, 'Stock Aggregated Report')
            }
          ]
        },
        {
          key: 'reports:raw-material',
          label: withTooltip(<span style={getStyle('reports:raw-material')}>Raw Material Reports</span>, 'Raw Material Reports'),
          children: [
            {
              key: 'reports:raw-material:requisition',
              label: withTooltip(<Link to="/reports/raw-material/requisition" style={getStyle('reports:raw-material:requisition')}>Material Requisition Report</Link>, 'Material Requisition Report')
            },
            {
              key: 'reports:raw-material:requisition-receipt',
              label: withTooltip(<Link to="/reports/raw-material/requisition-receipt" style={getStyle('reports:raw-material:requisition-receipt')}>Material Requisition Receipt</Link>, 'Material Requisition Receipt')
            },
            {
              key: 'reports:raw-material:issue-receipt',
              label: withTooltip(<Link to="/reports/raw-material/issue-receipt" style={getStyle('reports:raw-material:issue-receipt')}>Material Issue Receipt</Link>, 'Material Issue Receipt')
            },
            {
              key: 'reports:raw-material:issue',
              label: withTooltip(<Link to="/reports/raw-material/issue-report" style={getStyle('reports:raw-material:issue')}>Material Issue Report</Link>, 'Material Issue Report')
            }
          ]
        },
        {
          key: 'reports:material-issue',
          label: withTooltip(<Link to="/reports/material-issue" style={getStyle('reports:material-issue')}>Material Issue</Link>, 'Material Issue')
        },
        {
          key: 'reports:grn-receipt',
          label: withTooltip(<Link to="/reports/grn-receipt" style={getStyle('reports:grn-receipt')}>GRN Receipt</Link>, 'GRN Receipt')
        },
        {
          key: 'reports:scrap-purchase-approval-receipt',
          label: withTooltip(<Link to="/reports/scrap-purchase-approval-receipt" style={getStyle('reports:scrap-purchase-approval-receipt')}>Scrap Purchase Approval Receipt</Link>, 'Scrap Purchase Approval Receipt')
        }
      ]
    },
    {
      key: 'settings:user-management',
      icon: <UserOutlined style={getStyle('settings:user-management')} />,
      label: withTooltip(<Link to="/settings/user-management" style={getStyle('settings:user-management')}>User Management</Link>, 'User Management')
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={getStyle('settings')} />,
      label: withTooltip(<span style={getStyle('settings')}>Settings</span>, 'Settings'),
      children: [
        {
          key: 'settings:melting-plants',
          label: withTooltip(<Link to="/settings/melting-plants" style={getStyle('settings:melting-plants')}>Melting Plant</Link>, 'Melting Plant')
        },
        {
          key: 'settings:grn-serial',
          label: withTooltip(<Link to="/settings/grn-serial" style={getStyle('settings:grn-serial')}>GRN Serial Number</Link>, 'GRN Serial Number')
        },
        {
          key: 'settings:stock-beginning-balance',
          label: withTooltip(<Link to="/settings/stock-beginning-balance" style={getStyle('settings:stock-beginning-balance')}>Stock Beginning Balance</Link>, 'Stock Beginning Balance')
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
          Material Requisition
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
          openKeys={openKeys}
          onOpenChange={onOpenChange}
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
            © 2026 Scrap Transport
          </Text>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
