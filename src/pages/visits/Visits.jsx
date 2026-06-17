import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import api, { courtAPI, visitationAPI, requestsAPI } from '../../services/api';
import { toast } from 'react-hot-toast'; 
import { getErrorMessage } from '../../utils/errorHandler';
import { pdf } from '@react-pdf/renderer';

// استيراد المكونات الفرعية والمساعدات
import { getSmartVisitStatus } from './components/VisitsHelpers';
import VisitReportPDF from './components/VisitReportPDF';
import VisitsHeader from './components/VisitsHeader';
import DynamicCards from './components/DynamicCards';
import ScheduleCard from './components/ScheduleCard';
import VisitsHistory from './components/VisitsHistory';
import { VisitDetailsModal, HistoryDetailsModal } from './components/VisitsModals';
import { StayModal, RejectModal, CompanionModal } from './components/ActionModals';

export default function Visits() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCustodial, setIsCustodial] = useState(false); 

  const [visits, setVisits] = useState([]);
  const [schedule, setSchedule] = useState(null); 
  const [familyData, setFamilyData] = useState(null);
  
  const [locationName, setLocationName] = useState('');
  const [parentNames, setParentNames] = useState({ custodial: '', nonCustodial: '', custodialNId: '', nonCustodialNId: '' });

  const [showVisitDetailsModal, setShowVisitDetailsModal] = useState(false);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState(null);

  const [showHistoryDetailsModal, setShowHistoryDetailsModal] = useState(false);
  const [selectedHistoryVisit, setSelectedHistoryVisit] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  const [showStayModal, setShowStayModal] = useState(false);
  const [stayRequest, setStayRequest] = useState({ startDate: '', endDate: '', reason: '' });
  const [isSubmittingStay, setIsSubmittingStay] = useState(false);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [companionNationalId, setCompanionNationalId] = useState('');
  const [isSubmittingCompanion, setIsSubmittingCompanion] = useState(false);
  const [companionError, setCompanionError] = useState(''); 

  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < 4 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < 5) {
        const options = ['all', 'completed', 'ongoing', 'missed', 'cancelled'];
        setStatusFilter(options[highlightedIndex]);
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const sessionUser = JSON.parse(sessionStorage.getItem('wesal_parent_user')) || JSON.parse(sessionStorage.getItem('wesal_user_data')) || {};
        const loggedInNationalId = String(sessionUser.nationalId || "").trim();

        const familyRes = await courtAPI.getMyFamilies();
        const currentFamily = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (!currentFamily || !currentFamily.familyId) {
          setIsLoading(false);
          return;
        }
        
        setFamilyData(currentFamily);
        const fId = currentFamily.familyId;

        let myParentId = null;
        let myRole = 'father';

        if (loggedInNationalId && String(currentFamily.mother?.nationalId).trim() === loggedInNationalId) {
            myParentId = currentFamily.mother?.id;
            myRole = 'mother';
        } else if (loggedInNationalId && String(currentFamily.father?.nationalId).trim() === loggedInNationalId) {
            myParentId = currentFamily.father?.id;
            myRole = 'father';
        } else {
            myRole = sessionUser.role === 'mother' ? 'mother' : 'father';
            myParentId = myRole === 'mother' ? currentFamily.mother?.id : currentFamily.father?.id;
        }

        setCurrentUser({ ...sessionUser, actualParentId: myParentId, actualNationalId: loggedInNationalId, role: myRole });

        let currentCase = null;
        let caseId = null;
        try {
          const caseRes = await courtAPI.listCourtCasesByFamily(fId);
          currentCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
          if (currentCase) caseId = currentCase.id;
        } catch (err) { console.warn("لم يتم العثور على قضية"); }

        let userIsCustodial = false;
        let fetchedSchedule = null;

        if (caseId) {
          const [cusRes, schRes] = await Promise.allSettled([
            courtAPI.getCustodyByCourtCase(caseId),
            courtAPI.getVisitationScheduleByCourtCase(caseId)
          ]);

          if (schRes.status === 'fulfilled' && schRes.value.data) {
            fetchedSchedule = schRes.value.data;
            const targetCenterId = fetchedSchedule.centerId || fetchedSchedule.visitCenterId || fetchedSchedule.locationId;
            if (targetCenterId) {
               try {
                  const locRes = await api.get(`/api/visit-centers/${targetCenterId}`, {
                      params: { locationId: targetCenterId }
                  });
                  if (locRes.data && locRes.data.name) {
                     setLocationName(locRes.data.name);
                  }
               } catch(e) { console.warn("لم يتم العثور على اسم المركز"); }
            }
          }
          
          if (cusRes.status === 'fulfilled' && cusRes.value.data) {
            const custId = cusRes.value.data.custodialParentId;
            if (String(custId).toLowerCase() === String(myParentId).toLowerCase()) {
              userIsCustodial = true;
            }

            let custName = "الطرف الحاضن";
            let nonCustName = "الطرف غير الحاضن";
            let custNId = "";
            let nonCustNId = "";
            
            if (currentFamily.father?.id === custId) {
              custName = currentFamily.father?.fullName || "الأب";
              custNId = currentFamily.father?.nationalId || "";
              nonCustName = currentFamily.mother?.fullName || "الأم";
              nonCustNId = currentFamily.mother?.nationalId || "";
            } else if (currentFamily.mother?.id === custId) {
              custName = currentFamily.mother?.fullName || "الأم";
              custNId = currentFamily.mother?.nationalId || "";
              nonCustName = currentFamily.father?.fullName || "الأب";
              nonCustNId = currentFamily.father?.nationalId || "";
            }
            setParentNames({ custodial: custName, nonCustodial: nonCustName, custodialNId: custNId, nonCustodialNId: nonCustNId });
          }
        }

        setIsCustodial(userIsCustodial);
        setSchedule(fetchedSchedule);

        let fetchedVisits = [];
        try {
          const visitsRes = await visitationAPI.list({ FamilyId: fId, PageSize: 100 }); 
          let rawVisits = visitsRes.data?.items || (Array.isArray(visitsRes.data) ? visitsRes.data : []);

          let cleanVisits = [];
          let seenVisitDates = new Set();
          rawVisits.forEach(v => {
              const dateOnly = v.startAt.split('T')[0]; 
              if (!seenVisitDates.has(dateOnly)) {
                  seenVisitDates.add(dateOnly);
                  cleanVisits.push(v);
              }
          });
          fetchedVisits = cleanVisits; 
        } catch(e) { console.warn("لم يتم العثور على زيارات بالسيرفر"); }
        setVisits(fetchedVisits);

        if (userIsCustodial) {
          try {
            const reqRes = await requestsAPI.list({ FamilyId: fId, Status: 'Pending', PageSize: 10 });
            setPendingRequests(reqRes.data?.requests?.items || reqRes.data?.items || []);
          } catch (e) { console.warn("لم يتم العثور على طلبات معلقة بالسيرفر"); }
        }

      } catch (error) {
        toast.error("حدث خطأ في تحميل البيانات");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsPageLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const now = new Date();
  
  const upcomingVisits = visits
    .filter(v => new Date(v.startAt) > now && v.status !== 'Cancelled' && v.status !== 'Completed')
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  const pastVisits = visits
    .filter(v => new Date(v.startAt) <= now || v.status === 'Cancelled' || v.status === 'Completed')
    .sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

  const filteredPastVisits = pastVisits.filter(visit => {
    if (statusFilter === 'all') return true;
    const status = getSmartVisitStatus(visit);
    return status.filterCode === statusFilter;
  });

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
        const statusDisplay = getSmartVisitStatus(selectedHistoryVisit);
        const blob = await pdf(
          <VisitReportPDF 
            visit={selectedHistoryVisit} 
            locationName={locationName} 
            statusDisplay={statusDisplay} 
            parentNames={parentNames}
          />
        ).toBlob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Visit_Report_${selectedHistoryVisit.startAt.split('T')[0]}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("تم استخراج التقرير بنجاح");
    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast.error("حدث خطأ أثناء استخراج التقرير");
    } finally {
        setIsGeneratingPDF(false);
    }
  };

  const handleStaySubmit = async (e) => {
    e.preventDefault();
    if(!stayRequest.startDate || !stayRequest.endDate || !stayRequest.reason) { toast.error("أكمل البيانات"); return; }
    try {
        setIsSubmittingStay(true);
        if(requestsAPI.create) await requestsAPI.create({ startDate: stayRequest.startDate, endDate: stayRequest.endDate, reason: stayRequest.reason });
        toast.success("تم رفع الطلب بنجاح"); 
        setShowStayModal(false); 
        setStayRequest({ startDate: '', endDate: '', reason: '' });
    } catch (error) { toast.error(getErrorMessage(error) || "حدث خطأ أثناء رفع الطلب"); } 
    finally { setIsSubmittingStay(false); }
  };

  const handleProcessRequest = async (requestId, isApproved, decisionNote = "") => {
    try {
      setIsProcessing(true);
      if(rejectReason.trim() === '' && !isApproved) { toast.error('يرجى كتابة سبب الرفض'); setIsProcessing(false); return; }
      await requestsAPI.process(requestId, { isAccepted: isApproved, reasonNote: decisionNote });
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setShowRejectModal(false);
      setRejectReason("");
      toast.success(isApproved ? "تمت الموافقة على الطلب بنجاح" : "تم رفض الطلب");
    } catch (error) { toast.error(getErrorMessage(error) || "حدث خطأ أثناء معالجة الطلب."); } 
    finally { setIsProcessing(false); }
  };

  const handleSetCompanion = async (e) => {
    e.preventDefault();
    setCompanionError(''); 
    if (!companionNationalId || companionNationalId.length !== 14) { setCompanionError("يرجى إدخال رقم قومي صحيح مكون من 14 رقم"); return; }
    if (currentUser?.actualNationalId && companionNationalId === currentUser.actualNationalId) { setCompanionError("عفواً، لا يمكنك إدخال رقمك القومي. أنت بالفعل المرافق الافتراضي."); return; }
    if (!upcomingVisits || upcomingVisits.length === 0) { setCompanionError("لا توجد زيارات قادمة مجدولة لربط المرافق بها."); return; }
    
    const nextVisitId = upcomingVisits[0].id;
    try {
      setIsSubmittingCompanion(true);
      
      // ✅ التعديل هنا: تجاوز visitationAPI.setCompanion واستخدام api.patch مع الـ Query Parameter
      await api.patch(`/api/visit-sessions/${nextVisitId}?visitationId=${nextVisitId}`, { 
          companionNationalId: companionNationalId 
      });

      setVisits(visits.map(v => v.id === nextVisitId ? { ...v, companionNationalId } : v));
      setShowCompanionModal(false); 
      setCompanionNationalId(''); 
      toast.success("تم تسجيل المرافق البديل بنجاح ✅"); 
    } catch (error) { 
        setCompanionError(getErrorMessage(error) || "فشل تسجيل المرافق."); 
    } finally { 
        setIsSubmittingCompanion(false); 
    }
  };

  const daysInMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay();
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const daysOfWeek = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const explicitVisitDates = visits.filter(v => v.status !== 'Cancelled').map(v => { const d = new Date(v.startAt); d.setHours(0, 0, 0, 0); return d.getTime(); });

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
          if (schedule.frequency === 'Weekly' && currentCellDate.getDay() === scheduleStartDate.getDay()) isVisitDay = true;
          else if (schedule.frequency === 'BiWeekly' && currentCellDate.getDay() === scheduleStartDate.getDay() && diffDays % 14 === 0) isVisitDay = true;
          else if (schedule.frequency === 'Monthly' && currentCellDate.getDate() === scheduleStartDate.getDate()) isVisitDay = true;
      }

      const isToday = currentCellDate.getTime() === today.getTime();

      return (
        <div key={day} className="flex flex-col items-center justify-center h-12">
          <div 
            onClick={() => {
              if (isVisitDay) {
                const targetTime = currentCellDate.getTime();
                const explicitVisit = visits.find(v => {
                    const d = new Date(v.startAt);
                    d.setHours(0,0,0,0);
                    return d.getTime() === targetTime && v.status !== 'Cancelled';
                });
                setSelectedVisitDetails({
                    date: currentCellDate,
                    actualVisit: explicitVisit,
                    schedule: schedule
                });
                setShowVisitDetailsModal(true);
              }
            }}
            className={`flex items-center justify-center h-10 w-10 mx-auto rounded-full text-sm transition-all relative ${isVisitDay ? 'bg-blue-50 text-blue-700 font-bold shadow-sm cursor-pointer hover:bg-blue-100 hover:scale-110' : 'text-gray-700'} ${isToday && !isVisitDay ? 'border border-[#1e3a8a] text-[#1e3a8a] font-bold' : ''} ${!isVisitDay && !isToday ? 'hover:bg-gray-100 cursor-default' : ''}`}
          >
            {day}
            {isVisitDay && <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-[#1e3a8a] rounded-full"></div>}
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] text-[#1e3a8a] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري تحميل بيانات الزيارات...</p>
      </div>
    );
  }

  const hasUpcomingVisit = upcomingVisits.length > 0;
  const rawCompanion = hasUpcomingVisit ? upcomingVisits[0].companionNationalId : null;
  const currentCompanion = (rawCompanion && String(rawCompanion).trim() !== String(currentUser?.actualNationalId).trim()) ? String(rawCompanion).trim() : null;

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
          
          <VisitsHeader navigate={navigate} />

          <DynamicCards 
            isCustodial={isCustodial} 
            pendingRequests={pendingRequests} 
            setShowStayModal={setShowStayModal} 
            setSelectedRequestId={setSelectedRequestId} 
            setShowRejectModal={setShowRejectModal} 
            handleProcessRequest={handleProcessRequest} 
            isProcessing={isProcessing} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">مواعيد الزيارات في التقويم</h2>
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6 px-2">
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors border-none outline-none cursor-pointer"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                  <h3 className="text-lg font-bold text-[#1e3a8a]">{monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}</h3>
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full transition-colors border-none outline-none cursor-pointer"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                </div>
                <div className="grid grid-cols-7 mb-4">{daysOfWeek.map(day => <div key={day} className="text-center text-sm font-bold text-gray-400">{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-y-4 gap-x-2">{renderCalendarDays()}</div>
                <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-bold"><div className="w-2 h-2 rounded-full bg-[#1e3a8a]"></div><span>يوم زيارة</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-bold"><div className="w-4 h-4 rounded-full border border-[#1e3a8a]"></div><span>اليوم</span></div>
                </div>
              </div>
            </div>

            <ScheduleCard 
              isCustodial={isCustodial} 
              schedule={schedule} 
              locationName={locationName} 
              hasUpcomingVisit={hasUpcomingVisit} 
              currentCompanion={currentCompanion} 
              setShowCompanionModal={setShowCompanionModal} 
              setCompanionError={setCompanionError} 
              setCompanionNationalId={setCompanionNationalId} 
            />
          </div>

          <VisitsHistory 
            statusFilter={statusFilter} 
            setStatusFilter={setStatusFilter} 
            isDropdownOpen={isDropdownOpen} 
            setIsDropdownOpen={setIsDropdownOpen} 
            handleKeyDown={handleKeyDown} 
            dropdownRef={dropdownRef} 
            highlightedIndex={highlightedIndex} 
            setHighlightedIndex={setHighlightedIndex} 
            filteredPastVisits={filteredPastVisits} 
            setSelectedHistoryVisit={setSelectedHistoryVisit} 
            setShowHistoryDetailsModal={setShowHistoryDetailsModal} 
          />
        </div>
      </div>

      <VisitDetailsModal 
        showVisitDetailsModal={showVisitDetailsModal} 
        setShowVisitDetailsModal={setShowVisitDetailsModal} 
        selectedVisitDetails={selectedVisitDetails} 
        locationName={locationName} 
      />

      <HistoryDetailsModal 
        showHistoryDetailsModal={showHistoryDetailsModal} 
        setShowHistoryDetailsModal={setShowHistoryDetailsModal} 
        selectedHistoryVisit={selectedHistoryVisit} 
        locationName={locationName} 
        parentNames={parentNames} 
        handleGeneratePDF={handleGeneratePDF} 
        isGeneratingPDF={isGeneratingPDF} 
      />

      <StayModal 
        showStayModal={showStayModal} 
        setShowStayModal={setShowStayModal} 
        handleStaySubmit={handleStaySubmit} 
        stayRequest={stayRequest} 
        setStayRequest={setStayRequest} 
        isSubmittingStay={isSubmittingStay} 
      />

      <RejectModal 
        showRejectModal={showRejectModal} 
        setShowRejectModal={setShowRejectModal} 
        rejectReason={rejectReason} 
        setRejectReason={setRejectReason} 
        handleProcessRequest={handleProcessRequest} 
        selectedRequestId={selectedRequestId} 
        isProcessing={isProcessing} 
      />

      <CompanionModal 
        showCompanionModal={showCompanionModal} 
        setShowCompanionModal={setShowCompanionModal} 
        companionNationalId={companionNationalId} 
        setCompanionNationalId={setCompanionNationalId} 
        companionError={companionError} 
        setCompanionError={setCompanionError} 
        handleSetCompanion={handleSetCompanion} 
        isSubmittingCompanion={isSubmittingCompanion} 
      />
    </div>
  );
}