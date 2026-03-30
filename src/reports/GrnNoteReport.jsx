import React, { useState } from 'react';
import { Card, Button, message, Tag, Input, Space, Row, Col, Typography, AutoComplete } from 'antd';
import { FilePdfOutlined, SearchOutlined } from '@ant-design/icons';
import { apiRequest } from '../api/core/apiRequest';
import { GRN_RECEIPT_GET_URL } from '../api/config';
import SimpleDataTable from '../components/SimpleDataTable';
import { pdf } from '@react-pdf/renderer';
import GrnNotePDF from '../components/pdfComponent/GrnNotePDF';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';

const { Title, Text } = Typography;

/**
 * GrnNoteReport
 * 
 * Lists a specific GRN record by record number and provides a "Get Note" action.
 */
const GrnNoteReport = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchRecordNo, setSearchRecordNo] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('grn_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchRecordByNo = async () => {
    const val = searchRecordNo.trim();
    if (!val) {
      message.warning('Please enter a record number');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest({
        url: GRN_RECEIPT_GET_URL(val),
        method: 'GET',
      });

      if (response.result === 'success' && response.content) {
        // We put the single record into an array for the table
        setDataSource([response.content]);
        message.success('Record found');

        // Add to history if not already there
        if (!history.includes(val)) {
          const newHistory = [val, ...history.slice(0, 9)]; // Keep last 10
          setHistory(newHistory);
          localStorage.setItem('grn_search_history', JSON.stringify(newHistory));
        }
      } else {
        setDataSource([]);
        message.error(response.message || 'Record not found');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('An error occurred while fetching the record');
    } finally {
      setLoading(false);
    }
  };

  const handleGetNote = async (record_no) => {
    message.loading({ content: 'Generating PDF...', key: 'pdf_loading' });
    try {
      // Since we already have the record in table, we could pass it directly if it's the right shape
      // But for consistency with previous logic, we fetch again or reuse.
      const response = await apiRequest({
        url: GRN_RECEIPT_GET_URL(record_no),
        method: 'GET',
      });

      if (response.result === 'success' && response.content) {
        const blob = await pdf(<GrnNotePDF data={response} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${response.content.record_no} - GRN Note.pdf`;
        link.click();
        URL.revokeObjectURL(url); // Clean up memory
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
      title: 'Record No',
      dataIndex: 'record_no',
      key: 'record_no',
    },
    {
      title: 'Plate No',
      dataIndex: 'plate_no',
      key: 'plate_no',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (text, record) => {
        const name = [record.customer_first_name, record.customer_last_name].filter(Boolean).join(' ');
        return name || text || '-';
      }
    },
    {
      title: 'Material Type',
      dataIndex: 'material_type',
      key: 'material_type',
      render: (v) => <Tag color="blue">{v?.toUpperCase() || 'SCRAP'}</Tag>
    },
    {
      title: 'Net Weight',
      dataIndex: 'net_weight',
      key: 'net_weight',
      render: (val) => <Text strong>{val} Kg</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'gold'}>
          {(status || 'unknown').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={() => handleGetNote(record.record_no)}
          style={{ background: 'rgb(245, 34, 45)', borderColor: 'rgb(245, 34, 45)', padding: '10px 10px' }}
        >
          Get GRN Note
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
            <Title level={3}>GRN Note</Title>
            <Text type="secondary">Retrieve and generate Raw Material Goods Received Notes by record number.</Text>
          </div>

          <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <AutoComplete
                  options={history.map(h => ({ value: h }))}
                  value={searchRecordNo}
                  onChange={(val) => setSearchRecordNo(val)}
                  onSelect={(val) => {
                    setSearchRecordNo(val);
                  }}
                  filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  style={{ width: '100%' }}
                >
                  <Input
                    placeholder="Enter Record Number (e.g. 5017)"
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
              rowKey="record_no"
              locale={{ emptyText: searchRecordNo ? 'No record found with this number' : 'Enter a record number above to start' }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GrnNoteReport;
