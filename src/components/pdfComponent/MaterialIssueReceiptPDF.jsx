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
    minWidth: 100,
    textAlign: 'center',
    paddingBottom: 2,
  },
  label: {
    marginRight: 5,
    fontWeight: 'bold',
  },
  midSection: {
    marginBottom: 15,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    padding: 0,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    minHeight: 35,
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
  footerSection: {
    marginTop: 60,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  distText: {
    fontSize: 8,
    marginTop: 20,
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
  signContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '30%',
  },
  signLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '100%',
    marginBottom: 4,
  }
});

const MaterialIssueReceiptPDF = ({ data }) => {
  const content = data?.content || {};
  const requisitionDetail = content.material_requisition_detail || {};
  const items = requisitionDetail.items || [];
  const plantName = requisitionDetail.melting_plant?.plant_name || '-';

  return (
    <Document title={`${content.issue_no || ''} - Material Issue Receipt`}>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          logoSrc={`${STATIC_FILES_URL}steely.jpg`}
          companyName="STEELY R.M.I.  Pvt. Ltd. Co."
          documentNumber="SRMI-OF-122"
          title="RAW MATERIAL ISSUE VOUCHER"
          revisionNumber="00"
        />

        <View style={styles.topSection}>
          <View style={styles.topRow}>
            <Text style={styles.label}>Date: </Text>
            <Text style={styles.topValue}>{content.issue_date ? new Date(content.issue_date).toLocaleDateString() : '-'}</Text>
          </View>
          <View style={styles.topRow}>
            <Text style={styles.label}>Issue No: </Text>
            <Text style={styles.topValue}>{content.issue_no}</Text>
          </View>
        </View>

        <View style={styles.midSection}>
          <Text style={styles.label}>Issue to: <Text style={{ textDecoration: 'underline' }}>{plantName}</Text></Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableColCode}>Item Code</Text>
            <Text style={styles.tableColDesc}>Description of Code</Text>
            <Text style={styles.tableCol}>Requisition No</Text>
            <Text style={styles.tableColUnit}>Unit</Text>
            <Text style={styles.tableCol}>Quantity</Text>
            <Text style={styles.tableCol}>Total Quantity</Text>
          </View>

          {items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableColCode}>{item.item_code || 'SC001'}</Text>
              <Text style={styles.tableColDesc}>{item.item_name || 'Scrap'}</Text>
              <Text style={styles.tableCol}>{requisitionDetail.requisition_no}</Text>
              <Text style={styles.tableColUnit}>Kg</Text>
              <Text style={styles.tableCol}>{content.issue_weight}</Text>
              <Text style={styles.tableCol}>{content.issue_weight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerSection}>
          <View style={styles.signRow}>
            <View style={styles.signContainer}>
              <View style={styles.signLine} />
              <Text style={{ textAlign: 'center' }}>Prepared & Issued By</Text>
            </View>
            <View style={styles.signContainer}>
              <View style={styles.signLine} />
              <Text style={{ textAlign: 'center' }}>Approved By</Text>
            </View>
            <View style={styles.signContainer}>
              <View style={styles.signLine} />
              <Text style={{ textAlign: 'center' }}>Received the above goods in good condition</Text>
            </View>
          </View>
        </View>

        <Text style={styles.distText}>
          Distribution; Original white Store; 1st Copy Blue Account; 2nd Copy Green Store; 3rd Copy Yellow pad
        </Text>

        <View style={{ marginTop: 'auto' }}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>RAW MATERIAL ISSUE VOUCHER G60/TMT/</Text>
        </View>
      </Page>
    </Document>
  );
};

export default MaterialIssueReceiptPDF;
