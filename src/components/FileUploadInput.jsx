import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { FILE_UPLOAD_URL } from '../api/config';
import { useAuth } from '../auth/AuthProvider';

/**
 * FileUploadInput - generic uploader that returns filename to parent
 * @param {Object} props
 * @param {String} props.value - Filename (from Form.Item)
 * @param {Function} props.onChange - Handler to update value in Form
 * @param {String} props.placeholder - Placeholder text
 */
const FileUploadInput = ({ value, onChange, placeholder = 'Click to upload' }) => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      // Backend typically returns { data: { filename: '...' } } or similar
      const filename = info.file.response?.data?.filename || info.file.response?.filename;
      if (filename) {
        onChange(filename);
        message.success(`${info.file.name} uploaded successfully`);
      } else {
        message.error('File uploaded but filename not returned.');
      }
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error(`${info.file.name} upload failed.`);
    }
  };

  return (
    <div className="file-upload-input">
      <Upload
        name="file"
        action={FILE_UPLOAD_URL}
        headers={{
          Authorization: `Bearer ${auth?.token || localStorage.getItem('access_token')}`,
        }}
        showUploadList={false}
        onChange={handleChange}
        accept="image/*"
      >
        <Button 
          icon={loading ? <LoadingOutlined /> : <UploadOutlined />} 
          style={{ width: '100%', borderRadius: '6px' }}
        >
          {value ? (
            <span style={{ color: '#52c41a' }}>{value} (Uploaded)</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </Upload>
    </div>
  );
};

export default FileUploadInput;
