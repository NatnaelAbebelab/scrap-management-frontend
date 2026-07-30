import React, { useState } from 'react'
import { Card, Typography, Space, Button, Upload, message, Divider, Alert } from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useUploadGrnCsv } from '../api/useUploadGrnCsv'
import DatePicker from '../components/DatePicker'

const { Title, Text } = Typography
const { Dragger } = Upload

const CsvExcelUploader = () => {
  const [fileList, setFileList] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const { isUploading, summary: uploadSummary, upload } = useUploadGrnCsv()

  const uploadProps = {
    accept: '.csv',
    multiple: false,
    fileList,
    disabled: isUploading,
    beforeUpload: (file) => {
      // Only keep the latest file
      setFileList([file])
      return false // prevent auto upload
    },
    onRemove: () => {
      setFileList([])
    }
  }

  const handleSubmit = async () => {
    if (!fileList.length) {
      message.warning('Please select a CSV file to upload.')
      return
    }

    const file = fileList[0]
    try {
      const summary = await upload({
        file,
        date: selectedDate // this is the date string from DatePicker
      })
      message.success(summary?.message || 'CSV uploaded successfully.')
      setFileList([])
    } catch (err) {
      console.error('CSV upload failed', err)
      message.error(err.message || 'Upload failed. Please check your connection and try again.')
    }
  }

  // Define date restriction: active today and 6 preceding days (total 7 days)
  const disabledDate = (current) => {
    if (!current) return false
    const today = dayjs().endOf('day')
    const sixDaysAgo = dayjs().subtract(6, 'day').startOf('day')
    return current.isAfter(today) || current.isBefore(sixDaysAgo)
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <Title level={3} style={{ marginBottom: 4 }}>CSV / Excel Uploader</Title>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Upload scrap purchase CSV files for the last seven days (today and previous 6 days).
            </Text>
          </div>

          <Card
            style={{
              marginTop: 16,
              borderRadius: 10,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
            }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ maxWidth: 320 }}>
                <Text strong>Date (optional)</Text>
                <div style={{ marginTop: 6 }}>
                  <DatePicker
                    value={selectedDate}
                    onChange={(dateStr) => setSelectedDate(dateStr)}
                    placeholder="Select a date"
                    disabledDate={disabledDate}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  If not selected, it will consider current active rate.
                </Text>
              </div>

              <Divider style={{ margin: '8px 0 12px' }} />

              <div>
                <Text strong>CSV File</Text>
                <Dragger {...uploadProps} style={{ marginTop: 8 }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
                  <p className="ant-upload-hint">Only one CSV file at a time. Format must match GRN template.</p>
                </Dragger>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleSubmit}
                  loading={isUploading}
                  disabled={!fileList.length}
                  style={{
                    borderRadius: '8px',
                    padding: '0 24px',
                    height: '40px',
                    color: '#ffffff' // Explicitly making the text color white
                  }}
                >
                  <span style={{ color: '#ffffff' }}>Upload</span>
                </Button>
              </div>

              {uploadSummary && (
                <Alert
                  type={uploadSummary.result === 'success' ? 'success' : 'warning'}
                  showIcon
                  message={uploadSummary.message}
                  description={(
                    <div style={{ marginTop: 6 }}>
                      {uploadSummary.totalGrns !== null && (
                        <div>
                          <Text strong>Total Records: </Text>
                          <Text>{uploadSummary.totalGrns}</Text>
                        </div>
                      )}
                      {uploadSummary.stockRecordsCreated !== null && (
                        <div style={{ marginTop: 4 }}>
                          <Text strong>Stock Records Created: </Text>
                          <Text>{uploadSummary.stockRecordsCreated}</Text>
                        </div>
                      )}
                      {uploadSummary.skipped && Object.keys(uploadSummary.skipped).length > 0 &&
                        Object.values(uploadSummary.skipped).some(arr => Array.isArray(arr) && arr.length > 0) && (
                          <div style={{ marginTop: 8 }}>
                            <Text strong>Skipped records:</Text>
                            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                              {Object.entries(uploadSummary.skipped).map(([key, arr]) =>
                                Array.isArray(arr) && arr.length > 0 ? (
                                  <li key={key}>
                                    <Text>
                                      {key.replace(/_/g, ' ')}: {arr.length}
                                    </Text>
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                />
              )}
            </Space>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CsvExcelUploader

