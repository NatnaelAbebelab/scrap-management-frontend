import React, { useState, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';

/**
 * FileUploadInput - generic uploader that returns file object to parent
 * @param {Object} props
 * @param {Object|String} props.value - File object or Filename string
 * @param {Function} props.onChange - Handler to update value in Form
 * @param {String} props.placeholder - Placeholder text
 */
const FileUploadInput = ({ value, onChange, placeholder = 'Click to upload' }) => {
  const [fileList, setFileList] = useState([]);

  // Sync internal state with external value changes (like form reset)
  useEffect(() => {
    if (!value) {
      setFileList([]);
    } else if (value instanceof File && fileList.length === 0) {
      setFileList([value]);
    }
  }, [value]);

  // Handle file selection
  const handleBeforeUpload = (file) => {
    setFileList([file]);
    if (onChange) {
      onChange(file);
    }
    return false; // Stop automatic upload
  };

  // Handle file removal
  const handleRemove = () => {
    setFileList([]);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="file-upload-input">
      <Upload
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        maxCount={1}
        showUploadList={false}
        accept="image/*"
      >
        <Button 
          icon={<UploadOutlined />} 
          style={{ width: '100%', borderRadius: '6px' }}
        >
          {value ? (
            <span style={{ color: '#52c41a' }}>
              {typeof value === 'string' ? value : value.name} (Selected)
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </Upload>
    </div>
  );
};

export default FileUploadInput;
