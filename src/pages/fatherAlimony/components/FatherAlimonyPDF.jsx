import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { pdfStyles, formatTimeAndDatePDF } from './FatherAlimonyHelpers';

// تأكد من مسار الخطوط أن يكون صحيحاً بناءً على المجلد الجديد
import CairoRegular from '../../../assets/fonts/Cairo-Regular.ttf';
import CairoBold from '../../../assets/fonts/Cairo-Bold.ttf';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: CairoRegular },
    { src: CairoBold, fontWeight: 'bold' }
  ]
});

export const PaymentReceiptPDF = ({ payment, alimony, parents, caseNumber, courtName }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.headerMinistry}>وزارة العدل - محكمة الأسرة {courtName ? `بـ ${courtName}` : ''}</Text>
        <Text style={pdfStyles.headerSystem}>(نظام وصال الإلكتروني)</Text>
        <Text style={pdfStyles.titleReceipt}>إيصال سداد نفقة إلكتروني</Text>
      </View>
      <View style={pdfStyles.section}>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>رقم القضية:</Text>
            <Text style={pdfStyles.value}>{caseNumber || 'غير مدرج'}</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>طبيعة النفقة:</Text>
            <Text style={pdfStyles.value}>{alimony?.frequency === 'Monthly' ? 'دورية شهرية' : 'نفقة دورية'}</Text>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <View style={pdfStyles.partySection}>
            <Text style={pdfStyles.partyTitle}>الطرف القائم بالسداد (الأب)</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الاسم الرباعي:</Text>
              <Text style={pdfStyles.value}>{parents.fatherName}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الرقم القومي:</Text>
              <Text style={pdfStyles.value}>{parents.fatherNId}</Text>
            </View>
        </View>
        <View style={pdfStyles.partySection}>
            <Text style={pdfStyles.partyTitle}>الطرف المستحق (الأم)</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الاسم الرباعي:</Text>
              <Text style={pdfStyles.value}>{parents.motherName}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الرقم القومي:</Text>
              <Text style={pdfStyles.value}>{parents.motherNId}</Text>
            </View>
        </View>
      </View>
      <View style={pdfStyles.transactionSection}>
        <Text style={pdfStyles.transactionTitle}>تفاصيل الدفعة المسددة</Text>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>المبلغ المسدد:</Text>
            <Text style={pdfStyles.transactionValue}>{(payment.amount / 100).toLocaleString('ar-EG')} ج.م</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>عن استحقاق تاريخ:</Text>
            <Text style={pdfStyles.transactionValue}>{new Date(payment.dueDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>تاريخ ووقت السداد الفعلي:</Text>
            <Text style={pdfStyles.transactionValue} dir="ltr">{formatTimeAndDatePDF(payment.paidAt || payment.dueDate)}</Text>
        </View>
        <View style={pdfStyles.referenceBox}>
            <Text style={pdfStyles.referenceLabel}>الرقم المرجعي للعملية (Transaction ID)</Text>
            <Text style={pdfStyles.referenceValue}>{payment.id}</Text>
        </View>
      </View>
      <View style={pdfStyles.footer}>
         <Text style={pdfStyles.footerText}>يُعد هذا المستند إيصالاً إلكترونياً رسمياً معتمداً ومسجلاً لدى قاعدة بيانات وزارة العدل المصرية، ولا يتطلب ختم الجهة أو التوقيع الورقي.</Text>
         <Text style={pdfStyles.footerText}>تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')} - نظام وصال</Text>
      </View>
    </Page>
  </Document>
);