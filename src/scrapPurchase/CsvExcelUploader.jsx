import React, { useMemo, useState } from 'react'
import { Card, Typography, Space, Select, Button, Upload, message, Divider, Alert } from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import Header from '../layouts/Header'
import Sidebar from '../layouts/Sidebar'
import { useUploadGrnCsv } from '../api/useUploadGrnCsv'

const { Title, Text } = Typography
const { Dragger } = Upload

const getLastNDates = (n = 7) => {
  const today = new Date()
  const results = []
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().slice(0, 10) // YYYY-MM-DD
    results.push({
      label: d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        weekday: 'short'
      }),
      value: iso
    })
  }
  return results
}

const CsvExcelUploader = () => {
  const [fileList, setFileList] = useState([])
  const [selectedDate, setSelectedDate] = useState()
  const { isUploading, summary: uploadSummary, setSummary, upload } = useUploadGrnCsv()

  const dateOptions = useMemo(() => getLastNDates(7), [])

  const uploadProps = {
    accept: '.csv',
    multiple: false,
    fileList,
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
      const summary = await upload({ file, date: selectedDate })
      message.success(summary?.message || 'CSV uploaded successfully.')
      setFileList([])
    } catch (err) {
      console.error('CSV upload failed', err)
      message.error(err.message || 'CSV upload failed')
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar selected="scrap-purchase" />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <Title level={3} style={{ marginBottom: 4 }}>CSV / Excel Uploader</Title>
          <Text type="secondary">
            Upload scrap purchase CSV files for the last seven days (today, yesterday and previous 5 days).
          </Text>

          <Card
            style={{
              marginTop: 16,
              borderRadius: 10,
              boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
            }}
          >
            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              {uploadSummary && (
                <Alert
                  type={uploadSummary.result === 'success' ? 'success' : 'warning'}
                  showIcon
                  message={uploadSummary.message}
                  description={(
                    <div style={{ marginTop: 6 }}>
                      {uploadSummary.totalRecords !== null && (
                        <div>
                          <Text strong>Total records: </Text>
                          <Text>{uploadSummary.totalRecords}</Text>
                        </div>
                      )}
                      {uploadSummary.skipped && Object.keys(uploadSummary.skipped).length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <Text strong>Skipped records:</Text>
                          <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                            {Object.entries(uploadSummary.skipped).map(([key, arr]) => (
                              <li key={key}>
                                <Text>
                                  {key.replace(/_/g, ' ')}: {Array.isArray(arr) ? arr.length : 0}
                                </Text>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                />
              )}

              <div>
                <Text strong>Date (optional)</Text>
                <div style={{ marginTop: 6 }}>
                  <Select
                    allowClear
                    placeholder="Select a date (can be left empty)"
                    style={{ width: '100%', maxWidth: 320 }}
                    options={dateOptions}
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  If not selected, the backend will use its default date handling.
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
                >
                  Upload
                </Button>
              </div>
            </Space>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CsvExcelUploader

