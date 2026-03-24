import React from 'react'
import { Select, Typography } from 'antd'

const { Text } = Typography

/**
 * MultiSelectInput
 * @param {Object} props
 * @param {String} props.label - Label
 * @param {Array} props.options - [{ value, label }]
 * @param {Array} props.value - Selected values
 * @param {Function} props.onChange - Selection change handler
 * @param {String} props.placeholder - Select placeholder
 */
const MultiSelectInput = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select items...',
  ...rest
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && <Text strong style={{ fontSize: '14px', color: '#595959' }}>{label}</Text>}
      <Select
        mode="multiple"
        allowClear
        style={{ width: '100%' }}
        placeholder={placeholder}
        value={Array.isArray(value) ? value : []} // Ensure array
        onChange={onChange}
        options={options}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        styles={{
          popup: {
            root: { borderRadius: '8px' }
          }
        }}
        {...rest}
      />
    </div>
  )
}

export default MultiSelectInput
