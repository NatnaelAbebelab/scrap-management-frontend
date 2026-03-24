import React from 'react';
import { DatePicker as AntDatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(localeData);
dayjs.extend(weekday);

/**
 * Standardized DatePicker component that ensures consistent styling and layout.
 * Fixes potential alignment issues with the arrow and picker layout.
 */
const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Select Date', 
  format = 'YYYY-MM-DD', 
  style = {}, 
  ...props 
}) => {
  // Handle string values to dayjs object conversions
  const dateValue = value ? (dayjs.isDayjs(value) ? value : dayjs(value)) : null;

  const handleChange = (date, dateString) => {
    if (onChange) {
      // Return both dayjs object and formatted string for flexibility
      onChange(dateString, date);
    }
  };

  return (
    <div className="custom-datepicker-wrapper" style={{ width: '100%', ...style }}>
      <AntDatePicker
        value={dateValue}
        onChange={handleChange}
        placeholder={placeholder}
        format={format}
        style={{ width: '100%', height: '40px', borderRadius: '8px' }}
        {...props}
      />
    </div>
  );
};

export default DatePicker;
