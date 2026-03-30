import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    border: "1px solid #333",
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #333",
    minHeight: 45,
  },
  bottomRow: {
    flexDirection: "row",
    minHeight: 35,
  },
  // Cells
  cell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#333",
    justifyContent: "center",
  },
  lastCell: {
    padding: 4,
    justifyContent: "center",
  },
  // Specific Cell Widths
  logoCell: {
    width: "20%",
    alignItems: "center",
  },
  companyCell: {
    width: "55%",
    alignItems: "center",
  },
  docNoCell: {
    width: "25%",
    paddingLeft: 8,
  },
  titleLabelCell: {
    width: "20%",
    alignItems: "center",
  },
  titleValueCell: {
    width: "55%",
    alignItems: "center",
  },
  revisionCell: {
    width: "12.5%",
    borderRightWidth: 1,
    borderRightColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  pageCell: {
    width: "12.5%",
    alignItems: "center",
    justifyContent: "center",
  },
  // Text Styles
  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 1,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  docNoLabel: {
    fontSize: 10,
    color: "#333",
  },
  docNoValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  titleLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
  },
  titleValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3f51b5", // Blue color for title
    textAlign: "center",
    textTransform: "uppercase",
  },
  metaText: {
    fontSize: 9,
    color: "#333",
    textAlign: 'center',
  },
});

/**
 * Standard A4 Header Section component.
 */
const PDFHeader = ({
  logoSrc,
  companyName = "STEELY R.M.I. Pvt. Ltd. C.",
  documentNumber = "SRMI-OF-132",
  title = "INTER - OFFICE MEMO",
  revisionNumber = "00"
}) => (
  <View style={styles.container}>
    {/* Top Row: Logo | Company Name | Document No */}
    <View style={styles.row}>
      <View style={[styles.cell, styles.logoCell]}>
        {logoSrc && <Image src={logoSrc} style={{ width: 45, height: 35, objectFit: 'contain' }} />}
      </View>

      <View style={[styles.cell, styles.companyCell]}>
        <Text style={styles.label}>Company Name:</Text>
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      <View style={[styles.lastCell, styles.docNoCell]}>
        <Text style={styles.docNoLabel}>
          Document No: <Text style={styles.docNoValue}>{documentNumber}</Text>
        </Text>
      </View>
    </View>

    {/* Bottom Row: Title Label | Title Value | Revision | Page */}
    <View style={styles.bottomRow}>
      <View style={[styles.cell, styles.titleLabelCell]}>
        <Text style={styles.titleLabel}>Title:</Text>
      </View>

      <View style={[styles.cell, styles.titleValueCell]}>
        <Text style={styles.titleValue}>{title}</Text>
      </View>

      <View style={styles.revisionCell}>
        <Text style={styles.metaText}>Revision No. {revisionNumber}</Text>
      </View>

      <View style={styles.pageCell}>
        <Text style={styles.metaText} render={({ pageNumber, totalPages }) => `Page No: ${pageNumber} of ${totalPages}`} />
      </View>
    </View>
  </View>
);

export default PDFHeader;
