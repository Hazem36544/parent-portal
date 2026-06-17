import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Loader2, Check, UserPlus, AlertTriangle, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const daysOfWeek = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export const StayModal = ({ showStayModal, setShowStayModal, handleStaySubmit, stayRequest, setStayRequest, isSubmittingStay }) => {
  const [openCalendar, setOpenCalendar] = useState(null);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  
  const startRef = useRef(null);
  const endRef = useRef(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openCalendar === 'start' && startRef.current && !startRef.current.contains(e.target)) setOpenCalendar(null);
      if (openCalendar === 'end' && endRef.current && !endRef.current.contains(e.target)) setOpenCalendar(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCalendar]);

  if (!showStayModal) return null;

  const handlePrevMonth = (e) => { 
    e.stopPropagation(); 
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)); 
  };
  const handleNextMonth = (e) => { 
    e.stopPropagation(); 
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)); 
  };

  const selectDate = (day, type) => {
    const year = calendarViewDate.getFullYear();
    const month = String(calendarViewDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${formattedDay}`;

    if (type === 'start') setStayRequest({ ...stayRequest, startDate: dateStr });
    else if (type === 'end') setStayRequest({ ...stayRequest, endDate: dateStr });

    setOpenCalendar(null);
  };

  const renderCalendarPopup = (currentDateValue, type) => {
    const daysInMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1).getDay();

    return (
      <div className="absolute top-[calc(100%+12px)] left-1/2 transform -translate-x-1/2 w-72 bg-white border border-gray-100 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] z-[150] p-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* ✅ المثلث (Caret) في المنتصف أعلى التقويم */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 rounded-tl-[2px]"></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
          <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors outline-none border-none bg-transparent cursor-pointer">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-sm font-bold text-[#1e3a8a]">
            {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
          </h3>
          <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors outline-none border-none bg-transparent cursor-pointer">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 mb-2 relative z-10">
          {daysOfWeek.map(day => <div key={day} className="text-center text-xs font-bold text-gray-400">{day}</div>)}
        </div>
        
        <div className="grid grid-cols-7 gap-1 relative z-10">
          {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = `${calendarViewDate.getFullYear()}-${String(calendarViewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = currentDateValue === dateStr;
            const isToday = dateStr === todayStr;
            
            let btnClass = "h-8 w-8 mx-auto rounded-full text-sm font-bold flex items-center justify-center transition-all outline-none cursor-pointer ";
            
            if (isSelected) {
              btnClass += "bg-[#1e3a8a] text-white shadow-md scale-110 border-none";
            } else if (isToday) {
              btnClass += "bg-blue-50 text-blue-700 border border-blue-300 shadow-sm";
            } else {
              btnClass += "text-gray-700 bg-transparent hover:bg-gray-100 border-none";
            }

            return (
              <button key={day} type="button" onClick={() => selectDate(day, type)} className={btnClass}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* ✅ جعلنا الـ overflow مرن لكي لا يتم قص التقويم */}
      <div className={`bg-white rounded-3xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 shadow-2xl relative max-h-[90vh] flex flex-col ${openCalendar ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
         <div className="text-center mb-6 shrink-0"><h2 className="text-xl font-bold text-gray-800">طلب مكوث الأبناء</h2></div>
         <form onSubmit={handleStaySubmit} className="flex flex-col gap-4">
            
            {/* ✅ حقول التاريخ أصبحت تاخد العرض كامل في الموبايل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* حقل تاريخ البداية */}
                <div className={`flex flex-col gap-2 relative ${openCalendar === 'start' ? 'z-50' : 'z-10'}`} ref={startRef}>
                  <label className="text-sm text-gray-700 font-bold">تاريخ البداية</label>
                  <div className="relative flex items-center">
                    <input 
                      type="date" 
                      value={stayRequest.startDate} 
                      onChange={e => setStayRequest({...stayRequest, startDate: e.target.value})} 
                      onKeyDown={(e) => { if (e.key === ' ' || e.code === 'Space') e.preventDefault(); }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-12 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-bold [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-clear]:hidden" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        if (openCalendar === 'start') setOpenCalendar(null); 
                        else { 
                          setOpenCalendar('start'); 
                          setCalendarViewDate(stayRequest.startDate ? new Date(stayRequest.startDate) : new Date()); 
                        } 
                      }} 
                      className="absolute right-3 text-gray-400 hover:text-purple-600 transition-colors outline-none border-none bg-transparent cursor-pointer"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    {openCalendar === 'start' && renderCalendarPopup(stayRequest.startDate, 'start')}
                  </div>
                </div>

                {/* حقل تاريخ النهاية */}
                <div className={`flex flex-col gap-2 relative ${openCalendar === 'end' ? 'z-50' : 'z-10'}`} ref={endRef}>
                  <label className="text-sm text-gray-700 font-bold">تاريخ النهاية</label>
                  <div className="relative flex items-center">
                    <input 
                      type="date" 
                      value={stayRequest.endDate} 
                      onChange={e => setStayRequest({...stayRequest, endDate: e.target.value})} 
                      onKeyDown={(e) => { if (e.key === ' ' || e.code === 'Space') e.preventDefault(); }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-12 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-bold [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-clear]:hidden" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        if (openCalendar === 'end') setOpenCalendar(null); 
                        else { 
                          setOpenCalendar('end'); 
                          setCalendarViewDate(stayRequest.endDate ? new Date(stayRequest.endDate) : new Date()); 
                        } 
                      }} 
                      className="absolute right-3 text-gray-400 hover:text-purple-600 transition-colors outline-none border-none bg-transparent cursor-pointer"
                    >
                      <Calendar className="w-5 h-5" />
                    </button>
                    {openCalendar === 'end' && renderCalendarPopup(stayRequest.endDate, 'end')}
                  </div>
                </div>

            </div>

            <div className="flex flex-col gap-2 relative z-0">
              <label className="text-sm text-gray-700 font-bold">سبب الطلب</label>
              <textarea value={stayRequest.reason} onChange={e => setStayRequest({...stayRequest, reason: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm font-bold" placeholder="اذكر سبب طلب المكوث (مثال: قضاء الإجازة الصيفية)" required />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-xs font-bold leading-relaxed mt-2 text-center relative z-0">ملاحظة: سيتم مراجعة طلبك من قبل المحكمة وقد يستغرق الأمر من 3-5 أيام عمل.</div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 relative z-0 shrink-0">
              <button type="button" onClick={() => setShowStayModal(false)} className="bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm outline-none border-none cursor-pointer">إلغاء</button>
              <button type="submit" disabled={isSubmittingStay} className="bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all text-sm flex justify-center items-center gap-2 shadow-sm disabled:opacity-70 outline-none border-none cursor-pointer">{isSubmittingStay ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> تقديم الطلب</>}</button>
            </div>

         </form>
      </div>
    </div>
  );
};

export const RejectModal = ({ showRejectModal, setShowRejectModal, rejectReason, setRejectReason, handleProcessRequest, selectedRequestId, isProcessing }) => {
  if (!showRejectModal) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="bg-red-600 text-white p-4 flex justify-between items-center"><h2 className="font-bold flex items-center gap-2"><X className="w-5 h-5" /> رفض الطلب</h2><button onClick={() => setShowRejectModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none"><X className="w-5 h-5" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); handleProcessRequest(selectedRequestId, false, rejectReason); }} className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-xs mb-6 font-bold leading-relaxed">تنبيه: رفض طلب الزيارة يتطلب ذكر سبب واضح، سيتم إبلاغ الطرف الآخر بقرارك والسبب من خلال النظام.</div>
          <label className="text-sm text-gray-700 font-bold block mb-2">سبب رفض الطلب <span className="text-red-500">*</span></label>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 resize-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-sm mb-2 font-bold" placeholder="يرجى كتابة سبب الرفض بالتفصيل..." required />
          <div className="pt-4 mt-2 flex gap-3">
            <button type="button" onClick={() => setShowRejectModal(false)} className="flex-1 border border-gray-300 bg-white text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors shadow-sm outline-none border-none">رجوع</button>
            <button type="submit" disabled={isProcessing} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors shadow-sm disabled:opacity-70 outline-none border-none">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> تأكيد الرفض</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CompanionModal = ({ showCompanionModal, setShowCompanionModal, companionNationalId, setCompanionNationalId, companionError, setCompanionError, handleSetCompanion, isSubmittingCompanion }) => {
  if (!showCompanionModal) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center"><h2 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5" /> إضافة مرافق للزيارة القادمة</h2><button onClick={() => { setShowCompanionModal(false); setCompanionError(''); }} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSetCompanion} className="p-6">
          <p className="text-gray-600 text-sm font-bold mb-5 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">يمكنك تحديد شخص بديل ليرافق الأطفال في هذه الزيارة بدلاً منك. يرجى إدخال الرقم القومي الخاص به ليتم التحقق منه في مركز الرؤية.</p>
          {companionError && (<div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-4 rounded-xl mb-5 flex items-start gap-2 animate-in slide-in-from-top-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{companionError}</span></div>)}
          <label className="text-sm text-gray-700 font-bold block mb-2">الرقم القومي للمرافق (14 رقم)</label>
          <input type="text" maxLength="14" minLength="14" pattern="\d{14}" value={companionNationalId} onChange={(e) => { setCompanionNationalId(e.target.value.replace(/\D/g, '')); if (companionError) setCompanionError(''); }} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-center font-mono tracking-[0.2em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white mb-6 text-lg" placeholder="00000000000000" required />
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => { setShowCompanionModal(false); setCompanionError(''); }} className="flex-1 border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm outline-none border-none">إلغاء</button>
            <button type="submit" disabled={isSubmittingCompanion || companionNationalId.length !== 14} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center shadow-sm disabled:opacity-70 disabled:bg-gray-400 outline-none border-none">{isSubmittingCompanion ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ المرافق"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};