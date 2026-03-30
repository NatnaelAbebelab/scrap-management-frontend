import React, { useState } from 'react';
import { Card, Button, message, Tag, Input, Space, Row, Col, Typography, AutoComplete } from 'antd';
import { FilePdfOutlined, SearchOutlined } from '@ant-design/icons';
import { apiRequest } from '../api/core/apiRequest';
import { RAW_MATERIAL_ISSUE_DETAIL_URL, RAW_MATERIAL_ISSUE_GET_URL } from '../api/config';
import SimpleDataTable from '../components/SimpleDataTable';
import { pdf } from '@react-pdf/renderer';
import MaterialIssueReceiptPDF from '../components/pdfComponent/MaterialIssueReceiptPDF';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { formatDate } from '../utils/dateFormatter';

const { Title, Text } = Typography;

/**
 * MaterialIssueReceiptReport
 * 
 * Lists a specific Material Issue record and provides a "Get Receipt" action.
 */
const MaterialIssueReceiptReport = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchNo, setSearchNo] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('issue_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchRecordByNo = async () => {
    const val = searchNo.trim();
    if (!val) {
      message.warning('Please enter an issue number');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest({
        url: RAW_MATERIAL_ISSUE_GET_URL,
        method: 'GET',
        params: {
          issue_no: val,
          page_size: 1
        }
      });

      if (response.result === 'success' && response.content?.results?.length > 0) {
        const record = response.content.results[0];
        setDataSource([record]);
        message.success('Record found');

        if (!history.includes(val)) {
          const newHistory = [val, ...history.slice(0, 9)];
          setHistory(newHistory);
          localStorage.setItem('issue_search_history', JSON.stringify(newHistory));
        }
      } else {
        setDataSource([]);
        message.error('Issue not found');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('An error occurred while fetching the record');
    } finally {
      setLoading(false);
    }
  };

  const handleGetPDF = async (id) => {
    message.loading({ content: 'Generating PDF...', key: 'pdf_loading' });
    try {
      const response = await apiRequest({
        url: RAW_MATERIAL_ISSUE_DETAIL_URL(id),
        method: 'GET',
      });

      if (response.result === 'success' && response.content) {
        const blob = await pdf(<MaterialIssueReceiptPDF data={response} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${response.content.issue_no} - Material Issue.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        message.success({ content: 'PDF generated successfully!', key: 'pdf_loading', duration: 2 });
      } else {
        message.error({ content: response.message || 'Failed to get record details', key: 'pdf_loading' });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      message.error({ content: 'Failed to generate PDF', key: 'pdf_loading' });
    }
  };

  const columns = [
    {
      title: 'Issue No',
      dataIndex: 'issue_no',
      key: 'issue_no',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'issue_date',
      key: 'issue_date',
      render: (text) => formatDate(text)
    },
    {
      title: 'Issue Weight',
      dataIndex: 'issue_weight',
      key: 'issue_weight',
      render: (val) => <Text strong>{Number(val || 0).toLocaleString()} Kg</Text>
    },
    {
      title: 'Status',
      dataIndex: 'issue_status',
      key: 'issue_status',
      render: (status) => {
        let color = 'gold';
        if (status === 'approved') color = 'green';
        return <Tag color={color}>{(status || 'unknown').toUpperCase()}</Tag>
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={() => handleGetPDF(record._id)}
          style={{ background: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }}
        >
          Get Receipt
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220 }}>
        <Header />
        <div className="page-wrapper" style={{ padding: 20 }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={3}>Material Issue Receipt</Title>
            <Text type="secondary">Retrieve and generate Raw Material Issue Vouchers by issue number.</Text>
          </div>

          <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <AutoComplete
                  options={history.map(h => ({ value: h }))}
                  value={searchNo}
                  onChange={(val) => setSearchNo(val)}
                  onSelect={(val) => setSearchNo(val)}
                  style={{ width: '100%' }}
                >
                  <Input
                    placeholder="Enter Issue Number (e.g. ISS-004)"
                    size="large"
                    onPressEnter={fetchRecordByNo}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ borderRadius: 8 }}
                  />
                </AutoComplete>
              </Col>
              <Col span={4}>
                <Button
                  type="primary"
                  onClick={fetchRecordByNo}
                  loading={loading}
                  style={{ borderRadius: 8, background: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)' }}
                  block
                >
                  Fetch Record
                </Button>
              </Col>
            </Row>
          </Card>

          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}>
            <SimpleDataTable
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="_id"
              locale={{ emptyText: searchNo ? 'No record found with this number' : 'Enter an issue number above to start' }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialIssueReceiptReport;
