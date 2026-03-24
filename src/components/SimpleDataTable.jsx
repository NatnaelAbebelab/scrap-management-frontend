import React from 'react';
import { Table } from 'antd';

/**
 * SimpleDataTable
 * @param {Object} props
 * @param {Array} props.columns - Table columns
 * @param {Array} props.dataSource - Table data
 * @param {Boolean} props.loading - Loading state
 * @param {String} props.rowKey - Unique key for rows
 */
const SimpleDataTable = ({
  columns,
  dataSource,
  loading,
  rowKey = 'id',
  ...rest
}) => {
  return (
    <Table
      rowKey={rowKey}
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={false}
      scroll={{ x: 'max-content' }}
      {...rest}
    />
  );
};

export default SimpleDataTable;
