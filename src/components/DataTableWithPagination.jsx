import React, { useState } from 'react';
import { Table, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * DataTableWithPagination
 * @param {Object} props
 * @param {Array} props.columns - Table columns
 * @param {Array} props.dataSource - Table data
 * @param {Boolean} props.loading - Loading state
 * @param {Number} props.total - Total records for pagination
 * @param {Number} props.page - Current page
 * @param {Number} props.pageSize - Page size
 * @param {Function} props.onPaginationChange - Handler for page/pageSize change (page, pageSize)
 * @param {Function} props.onSearch - Optional callback for parent-level search
 * @param {String} props.rowKey - Unique key for rows
 */
const DataTableWithPagination = ({
  columns,
  dataSource,
  loading,
  total,
  page,
  pageSize,
  onPaginationChange,
  onSearch,
  rowKey = 'id',
  minRows = 10,
  ...rest
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const handleSearch = (val) => {
    setLocalSearch(val);
    if (onSearch) onSearch(val);
  };

  // Local filtering if no external search is provided
  const displayData = onSearch
    ? dataSource
    : (localSearch
      ? dataSource.filter((item) =>
        Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(localSearch.toLowerCase())
        )
      )
      : dataSource);

  return (
    <div className="data-table-container">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Input
          placeholder="Search items..."
          prefix={<SearchOutlined style={{ color: 'rgb(245, 34, 45)' }} />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300, borderRadius: '8px' }}
          allowClear
        />
      </div>
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={displayData}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize || minRows,
          total: total || displayData.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (p, ps) => onPaginationChange && onPaginationChange(p, ps),
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          className: 'custom-pagination',
        }}
        scroll={{ x: 'max-content' }}
        {...rest}
      />
    </div>
  );
};

export default DataTableWithPagination;
