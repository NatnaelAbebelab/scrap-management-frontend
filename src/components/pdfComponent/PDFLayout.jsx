import React from 'react';
import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import PDFHeader from './PDFHeader';
import PDFFooter from './PDFFooter';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  body: {
    paddingTop: 10,
    paddingBottom: 20,
    flexGrow: 1,
  }
});

/**
 * Reusable PDF Layout component that provides a standard header and footer.
 * 
 * @param {Object} props
 * @param {string} props.company - The company name to display in the header.
 * @param {string} props.documentNo - The document number for the header.
 * @param {string} props.title - The document title for the header.
 * @param {string} props.revision - The revision number for the header.
 * @param {string} props.page - The page description (e.g., "1 of 1").
 * @param {React.ReactNode} props.children - The varying body content of the PDF.
 */
const PDFLayout = ({ 
  company = "STEELY R.M.I. Pvt. Ltd. C.",
  documentNo = "SRMI-OF-132",
  title = "INTER - OFFICE MEMO",
  revision = "00",
  page = "1 of 1",
  children 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader 
        company={company}
        documentNo={documentNo}
        title={title}
        revision={revision}
        page={page}
      />

      <View style={styles.body}>
        {children}
      </View>

      <PDFFooter />
    </Page>
  </Document>
);

export default PDFLayout;
