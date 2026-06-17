import React from 'react';
import { ChevronRight, CheckCircle, Receipt, Download } from 'lucide-react';
import { formatMoney, formatDate } from './FatherAlimonyHelpers';

export default function FatherAlimonyHistory({ 
  isPageLoaded, historyPayments, setShowFullHistory, setSelectedReceipt, setShowReceiptModal 
}) {
  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
          <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-5 relative z-10">
              <button onClick={() => setShowFullHistory(false)} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border-none outline-none cursor-pointer">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold mb-1">سجل المدفوعات السابقة</h1>
                <p className="text-blue-200 text-sm font-bold">جميع الدفعات التي قمت بسدادها مسبقاً</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-l from-blue-50 to-indigo-50/30 border border-blue-100 rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col gap-1 text-center sm:text-right">
               <span className="text-blue-700 font-bold text-sm">إجمالي المبالغ المسددة</span>
               <div className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                 {formatMoney(historyPayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
                 <CheckCircle className="w-8 h-8 text-blue-600 hidden sm:block" />
               </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-blue-200/50 py-3.5 px-8 rounded-2xl flex items-center gap-3 shadow-sm">
               <span className="text-gray-500 text-sm font-bold">عدد المدفوعات:</span>
               <span className="text-blue-700 font-bold text-lg">{historyPayments.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {historyPayments.map((item) => (
              <div 
                key={item.id} 
                onClick={() => { setSelectedReceipt(item); setShowReceiptModal(true); }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-50 rounded-br-full -translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform opacity-50 pointer-events-none"></div>
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-50 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform"><Receipt className="w-5 h-5" /></div>
                    <div>
                      <h3 className="font-bold text-gray-800">{formatDate(item.dueDate)}</h3>
                      <span className="text-xs text-gray-500 font-bold">شهر الاستحقاق</span>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">تم السداد</span>
                </div>
                <div className="flex justify-between items-end relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 text-xs font-bold">تاريخ الدفع:</span>
                    <span className="font-bold text-gray-700 text-sm font-mono" dir="ltr">{formatDate(item.paidAt || item.dueDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-xl font-bold text-blue-700 font-mono">{formatMoney(item.amount)} <span className="text-sm text-gray-500">ج.م</span></span>
                     <div className="text-blue-600 bg-blue-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                         <Download className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              </div>
            ))}
            {historyPayments.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                 <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                 <p className="font-bold text-lg">لم تقم بسداد أي دفعات حتى الآن</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}