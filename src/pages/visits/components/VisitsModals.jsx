import React from 'react';
import { Calendar as CalendarIcon, MapPin, X, FileText, Users, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { formatDate, formatTime, getSmartVisitStatus } from './VisitsHelpers';

export const VisitDetailsModal = ({ showVisitDetailsModal, setShowVisitDetailsModal, selectedVisitDetails, locationName }) => {
  if (!showVisitDetailsModal || !selectedVisitDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> ملخص الزيارة</h2>
          <button onClick={() => setShowVisitDetailsModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <span className="text-gray-500 font-bold text-sm">التاريخ</span>
                  <span className="text-gray-800 font-bold">{formatDate(selectedVisitDetails.date)}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <span className="text-gray-500 font-bold text-sm">الموعد المجدول</span>
                  <span className="text-gray-800 font-mono font-bold" dir="ltr">
                      {selectedVisitDetails.actualVisit ? formatTime(selectedVisitDetails.actualVisit.startAt) : (selectedVisitDetails.schedule?.startTime?.substring(0, 5) || '21:00')} - {selectedVisitDetails.actualVisit ? formatTime(selectedVisitDetails.actualVisit.endAt) : (selectedVisitDetails.schedule?.endTime?.substring(0, 5) || '23:00')}
                  </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <span className="text-gray-500 font-bold text-sm">مكان الزيارة</span>
                  <span className="text-gray-800 font-bold flex items-center gap-1">
                     <MapPin className="w-4 h-4 text-gray-400" /> {locationName || "مركز الرؤية المحدد"}
                  </span>
              </div>

              {(() => {
                  const statusDisplay = getSmartVisitStatus(selectedVisitDetails.actualVisit, selectedVisitDetails.date);
                  return (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                          <span className="text-gray-500 font-bold text-sm">حالة الزيارة</span>
                          <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${statusDisplay.bgClass} ${statusDisplay.textClass} shadow-sm`}>{statusDisplay.label}</span>
                      </div>
                  );
              })()}
          </div>
          <div className="mt-6">
              <button onClick={() => setShowVisitDetailsModal(false)} className="w-full bg-[#1e3a8a] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors shadow-sm outline-none border-none cursor-pointer">إغلاق</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryDetailsModal = ({ showHistoryDetailsModal, setShowHistoryDetailsModal, selectedHistoryVisit, locationName, parentNames, handleGeneratePDF, isGeneratingPDF }) => {
  if (!showHistoryDetailsModal || !selectedHistoryVisit) return null;

  const statusDisplay = getSmartVisitStatus(selectedHistoryVisit);
  const att = selectedHistoryVisit.attendance || {};
  const hasNonCustodialIn = !!att.nonCustodialCheckedInAt;
  const hasCompIn = !!att.companionCheckedInAt;
  const nonCustodialIn = hasNonCustodialIn ? formatTime(att.nonCustodialCheckedInAt) : 'لم يحضر';
  const nonCustodialOut = att.nonCustodialCheckedOutAt ? formatTime(att.nonCustodialCheckedOutAt) : 'لم ينصرف';
  const compIn = hasCompIn ? formatTime(att.companionCheckedInAt) : 'لم يحضر';
  const compOut = att.companionCheckedOutAt ? formatTime(att.companionCheckedOutAt) : 'لم ينصرف';
  const compNIdFromVisit = selectedHistoryVisit.companionNationalId;
  const isAlternateCompanion = compNIdFromVisit && compNIdFromVisit !== parentNames.custodialNId;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] flex flex-col">
        <div className={`${statusDisplay.headerBgClass} text-white p-4 flex justify-between items-center shrink-0 transition-colors`}>
          <h2 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5" /> تقرير حالة الزيارة التفصيلي</h2>
          <button onClick={() => setShowHistoryDetailsModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 bg-white overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-3">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                  <span className="text-blue-800 font-bold text-sm">التاريخ</span>
                  <span className="text-blue-900 font-bold text-sm">{formatDate(selectedHistoryVisit.startAt)}</span>
              </div>
              
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                  <span className="text-blue-800 font-bold text-sm">المكان</span>
                  <span className="text-blue-900 font-bold text-sm flex items-center gap-1">
                     <MapPin className="w-3.5 h-3.5 text-blue-400" /> {locationName || "مركز الرؤية المحدد"}
                  </span>
              </div>

              <div className={`${statusDisplay.lightBgClass} p-3 rounded-xl border ${statusDisplay.borderClass} flex items-center justify-between shadow-sm mb-2`}>
                  <span className={`${statusDisplay.timeColor} font-bold text-sm`}>الحالة النهائية</span>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${statusDisplay.bgClass} ${statusDisplay.textClass} shadow-sm`}>{statusDisplay.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col justify-center items-center shadow-sm">
                      <span className="text-blue-500 font-bold text-[10px] mb-1">وقت الحضور المجدول</span>
                      <span className="text-blue-900 font-mono font-bold text-sm" dir="ltr">{formatTime(selectedHistoryVisit.startAt)}</span>
                  </div>
                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex flex-col justify-center items-center shadow-sm">
                      <span className="text-blue-500 font-bold text-[10px] mb-1">وقت الانصراف المجدول</span>
                      <span className="text-blue-900 font-mono font-bold text-sm" dir="ltr">{formatTime(selectedHistoryVisit.endAt)}</span>
                  </div>
              </div>

              {/* الطرف غير الحاضن */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                 <div className="border-b border-slate-200 pb-2 mb-1">
                   <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{parentNames.nonCustodial || 'الطرف غير الحاضن'}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">(الطرف غير الحاضن)</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">الرقم القومي:</span>
                      <span className="font-mono text-xs font-bold text-slate-600 tracking-widest">{parentNames.nonCustodialNId || 'غير مسجل'}</span>
                   </div>
                 </div>
                 <div className="flex justify-between text-xs items-center bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-bold">وقت الحضور الفعلي:</span>
                    <span className="font-mono font-bold text-slate-800" dir="ltr">{nonCustodialIn}</span>
                 </div>
                 {hasNonCustodialIn && (
                     <div className="flex justify-between text-xs items-center bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-bold">وقت الانصراف الفعلي:</span>
                        <span className="font-mono font-bold text-slate-800" dir="ltr">{nonCustodialOut}</span>
                     </div>
                 )}
              </div>

              {/* الطرف الحاضن */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                 <div className="border-b border-slate-200 pb-2 mb-1">
                   <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{parentNames.custodial || 'الطرف الحاضن'}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">
                         {isAlternateCompanion ? '(الطرف الحاضن)' : '(الطرف الحاضن والمرافق الافتراضي)'}
                      </span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[10px]">الرقم القومي:</span>
                      <span className="font-mono text-xs font-bold text-slate-600 tracking-widest">{parentNames.custodialNId || 'غير مسجل'}</span>
                   </div>
                 </div>
                 {isAlternateCompanion && (
                   <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg mb-1 flex justify-between items-center">
                      <span className="text-blue-700 text-xs font-bold flex items-center gap-1"><Users className="w-3.5 h-3.5"/> المرافق البديل:</span>
                      <span className="font-mono text-xs font-bold text-blue-900 tracking-widest">{compNIdFromVisit}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-xs items-center bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-bold">وقت الحضور الفعلي:</span>
                    <span className="font-mono font-bold text-slate-800" dir="ltr">{compIn}</span>
                 </div>
                 {hasCompIn && (
                     <div className="flex justify-between text-xs items-center bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-bold">وقت الانصراف الفعلي:</span>
                        <span className="font-mono font-bold text-slate-800" dir="ltr">{compOut}</span>
                     </div>
                 )}
              </div>
              
              {att.attendedChildrenIds && att.attendedChildrenIds.length > 0 && (
                 <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center justify-between shadow-sm mt-1">
                    <span className="text-amber-700 font-bold text-xs flex items-center gap-2"><Users className="w-4 h-4"/> الأطفال الحاضرين فعلياً</span>
                    <span className="text-amber-900 font-black text-base">{att.attendedChildrenIds.length}</span>
                 </div>
              )}

              {(att.nonCustodialOverstayed || att.companionOverstayed) && (
                 <div className="bg-red-50 p-3 rounded-xl border border-red-200 shadow-sm mt-1">
                    <h4 className="text-red-700 font-bold text-xs mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> ملاحظات ومخالفات:</h4>
                    <ul className="text-[11px] text-red-600 font-bold list-disc list-inside px-2">
                       {att.nonCustodialOverstayed && <li>تأخر الطرف غير الحاضن في تسليم الأطفال بالموعد.</li>}
                       {att.companionOverstayed && <li>تأخر المرافق/الطرف الحاضن عن الانصراف في الموعد.</li>}
                    </ul>
                 </div>
              )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
            <button onClick={() => setShowHistoryDetailsModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm outline-none cursor-pointer">إغلاق</button>
            <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="flex-[2] bg-[#1e3a8a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors shadow-sm outline-none border-none cursor-pointer flex justify-center items-center gap-2">
                {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> تحميل التقرير (PDF)</>}
            </button>
        </div>
      </div>
    </div>
  );
};