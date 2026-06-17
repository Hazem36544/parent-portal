import React from 'react';
import { FileText, CalendarDays, CheckCircle, Receipt, Download } from 'lucide-react';
import { formatDate, formatMoney } from './FatherAlimonyHelpers';

export default function FatherAlimonySidebar({ 
  alimonyDetails, historyPayments, overduePayments, setShowFullHistory, setSelectedReceipt, setShowReceiptModal 
}) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-6">
      
      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-5 h-5"/></div>
          <h2 className="text-lg font-bold text-gray-800">بيانات قرار النفقة</h2>
        </div>
        
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-bold">المبلغ الشهري المقرر</span>
            <span className="font-bold text-[#1e3a8a] font-mono text-base">{formatMoney(alimonyDetails?.amount)} ج.م</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-gray-500 font-bold">معدل الدفع</span>
            <span className="font-bold text-gray-800">
              {alimonyDetails?.frequency === 'Weekly' ? 'أسبوعياً' : 
               alimonyDetails?.frequency === 'Monthly' ? 'شهرياً' : 
               alimonyDetails?.frequency === 'Yearly' ? 'سنوياً' : (alimonyDetails?.frequency || 'غير محدد')}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
             <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col justify-center items-center text-center gap-1">
               <span className="text-2xl font-bold text-green-700 font-mono">{historyPayments.length}</span>
               <span className="text-green-700 text-xs font-bold">دفعة مسددة</span>
             </div>
             <div className={`${overduePayments.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border p-4 rounded-xl flex flex-col justify-center items-center text-center gap-1`}>
               <span className={`text-2xl font-bold font-mono ${overduePayments.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{overduePayments.length}</span>
               <span className={`${overduePayments.length > 0 ? 'text-red-600' : 'text-gray-500'} text-xs font-bold`}>دفعة متأخرة</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-400"/> سجل المدفوعات
            </h2>
            <button 
              onClick={() => setShowFullHistory(true)}
              className="text-[#1e3a8a] text-xs font-bold bg-blue-50 py-2 px-3.5 rounded-lg hover:bg-blue-100 transition-colors border-none outline-none cursor-pointer"
            >
              عرض الكل
            </button>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {historyPayments.slice(0, 3).map(payment => (
            <div 
                key={payment.id} 
                onClick={() => { setSelectedReceipt(payment); setShowReceiptModal(true); }}
                className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100 hover:border-blue-100 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-800 font-bold text-sm font-mono" dir="ltr">{formatDate(payment.dueDate)}</span>
                <span className="text-blue-600 text-[11px] font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> تم السداد</span>
              </div>
              <span className="font-bold text-[#1e3a8a] text-sm font-mono">{formatMoney(payment.amount)} ج.م</span>
            </div>
          ))}
          
          {historyPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-8 opacity-50">
              <Receipt className="w-10 h-10 text-gray-400 mb-3" />
              <span className="text-sm text-gray-500 font-bold">لا توجد عمليات سداد سابقة</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}