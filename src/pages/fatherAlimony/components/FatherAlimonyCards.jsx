import React from 'react';
import { Wallet, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate, formatMoney, getDelayDays } from './FatherAlimonyHelpers';

export default function FatherAlimonyCards({ dueTodayList, upcomingList, overduePayments, handleInitiatePayment }) {
  const currentDue = upcomingList.length > 0 ? upcomingList[0] : null;

  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      
      {dueTodayList.length > 0 && (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/20 p-3.5 rounded-2xl shrink-0 backdrop-blur-sm"><Wallet className="w-7 h-7" /></div>
              <div>
                <h2 className="text-xl font-bold mb-1">دفعات مستحقة اليوم</h2>
                <p className="text-blue-100 text-sm font-bold">حان موعد سدادها اليوم</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative z-10 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {dueTodayList.map(payment => (
              <div key={payment.id} className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors text-white">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm">استحقاق {formatDate(payment.dueDate)}</span>
                  <span className="text-blue-200 text-xs font-mono font-bold">{formatMoney(payment.amount)} ج.م</span>
                </div>
                <button 
                  onClick={() => handleInitiatePayment(payment)}
                  className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2 outline-none border-none cursor-pointer"
                >
                  <CreditCard className="w-4 h-4"/> سداد الدفعة الآن
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentDue && (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3.5 rounded-2xl shrink-0 text-yellow-600"><Clock className="w-7 h-7" /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">النفقة القادمة المنتظرة</h2>
                <p className="text-gray-500 text-sm font-bold">لم يحن موعد استحقاقها بعد</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex justify-between items-center relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs font-bold">تاريخ الاستحقاق</span>
              <span className="font-bold text-gray-700">{formatDate(currentDue.dueDate)}</span>
            </div>
            <div className="flex flex-col gap-1 text-left">
              <span className="text-gray-500 text-xs font-bold">المبلغ المنتظر</span>
              <span className="font-bold text-gray-800 font-mono text-lg">{formatMoney(currentDue.amount)} ج.م</span>
            </div>
          </div>
        </div>
      )}

      {overduePayments.length > 0 && (
        <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/50 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-1">
                <AlertCircle className="w-6 h-6" /> دفعات متأخرة
              </h2>
              <p className="text-red-500/80 text-sm font-bold">تجاوزت موعد استحقاقها ويجب سدادها فوراً</p>
            </div>
            <div className="text-left">
              <span className="text-xs text-red-500 font-bold block mb-1">إجمالي المتأخرات</span>
              <span className="text-2xl font-bold text-red-600 font-mono">
                {formatMoney(overduePayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 relative z-10 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {overduePayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-red-100 shadow-sm transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-800 font-bold text-sm">استحقاق {formatDate(payment.dueDate)}</span>
                  <span className="text-red-500 text-xs font-bold">متأخرة منذ {getDelayDays(payment.dueDate)} يوم</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-600 font-bold font-mono text-lg">{formatMoney(payment.amount)} ج.م</span>
                  <button 
                    onClick={() => handleInitiatePayment(payment)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2 outline-none border-none cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4"/> سداد المتأخرات
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentDue && overduePayments.length === 0 && dueTodayList.length === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full min-h-[300px] relative z-10 mt-4">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-500 mb-5 shadow-sm border border-green-100">
             <CheckCircle className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أي مستحقات منتظرة حالياً</h3>
           <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-sm">تم سداد جميع الدفعات بنجاح، ولا يوجد متأخرات مسجلة.</p>
        </div>
      )}

    </div>
  );
}