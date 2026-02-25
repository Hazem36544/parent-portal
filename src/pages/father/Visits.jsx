import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Home, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  Check,
  UserPlus,
  Users,
  Loader2
} from 'lucide-react';
import { courtAPI, visitationAPI, requestsAPI, complaintsAPI } from '../../services/api';
import { toast } from 'react-hot-toast'; 

export default function Visits() {
  const navigate = useNavigate();
  
  // حالات الواجهة الأساسية
  const [showStayModal, setShowStayModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // حالات البيانات
  const [visits, setVisits] = useState([]);
  const [schedule, setSchedule] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [familyData, setFamilyData] = useState(null);

  // حالات النوافذ المنبثقة
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [companionNationalId, setCompanionNationalId] = useState('');
  const [isSubmittingCompanion, setIsSubmittingCompanion] = useState(false);

  const [stayRequest, setStayRequest] = useState({ startDate: '', endDate: '', reason: '' });
  const [isSubmittingStay, setIsSubmittingStay] = useState(false);

  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  // حالة التقويم
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    const fetchVisitsData = async () => {
      try {
        setIsLoading(true);
        const familyRes = await courtAPI.getMyFamilies();
        const family = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        let fetchedVisits = [];
        let fetchedSchedule = null;

        if (family && family.familyId) {
          setFamilyData(family);
          
          try {
            const visitsRes = await visitationAPI.list({ FamilyId: family.familyId, PageSize: 50 });
            fetchedVisits = visitsRes.data?.items || (Array.isArray(visitsRes.data) ? visitsRes.data : []);
          } catch(e) { console.warn("لم يتم العثور على زيارات بالسيرفر"); }

          try {
            const casesRes = await courtAPI.listCourtCasesByFamily(family.familyId);
            if (casesRes.data?.items && casesRes.data.items.length > 0) {
                const courtCaseId = casesRes.data.items[0].id;
                const scheduleRes = await courtAPI.getVisitationScheduleByCourtCase(courtCaseId);
                fetchedSchedule = scheduleRes.data;
            }
          } catch (e) { console.warn("لم يتم العثور على جدول رؤية بالسيرفر"); }
        }

        // =========================================================
        // نظام الطوارئ: توليد بيانات تجريبية لو السيرفر فارغ تماماً
        // =========================================================
        if (fetchedVisits.length === 0 && !fetchedSchedule) {
          const today = new Date();
          const thisMonth = today.getMonth();
          const thisYear = today.getFullYear();
          
          // إنشاء جدول وهمي يبدأ من اليوم ويتكرر أسبوعياً
          fetchedSchedule = { 
            frequency: 'Weekly', 
            startTime: '21:00:00', 
            endTime: '23:00:00',
            startDate: new Date(thisYear, thisMonth, today.getDate() - 7).toISOString() 
          };

          // زيارات وهمية
          fetchedVisits = [
            { 
              id: "mock-1", 
              startAt: new Date(thisYear, thisMonth, today.getDate() - 7, 21, 0).toISOString(), 
              endAt: new Date(thisYear, thisMonth, today.getDate() - 7, 23, 0).toISOString(), 
              status: 'Completed',
              nonCustodialCheckedInAt: new Date(thisYear, thisMonth, today.getDate() - 7, 20, 50).toISOString(),
              completedAt: new Date(thisYear, thisMonth, today.getDate() - 7, 23, 5).toISOString()
            },
            { id: "mock-2", startAt: new Date(thisYear, thisMonth, today.getDate(), 21, 0).toISOString(), endAt: new Date(thisYear, thisMonth, today.getDate(), 23, 0).toISOString(), status: 'Scheduled' },
            { id: "mock-3", startAt: new Date(thisYear, thisMonth, today.getDate() + 7, 21, 0).toISOString(), endAt: new Date(thisYear, thisMonth, today.getDate() + 7, 23, 0).toISOString(), status: 'Scheduled' }
          ];
        }

        setVisits(fetchedVisits);
        setSchedule(fetchedSchedule);

      } catch (error) {
        toast.error("حدث خطأ في تحميل جدول الزيارات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitsData();
  }, []);

  const handleSetCompanion = async (e) => {
    e.preventDefault();
    if (!companionNationalId || companionNationalId.length !== 14) {
      toast.error("يرجى إدخال رقم قومي صحيح مكون من 14 رقم");
      return;
    }
    if(selectedVisitId?.toString().startsWith('mock')) {
      setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, companionNationalId } : v));
      setShowCompanionModal(false); setCompanionNationalId(''); toast.success("تم تسجيل المرافق (تجريبي)");
      return;
    }
    try {
      setIsSubmittingCompanion(true);
      await visitationAPI.setCompanion(selectedVisitId, { companionNationalId });
      setVisits(visits.map(v => v.id === selectedVisitId ? { ...v, companionNationalId } : v));
      setShowCompanionModal(false); setCompanionNationalId(''); toast.success("تم تسجيل المرافق بنجاح");
    } catch (error) { toast.error("فشل تسجيل المرافق."); } finally { setIsSubmittingCompanion(false); }
  };

  const handleStaySubmit = async (e) => {
      e.preventDefault();
      if(!stayRequest.startDate || !stayRequest.endDate || !stayRequest.reason) { toast.error("أكمل البيانات"); return; }
      try {
          setIsSubmittingStay(true);
          if(requestsAPI.create) await requestsAPI.create({ startDate: stayRequest.startDate, endDate: stayRequest.endDate, reason: stayRequest.reason });
          toast.success("تم رفع الطلب"); setShowStayModal(false); setStayRequest({ startDate: '', endDate: '', reason: '' });
      } catch (error) { toast.error("حدث خطأ"); } finally { setIsSubmittingStay(false); }
  };

  const handleCancelVisit = async (e) => {
      e.preventDefault();
      if(!cancelReason) { toast.error("أدخل السبب"); return; }
      if(selectedVisitId?.toString().startsWith('mock')) { toast.success("تم الرفع (تجريبي)"); setShowCancelModal(false); setCancelReason(''); return; }
      try {
          setIsCanceling(true);
          await complaintsAPI.create({ familyId: familyData.familyId, type: "CancelVisit", description: cancelReason });
          toast.success("تم رفع الطلب"); setShowCancelModal(false); setCancelReason('');
      } catch(error) { toast.error("فشل"); } finally { setIsCanceling(false); }
  };

  const now = new Date();
  const pastVisits = visits.filter(v => new Date(v.startAt) <= now || v.status === 'Cancelled').sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const translateFrequency = (freq) => {
      switch(freq) { case 'Weekly': return 'أسبوعياً'; case 'BiWeekly': return 'كل أسبوعين'; case 'Monthly': return 'شهرياً'; default: return freq || 'محددة'; }
  };

  // 🚀 --- دوال التقويم السحرية (Recurrence Engine) ---
  const daysInMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay();
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const daysOfWeek = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const explicitVisitDates = visits.filter(v => v.status !== 'Cancelled').map(v => {
      const d = new Date(v.startAt);
      d.setHours(0, 0, 0, 0); 
      return d.getTime();
  });

  const handlePrevMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allCells = [...blanks, ...days];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scheduleStartDate = schedule?.startDate ? new Date(schedule.startDate) : null;
    if(scheduleStartDate) scheduleStartDate.setHours(0, 0, 0, 0);

    return allCells.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="p-2"></div>;

      const currentCellDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
      currentCellDate.setHours(0, 0, 0, 0);

      let isVisitDay = false;

      if (explicitVisitDates.includes(currentCellDate.getTime())) {
          isVisitDay = true;
      } 
      else if (schedule && scheduleStartDate && currentCellDate >= scheduleStartDate) {
          const diffTime = Math.abs(currentCellDate - scheduleStartDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (schedule.frequency === 'Weekly' && currentCellDate.getDay() === scheduleStartDate.getDay()) {
              isVisitDay = true;
          } else if (schedule.frequency === 'BiWeekly' && currentCellDate.getDay() === scheduleStartDate.getDay() && diffDays % 14 === 0) {
              isVisitDay = true;
          } else if (schedule.frequency === 'Monthly' && currentCellDate.getDate() === scheduleStartDate.getDate()) {
              isVisitDay = true;
          }
      }

      const isToday = currentCellDate.getTime() === today.getTime();

      return (
        <div key={day} className="flex flex-col items-center justify-center h-12">
          <div 
            className={`flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm transition-all relative
              ${isVisitDay ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-gray-700'}
              ${isToday && !isVisitDay ? 'border border-[#1e3a8a] text-[#1e3a8a] font-bold' : ''}
              ${!isVisitDay && !isToday ? 'hover:bg-gray-100 cursor-pointer' : ''}
            `}
          >
            {day}
            {isVisitDay && <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-[#1e3a8a] rounded-full"></div>}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      {/* Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={() => navigate(-1)} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group">
            <ChevronRight className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1"><h1 className="text-2xl font-bold">إدارة الزيارات</h1></div>
            <p className="text-blue-200 text-sm opacity-90">إدارة مواعيد الرؤية الخاصة بك</p>
          </div>
        </div>
        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
           <CalendarIcon className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* Section 1: طلب المكوث (Full Width) */}
      <div className="flex flex-col gap-4">
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
             <div className="bg-purple-100 p-4 rounded-2xl shrink-0">
               <Home className="w-8 h-8 text-purple-600" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">طلب مكوث الأبناء</h3>
                <p className="text-gray-500 text-sm">اطلب مكوث الأطفال لفترة محددة (إجازات رسمية أو أعياد)</p>
             </div>
          </div>

          <button onClick={() => setShowStayModal(true)} className="w-full md:w-auto bg-purple-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-purple-700 transition-colors flex justify-center items-center gap-2 relative z-10 shadow-sm shrink-0">
            <Home className="w-5 h-5" /> رفع طلب للمحكمة
          </button>
        </div>
      </div>

      {/* 🚀 Section 2: التقويم وجدول الرؤية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* التقويم التفاعلي (Interactive Calendar) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">مواعيد الزيارات في التقويم</h2>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm h-full flex flex-col justify-between">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6 px-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-lg font-bold text-[#1e3a8a]">
                {monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-bold text-gray-400">{day}</div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {renderCalendarDays()}
            </div>

            {/* Calendar Legend */}
            <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-[#1e3a8a]"></div>
                <span>يوم زيارة</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 rounded-full border border-[#1e3a8a]"></div>
                <span>اليوم</span>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الجدول المعتمد */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">جدول الرؤية المعتمد</h2>
          {isLoading ? (
              <div className="flex justify-center py-6 bg-white rounded-3xl h-full items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-800" /></div>
          ) : schedule ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 flex flex-col h-full shadow-sm relative overflow-hidden text-center items-center justify-center">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200/50 rounded-full blur-xl pointer-events-none"></div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 shrink-0 w-max mb-4 relative z-10">
                      <CalendarIcon className="w-7 h-7" />
                  </div>
                  <div className="relative z-10 flex-col flex items-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">زيارة دورية {translateFrequency(schedule.frequency)}</h3>
                      
                      <div className="flex items-center gap-3 text-gray-600 bg-white px-4 py-2.5 rounded-xl mb-4 border border-blue-50 w-full justify-center">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="font-mono text-sm font-bold" dir="ltr">{schedule.startTime?.substring(0, 5) || '21:00'} - {schedule.endTime?.substring(0, 5) || '23:00'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 px-5 py-2 rounded-full font-bold text-sm border border-green-100">
                          <CheckCircle className="w-4 h-4 text-green-600" /> ساري المفعول
                      </div>
                  </div>
              </div>
          ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center h-full text-gray-400 gap-3">
                  <CalendarIcon className="w-10 h-10 opacity-50 mb-1 text-gray-300" />
                  <p className="font-bold text-gray-500">لا يوجد جدول رؤية معتمد</p>
              </div>
          )}
        </div>
      </div>

      {/* Section 3: سجل الزيارات السابقة (Full Width Horizontal Cards) */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">سجل الزيارات السابقة</h2>
        {!isLoading && pastVisits.length > 0 ? (
          <div className="flex flex-col gap-4">
            {pastVisits.map((visit) => (
              <div key={visit.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* الجزء الأيمن: التاريخ والحالة */}
                <div className="flex flex-col gap-3 lg:w-1/3">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl shrink-0 ${visit.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      <CalendarIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1.5">{formatDate(visit.startAt)}</h3>
                      <span className={`text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm ${visit.status === 'Cancelled' ? 'bg-red-500' : 'bg-[#16a34a]'}`}>
                        {visit.status === 'Cancelled' ? 'تم إلغاء الزيارة' : 'تمت بنجاح'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* الجزء الأيسر: الأوقات والمواعيد */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:justify-end">
                   
                   <div className="flex flex-col gap-1.5 bg-gray-50 p-4 rounded-2xl flex-1 max-w-[220px]">
                      <span className="text-gray-500 text-xs font-bold">الموعد المحدد</span>
                      <span className="text-gray-800 font-mono font-bold text-base" dir="ltr">{formatTime(visit.startAt)} - {formatTime(visit.endAt)}</span>
                   </div>
                   
                   {visit.status !== 'Cancelled' && (
                     <>
                       <div className="flex flex-col gap-1.5 bg-green-50/50 p-4 rounded-2xl border border-green-100/50 flex-1 max-w-[220px]">
                          <span className="text-gray-500 text-xs font-bold">وقت الحضور</span>
                          <span className={`font-mono font-bold text-base ${visit.nonCustodialCheckedInAt ? 'text-green-700' : 'text-gray-400'}`} dir="ltr">
                            {visit.nonCustodialCheckedInAt ? formatTime(visit.nonCustodialCheckedInAt) : 'لم يسجل'}
                          </span>
                       </div>
                       
                       <div className="flex flex-col gap-1.5 bg-green-50/50 p-4 rounded-2xl border border-green-100/50 flex-1 max-w-[220px]">
                          <span className="text-gray-500 text-xs font-bold">وقت الانصراف</span>
                          <span className={`font-mono font-bold text-base ${visit.completedAt ? 'text-green-700' : 'text-gray-400'}`} dir="ltr">
                            {visit.completedAt ? formatTime(visit.completedAt) : 'لم يسجل'}
                          </span>
                       </div>
                     </>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
               <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
               <p className="text-gray-500 font-medium">لا توجد سجلات لزيارات سابقة حتى الآن</p>
            </div>
          )
        )}
      </div>

      {/* Modal: إضافة مرافق */}
      {showCompanionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5" /> إضافة مرافق للزيارة</h2>
              <button onClick={() => setShowCompanionModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSetCompanion} className="p-6">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">يمكنك تحديد شخص واحد ليرافقك في هذه الزيارة. يرجى إدخال الرقم القومي الخاص به ليتم التحقق منه في مركز الرؤية.</p>
              <label className="text-sm text-gray-700 font-bold block mb-2">الرقم القومي للمرافق</label>
              <input type="text" maxLength="14" value={companionNationalId} onChange={(e) => setCompanionNationalId(e.target.value.replace(/\D/g, ''))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-6" placeholder="14 رقم" required />
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmittingCompanion} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center shadow-sm">
                  {isSubmittingCompanion ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ المرافق"}
                </button>
                <button type="button" onClick={() => setShowCompanionModal(false)} className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stay/Mokouth */}
      {showStayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl relative h-[90vh] md:h-auto overflow-y-auto">
             <div className="text-center mb-6"><h2 className="text-xl font-bold text-gray-800">طلب مكوث الأبناء</h2></div>
             <form onSubmit={handleStaySubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-700 font-bold">اختر الأبناء</label>
                  <div className="flex flex-col gap-2">
                    {familyData?.children?.length > 0 ? familyData.children.map(child => (
                        <label key={child.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm">{child.fullName}</span>
                            <span className="text-xs text-gray-400">{child.age} سنوات</span>
                          </div>
                          <div className="w-5 h-5 rounded border border-gray-300 bg-[#166534] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                        </label>
                    )) : (
                       <span className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">لا توجد بيانات أبناء مسجلة حالياً</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-gray-700 font-bold">تاريخ البداية</label>
                      <input type="date" value={stayRequest.startDate} onChange={e => setStayRequest({...stayRequest, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-gray-700 font-bold">تاريخ النهاية</label>
                      <input type="date" value={stayRequest.endDate} onChange={e => setStayRequest({...stayRequest, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" required />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-700 font-bold">سبب الطلب</label>
                  <textarea value={stayRequest.reason} onChange={e => setStayRequest({...stayRequest, reason: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-24 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm" placeholder="اذكر سبب طلب المكوث (مثال: قضاء الإجازة الصيفية)" required />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-xs font-medium leading-relaxed mt-2 text-center">
                  ملاحظة: سيتم مراجعة طلبك من قبل المحكمة وقد يستغرق الأمر من 3-5 أيام عمل.
                </div>
               <div className="grid grid-cols-2 gap-3 mt-4">
                  <button type="button" onClick={() => setShowStayModal(false)} className="bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm shadow-sm">إلغاء</button>
                  <button type="submit" disabled={isSubmittingStay} className="bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-all text-sm flex justify-center items-center gap-2 shadow-sm disabled:opacity-70">
                    {isSubmittingStay ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> تقديم الطلب</>}
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Modal: Cancel Visit */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> إلغاء الزيارة</h2>
              <button onClick={() => setShowCancelModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCancelVisit} className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-xs mb-6 font-medium leading-relaxed">
                تنبيه: لا يمكن إلغاء الزيارة بشكل مباشر. سيتم رفع طلبك كشكوى مستعجلة لمركز الرؤية والمحكمة لدراسة سبب غيابك.
              </div>
              <label className="text-sm text-gray-700 font-bold block mb-2">سبب إلغاء الزيارة <span className="text-red-500">*</span></label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 resize-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-sm mb-2" placeholder="يرجى كتابة العذر القهري بالتفصيل..." required />
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button type="submit" disabled={isCanceling} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors shadow-sm disabled:opacity-70">
                  {isCanceling ? <Loader2 className="w-4 h-4 animate-spin" /> : <><AlertTriangle className="w-4 h-4" /> رفع طلب الإلغاء</>}
                </button>
                <button type="button" onClick={() => setShowCancelModal(false)} className="flex-1 border border-gray-300 bg-white text-gray-700 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors shadow-sm">رجوع</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}