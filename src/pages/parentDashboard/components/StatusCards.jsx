import React from 'react';
import { Calendar, DollarSign, ChevronLeft, WifiOff, AlertCircle } from 'lucide-react';
import { formatVisitDate, renderScheduleInfo } from './DashboardHelpers';

export default function StatusCards({ navigate, basePath, visitsError, alimonyError, isFatherRole, stats }) {
  const formattedNextVisit = formatVisitDate(stats.nextVisitDate);

  const getAlimonyIconStyle = () => {
      if (alimonyError) return 'bg-gray-100 text-gray-400';
      if (!isFatherRole) return stats.availableWithdrawalAmount > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500';
      if (stats.alimonyOverdueAmount > 0) return 'bg-red-50 text-red-600';
      if (stats.alimonyDueAmount > 0) {
          // ✅ تمييز اللون الأصفر للنفقة القادمة
          return stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'bg-yellow-50 text-yellow-600' : 'bg-orange-50 text-orange-600';
      }
      return 'bg-green-50 text-green-600';
  };

  const getAlimonyBadgeStyle = () => {
      if (alimonyError) return 'bg-gray-100 text-gray-500';
      if (!isFatherRole) return stats.availableWithdrawalAmount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
      if (stats.alimonyOverdueAmount > 0) return 'bg-red-100 text-red-700';
      if (stats.alimonyDueAmount > 0) {
          // ✅ تمييز اللون الأصفر للنفقة القادمة
          return stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700';
      }
      return 'bg-green-100 text-green-700';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* كارت الزيارات */}
      <div 
        onClick={() => navigate(`${basePath}/visits`)} 
        className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-row items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${visitsError ? 'bg-gray-100 text-gray-400' : 'bg-green-50/80 text-green-600'}`}>
            <Calendar className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-1 font-medium">الزيارات</span>
            {visitsError ? (
              <div className="flex items-center gap-1.5 mt-1">
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="font-bold text-red-500 text-sm">تعذر جلب البيانات</span>
              </div>
            ) : formattedNextVisit ? (
              <>
                <span className="font-bold text-gray-800 text-lg">{formattedNextVisit.dayName} {formattedNextVisit.time}</span>
                <span className="text-xs text-gray-400 mt-1 font-medium">{formattedNextVisit.fullDate}</span>
              </>
            ) : (
              <span className="font-bold text-gray-800 text-sm mt-1">{renderScheduleInfo(stats.visitationSchedule)}</span>
            )}
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
      </div>

      {/* كارت النفقة */}
      <div 
         onClick={() => navigate(`${basePath}/alimony`)} 
         className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-row items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getAlimonyIconStyle()}`}>
            <DollarSign className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-1 font-medium">حالة النفقة</span>
            <div className="flex items-center gap-2">
              {alimonyError ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-red-500 text-sm">غير متاح حالياً</span>
                </div>
              ) : (
                <span className="font-bold text-gray-800 text-lg">
                    {isFatherRole 
                       ? (stats.alimonyOverdueAmount > 0 
                            ? `${(stats.alimonyOverdueAmount + stats.alimonyDueAmount).toLocaleString('ar-EG')} ج.م` 
                            : (stats.alimonyDueAmount > 0 
                                ? `${stats.alimonyDueAmount.toLocaleString('ar-EG')} ج.م` 
                                : 'مسددة بالكامل'))
                       : (stats.availableWithdrawalAmount > 0 ? `${stats.availableWithdrawalAmount.toLocaleString('ar-EG')} ج.م` : 'لا يوجد رصيد متاح')
                    }
                </span>
              )}
            </div>
            {alimonyError ? (
                <span className={`mt-1.5 text-xs px-3 py-1 rounded-full w-max font-bold ${getAlimonyBadgeStyle()} flex items-center gap-1`}>
                    <AlertCircle className="w-3 h-3"/> خطأ بالاتصال
                </span>
            ) : (((isFatherRole && (stats.alimonyDueAmount > 0 || stats.alimonyOverdueAmount > 0)) || (!isFatherRole && stats.availableWithdrawalAmount > 0)) && (
                <span className={`mt-1.5 text-xs px-3 py-1 rounded-full w-max font-bold ${getAlimonyBadgeStyle()}`}>
                    {stats.alimonyStatus}
                </span>
            ))}
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
      </div>
    </div>
  );
}