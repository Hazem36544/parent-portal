import React from 'react';
import { Loader2, FileWarning, FileText, Filter, ChevronDown } from 'lucide-react';
import { getReportTheme, translateReportType } from './ReportHelpers';

export default function ReportsList({ 
  loadingReports, permissionError, reports, filteredReports, 
  visibleCount, setVisibleCount, setSelectedReportDetail 
}) {
  
  if (loadingReports) {
    return (
      <div className="flex justify-center items-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="bg-yellow-50 p-10 rounded-[2rem] flex flex-col items-center text-center border border-yellow-200 shadow-sm">
        <FileWarning className="w-16 h-16 text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold text-yellow-800 mb-2">الصلاحيات غير مكتملة</h3>
        <p className="text-yellow-700 max-w-md leading-relaxed font-bold text-sm">
          لا يمكن عرض تقارير المدرسة حالياً. يرجى مراجعة الإدارة لتحديث صلاحيات حسابات أولياء الأمور لتشمل قراءة التقارير.
        </p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2rem] text-center flex flex-col items-center border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-gray-800 font-bold text-lg">لا توجد تقارير مطابقة.</p>
        <p className="text-sm text-gray-500 mt-2 font-bold">لم يتم العثور على تقارير في الفترة المحددة أو لم يتم رفعها بعد.</p>
      </div>
    );
  }

  if (filteredReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Filter className="w-8 h-8 text-gray-300" />
        </div>
        <p className="font-bold text-lg text-gray-700">لا توجد تقارير مطابقة</p>
        <p className="text-sm font-medium text-gray-500 mt-2 text-center max-w-sm">لم يتم العثور على تقارير تطابق الفلاتر المحددة (النوع / الشهر).</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredReports.slice(0, visibleCount).map((report) => {
          const theme = getReportTheme(report.reportType);
          return (
            <div 
              key={report.id} 
              onClick={() => setSelectedReportDetail(report)}
              className={`group ${theme.cardBg} border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md ${theme.hoverBorder} transition-all duration-300 rounded-[2rem] p-6 cursor-pointer relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-20 h-20 ${theme.bg} rounded-br-full -translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform opacity-60 pointer-events-none`}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${theme.bg} flex items-center justify-center shrink-0 shadow-sm border border-white/50`}>
                  <FileText className={`w-6 h-6 ${theme.text}`} />
                </div>
                <span className="text-[10px] px-3 py-1 rounded-full font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
                  مُعتمد
                </span>
              </div>

              <div className="flex flex-col gap-2 relative z-10 mb-4">
                 <h3 className={`font-bold text-gray-800 text-lg transition-colors duration-300 ${theme.hoverText}`}>{translateReportType(report.reportType)}</h3>
                 <span className="text-xs text-gray-500 font-bold">تم الرفع من إدارة المدرسة</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 relative z-10">
                <span className="text-sm font-bold text-gray-700 font-mono tracking-wide">
                  {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                </span>
                <div className={`${theme.text} ${theme.bg} p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`}>
                   <ChevronDown className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < filteredReports.length && (
        <div className="flex justify-center mt-8 animate-in fade-in">
          <button
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-8 py-3.5 bg-white border-2 border-blue-100 text-[#1e3a8a] rounded-2xl font-bold shadow-sm hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center gap-2 outline-none active:scale-95 border-none"
          >
            <ChevronDown className="w-5 h-5" /> عرض المزيد من التقارير
          </button>
        </div>
      )}
    </>
  );
}