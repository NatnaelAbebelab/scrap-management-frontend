import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from './PDFHeader';
import { formatDate } from '../../utils/dateFormatter';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
    height: '100%',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCol: {
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 4,
    height: '100%',
    justifyContent: 'center',
  },
  colDate: { width: '12%' },
  colGrn: { width: '15%' },
  colIssue: { width: '15%' },
  colQty: { width: '12%' },
  colNet: { width: '12%' },
  colPlant: { width: '22%', borderRightWidth: 0 },

  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },

  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 20,
  },
  footerLine: {
    width: '80%',
    borderBottomWidth: 1,
    borderColor: '#000',
    marginBottom: 5,
  },
  footerText: {
    fontWeight: 'bold',
    fontSize: 10,
  }
});

const StockCardPDF = ({ records, totals }) => {
  // Manual Pagination: 22 rows for first page, 25 for subsequent pages
  const paginate = (data) => {
    const pages = [];
    let current = 0;

    // First page
    pages.push(data.slice(current, current + 22));
    current += 22;

    // Subsequent pages
    while (current < data.length) {
      pages.push(data.slice(current, current + 25));
      current += 25;
    }

    return pages;
  };

  const paginatedData = paginate(records);

  return (
    <Document title="Stock Card Report">
      {paginatedData.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <PDFHeader
            logoSrc="/steely.jpg"
            companyName="STEELY R.M.I.  Pvt. Ltd. Co."
            documentNumber="SRMI-OF-119"
            title="RAW MATERIAL STOCK CARD"
            revisionNumber="00"
          />

          <View style={styles.table}>
            {/* Hierarchical Header - Row 1 */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, styles.colDate]}><Text style={styles.textCenter}>Weight Date</Text></View>
              <View style={[styles.tableCol, styles.colGrn]}><Text style={styles.textCenter}>Receiving Report No</Text></View>
              <View style={[styles.tableCol, styles.colIssue]}><Text style={styles.textCenter}>Issue No</Text></View>
              <View style={[styles.tableCol, { width: '36%', borderRightWidth: 1 }]}><Text style={styles.textCenter}>Quantity</Text></View>
              <View style={[styles.tableCol, styles.colPlant]}><Text style={styles.textCenter}>Melting Plant</Text></View>
            </View>

            {/* Hierarchical Header - Row 2 */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, styles.colDate]}><Text></Text></View>
              <View style={[styles.tableCol, styles.colGrn]}><Text></Text></View>
              <View style={[styles.tableCol, styles.colIssue]}><Text></Text></View>
              <View style={[styles.tableCol, styles.colQty]}><Text style={styles.textCenter}>Received</Text></View>
              <View style={[styles.tableCol, styles.colQty]}><Text style={styles.textCenter}>Issued</Text></View>
              <View style={[styles.tableCol, styles.colNet]}><Text style={styles.textCenter}>Net Balance</Text></View>
              <View style={[styles.tableCol, styles.colPlant]}><Text></Text></View>
            </View>

            {pageData.map((record, index) => (
              <View key={index} style={[styles.tableRow, record.isBeginning && { backgroundColor: '#f0faff' }]}>
                <View style={[styles.tableCol, styles.colDate]}>
                  <Text style={styles.textCenter}>
                    {record.isBeginning ? 'Beginning Balance' : (record.weight_date ? formatDate(record.weight_date) : '-')}
                  </Text>
                </View>
                <View style={[styles.tableCol, styles.colGrn]}>
                  <Text style={styles.textCenter}>{record.isBeginning ? '-' : (record.grn_no || '-')}</Text>
                </View>
                <View style={[styles.tableCol, styles.colIssue]}>
                  <Text style={styles.textCenter}>{record.isBeginning ? '-' : (record.issue_no || '-')}</Text>
                </View>
                <View style={[styles.tableCol, styles.colQty]}>
                  <Text style={styles.textRight}>{record.isBeginning ? '-' : (record.purchased_qty?.toLocaleString() || '0')}</Text>
                </View>
                <View style={[styles.tableCol, styles.colQty]}>
                  <Text style={styles.textRight}>{record.isBeginning ? '-' : (record.issued_qty?.toLocaleString() || '0')}</Text>
                </View>
                <View style={[styles.tableCol, styles.colNet]}>
                  <Text style={[styles.textRight, record.isBeginning && { fontWeight: 'bold' }]}>
                    {record.remaining_qty?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={[styles.tableCol, styles.colPlant]}>
                  <Text>{record.isBeginning ? '-' : (record.melting_plant || '-')}</Text>
                </View>
              </View>
            ))}

            {/* Total row on the last page */}
            {pageIndex === paginatedData.length - 1 && (
              <View style={[styles.tableRow, { backgroundColor: '#f9f9f9', fontWeight: 'bold' }]}>
                <View style={[styles.tableCol, { width: '42%', borderRightWidth: 1 }]}><Text style={{ textAlign: 'center', fontWeight: 'bold' }}>TOTAL</Text></View>
                <View style={[styles.tableCol, styles.colQty]}><Text style={[styles.textRight, { fontWeight: 'bold' }]}>{totals.total_purchase_qty?.toLocaleString() || '0'}</Text></View>
                <View style={[styles.tableCol, styles.colQty]}><Text style={[styles.textRight, { fontWeight: 'bold' }]}>{totals.total_issue_qty?.toLocaleString() || '0'}</Text></View>
                <View style={[styles.tableCol, styles.colNet]}><Text style={[styles.textRight, { fontWeight: 'bold' }]}>{records[records.length - 1]?.remaining_qty?.toLocaleString() || '0'}</Text></View>
                <View style={[styles.tableCol, styles.colPlant]}><Text></Text></View>
              </View>
            )}
          </View>

          {/* Show the footer section on the last page only */}
          {pageIndex === paginatedData.length - 1 && (
            <View style={styles.footer}>
              <View style={styles.footerLine} />
              <Text style={styles.footerText}>RAW MATERIAL STOCK CARD</Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
};

export default StockCardPDF;
