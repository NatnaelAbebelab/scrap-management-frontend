/**
 * Formats API error messages that are returned in a list-like string format.
 * Example: "['Initial serial number is among used serial numbers']" -> "Initial serial number is among used serial numbers"
 */
export const formatErrorMessage = (message: any) => {
  if (typeof message !== 'string') return message;

  // Check if it's a string representation of a list like "['msg']" or '["msg"]'
  const listMatch = message.match(/^\[['"](.*)['"]\]$/);
  if (listMatch) {
    return listMatch[1];
  }

  // Handle case where it's a JSON array string but not strictly matching the above
  try {
    const parsed = JSON.parse(message.replace(/'/g, '"'));
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch (e) {
    // If parsing fails, just return the original message
  }

  return message;
};

/**
 * Extracts and formats errors from a structured API response.
 * Handles cases where 'content' is an object of field errors (e.g., { issue_no: ['already exists'] }).
 */
export const extractApiError = (response: any) => {
  if (!response) return 'An error occurred';
  if (response.result === 'success') return null;

  const { message: mainMessage, content } = response;

  if (content && typeof content === 'object' && !Array.isArray(content) && Object.keys(content).length > 0) {
    const errorDetails = Object.entries(content)
      .map(([field, errors]) => {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        
        let errorMsg = '';
        if (Array.isArray(errors)) {
          errorMsg = errors.join(', ');
        } else if (typeof errors === 'object' && errors !== null) {
          // Flatten nested objects e.g. { issue_date: { issue_date: "msg" } }
          errorMsg = Object.values(errors)
            .map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
            .join(', ');
        } else {
          errorMsg = String(errors);
        }

        return `${fieldName}: ${errorMsg}`;
      })
      .join(' | ');

    if (errorDetails) return errorDetails;
  }

  return mainMessage || 'An unexpected error occurred';
};
