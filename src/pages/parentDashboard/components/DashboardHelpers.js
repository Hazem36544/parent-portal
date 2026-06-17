import { DollarSign, Calendar, FileText, AlertCircle, Bell } from 'lucide-react';

export const getNotificationStyle = (type) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('alimony') || lowerType.includes('payment')) return { icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50", title: "تنبيه نفقة" };
    if (lowerType.includes('visitation') || lowerType.includes('schedule') || lowerType.includes('custody')) return { icon: Calendar, color: "text-green-600", bg: "bg-green-50", title: "تنبيه زيارة وحضانة" };
    if (lowerType.includes('case') || lowerType.includes('document') || lowerType.includes('school')) return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", title: "تحديث ملفات" };
    if (lowerType.includes('alert') || lowerType.includes('violation')) return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", title: "تنبيه هام" };
    return { icon: Bell, color: "text-gray-600", bg: "bg-gray-100", title: "إشعار نظام" };
};

// ✅ الدالة الجديدة التي تعرض التاريخ والوقت بدقة فائقة
export const formatExactDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })} - ${d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatVisitDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return {
        dayName: d.toLocaleDateString('ar-EG', { weekday: 'long' }),
        time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        fullDate: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
    };
};

export const renderScheduleInfo = (visitationSchedule) => {
    if (visitationSchedule) {
        const freq = visitationSchedule.frequency === 'Weekly' ? 'أسبوعياً' : visitationSchedule.frequency;
        const start = visitationSchedule.startTime ? visitationSchedule.startTime.substring(0, 5) : '';
        const end = visitationSchedule.endTime ? visitationSchedule.endTime.substring(0, 5) : '';
        return `جدول معتمد: ${freq} (${start} - ${end})`;
    }
    return 'لا توجد زيارات مسجلة';
};