/**
 * Formats a date string or object to "MMM DD, YYYY" (e.g., Jan 01, 2026)
 * @param {string | Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A'
  
  const options = { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  }
  
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', options)
  } catch (err) {
    console.error('Date formatting error:', err)
    return 'Invalid Date'
  }
}
