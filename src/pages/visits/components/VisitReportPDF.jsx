import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles, formatTimePDF } from './VisitsHelpers';

const VisitReportPDF = ({ visit, locationName, statusDisplay, parentNames }) => {
  const att = visit?.attendance || {};
  
  const hasNonCustodialIn = !!att.nonCustodialCheckedInAt;
  const hasCompIn = !!att.companionCheckedInAt;

  const nonCustodialIn = hasNonCustodialIn ? formatTimePDF(att.nonCustodialCheckedInAt) : 'لم يحضر';
  const nonCustodialOut = att.nonCustodialCheckedOutAt ? formatTimePDF(att.nonCustodialCheckedOutAt) : 'لم ينصرف';
  
  const compIn = hasCompIn ? formatTimePDF(att.companionCheckedInAt) : 'لم يحضر';
  const compOut = att.companionCheckedOutAt ? formatTimePDF(att.companionCheckedOutAt) : 'لم ينصرف';

  const schedIn = formatTimePDF(visit.startAt);
  const schedOut = formatTimePDF(visit.endAt);

  const compNIdFromVisit = visit.companionNationalId;
  const isAlternateCompanion = compNIdFromVisit && compNIdFromVisit !== parentNames.custodialNId;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>نظام وصال - محكمة الأسرة</Text>
          <Text style={pdfStyles.subtitle}>تقرير إثبات حالة زيارة إلكتروني</Text>
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>التاريخ:</Text>
            <Text style={pdfStyles.value}>{new Date(visit.startAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>المكان:</Text>
            <Text style={pdfStyles.value}>{locationName || "مركز الرؤية المحدد"}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>الحالة النهائية:</Text>
            <Text style={pdfStyles.value}>{statusDisplay.label}</Text>
          </View>

          <View style={pdfStyles.grid}>
            <View style={pdfStyles.gridBox}>
              <Text style={pdfStyles.gridLabel}>وقت الحضور المجدول</Text>
              <Text style={pdfStyles.gridValue}>{schedIn}</Text>
            </View>
            <View style={pdfStyles.gridBox}>
              <Text style={pdfStyles.gridLabel}>وقت الانصراف المجدول</Text>
              <Text style={pdfStyles.gridValue}>{schedOut}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.partySection}>
            <View style={pdfStyles.partyTitleRow}>
                <Text style={pdfStyles.partyName}>{parentNames.nonCustodial || 'الطرف غير الحاضن'}</Text>
                <Text style={pdfStyles.partyRole}>(الطرف غير الحاضن)</Text>
            </View>
            <View style={pdfStyles.partySubtitleRow}>
                <Text style={pdfStyles.partyNidLabel}>الرقم القومي: </Text>
                <Text style={pdfStyles.partyNidValue}>{parentNames.nonCustodialNId || 'غير مسجل'}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>وقت الحضور الفعلي:</Text>
              <Text style={pdfStyles.value}>{nonCustodialIn}</Text>
            </View>
            {hasNonCustodialIn && (
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>وقت الانصراف الفعلي:</Text>
                  <Text style={pdfStyles.value}>{nonCustodialOut}</Text>
                </View>
            )}
          </View>

          <View style={pdfStyles.partySection}>
            <View style={pdfStyles.partyTitleRow}>
                <Text style={pdfStyles.partyName}>{parentNames.custodial || 'الطرف الحاضن'}</Text>
                <Text style={pdfStyles.partyRole}>{isAlternateCompanion ? '(الطرف الحاضن)' : '(الطرف الحاضن والمرافق الافتراضي)'}</Text>
            </View>
            <View style={pdfStyles.partySubtitleRow}>
                <Text style={pdfStyles.partyNidLabel}>الرقم القومي: </Text>
                <Text style={pdfStyles.partyNidValue}>{parentNames.custodialNId || 'غير مسجل'}</Text>
            </View>

            {isAlternateCompanion && (
                <View style={pdfStyles.companionBox}>
                    <Text style={pdfStyles.companionLabel}>الرقم القومي للمرافق البديل:</Text>
                    <Text style={pdfStyles.companionValue}>{compNIdFromVisit}</Text>
                </View>
            )}

            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>وقت الحضور الفعلي:</Text>
              <Text style={pdfStyles.value}>{compIn}</Text>
            </View>
            {hasCompIn && (
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>وقت الانصراف الفعلي:</Text>
                  <Text style={pdfStyles.value}>{compOut}</Text>
                </View>
            )}
          </View>
        </View>

        {att.attendedChildrenIds && att.attendedChildrenIds.length > 0 && (
          <View style={pdfStyles.section}>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>عدد الأطفال الحاضرين فعلياً:</Text>
              <Text style={pdfStyles.value}>{att.attendedChildrenIds.length}</Text>
            </View>
          </View>
        )}

        {(att.nonCustodialOverstayed || att.companionOverstayed) && (
          <View style={pdfStyles.warningSection}>
            <Text style={pdfStyles.warningTitle}>ملاحظات ومخالفات مسجلة:</Text>
            {att.nonCustodialOverstayed && <Text style={pdfStyles.warningText}>- تأخر الطرف غير الحاضن في تسليم الأطفال بالموعد.</Text>}
            {att.companionOverstayed && <Text style={pdfStyles.warningText}>- تأخر المرافق/الطرف الحاضن عن الانصراف في الموعد.</Text>}
          </View>
        )}

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>هذا المستند مستخرج إلكترونياً من نظام وصال ولا يحتاج إلى توقيع.</Text>
          <Text style={pdfStyles.footerText}>تاريخ الاستخراج: {new Date().toLocaleString('en-US')}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default VisitReportPDF;