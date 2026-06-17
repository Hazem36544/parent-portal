import { Bell, Calendar, DollarSign, FileText, AlertTriangle } from 'lucide-react';

export const getNotificationStyle = (type) => {
  const lowerType = type?.toLowerCase() || '';
  if (lowerType.includes('alimony') || lowerType.includes('payment')) {
    return { icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50", title: "تنبيه نفقة" };
  }
  if (lowerType.includes('visitation') || lowerType.includes('schedule') || lowerType.includes('custody')) {
    return { icon: Calendar, color: "text-green-600", bg: "bg-green-50", title: "تنبيه زيارة وحضانة" };
  }
  if (lowerType.includes('case') || lowerType.includes('document') || lowerType.includes('school')) {
    return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", title: "تحديث ملفات وقضايا" };
  }
  if (lowerType.includes('alert') || lowerType.includes('violation')) {
    return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "تنبيه هام" };
  }
  return { icon: Bell, color: "text-gray-600", bg: "bg-gray-100", title: "إشعار نظام" };
};

// ✅ الدالة الجديدة لعرض التاريخ والوقت بدقة (مثال: 8 يونيو 2026 - 10:30 صباحاً)
export const formatExactDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  
  const datePart = d.toLocaleDateString('ar-EG', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // تحويل الصفر إلى 12

  return `${datePart} - ${hours}:${minutes} ${ampm}`;
};