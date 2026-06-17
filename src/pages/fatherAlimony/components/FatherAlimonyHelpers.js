import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Cairo', backgroundColor: '#ffffff' },
  header: { textAlign: 'center', marginBottom: 25, borderBottom: '2 solid #1e3a8a', paddingBottom: 15 },
  headerMinistry: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 },
  headerSystem: { fontSize: 10, color: '#6b7280', marginBottom: 8 },
  titleReceipt: { fontSize: 16, fontWeight: 'bold', color: '#111827', backgroundColor: '#f0fdf4', padding: '6 0', borderRadius: 4, border: '1 solid #bbf7d0' },
  section: { marginBottom: 15, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1 solid #e2e8f0' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  value: { fontSize: 11, color: '#1e293b', fontWeight: 'bold' },
  partySection: { marginTop: 10, padding: 10, backgroundColor: '#ffffff', borderRadius: 6, border: '1 solid #cbd5e1' },
  partyTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 6, textAlign: 'right', borderBottom: '1 solid #f1f5f9', paddingBottom: 4 },
  transactionSection: { marginTop: 15, padding: 15, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1 solid #bbf7d0' },
  transactionTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 8, textAlign: 'right' },
  transactionValue: { fontSize: 12, color: '#15803d', fontWeight: 'bold' },
  referenceBox: { marginTop: 10, padding: 8, backgroundColor: '#ffffff', border: '1 dashed #94a3b8', borderRadius: 4, alignItems: 'center' },
  referenceLabel: { fontSize: 9, color: '#64748b', marginBottom: 2 },
  referenceValue: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', borderTop: '1 solid #e2e8f0', paddingTop: 10 },
  footerText: { fontSize: 9, color: '#94a3b8', lineHeight: 1.5 }
});

export const formatTimeAndDatePDF = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatTimeAndDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return '0';
    return (amount / 100).toLocaleString('ar-EG');
};

export const getDelayDays = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.max(0, now - dueDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};