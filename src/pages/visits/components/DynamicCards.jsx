import React from 'react';
import { Calendar as CalendarIcon, Home, X, Check, Users, Loader2 } from 'lucide-react';
import { formatDate, calculateDays } from './VisitsHelpers';

export default function DynamicCards({ isCustodial, pendingRequests, setShowStayModal, setSelectedRequestId, setShowRejectModal, handleProcessRequest, isProcessing }) {
  if (!isCustodial) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
             <div className="bg-purple-100 p-4 rounded-2xl shrink-0"><Home className="w-8 h-8 text-purple-600" /></div>
             <div><h3 className="text-xl font-bold text-gray-800 mb-1">طلب مكوث الأبناء</h3><p className="text-gray-500 text-sm font-bold">اطلب مكوث الأطفال لفترة محددة (إجازات رسمية أو أعياد)</p></div>
          </div>
          <button onClick={() => setShowStayModal(true)} className="w-full md:w-auto bg-purple-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 relative z-10 shadow-sm shrink-0 outline-none border-none cursor-pointer">
            <Home className="w-5 h-5" /> رفع طلب للمحكمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        طلبات الطرف الآخر المعلقة
        {pendingRequests.length > 0 && (
           <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
             {pendingRequests.length}
           </span>
        )}
      </h2>
      
      {pendingRequests.length === 0 ? (
        <div className="text-gray-500 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center font-bold">لا توجد طلبات معلقة حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingRequests.map((req) => {
            const daysCount = calculateDays(req.startDate, req.endDate);
            const isStay = daysCount > 0 && req.startDate !== req.endDate; 
            return (
              <div key={req.id} className="bg-white border-2 border-orange-200 rounded-[2rem] p-6 relative shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                <span className="absolute top-6 left-6 bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1.5 rounded-full">طلب معلق</span>
                <div className="flex items-start gap-4 mb-5">
                   <div className="bg-orange-50 p-3 rounded-2xl shrink-0">{isStay ? <Users className="w-6 h-6 text-orange-500" /> : <CalendarIcon className="w-6 h-6 text-orange-500" />}</div>
                   <div>
                     <h3 className="font-bold text-gray-800 text-lg mb-1">{isStay ? "طلب مكوث الأبناء" : "طلب زيارة إضافية"}</h3>
                     <p className="text-xs text-gray-400 font-bold">تاريخ الطلب: {formatDate(req.requestedAt || new Date().toISOString())}</p>
                   </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 flex flex-col gap-2 mb-6 border border-gray-100 text-sm">
                   {isStay ? (
                     <>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60 pb-2"><span className="text-gray-500 font-bold">من</span><span className="text-gray-800 font-bold">{formatDate(req.startDate)}</span></div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60 pb-2"><span className="text-gray-500 font-bold">إلى</span><span className="text-gray-800 font-bold">{formatDate(req.endDate)}</span></div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-200/60 pb-2"><span className="text-gray-500 font-bold">المدة</span><span className="text-gray-800 font-bold font-mono">{daysCount} أيام</span></div>
                     </>
                   ) : (
                     <div className="flex items-center gap-2 text-sm mb-2"><CalendarIcon className="w-4 h-4 text-gray-400" /><span className="text-gray-600 font-bold">{formatDate(req.startDate)}</span></div>
                   )}
                   {req.reason && (<div className="pt-2 border-t border-gray-200/60 mt-1"><p className="text-xs text-gray-600 leading-relaxed font-bold"><span className="text-gray-800">السبب:</span> {req.reason}</p></div>)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setSelectedRequestId(req.id); setShowRejectModal(true); }} className="border border-red-200 text-red-500 font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-red-50 transition-colors text-sm outline-none cursor-pointer"><X className="w-4 h-4" /> رفض</button>
                  <button onClick={() => handleProcessRequest(req.id, true)} disabled={isProcessing} className="bg-[#16a34a] hover:bg-green-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors text-sm shadow-sm outline-none border-none cursor-pointer">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> موافقة</>}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}