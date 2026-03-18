import React, { useState } from 'react'
import { Card, Typography, Table, Alert, Dropdown, Modal, Descriptions, Tag, Button } from 'antd'
import { MoreOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { usePurchaseRecords } from '../api/usePurchaseRecords'

const { Title, Text } = Typography

const PurchaseRecords = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [viewRecord, setViewRecord] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const { records, total, loading, error } = usePurchaseRecords({ page, pageSize })

  const handleView = (record) => {
    setViewRecord(record)
    setViewModalOpen(true)
  }

  const handleEdit = (record) => {
    // Placeholder for edit functionality
    console.log('Edit record:', record)
  }

  const getActionItems = (record) => [
    {
      key: 'view',
      label: 'View',
      icon: <EyeOutlined />,
      onClick: () => handleView(record)
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => handleEdit(record)
    }
  ]

  const columns = [
    {
      title: 'Record No',
      dataIndex: 'record_no',
      key: 'record_no',
      width: 110
    },
    {
      title: 'Plate No',
      dataIndex: 'plate_no',
      key: 'plate_no',
      width: 120
    },
    {
      title: 'First Weight',
      dataIndex: 'first_weight',
      key: 'first_weight',
      render: (v) => v ?? '-',
      width: 120
    },
    {
      title: 'Second Weight',
      dataIndex: 'second_weight',
      key: 'second_weight',
      render: (v) => v ?? '-',
      width: 130
    },
    {
      title: 'Net Weight',
      dataIndex: 'net_weight',
      key: 'net_weight',
      render: (v) => v ?? '-',
      width: 120
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 120
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      width: 140
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => (v ? v.toUpperCase() : '-')
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      render: (v) => (v !== null && v !== undefined ? v : '-')
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 70,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
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
    }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="scrap-purchase" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <Title level={3} style={{ marginBottom: 4 }}>Purchase Records</Title>
          <Text type="secondary">
            View GRN records with vehicle, weight, material type and amount details.
          </Text>

          <Card
            style={{
              marginTop: 16,
              borderRadius: 10,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
            }}
          >
            {error && (
              <Alert
                type="error"
                message="Failed to load purchase records"
                description={error}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Table
              rowKey="_id"
              columns={columns}
              dataSource={records}
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
                onChange: (p, ps) => {
                  setPage(p)
                  setPageSize(ps)
                }
              }}
              scroll={{ x: 900 }}
            />
          </Card>
        </div>
      </div>

      {/* View Record Modal */}
      <Modal
        title={
          <span style={{ fontWeight: 600, fontSize: 16 }}>
            Purchase Record Details
          </span>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {viewRecord && (
          <Descriptions
            bordered
            column={2}
            size="small"
            style={{ marginTop: 8 }}
          >
            <Descriptions.Item label="Record No">{viewRecord.record_no ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Plate No">{viewRecord.plate_no ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="First Weight">{viewRecord.first_weight ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Second Weight">{viewRecord.second_weight ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Net Weight">{viewRecord.net_weight ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Customer">{viewRecord.customer ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Material Type">{viewRecord.material_type ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Amount">{viewRecord.amount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {viewRecord.status ? (
                <Tag color={viewRecord.status.toLowerCase() === 'completed' ? 'green' : viewRecord.status.toLowerCase() === 'pending' ? 'orange' : 'blue'}>
                  {viewRecord.status.toUpperCase()}
                </Tag>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">{viewRecord.created_at ?? '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default PurchaseRecords

