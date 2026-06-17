import { StyleSheet, Font } from '@react-pdf/renderer';

import CairoRegular from '../../../assets/fonts/Cairo-Regular.ttf';
import CairoBold from '../../../assets/fonts/Cairo-Bold.ttf';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: CairoRegular },
    { src: CairoBold, fontWeight: 'bold' }
  ]
});

export const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Cairo', backgroundColor: '#ffffff' },
  header: { textAlign: 'center', marginBottom: 20, borderBottom: '1 solid #e5e7eb', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6b7280' },
  section: { marginBottom: 10, padding: 10, backgroundColor: '#f9fafb', borderRadius: 8, border: '1 solid #f3f4f6' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  label: { fontSize: 11, color: '#6b7280', fontWeight: 'bold' },
  value: { fontSize: 11, color: '#1f2937', fontWeight: 'bold' },
  grid: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 5 },
  gridBox: { width: '48%', backgroundColor: '#eff6ff', padding: 8, borderRadius: 6, border: '1 solid #dbeafe', alignItems: 'center' },
  gridLabel: { fontSize: 9, color: '#1e40af', fontWeight: 'bold', marginBottom: 2 },
  gridValue: { fontSize: 11, color: '#1e3a8a', fontWeight: 'bold' },
  partySection: { marginTop: 8, padding: 8, backgroundColor: '#ffffff', borderRadius: 6, border: '1 solid #e5e7eb' },
  partyTitleRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  partyName: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a' },
  partyRole: { fontSize: 9, color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2 4', borderRadius: 4 },
  partySubtitleRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 6, borderBottom: '1 solid #f3f4f6', paddingBottom: 4 },
  partyNidLabel: { fontSize: 9, color: '#9ca3af' },
  partyNidValue: { fontSize: 10, color: '#4b5563', fontWeight: 'bold', marginLeft: 4 },
  companionBox: { backgroundColor: '#eff6ff', padding: 6, borderRadius: 4, marginBottom: 6, flexDirection: 'row-reverse', justifyContent: 'space-between' },
  companionLabel: { fontSize: 9, color: '#1d4ed8', fontWeight: 'bold' },
  companionValue: { fontSize: 10, color: '#1e3a8a', fontWeight: 'bold' },
  warningSection: { marginTop: 10, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8, border: '1 solid #fecaca' },
  warningTitle: { fontSize: 11, fontWeight: 'bold', color: '#b91c1c', marginBottom: 5, textAlign: 'right' },
  warningText: { fontSize: 10, color: '#dc2626', textAlign: 'right', marginBottom: 2 },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', borderTop: '1 solid #e5e7eb', paddingTop: 10 },
  footerText: { fontSize: 9, color: '#9ca3af' }
});

export const formatTimePDF = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
export const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
export const calculateDays = (start, end) => Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
export const translateFrequency = (freq) => { switch(freq) { case 'Weekly': return 'أسبوعياً'; case 'BiWeekly': return 'كل أسبوعين'; case 'Monthly': return 'شهرياً'; default: return freq || 'محددة'; }};

export const statusOptions = [
  { value: 'all', label: 'جميع الزيارات' },
  { value: 'completed', label: 'تمت بنجاح' },
  { value: 'ongoing', label: 'مستمرة / حضور جزئي' },
  { value: 'missed', label: 'لم تتم (غياب)' },
  { value: 'cancelled', label: 'تم الإلغاء' }
];

export const getSmartVisitStatus = (visit, targetDate = null) => {
    const base = { textClass: 'text-white' };

    if (visit && visit.status === 'Cancelled') {
      return { ...base, label: 'تم إلغاء الزيارة', bgClass: 'bg-red-500', lightBgClass: 'bg-red-50', borderClass: 'border-red-200', timeColor: 'text-red-500', filterCode: 'cancelled', headerBgClass: 'bg-red-600', cornerBgClass: 'bg-red-100', hoverBorderClass: 'hover:border-red-300' };
    }

    const att = visit?.attendance || {};
    const vDate = visit ? new Date(visit.startAt) : (targetDate ? new Date(targetDate) : new Date());
    const vEndDate = visit ? new Date(visit.endAt) : null;
    
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const vDateOnly = new Date(vDate.getFullYear(), vDate.getMonth(), vDate.getDate());

    if (vDateOnly.getTime() > todayDateOnly.getTime()) {
      return { ...base, label: 'مجدولة (قادمة)', bgClass: 'bg-gray-400', lightBgClass: 'bg-gray-50', borderClass: 'border-gray-200', timeColor: 'text-gray-500', filterCode: 'scheduled', headerBgClass: 'bg-gray-500', cornerBgClass: 'bg-gray-200', hoverBorderClass: 'hover:border-gray-300' };
    }

    if (visit) {
        if (visit.status === 'Completed' || att.areBothCheckedOut || att.completedAt) {
            return { ...base, label: 'تمت بنجاح', bgClass: 'bg-[#16a34a]', lightBgClass: 'bg-green-50', borderClass: 'border-green-200', timeColor: 'text-green-700', filterCode: 'completed', headerBgClass: 'bg-[#16a34a]', cornerBgClass: 'bg-green-100', hoverBorderClass: 'hover:border-green-300' };
        }

        const inspectionTime = vEndDate ? new Date(vEndDate.getTime() + 15 * 60000) : null;
        const isPastInspection = inspectionTime ? (today.getTime() >= inspectionTime.getTime()) : (vDateOnly.getTime() < todayDateOnly.getTime());

        const attendeesCount = (att.isNonCustodialCheckedIn ? 1 : 0) + (att.isCompanionCheckedIn ? 1 : 0);

        if (isPastInspection) {
           if (attendeesCount === 0) {
               return { ...base, label: 'لم تتم (غياب الطرفين)', bgClass: 'bg-red-500', lightBgClass: 'bg-red-50', borderClass: 'border-red-200', timeColor: 'text-red-500', filterCode: 'missed', headerBgClass: 'bg-red-600', cornerBgClass: 'bg-red-100', hoverBorderClass: 'hover:border-red-300' };
           } else if (attendeesCount === 1) {
               return { ...base, label: 'لم تتم (حضور طرف واحد فقط)', bgClass: 'bg-orange-500', lightBgClass: 'bg-orange-50', borderClass: 'border-orange-200', timeColor: 'text-orange-700', filterCode: 'missed', headerBgClass: 'bg-orange-600', cornerBgClass: 'bg-orange-100', hoverBorderClass: 'hover:border-orange-300' };
           } else {
               return { ...base, label: 'تمت (مُعلقة الانصراف)', bgClass: 'bg-amber-500', lightBgClass: 'bg-amber-50', borderClass: 'border-amber-200', timeColor: 'text-amber-700', filterCode: 'completed', headerBgClass: 'bg-amber-600', cornerBgClass: 'bg-amber-100', hoverBorderClass: 'hover:border-amber-300' };
           }
        } else {
           const isVisitStarted = today.getTime() >= vDate.getTime();
           if (attendeesCount === 0) {
               if (isVisitStarted) {
                   return { ...base, label: 'في انتظار وصول الأطراف', bgClass: 'bg-cyan-500', lightBgClass: 'bg-cyan-50', borderClass: 'border-cyan-200', timeColor: 'text-cyan-600', filterCode: 'ongoing', headerBgClass: 'bg-cyan-600', cornerBgClass: 'bg-cyan-100', hoverBorderClass: 'hover:border-cyan-300' };
               } else {
                   return { ...base, label: 'اليوم (بانتظار الحضور)', bgClass: 'bg-indigo-500', lightBgClass: 'bg-indigo-50', borderClass: 'border-indigo-200', timeColor: 'text-indigo-600', filterCode: 'today', headerBgClass: 'bg-indigo-600', cornerBgClass: 'bg-indigo-100', hoverBorderClass: 'hover:border-indigo-300' };
               }
           } else if (attendeesCount === 1) {
               return { ...base, label: 'في انتظار الطرف الآخر', bgClass: 'bg-blue-500', lightBgClass: 'bg-blue-50', borderClass: 'border-blue-200', timeColor: 'text-blue-700', filterCode: 'ongoing', headerBgClass: 'bg-blue-500', cornerBgClass: 'bg-blue-100', hoverBorderClass: 'hover:border-blue-300' };
           } else {
               return { ...base, label: 'الرؤية تتم الآن', bgClass: 'bg-blue-600', lightBgClass: 'bg-blue-50', borderClass: 'border-blue-200', timeColor: 'text-blue-700', filterCode: 'ongoing', headerBgClass: 'bg-blue-600', cornerBgClass: 'bg-blue-100', hoverBorderClass: 'hover:border-blue-300' };
           }
        }
    }

    return { ...base, label: 'لم تتم (غياب)', bgClass: 'bg-red-500', lightBgClass: 'bg-red-50', borderClass: 'border-red-200', timeColor: 'text-red-500', filterCode: 'missed', headerBgClass: 'bg-red-600', cornerBgClass: 'bg-red-100', hoverBorderClass: 'hover:border-red-300' };
};