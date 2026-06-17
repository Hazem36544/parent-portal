import React from 'react';
import { CalendarClock, AlertCircle, CheckCircle, ChevronLeft, WifiOff, RefreshCw, MessageSquare } from 'lucide-react';
import { formatVisitDate } from './DashboardHelpers';

export default function UrgentAlerts({ 
  navigate, basePath, visitsError, alimonyError, 
  fetchDashboardData, isFatherRole, stats, isCustodial 
}) {
  const formattedNextVisit = formatVisitDate(stats.nextVisitDate);

  return (
    <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">التنبيهات العاجلة</h3>
        </div>

        {/* تنبيه الزيارات */}
        {visitsError ? (
            <div className="bg-gray-50 border-r-4 border-r-gray-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={fetchDashboardData}>
               <div className="flex items-center gap-4">
                  <div className="bg-white text-gray-400 p-3 rounded-xl shrink-0 shadow-sm"><WifiOff className="w-6 h-6"/></div>
                  <div className="flex flex-col">
                     <span className="font-bold text-gray-700 mb-1">تعذر مزامنة الزيارات</span>
                     <span className="text-sm text-gray-500 font-bold leading-relaxed">لم نتمكن من جلب حالة زياراتك الحالية من الخادم.</span>
                  </div>
               </div>
               <span className="bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3" /> تحديث</span>
            </div>
        ) : (
            <div className="bg-white border-r-4 border-r-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={() => navigate(`${basePath}/visits`)}>
               <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0"><CalendarClock className="w-6 h-6"/></div>
                  <div className="flex flex-col">
                     <span className="font-bold text-gray-800 mb-1">الزيارة القادمة</span>
                     <span className="text-sm text-gray-500 font-bold">{formattedNextVisit ? `${formattedNextVisit.dayName} - ${formattedNextVisit.fullDate}` : 'لا توجد زيارات مجدولة'}</span>
                  </div>
               </div>
               <ChevronLeft className="w-5 h-5 text-gray-300" />
            </div>
        )}

        {/* تنبيه النفقة */}
        {alimonyError ? (
            <div className="bg-gray-50 border-r-4 border-r-gray-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={fetchDashboardData}>
               <div className="flex items-center gap-4">
                  <div className="bg-white text-gray-400 p-3 rounded-xl shrink-0 shadow-sm"><WifiOff className="w-6 h-6"/></div>
                  <div className="flex flex-col">
                     <span className="font-bold text-gray-700 mb-1">تعذر مزامنة الدفعات المالية</span>
                     <span className="text-sm text-gray-500 font-bold leading-relaxed">يرجى إعادة تحميل الصفحة للتأكد من حالة النفقة الخاصة بك.</span>
                  </div>
               </div>
               <span className="bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3" /> تحديث</span>
            </div>
        ) : (
            <>
                {isFatherRole && stats.alimonyOverdueAmount > 0 && (
                    <div className="bg-red-50 border-r-4 border-r-red-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={() => navigate(`${basePath}/alimony`)}>
                       <div className="flex items-center gap-4">
                          <div className="bg-white text-red-500 p-3 rounded-xl shrink-0 shadow-sm"><AlertCircle className="w-6 h-6"/></div>
                          <div className="flex flex-col">
                             <span className="font-bold text-red-700 mb-1">لديك متأخرات سابقة ونفقة مستحقة</span>
                             <span className="text-sm text-red-500 font-bold leading-relaxed">بإجمالي {(stats.alimonyOverdueAmount + stats.alimonyDueAmount).toLocaleString('ar-EG')} ج.م. يُرجى السداد.</span>
                          </div>
                       </div>
                       <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shrink-0">الذهاب للسداد</span>
                    </div>
                )}
                
                {isFatherRole && stats.alimonyOverdueAmount === 0 && stats.alimonyDueAmount > 0 && (
                    <div className={`${stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'bg-yellow-50/50 border-r-yellow-400' : 'bg-orange-50/50 border-r-orange-400'} border-r-4 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between`} onClick={() => navigate(`${basePath}/alimony`)}>
                       <div className="flex items-center gap-4">
                          {/* ✅ التعديل هنا: استخدام اللون الأصفر والأيقونة المناسبة لدفعة الشهر القادم */}
                          <div className={`bg-white ${stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'text-yellow-500' : 'text-orange-500'} p-3 rounded-xl shrink-0 shadow-sm`}><AlertCircle className="w-6 h-6"/></div>
                          <div className="flex flex-col">
                             <span className={`font-bold ${stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'text-yellow-700' : 'text-orange-700'} mb-1`}>
                                {stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'النفقة القادمة (مستحقة الشهر القادم)' : 'عليك نفقة مستحقة السداد لهذا الشهر'}
                             </span>
                             <span className={`text-sm ${stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'text-yellow-600' : 'text-orange-600'} font-bold`}>
                                بمبلغ {stats.alimonyDueAmount.toLocaleString('ar-EG')} ج.م
                                {stats.nextAlimonyDate && ` (استحقاق ${new Date(stats.nextAlimonyDate).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })})`}
                             </span>
                          </div>
                       </div>
                       <span className={`${stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'bg-yellow-500' : 'bg-orange-500'} text-white text-xs px-3 py-1.5 rounded-lg font-bold shrink-0`}>
                           {stats.alimonyStatus === 'مستحقة الشهر القادم' ? 'عرض التفاصيل' : 'الذهاب للسداد'}
                       </span>
                    </div>
                )}

                {isFatherRole && stats.alimonyOverdueAmount === 0 && stats.alimonyDueAmount === 0 && (
                    <div className="bg-emerald-50 border-r-4 border-r-emerald-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={() => navigate(`${basePath}/alimony`)}>
                       <div className="flex items-center gap-4">
                          <div className="bg-white text-emerald-600 p-3 rounded-xl shrink-0 shadow-sm"><CheckCircle className="w-6 h-6"/></div>
                          <div className="flex flex-col">
                             <span className="font-bold text-emerald-800 mb-1">تم سداد نفقة الشهر الحالي بنجاح</span>
                             <span className="text-sm text-emerald-600 font-bold">
                                 {stats.nextAlimonyDate ? `الاستحقاق القادم في: ${new Date(stats.nextAlimonyDate).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'أنت ملتزم ولا يوجد متأخرات'}
                             </span>
                          </div>
                       </div>
                    </div>
                )}

                {!isFatherRole && stats.availableWithdrawalAmount > 0 && (
                    <div className="bg-green-50 border-r-4 border-r-green-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={() => navigate(`${basePath}/alimony`)}>
                       <div className="flex items-center gap-4">
                          <div className="bg-white text-green-600 p-3 rounded-xl shrink-0 shadow-sm"><CheckCircle className="w-6 h-6"/></div>
                          <div className="flex flex-col">
                             <span className="font-bold text-green-700 mb-1">لديكِ رصيد متاح للسحب</span>
                             <span className="text-sm text-green-600 font-bold">بمبلغ {stats.availableWithdrawalAmount.toLocaleString('ar-EG')} ج.م</span>
                          </div>
                       </div>
                       <span className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold shrink-0">سحب الرصيد</span>
                    </div>
                )}
            </>
        )}

        {isCustodial && stats.pendingVisitsCount > 0 && !visitsError && (
            <div className="bg-orange-50 border-r-4 border-r-orange-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between" onClick={() => navigate(`${basePath}/visits`)}>
               <div className="flex items-center gap-4">
                  <div className="bg-white text-orange-500 p-3 rounded-xl shrink-0 shadow-sm"><MessageSquare className="w-6 h-6"/></div>
                  <div className="flex flex-col">
                     <span className="font-bold text-orange-700 mb-1">طلبات مكوث معلقة</span>
                     <span className="text-sm text-orange-600 font-bold">لديك {stats.pendingVisitsCount} طلب بحاجة لمراجعتك</span>
                  </div>
               </div>
               <ChevronLeft className="w-5 h-5 text-orange-300" />
            </div>
        )}
    </div>
  );
}