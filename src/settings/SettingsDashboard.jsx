import React from 'react'
import { Card, Button, Space } from 'antd'
import { Link } from 'react-router-dom'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'

const SettingsDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="settings" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <h2>Settings</h2>
          <Card>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              <Link to="/settings/materials">
                <Button type="primary" block>Material Management</Button>
              </Link>
              <Link to="/settings/melting-plants">
                <Button type="primary" block>Melting Plants</Button>
              </Link>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsDashboard
