import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = AntDatePicker;

/**
 * Standardized DateRangePicker component that ensures consistent styling and layout.
 */
const DateRangePicker = ({ 
  value, 
  onChange, 
  style = {}, 
  ...props 
}) => {
  // Handle conversion of array of strings/dates to dayjs objects
  const dateValue = Array.isArray(value) 
    ? value.map(d => d ? (dayjs.isDayjs(d) ? d : dayjs(d)) : null)
    : null;

  const handleChange = (dates, dateStrings) => {
    if (onChange) {
      // Return both dayjs objects and formatted strings
      onChange(dateStrings, dates);
    }
  };

  return (
    <div className="custom-daterangepicker-wrapper" style={{ width: '100%', ...style }}>
      <RangePicker
        value={dateValue}
        onChange={handleChange}
        style={{ width: '100%', height: '40px', borderRadius: '8px' }}
        {...props}
      />
    </div>
  );
};

export default DateRangePicker;
