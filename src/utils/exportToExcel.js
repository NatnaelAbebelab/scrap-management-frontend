import * as XLSX from 'xlsx'
import { formatDate } from './dateFormatter'

/**
 * Reusable Excel export utility.
 *
 * @param {object} options
 * @param {string} options.filename  – Base filename without extension (date appended automatically)
 * @param {string} options.sheetName – Name of the worksheet tab
 * @param {Array}  options.columns   – Antd-style column definitions: [{ title, dataIndex, exportValue? }]
 *                                     Optionally supply `exportValue` fn(record) to override raw value
 * @param {Array}  options.data      – Array of data records
 * @param {object} options.totals    – Optional totals object keyed by dataIndex: { net_weight: 123, ... }
 */
export const exportToExcel = ({ filename = 'export', sheetName = 'Sheet1', columns = [], data = [], totals = null }) => {
  // Build rows — one object per record, keys are column titles
  const rows = data.map((record) => {
    const row = {}
    columns.forEach((col) => {
      let rawValue = ''
      if (col.dataIndex) {
        if (Array.isArray(col.dataIndex)) {
          rawValue = col.dataIndex.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), record)
        } else if (typeof col.dataIndex === 'string' && col.dataIndex.includes('.')) {
          rawValue = col.dataIndex.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), record)
        } else {
          rawValue = record[col.dataIndex]
        }
      }
      row[col.title] = col.exportValue ? col.exportValue(rawValue, record) : (rawValue ?? '')
    })
    return row
  })

  // Build totals row if provided
  if (totals && Object.keys(totals).length > 0) {
    rows.push({}) // blank spacer

    const totalsRow = {}
    columns.forEach((col, idx) => {
      if (idx === 0) {
        totalsRow[col.title] = 'TOTAL'
      } else if (col.dataIndex && totals[col.dataIndex] !== undefined) {
        totalsRow[col.title] = totals[col.dataIndex]
      } else {
        totalsRow[col.title] = ''
      }
    })
    rows.push(totalsRow)
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Auto column widths based on title length (min 12, max 30)
  worksheet['!cols'] = columns.map((col) => ({
    wch: Math.min(30, Math.max(12, (col.title || '').length + 4))
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `${filename}_${today}.xlsx`)
}
