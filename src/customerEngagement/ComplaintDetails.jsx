import React from 'react'
import { Card, Button, Divider, Tag } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'

// In a real app you'd fetch the complaint by id. Here we read from location state or show placeholder.
const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // placeholder content;
  const complaint = {
    id,
    buyerName: 'Sample Buyer',
    shopBranch: 'Sample Branch',
    email: 'sample@example.com',
    materialType: 'rebar',
    description: 'Sample description for complaint details.',
    date: '2026-01-24',
    status: 'Open',
  }

  const color = complaint.status === 'Open' ? 'orange' : complaint.status === 'Resolved' ? 'green' : 'blue'

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <Button onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>Back</Button>
          <Card style={{ borderRadius: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: 0 }}>{`Complaint #${complaint.id}`}</h2>
            <Divider />
            <p><strong>Buyer:</strong> {complaint.buyerName}</p>
            <p><strong>Shop/Branch:</strong> {complaint.shopBranch}</p>
            <p><strong>Email:</strong> {complaint.email}</p>
            <p><strong>Material:</strong> {complaint.materialType}</p>
            <Divider />
            <p><strong>Description</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
            <Divider />
            <p><strong>Date:</strong> {complaint.date}</p>
            <p><strong>Status:</strong> <Tag color={color}>{complaint.status}</Tag></p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ComplaintDetails
