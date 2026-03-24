import React from 'react'
import { Select, Typography, Space } from 'antd'

const { Text } = Typography

/**
 * Reusable Select Input component with consistent styling
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.options - Key-value pair options or list of values
 * @param {any} props.value - Current value
 * @param {function} props.onChange - Change handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.size - Size of the select (default: large)
 */
const SelectInput = ({
  label,
  placeholder,
  options = {},
  loading = false,
  size = 'large',
  hint,
  ...rest
}) => {
  // Handle both array of objects and key-value object
  const selectOptions = Array.isArray(options)
    ? options
    : Object.entries(options).map(([key, value]) => ({
      label: value,
      value: key
    }))

  return (
    <div className="custom-select-input-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '14px', color: '#262626', fontWeight: 600 }}>{label}</Text>
          {hint && <Text type="secondary" style={{ fontSize: '11px' }}>{hint}</Text>}
        </div>
      )}
      <Select
        size={size}
        placeholder={placeholder}
        loading={loading}
        showSearch={{
          optionFilterProp: 'label',
          filterSort: (optionA, optionB) =>
            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase()),
        }}
        styles={{
          popup: {
            root: { borderRadius: '8px' }
          }
        }}
        options={selectOptions}
        {...rest}
      />
    </div>
  )
}

export default SelectInput
