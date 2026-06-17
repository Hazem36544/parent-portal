import React from 'react';
import { X, CheckCircle, Receipt, CreditCard, Loader2, Download } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './FatherStripeCheckout';
import { formatMoney, formatDate, formatTimeAndDate } from './FatherAlimonyHelpers';

export default function FatherAlimonyModals({
  showReceiptModal, setShowReceiptModal, selectedReceipt, courtName, handleDownloadReceiptPDF, isGeneratingPDF,
  showPaymentModal, setShowPaymentModal, paymentAmountToDisplay, clientSecret, stripePromise, appearance
}) {
  return (
    <>
      {showReceiptModal && selectedReceipt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
                  <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
                      <h2 className="font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> إيصال سداد إلكتروني</h2>
                      <button onClick={() => setShowReceiptModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex flex-col gap-4">
                      <div className="text-center pb-4 border-b border-gray-100">
                          <Receipt className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                          <h3 className="text-3xl font-black text-gray-800 font-mono tracking-tight">{formatMoney(selectedReceipt.amount)} <span className="text-lg">ج.م</span></h3>
                          <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block">تم سداد المبلغ بنجاح</span>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center">
                              <span className="text-gray-500 font-bold text-sm">عن استحقاق شهر</span>
                              <span className="text-gray-800 font-bold text-sm">{formatDate(selectedReceipt.dueDate)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                              <span className="text-gray-500 font-bold text-sm">تاريخ ووقت السداد</span>
                              <span className="text-gray-800 font-bold text-xs font-mono" dir="ltr">{formatTimeAndDate(selectedReceipt.paidAt || selectedReceipt.dueDate)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                              <span className="text-gray-500 font-bold text-sm">الرقم المرجعي</span>
                              <span className="text-gray-800 font-bold text-[10px] font-mono tracking-widest">{selectedReceipt.id.split('-')[0].toUpperCase()}...</span>
                          </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm text-center">
                          <p className="text-xs text-blue-800 font-bold leading-relaxed">
                              هذا الإيصال معتمد إلكترونياً من محكمة الأسرة {courtName ? `بـ ${courtName}` : ''} ويثبت إتمام عملية السداد بنجاح.
                          </p>
                      </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
                      <button onClick={() => setShowReceiptModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm outline-none cursor-pointer">إغلاق</button>
                      <button onClick={handleDownloadReceiptPDF} disabled={isGeneratingPDF} className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm outline-none border-none cursor-pointer flex justify-center items-center gap-2">
                          {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> تحميل الإيصال (PDF)</>}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#1e3a8a] text-white p-5 flex justify-between items-center shrink-0">
              <h2 className="font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> دفع النفقة المستحقة</h2>
              <button onClick={() => setShowPaymentModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors outline-none border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="text-center mb-6">
                 <p className="text-sm font-bold text-gray-500 mb-1">المبلغ المطلوب سداده</p>
                 <p className="text-3xl font-black text-[#1e3a8a] font-mono">{paymentAmountToDisplay} <span className="text-lg font-sans">ج.م</span></p>
              </div>

              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm 
                     amountFormatted={paymentAmountToDisplay}
                     onCancel={() => setShowPaymentModal(false)}
                     onSuccess={() => {
                       setShowPaymentModal(false);
                       window.location.reload();
                     }}
                  />
                </Elements>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-2 shrink-0">
               <span className="text-[10px] font-bold text-gray-400">مدعوم ومشفر بواسطة</span>
               <span className="text-xs font-black text-indigo-600 tracking-widest font-mono">stripe</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}