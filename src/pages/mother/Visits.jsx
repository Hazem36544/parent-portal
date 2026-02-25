import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Check,
  UserPlus,
  Users,
  Loader2,
  Camera,
  Info,
  AlertTriangle 
} from 'lucide-react';
import { courtAPI, visitationAPI, requestsAPI } from '../../services/api';
import { toast } from 'react-hot-toast'; 

export default function MotherVisits() {
  const navigate = useNavigate();
  
  // حالات الواجهة
  const [isLoading, setIsLoading] = useState(true);

  // حالات البيانات
  const [visits, setVisits] = useState([]);
  const [schedule, setSchedule] = useState(null); 
  const [familyData, setFamilyData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  // حالات مودال الرفض
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // حالات مودال المرافق
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [companionNationalId, setCompanionNationalId] = useState('');
  const [isSubmittingCompanion, setIsSubmittingCompanion] = useState(false);
  const [companionError, setCompanionError] = useState(''); 

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
        let fetchedPending = [];

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

          try {
            const reqRes = await requestsAPI.list({ FamilyId: family.familyId, Status: 'Pending', PageSize: 10 });
            fetchedPending = reqRes.data?.items || (Array.isArray(reqRes.data) ? reqRes.data : []);
          } catch (e) { console.warn("لم يتم العثور على طلبات معلقة بالسيرفر"); }
        }

        setVisits(fetchedVisits);
        setSchedule(fetchedSchedule);
        setPendingRequests(fetchedPending);

      } catch (error) {
        toast.error("حدث خطأ في تحميل البيانات من الخادم");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitsData();
  }, []);

  const now = new Date();
  
  // ✅ التعديل هنا: الاعتماد على `endAt` للتحقق من الزيارات القادمة أو الحالية
  const upcomingVisits = visits
    .filter(v => new Date(v.endAt) > now && v.status !== 'Completed')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  const pastVisits = visits
    .filter(v => new Date(v.endAt) <= now || v.status === 'Completed')
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));


  const handleProcessRequest = async (requestId, isApproved, decisionNote = "") => {
    try {
      setIsProcessing(true);
      await requestsAPI.process(requestId, { isApproved, decisionNote });
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setShowRejectModal(false);
      setRejectReason("");
      toast.success(isApproved ? "تمت الموافقة على الطلب بنجاح" : "تم رفض الطلب");
    } catch (error) {
      toast.error("حدث خطأ أثناء معالجة الطلب.");
      console.error("Error processing request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetCompanion = async (e) => {
    e.preventDefault();
    setCompanionError(''); 
    
    if (!companionNationalId || companionNationalId.length !== 14) {
      setCompanionError("يرجى إدخال رقم قومي صحيح مكون من 14 رقم");
      return;
    }

    if (!upcomingVisits || upcomingVisits.length === 0) {
      setCompanionError("لا توجد زيارات قادمة مجدولة لربط المرافق بها.");
      return;
    }
    
    const nextVisitId = upcomingVisits[0].id;

    try {
      setIsSubmittingCompanion(true);
      await visitationAPI.setCompanion(nextVisitId, { companionNationalId });
      
      setVisits(visits.map(v => v.id === nextVisitId ? { ...v, companionNationalId } : v));
      setShowCompanionModal(false); 
      setCompanionNationalId(''); 
      toast.success("تم تسجيل المرافق للزيارة القادمة بنجاح ✅"); 
      
    } catch (error) { 
      setCompanionError("فشل تسجيل المرافق، تأكد من الاتصال بالسيرفر."); 
      console.error("Error setting companion:", error);
    } finally { 
      setIsSubmittingCompanion(false); 
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const calculateDays = (start, end) => Math.ceil(Math.abs(new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  
  const daysInMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay();
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const daysOfWeek = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const explicitVisitDates = visits.filter(v => v.status !== 'Cancelled').map(v => {
      const d = new Date(v.startAt); d.setHours(0, 0, 0, 0); return d.getTime();
  });

  const handlePrevMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const allCells = [...blanks, ...days];
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const scheduleStartDate = schedule?.startDate ? new Date(schedule.startDate) : null;
    if(scheduleStartDate) scheduleStartDate.setHours(0, 0, 0, 0);

    return allCells.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="p-2"></div>;
      const currentCellDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
      currentCellDate.setHours(0, 0, 0, 0);
      let isVisitDay = false;

      if (explicitVisitDates.includes(currentCellDate.getTime())) { isVisitDay = true; } 
      else if (schedule && scheduleStartDate && currentCellDate >= scheduleStartDate) {
          const diffDays = Math.ceil(Math.abs(currentCellDate - scheduleStartDate) / (1000 * 60 * 60 * 24));
          if (schedule.frequency === 'Weekly' && currentCellDate.getDay() === scheduleStartDate.getDay()) { isVisitDay = true; } 
          else if (schedule.frequency === 'BiWeekly' && currentCellDate.getDay() === scheduleStartDate.getDay() && diffDays % 14 === 0) { isVisitDay = true; } 
          else if (schedule.frequency === 'Monthly' && currentCellDate.getDate() === scheduleStartDate.getDate()) { isVisitDay = true; }
      }

      const isToday = currentCellDate.getTime() === today.getTime();

      return (
        <div key={day} className="flex flex-col items-center justify-center h-12">
          <div className={`flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm transition-all relative ${isVisitDay ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-gray-700'} ${isToday && !isVisitDay ? 'border border-[#1e3a8a] text-[#1e3a8a] font-bold' : ''} ${!isVisitDay && !isToday ? 'hover:bg-gray-100 cursor-pointer' : ''}`}>
            {day}
            {isVisitDay && <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-[#1e3a8a] rounded-full"></div>}
          </div>
        </div>
      );
    });
  };

  const openCompanionModal = () => {
    setCompanionError('');
    setShowCompanionModal(true);
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
            <div className="flex items-center gap-3 mb-1"><h1 className="text-2xl font-bold">جدول الزيارات</h1></div>
          </div>
        </div>
        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
           <CalendarIcon className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* Section 1: طلبات الأب المعلقة */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          طلبات الأب المعلقة
          {pendingRequests.length > 0 && (
             <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
               {pendingRequests.length}
             </span>
          )}
        </h2>
        
        {isLoading ? (
           <div className="flex justify-center py-6 bg-white rounded-3xl h-32 items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-800" /></div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-gray-500 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">لا توجد طلبات معلقة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const daysCount = calculateDays(req.startDate, req.endDate);
              const isStay = daysCount > 0 && req.startDate !== req.endDate; 
              
              return (
                <div key={req.id} className="bg-white border-2 border-orange-200 rounded-2xl p-5 relative shadow-sm hover:shadow-md transition-shadow">
                  <span className="absolute top-4 left-4 bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full">معلق</span>
                  
                  <div className="flex items-start gap-3 mb-4">
                     <div className="bg-orange-50 p-2.5 rounded-xl shrink-0">
                       {isStay ? <Users className="w-5 h-5 text-orange-500" /> : <CalendarIcon className="w-5 h-5 text-orange-500" />}
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-800">{isStay ? "طلب مكوث" : "طلب زيارة جديدة"}</h3>
                       <p className="text-xs text-gray-400">تاريخ الطلب: {formatDate(req.requestedAt || new Date().toISOString())}</p>
                     </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 mb-5 border border-gray-100 text-sm">
                     {isStay ? (
                       <>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60 pb-2">
                          <span className="text-gray-500">من</span><span className="text-gray-800 font-medium">{formatDate(req.startDate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60 pb-2">
                          <span className="text-gray-500">إلى</span><span className="text-gray-800 font-medium">{formatDate(req.endDate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200/60 pb-2">
                          <span className="text-gray-500">المدة</span><span className="text-gray-800 font-medium font-mono">{daysCount} أيام</span>
                        </div>
                       </>
                     ) : (
                       <div className="flex items-center gap-2 text-sm mb-2">
                         <CalendarIcon className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{formatDate(req.startDate)}</span>
                       </div>
                     )}
                     {req.reason && (
                      <div className="pt-2 border-t border-gray-200/60 mt-1">
                        <p className="text-xs text-gray-600 leading-relaxed"><span className="font-bold text-gray-800">السبب/الملاحظة:</span> {req.reason}</p>
                      </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setSelectedRequestId(req.id); setShowRejectModal(true); }} className="border border-red-200 text-red-500 font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 hover:bg-red-50 transition-colors text-sm">
                      <X className="w-4 h-4" /> رفض
                    </button>
                    <button onClick={() => handleProcessRequest(req.id, true)} disabled={isProcessing} className="bg-[#16a34a] hover:bg-green-700 text-white font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 transition-colors text-sm shadow-sm">
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> موافقة</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: التقويم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">التقويم وجدول الزيارات</h2>
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6 px-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
              <h3 className="text-lg font-bold text-[#1e3a8a]">{monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}</h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="grid grid-cols-7 mb-4">
              {daysOfWeek.map(day => <div key={day} className="text-center text-sm font-bold text-gray-400">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-4 gap-x-2">{renderCalendarDays()}</div>
            <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-2 h-2 rounded-full bg-[#1e3a8a]"></div><span>يوم زيارة</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 rounded-full border border-[#1e3a8a]"></div><span>اليوم</span></div>
            </div>
          </div>
        </div>

        {/* معلومات الجدول + زر إضافة مرافق */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-4 relative overflow-hidden h-full justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="bg-blue-100 p-3 rounded-full relative z-10"><Users className="w-6 h-6 text-[#1e3a8a]" /></div>
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-gray-800 mb-1">إضافة مرافق للزيارة</h2>
              <p className="text-gray-500 text-sm">أضف مرافق معتمد للحضور مع الأطفال أثناء الزيارة القادمة</p>
            </div>
            <button onClick={openCompanionModal} className="w-full mt-2 bg-[#1e3a8a] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm relative z-10">
              <Camera className="w-4 h-4" /> إضافة مرافق
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: الزيارات القادمة والسابقة */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">قائمة الزيارات</h2>
        
        {/* الزيارات القادمة */}
        {upcomingVisits.map((visit) => (
          <div key={visit.id} className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 bg-blue-500 h-full"></div>
            <div className="flex flex-col gap-3 lg:w-1/3">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl shrink-0 bg-blue-50 text-blue-600"><CalendarIcon className="w-7 h-7" /></div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1.5">{formatDate(visit.startAt)}</h3>
                  <span className="text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm bg-blue-500">قادمة (مجدولة)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:justify-end">
               <div className="flex flex-col gap-1.5 bg-gray-50 p-4 rounded-2xl flex-1 max-w-[220px]">
                  <span className="text-gray-500 text-xs font-bold">الموعد المحدد</span>
                  <span className="text-gray-800 font-mono font-bold text-base" dir="ltr">{formatTime(visit.startAt)} - {formatTime(visit.endAt)}</span>
               </div>
               {visit.companionNationalId && (
                 <div className="flex flex-col gap-1.5 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex-1 max-w-[220px]">
                    <span className="text-blue-500 text-xs font-bold">المرافق المسجل</span>
                    <span className="text-blue-800 font-mono font-bold text-sm" dir="ltr">{visit.companionNationalId}</span>
                 </div>
               )}
            </div>
          </div>
        ))}

        {/* الزيارات السابقة */}
        {pastVisits.map((visit) => (
          <div key={visit.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

        {!isLoading && upcomingVisits.length === 0 && pastVisits.length === 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
             <CalendarIcon className="w-12 h-12 text-gray-300 mb-3" />
             <p className="text-gray-500 font-medium">لا توجد زيارات مسجلة حتى الآن</p>
          </div>
        )}
      </div>

      {/* Modal: رفض الطلب */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-red-600 text-white p-4 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><X className="w-5 h-5" /> رفض الطلب</h2>
              <button onClick={() => setShowRejectModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl text-xs mb-6 font-medium leading-relaxed">
                تنبيه: رفض طلب الزيارة يتطلب ذكر سبب واضح، سيتم إبلاغ الأب بقرارك والسبب.
              </div>
              <label className="text-sm text-gray-700 font-bold block mb-2">سبب رفض الطلب <span className="text-red-500">*</span></label>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 resize-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-sm mb-2"
                placeholder="يرجى كتابة سبب الرفض بالتفصيل..."
                required
              />
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if(rejectReason.trim() === '') { toast.error('يرجى كتابة سبب الرفض'); return; }
                    handleProcessRequest(selectedRequestId, false, rejectReason); 
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors shadow-sm disabled:opacity-70"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> تأكيد الرفض</>}
                </button>
                <button onClick={() => setShowRejectModal(false)} className="flex-1 border border-gray-300 bg-white text-gray-700 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors shadow-sm">رجوع</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: إضافة مرافق */}
      {showCompanionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5" /> إضافة مرافق للزيارة القادمة</h2>
              <button onClick={() => { setShowCompanionModal(false); setCompanionError(''); }} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSetCompanion} className="p-6">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                يمكنك تحديد شخص واحد ليرافق الأطفال في هذه الزيارة. يرجى إدخال الرقم القومي الخاص به ليتم التحقق منه في مركز الرؤية.
              </p>
              
              {/* رسالة الخطأ تظهر هنا داخل المودال */}
              {companionError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl mb-4 flex items-start gap-2 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{companionError}</span>
                </div>
              )}
              
              <label className="text-sm text-gray-700 font-bold block mb-2">الرقم القومي للمرافق</label>
              <input 
                type="text" 
                maxLength="14" 
                value={companionNationalId} 
                onChange={(e) => {
                  setCompanionNationalId(e.target.value.replace(/\D/g, ''));
                  if (companionError) setCompanionError(''); 
                }} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-6" 
                placeholder="14 رقم" 
                required 
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowCompanionModal(false); setCompanionError(''); }} className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                  إلغاء
                </button>
                <button type="submit" disabled={isSubmittingCompanion} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center shadow-sm disabled:opacity-70">
                  {isSubmittingCompanion ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ المرافق"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}