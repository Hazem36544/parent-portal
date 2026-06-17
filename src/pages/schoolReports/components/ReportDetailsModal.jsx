import React from 'react';
import { X, Info, Download, Loader2, Eye, GraduationCap } from 'lucide-react';
import { getReportTheme, translateReportType } from './ReportHelpers';

export default function ReportDetailsModal({ 
  selectedReportDetail, setSelectedReportDetail, 
  handleDownload, handleOpenPreview, isPreviewLoading 
}) {
  if (!selectedReportDetail) return null;
  const modalTheme = getReportTheme(selectedReportDetail.reportType);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
        
        <div className={`h-2 w-full ${modalTheme.headerBg} shrink-0`}></div>

        <div className="p-6 md:p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${modalTheme.bg} flex items-center justify-center flex-shrink-0 border ${modalTheme.borderColor}`}>
                <GraduationCap className={`w-6 h-6 ${modalTheme.text}`} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-gray-800 text-xl">{translateReportType(selectedReportDetail.reportType)}</h3>
                <span className="text-xs text-gray-500 font-bold mt-1">التقييم الأكاديمي</span>
              </div>
            </div>
            <button onClick={() => setSelectedReportDetail(null)} className="bg-gray-50 hover:bg-gray-100 text-gray-500 p-2 rounded-full transition-colors border-none outline-none cursor-pointer"><X size={18} /></button>
          </div>

          <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <span className="text-sm font-bold text-gray-600">تاريخ الرفع</span>
            <span className={`text-sm font-black ${modalTheme.text} font-mono tracking-wide`}>
              {selectedReportDetail.uploadedAt ? new Date(selectedReportDetail.uploadedAt).toLocaleDateString('ar-EG') : 'غير محدد'}
            </span>
          </div>

          <div className={`${modalTheme.bg} bg-opacity-50 ${modalTheme.darkText} rounded-2xl p-5 border ${modalTheme.borderColor} shadow-sm relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-1.5 h-full ${modalTheme.headerBg}`}></div>
            <div className="flex gap-2 items-center mb-2">
              <Info className={`w-5 h-5 ${modalTheme.text}`} />
              <span className="font-bold text-sm">ملاحظة النظام:</span>
            </div>
            <p className="text-sm leading-relaxed font-bold pr-1">
              التفاصيل الدقيقة للدرجات والمواد والسلوك موجودة داخل الملف المرفق (PDF). يمكنك عرض التقرير أو تحميله على جهازك للاطلاع على التقييم الكامل.
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 md:gap-4">
            <button 
              onClick={() => handleDownload(selectedReportDetail.documentId)}
              disabled={!selectedReportDetail.documentId || isPreviewLoading}
              className={`w-full sm:flex-1 bg-white ${modalTheme.outlineBtn} py-3 md:py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 outline-none cursor-pointer`}
              title="تنزيل الـ PDF"
            >
              <Download className="w-5 h-5" />
              <span>تنزيل</span>
            </button>
            <button 
              onClick={() => {
                  const repType = selectedReportDetail.reportType;
                  setSelectedReportDetail(null);
                  handleOpenPreview(selectedReportDetail.documentId, repType);
              }}
              disabled={!selectedReportDetail.documentId || isPreviewLoading}
              className={`w-full sm:flex-[2] ${modalTheme.primaryBtn} py-3 md:py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 border-none outline-none cursor-pointer`}
            >
              {isPreviewLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Eye className="h-5 w-5" />}
              <span>عرض التقرير</span>
            </button>
            <button 
              onClick={() => setSelectedReportDetail(null)}
              className="w-full sm:flex-1 bg-gray-50 text-gray-700 py-3 md:py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-200 active:scale-95 outline-none cursor-pointer"
            >
              إغلاق
            </button>
        </div>
      </div>
    </div>
  );
}