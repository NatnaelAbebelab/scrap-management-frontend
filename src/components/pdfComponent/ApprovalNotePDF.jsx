import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import PDFHeader from './PDFHeader';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9, // Slightly smaller for better fit
    fontFamily: 'Helvetica',
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
  label: {
    marginRight: 5,
    fontWeight: 'bold',
  },
  topValue: {
    marginLeft: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minWidth: 80,
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
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 2,
    textAlign: 'center',
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  footerSection: {
    marginTop: 40,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  signBlock: {
    alignItems: 'center',
    width: '24%',
  },
  signLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 30, // Increased for signature space
    marginBottom: 4,
  },
  signLabel: {
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginTop: 20,
    marginBottom: 5,
  },
  bottomText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
});

const ApprovalNotePDF = ({ data }) => {
  const content = data?.content || {};

  // Compute grades and prices
  const gradeParts = [];
  const priceParts = [];

  if (parseFloat(content.heavy_grade) > 0) {
    gradeParts.push('Heavy');
    priceParts.push(`H: ${content.heavy_rate}`);
  }
  if (parseFloat(content.medium_grade) > 0) {
    gradeParts.push('Medium');
    priceParts.push(`M: ${content.medium_rate}`);
  }
  if (parseFloat(content.light_grade) > 0) {
    gradeParts.push('Light');
    priceParts.push(`L: ${content.light_rate}`);
  }

  // Fallback if no specific grade fields but has net weight
  if (gradeParts.length === 0 && parseFloat(content.net_weight) > 0) {
    gradeParts.push('Scrap');
    priceParts.push(content.fixed_rate || content.price || '0');
  }

  const gradesStr = gradeParts.join(', ');
  const pricesStr = priceParts.join(', ');

  return (
    <Document title={`${content.record_no || ''} - Approval Note`}>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          logoSrc="/steely.jpg"
          companyName="STEELY R.M.I.  Pvt. Ltd. Co."
          documentNumber="SRMI-OF-119"
          title="RAW MATERIAL GOODS PAYMENT APPROVAL NOTE"
          revisionNumber="00"
        />

        {/* Top Info */}
        <View style={styles.topSection}>
          <View style={styles.topRow}>
            <Text style={styles.label}>Date: </Text>
            <Text style={styles.topValue}>{new Date(content.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.topRow}>
            <Text style={styles.label}>Serial No: </Text>
            <Text style={styles.topValue}>{content.serial_no}</Text>
          </View>
          <View style={styles.topRow}>
            <Text style={styles.label}>GRN No: </Text>
            <Text style={styles.topValue}>{content.grn_no || '-'}</Text>
          </View>
        </View>

        {/* Mid Info */}
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

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>Gross Weight(KG)</Text>
            <Text style={styles.tableCol}>Tare Weight(KG)</Text>
            <Text style={styles.tableCol}>Net Weight(KG)</Text>
            <Text style={styles.tableCol}>Unit Price</Text>
            <Text style={styles.tableCol}>Total Birr</Text>
            <Text style={styles.tableCol}>Grades</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>{content.first_weight}</Text>
            <Text style={styles.tableCol}>{content.second_weight}</Text>
            <Text style={styles.tableCol}>{content.net_weight}</Text>
            <Text style={styles.tableCol}>{pricesStr}</Text>
            <Text style={styles.tableCol}>{content.net_price}</Text>
            <Text style={styles.tableCol}>{gradesStr}</Text>
          </View>
        </View>

        {/* Footer Signatures */}
        <View style={styles.footerSection}>
          <View style={styles.footerRow}>
            <View style={styles.signBlock}>
              <Text>Prepared by</Text>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>(Scrap Purchase)</Text>
            </View>
            <View style={styles.signBlock}>
              <Text>Checked by</Text>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>(Scrap Inspection)</Text>
            </View>
            <View style={styles.signBlock}>
              <Text>Verified by</Text>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>(Scrap Purchase Head)</Text>
            </View>
            <View style={styles.signBlock}>
              <Text>Authorized by</Text>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>(Pro & Finance Dep Head)</Text>
            </View>
          </View>
        </View>

        {/* Bottom Text */}
        <View style={{ marginTop: 'auto' }}>
          <View style={styles.bottomLine} />
          <Text style={styles.bottomText}>RAW MATERIAL GOODS PAYMENT APPROVAL NOTE</Text>
        </View>

      </Page>
    </Document>
  );
};

export default ApprovalNotePDF;
