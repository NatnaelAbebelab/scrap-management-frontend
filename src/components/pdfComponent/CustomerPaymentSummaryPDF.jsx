import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PDFHeader from './PDFHeader';
import { STATIC_FILES_URL } from '../../api/config';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minWidth: 150,
    paddingBottom: 2,
    marginRight: 20,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderTopWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableColBase: {
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    textAlign: 'center',
    justifyContent: 'center',
  },
  colRowNo: { width: '5%', borderLeftWidth: 1, borderColor: '#000' },
  colDate: { width: '12%' },
  colWeight: { width: '12%' },
  colGrn: { width: '11%' },
  colGrade: { width: '10%' },
  colQty: { width: '17%' },
  colPrice: { width: '18%' },
  colTotal: { width: '15%' },
  summaryTableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryColPrice: {
    width: '60.526%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  summaryColTotal: {
    width: '39.474%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    padding: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  footerLine: {
    borderBottomWidth: 1,
    borderColor: '#000',
    marginTop: 10,
    marginBottom: 5,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

const CustomerPaymentSummaryPDF = ({ data }) => {
  const customerInfo = data?.customer_info || {};
  const grns = data?.grn || [];
  const calculated = data?.calculated_price || {};

  const customerName = [customerInfo.first_name, customerInfo.last_name].filter(Boolean).join(' ') || '';
  const customerTIN = customerInfo.tin || '';
  const businessName = customerInfo.business_name || '';

  // Chunking to handle 11 rows max per page
  const MAX_ROWS = 11;
  const pages = [];
  for (let i = 0; i < grns.length; i += MAX_ROWS) {
    pages.push(grns.slice(i, i + MAX_ROWS));
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  return (
    <Document>
      {pages.map((pageGrns, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex}>
          <PDFHeader
            logoSrc={`${STATIC_FILES_URL}steely.jpg`}
            companyName="STEELY R.M.I.  Pvt. Ltd. Co."
            documentNumber="SRMI-OF-192"
            title={"LOCAL SCRAP\nCUSTOMER PAYMENT SUMMERY"}
            revisionNumber="00"
          />

          {pageIndex === 0 && (
            <>
              <Text style={styles.title}>Payment Summery</Text>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Customer Name:</Text>
                  <Text style={styles.underline}>{customerName}</Text>
                  <Text style={[styles.label, { marginLeft: 20 }]}>TIN:</Text>
                  <Text style={styles.underline}>{customerTIN}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Business Name:</Text>
                  <Text style={styles.underline}>{businessName}</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableColBase, styles.colRowNo]}>Row No</Text>
              <Text style={[styles.tableColBase, styles.colDate]}>Date</Text>
              <Text style={[styles.tableColBase, styles.colWeight]}>Weight Record No</Text>
              <Text style={[styles.tableColBase, styles.colGrn]}>GRN/Serial No</Text>
              <Text style={[styles.tableColBase, styles.colGrade]}>Grade</Text>
              <Text style={[styles.tableColBase, styles.colQty]}>Quantity</Text>
              <Text style={[styles.tableColBase, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableColBase, styles.colTotal]}>Total</Text>
            </View>

            {pageGrns.map((item, idx) => {
              const rowNo = pageIndex * MAX_ROWS + idx + 1;
              const dateVal = item.first_date ? item.first_date.replace(/\./g, '/') : '-';
              const grnOrSerial = (item.grn_no && item.grn_no !== '-' && item.grn_no.trim() !== '') ? `${item.grn_no}/${item.serial_no}` : `${item.serial_no}`;

              const recordNo = item.record_no || '-';

              const grades = [];
              if (parseFloat(item.heavy_grade) > 0) {
                grades.push({ name: 'H', qty: parseFloat(item.heavy_grade).toFixed(2), price: parseFloat(item.heavy_rate).toFixed(2) });
              }
              if (parseFloat(item.medium_grade) > 0) {
                grades.push({ name: 'M', qty: parseFloat(item.medium_grade).toFixed(2), price: parseFloat(item.medium_rate).toFixed(2) });
              }
              if (parseFloat(item.light_grade) > 0) {
                grades.push({ name: 'L', qty: parseFloat(item.light_grade).toFixed(2), price: parseFloat(item.light_rate).toFixed(2) });
              }

              return (
                <View style={styles.tableRow} key={idx}>
                  <Text style={[styles.tableColBase, styles.colRowNo]}>{rowNo}</Text>
                  <Text style={[styles.tableColBase, styles.colDate]}>{dateVal}</Text>
                  <Text style={[styles.tableColBase, styles.colWeight]}>{recordNo}</Text>
                  <Text style={[styles.tableColBase, styles.colGrn]}>{grnOrSerial}</Text>

                  <View style={{ width: '45%', flexDirection: 'column', borderRightWidth: 1, borderColor: '#000' }}>
                    {grades.length > 1 ? grades.map((g, i) => (
                      <View style={{ flexDirection: 'row', flexGrow: 1, borderBottomWidth: i === grades.length - 1 ? 0 : 1, borderColor: '#000', alignItems: 'stretch' }} key={i}>
                        <Text style={[styles.tableColBase, { width: '22.22%' }]}>{g.name}</Text>
                        <Text style={[styles.tableColBase, { width: '37.78%' }]}>{g.qty}</Text>
                        <Text style={[styles.tableColBase, { width: '40%', borderRightWidth: 0 }]}>{g.price}</Text>
                      </View>
                    )) : grades.length === 1 ? (
                      <View style={{ flexDirection: 'row', flexGrow: 1, alignItems: 'stretch' }}>
                        <Text style={[styles.tableColBase, { width: '22.22%' }]}>{grades[0].name}</Text>
                        <Text style={[styles.tableColBase, { width: '37.78%' }]}>{grades[0].qty}</Text>
                        <Text style={[styles.tableColBase, { width: '40%', borderRightWidth: 0 }]}>{grades[0].price}</Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', flexGrow: 1, alignItems: 'stretch' }}>
                        <Text style={[styles.tableColBase, { width: '22.22%' }]}>-</Text>
                        <Text style={[styles.tableColBase, { width: '37.78%' }]}>-</Text>
                        <Text style={[styles.tableColBase, { width: '40%', borderRightWidth: 0 }]}>-</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.tableColBase, styles.colTotal]}>
                    {parseFloat(item.net_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              );
            })}

            {/* Render Summary Block only on the last page outside the main table rows but inside the table container */}
            {pageIndex === pages.length - 1 && (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '62%' }} />
                <View style={{ width: '38%', borderLeftWidth: 1, borderColor: '#000', flexDirection: 'column' }}>
                  <View style={styles.summaryTableRow}>
                    <Text style={styles.summaryColPrice}>Sub total</Text>
                    <Text style={styles.summaryColTotal}>{parseFloat(calculated.sub_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.summaryTableRow}>
                    <Text style={styles.summaryColPrice}>15% (VAT)</Text>
                    <Text style={styles.summaryColTotal}>{parseFloat(calculated.vat_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.summaryTableRow}>
                    <Text style={styles.summaryColPrice}>Grand Total</Text>
                    <Text style={styles.summaryColTotal}>{parseFloat(calculated.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.summaryTableRow}>
                    <Text style={styles.summaryColPrice}>Withholding Tax (3%)</Text>
                    <Text style={styles.summaryColTotal}>{parseFloat(calculated.with_holding_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.summaryTableRow}>
                    <Text style={styles.summaryColPrice}>Net Paid</Text>
                    <Text style={styles.summaryColTotal}>{parseFloat(calculated.net_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Footer */}
          <View style={{ marginTop: 'auto' }}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Customer Payment summery</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default CustomerPaymentSummaryPDF;
