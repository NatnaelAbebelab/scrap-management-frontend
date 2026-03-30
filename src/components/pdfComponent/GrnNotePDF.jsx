import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import PDFHeader from './PDFHeader';

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
    marginBottom: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  topSection: {
    marginTop: 40,
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  topValue: {
    marginLeft: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minWidth: 60,
    textAlign: 'center',
    paddingBottom: 2,
  },
  midSection: {
    marginBottom: 20,
  },
  midRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    marginRight: 5,
    fontWeight: 'bold',
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 12,
    paddingBottom: 2,
    flexGrow: 1,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    padding: 0, // Ensure table content doesn't push borders
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 25, // Vertical space for values
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    minHeight: 35, // Adjust for multi-line headers "(Br.)"
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
    textAlign: 'center',
    flex: 1,
    fontSize: 9,
    height: '100%',
    justifyContent: 'center',
  },
  tableColCode: { borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 2, width: 70, textAlign: 'center', height: '100%', justifyContent: 'center' },
  tableColDesc: { borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 5, flex: 2, height: '100%', justifyContent: 'center' },
  tableColUnit: { borderStyle: 'solid', borderWidth: 1, borderColor: '#000', padding: 2, width: 40, textAlign: 'center', height: '100%', justifyContent: 'center' },
  totalRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    minHeight: 25,
  },
  noBorder: {
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  footerSection: {
    marginTop: 20,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25, // Increased for signature space
  },
  distText: {
    fontSize: 8,
    marginTop: 30,
    marginBottom: 20,
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
    textTransform: 'uppercase',
  },
});

const GrnNotePDF = ({ data }) => {
  const content = data?.content || {};

  const items = [];
  if (parseFloat(content.heavy_grade) > 0) {
    items.push({ grade: 'H', quantity: content.heavy_grade, rate: content.heavy_rate });
  }
  if (parseFloat(content.medium_grade) > 0) {
    items.push({ grade: 'M', quantity: content.medium_grade, rate: content.medium_rate });
  }
  if (parseFloat(content.light_grade) > 0) {
    items.push({ grade: 'L', quantity: content.light_grade, rate: content.light_rate });
  }

  // Fallback for net weight if no specific grades are present
  if (items.length === 0 && parseFloat(content.net_weight) > 0) {
    items.push({ grade: 'N', quantity: content.net_weight, rate: content.fixed_rate || 0 });
  }

  return (
    <Document title={`${content.record_no || ''} - GRN Note`}>
      <Page size="A4" style={styles.page}>
        {/* 1. New Grid Header Section */}
        <PDFHeader
          logoSrc="/steely.jpg"
          companyName="STEELY R.M.I.  Pvt. Ltd. Co."
          documentNumber="SRMI-OF-119"
          title="RAW MATERIAL GOODS RECEIVED NOTE"
          revisionNumber="00"
        />

        {/* 2. Date and Serial No (Vertical List Right) */}
        <View style={styles.topSection}>
          <View style={styles.topRow}>
            <Text style={styles.label}>Date: </Text>
            <Text style={[styles.topValue, { minWidth: 100 }]}>{new Date(content.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.topRow}>
            <Text style={styles.label}>Serial No: </Text>
            <Text style={[styles.topValue, { minWidth: 100 }]}>{content.serial_no}</Text>
          </View>
          <View style={styles.topRow}>
            <Text style={styles.label}>GRN No: </Text>
            <Text style={[styles.topValue, { minWidth: 100 }]}>{content.grn_no || '-'}</Text>
          </View>
        </View>

        {/* 3. Mid Section */}
        <View style={styles.midSection}>
          <View style={styles.midRow}>
            <Text style={styles.label}>Received from: </Text>
            <Text style={styles.underline}>{content.customer_first_name} {content.customer_last_name} {content.customer_business_name}</Text>
            <Text style={[styles.label, { marginLeft: 20 }]}>Plate No.: </Text>
            <Text style={[styles.underline, { flexGrow: 0, width: 80 }]}>{content.plate_no}</Text>
          </View>
          <View style={styles.midRow}>
            <Text style={styles.label}>Suppliers Inv. No.: </Text>
            <Text style={styles.underline}></Text>
            <Text style={[styles.label, { marginLeft: 20 }]}>Weighing No.: </Text>
            <Text style={[styles.underline, { flexGrow: 0, width: 80 }]}>{content.record_no}</Text>
          </View>
        </View>

        {/* 4. Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableColCode}>Item Code</Text>
            <Text style={styles.tableColDesc}>Description</Text>
            <Text style={styles.tableColUnit}>Unit</Text>
            <Text style={styles.tableCol}>Quantity</Text>
            <Text style={styles.tableCol}>Unit Price (Br.)</Text>
            <Text style={styles.tableCol}>Total Amount</Text>
            <Text style={styles.tableCol}>Remark</Text>
          </View>

          {items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableColCode}>SC-001</Text>
              <Text style={styles.tableColDesc}>SCRAP</Text>
              <Text style={styles.tableColUnit}>Kg</Text>
              <Text style={styles.tableCol}>{item.grade}: {item.quantity}</Text>
              <Text style={styles.tableCol}>{item.grade}: {item.rate}</Text>
              <Text style={styles.tableCol}>{(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}</Text>
              <Text style={styles.tableCol}></Text>
            </View>
          ))}

          {/* Clean Grand Total Row */}
          <View style={[styles.totalRow, { justifyContent: 'flex-end', marginTop: 10 }]}>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' }}>
              <Text style={{ padding: 5, fontSize: 10, fontWeight: 'bold', minWidth: 100, textAlign: 'right' }}>Grand Total:</Text>
              <Text style={{ padding: 5, fontSize: 10, fontWeight: 'bold', minWidth: 100, textAlign: 'center' }}>{content.net_price}</Text>
            </View>
          </View>
        </View>

        {/* 5. Signatures */}
        <View style={styles.footerSection}>
          <View style={styles.signRow}>
            <Text>Prepared by ____________________    Signature ____________</Text>
          </View>
          <View style={styles.signRow}>
            <Text>Weightunng by _________________   Signature _____________</Text>
          </View>
          <View style={styles.signRow}>
            <Text>Received by __________________     Signature _______________</Text>
          </View>
          <View style={styles.signRow}>
            <Text>Approved by _________________     Signature ________________</Text>
          </View>
        </View>

        {/* 7. Distribution text */}
        <Text style={styles.distText}>
          Distribution; Original White Accounts; 1st Copy Blue Stock Account; 2nd Copy Green Store; 3rd Copy Yellow pad
        </Text>

        {/* 8. Bottom Footer */}
        <View style={{ marginTop: 'auto' }}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>RAW MATERIAL GOODS RECEIVED NOTE</Text>
        </View>
      </Page>
    </Document>
  );
};

export default GrnNotePDF;
