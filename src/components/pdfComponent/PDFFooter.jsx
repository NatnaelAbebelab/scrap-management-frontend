import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footerContainer: {
    borderTop: 1,
    borderColor: '#000',
    marginTop: 20
  },
  row: {
    flexDirection: 'row'
  },
  cell: {
    flexGrow: 1,
    borderRight: 1,
    borderColor: '#000',
    padding: 5,
    fontSize: 10,
    textAlign: 'center'
  },
  lastCell: {
    flexGrow: 1,
    padding: 5,
    fontSize: 10,
    textAlign: 'center'
  },
  signatureBox: {
    height: 40
  }
});

const PDFFooter = () => (
  <View style={styles.footerContainer}>
    
    <View style={styles.row}>
      <Text style={styles.cell}>Prepared By</Text>
      <Text style={styles.cell}>Checked By</Text>
      <Text style={styles.cell}>Approved By</Text>
      <Text style={styles.lastCell}>Date</Text>
    </View>

    <View style={styles.row}>
      <Text style={[styles.cell, styles.signatureBox]}></Text>
      <Text style={[styles.cell, styles.signatureBox]}></Text>
      <Text style={[styles.cell, styles.signatureBox]}></Text>
      <Text style={[styles.lastCell, styles.signatureBox]}></Text>
    </View>

  </View>
);

export default PDFFooter;
