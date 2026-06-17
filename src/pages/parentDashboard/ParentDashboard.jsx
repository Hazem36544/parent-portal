import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { courtAPI, visitationAPI, requestsAPI } from '../../services/api';

// استيراد المكونات الفرعية
import DashboardHeader from './components/DashboardHeader';
import CaseSummary from './components/CaseSummary';
import StatusCards from './components/StatusCards';
import QuickActions from './components/QuickActions';
import UrgentAlerts from './components/UrgentAlerts';
import RecentActivities from './components/RecentActivities';
import NotificationPopup from './components/NotificationPopup';

export default function ParentDashboard() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  const { user, notifications, unreadCount, markNotificationAsRead } = useAuth(); 
  const navigate = useNavigate();
  const basePath = '/parent';
  
  const [familyData, setFamilyData] = useState(null);
  const [courtCase, setCourtCase] = useState(null);
  
  const [isCustodial, setIsCustodial] = useState(false);
  const [isFatherRole, setIsFatherRole] = useState(true);
  
  const [stats, setStats] = useState({
    alimonyDueAmount: 0,           
    alimonyOverdueAmount: 0, 
    nextAlimonyDate: null,   
    availableWithdrawalAmount: 0,  
    alimonyStatus: 'مسدد',
    nextVisitDate: null,
    visitationSchedule: null, 
    pendingVisitsCount: 0
  });

  const [alimonyError, setAlimonyError] = useState(false);
  const [visitsError, setVisitsError] = useState(false);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAlimonyError(false);
      setVisitsError(false);

      const sessionUser = JSON.parse(sessionStorage.getItem('wesal_parent_user')) || JSON.parse(sessionStorage.getItem('wesal_user_data')) || user || {};
      const loggedInNationalId = String(sessionUser.nationalId || "").trim();

      const familyResponse = await courtAPI.getMyFamilies();
      let currentFamily = null;
      
      if (familyResponse.data && familyResponse.data.length > 0) {
          currentFamily = familyResponse.data[0];
          setFamilyData(currentFamily);
      }

      if (currentFamily && currentFamily.familyId) {
          const fId = currentFamily.familyId; 
          let currentCourtCase = null;
          let cId = null;

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
          const isFather = myRole === 'father';
          setIsFatherRole(isFather);

          try {
             const caseResponse = await courtAPI.listCourtCasesByFamily(fId);
             if (caseResponse.data && caseResponse.data.items && caseResponse.data.items.length > 0) {
                 currentCourtCase = caseResponse.data.items[0];
                 setCourtCase(currentCourtCase);
                 cId = currentCourtCase.id;
             }
          } catch (caseErr) { console.error("لم نتمكن من جلب بيانات القضية:", caseErr); }

          const promises = [
              visitationAPI.list({ FamilyId: fId, PageSize: 50 })
          ];

          if (cId) {
              promises.push(courtAPI.getCustodyByCourtCase(cId).catch(() => ({ data: null })));
              promises.push(api.get(`/api/court-cases/${cId}/alimonySchedule-schedule`).catch(() => { setAlimonyError(true); return { data: null }; }));
              promises.push(courtAPI.getVisitationScheduleByCourtCase(cId).catch(() => { setVisitsError(true); return { data: null }; }));
          } else {
              promises.push(Promise.resolve({ status: 'skipped', data: null }));
              promises.push(Promise.resolve({ status: 'skipped', data: null }));
              promises.push(Promise.resolve({ status: 'skipped', data: null }));
          }

          const [visitsRes, custodyRes, alimonyRes, scheduleRes] = await Promise.allSettled(promises);
          let newStats = { ...stats };

          if (visitsRes.status === 'rejected') setVisitsError(true);
          if (alimonyRes.status === 'rejected') setAlimonyError(true);

          let userIsCustodial = false;
          if (custodyRes.status === 'fulfilled' && custodyRes.value?.data) {
             if (String(custodyRes.value.data.custodialParentId).toLowerCase() === String(myParentId).toLowerCase()) {
                 userIsCustodial = true;
             }
          }
          setIsCustodial(userIsCustodial);

          if (userIsCustodial && !visitsError) {
              try {
                  const reqRes = await requestsAPI.list({ FamilyId: fId, Status: 'Pending', PageSize: 1 });
                  newStats.pendingVisitsCount = reqRes.data?.totalCount || 0;
              } catch(e) { setVisitsError(true); }
          }

          if (scheduleRes.status === 'fulfilled' && scheduleRes.value?.data) {
              newStats.visitationSchedule = scheduleRes.value.data;
          }

          if (visitsRes.status === 'fulfilled' && visitsRes.value?.data) {
              const visitsData = visitsRes.value.data.items || [];
              if (Array.isArray(visitsData)) {
                  const now = new Date();
                  const upcoming = visitsData.filter(v => v.startAt && new Date(v.startAt) > now && v.status !== 'Cancelled');
                  if (upcoming.length > 0) {
                      upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
                      newStats.nextVisitDate = upcoming[0].startAt;
                  }
              }
          }

          if (alimonyRes.status === 'fulfilled' && alimonyRes.value?.data && !alimonyError) {
              const alimonyId = alimonyRes.value.data.id;
              try {
                  const payRes = await api.get(`/api/alimonySchedule-schedules/${alimonyId}/alimonySchedule-dues`, {
                      params: { alimonyId: alimonyId, PageNumber: 1, PageSize: 100 }
                  });

                  const rawPayments = payRes.data?.items || [];
                  let cleanPayments = [];
                  let seenPaymentDates = new Set();
                  
                  let sortedForDeduplication = [...rawPayments].sort((a, b) => {
                      const aIsPaid = (a.status?.toLowerCase() === 'paid' || a.status === 'مدفوعة');
                      const bIsPaid = (b.status?.toLowerCase() === 'paid' || b.status === 'مدفوعة');
                      return aIsPaid ? -1 : (bIsPaid ? 1 : 0);
                  });

                  sortedForDeduplication.forEach(p => {
                      if (!p.dueDate) return;
                      const dateOnly = p.dueDate.split('T')[0];
                      if (!seenPaymentDates.has(dateOnly)) {
                          seenPaymentDates.add(dateOnly);
                          cleanPayments.push(p);
                      }
                  });

                  cleanPayments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

                  if (isFather) {
                      const now = new Date();
                      now.setHours(0,0,0,0);
                      
                      let currentAmount = 0;
                      let overdueAmount = 0;
                      let nextDate = null;
                      let foundCurrent = false;

                      cleanPayments.forEach(p => {
                          const status = p.status?.toLowerCase();
                          const isUnpaid = status !== 'paid' && status !== 'مدفوعة' && status !== 'withdrawn' && status !== 'مستلمة';
                          const dueDate = new Date(p.dueDate);
                          dueDate.setHours(0,0,0,0);

                          if (isUnpaid) {
                              if (dueDate < now) {
                                  overdueAmount += (p.amount || 0) / 100;
                              } else if (dueDate >= now && !foundCurrent) {
                                  currentAmount += (p.amount || 0) / 100;
                                  nextDate = p.dueDate; // ✅ تم تعديل جلب تاريخ الدفعة القادمة ليكون دقيق
                                  foundCurrent = true; 
                              }
                          }
                      });

                      if (!nextDate) {
                          const nextPaid = cleanPayments.find(p => {
                              const d = new Date(p.dueDate);
                              d.setHours(0,0,0,0);
                              return d >= now && (p.status?.toLowerCase() === 'paid' || p.status === 'مدفوعة');
                          });
                          if (nextPaid) nextDate = nextPaid.dueDate;
                      }

                      newStats.alimonyDueAmount = currentAmount;
                      newStats.alimonyOverdueAmount = overdueAmount;
                      newStats.nextAlimonyDate = nextDate;

                      // ✅ الخوارزمية الذكية لتحديد ما إذا كانت الدفعة للشهر القادم
                      if (overdueAmount > 0) {
                          newStats.alimonyStatus = 'متأخرات متراكمة';
                      } else if (currentAmount > 0) {
                          const dueD = new Date(nextDate);
                          const currentD = new Date();
                          const isFutureMonth = dueD.getFullYear() > currentD.getFullYear() || (dueD.getFullYear() === currentD.getFullYear() && dueD.getMonth() > currentD.getMonth());
                          
                          newStats.alimonyStatus = isFutureMonth ? 'مستحقة الشهر القادم' : 'مستحقة السداد';
                      } else {
                          newStats.alimonyStatus = 'مسددة بالكامل';
                      }
                      
                  } else {
                      const available = cleanPayments.filter(p => {
                          const s = p.status?.toLowerCase();
                          const ws = p.withdrawalStatus?.toLowerCase();
                          const isPaid = s === 'paid' || s === 'مدفوعة';
                          const isWithdrawn = ws === 'completed' || ws === 'withdrawn' || ws === 'مستلمة' || s === 'withdrawn' || s === 'مستلمة';
                          return isPaid && !isWithdrawn;
                      });
                      newStats.availableWithdrawalAmount = available.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;
                      newStats.alimonyStatus = newStats.availableWithdrawalAmount > 0 ? 'متاح للسحب' : 'تم الاستلام';
                  }
              } catch(e) { 
                console.error("Error fetching payments due:", e);
                setAlimonyError(true);
              }
          }

          setStats(newStats);
      }
    } catch (err) {
      setError("حدث خطأ رئيسي في الاتصال، قد تظهر البيانات بشكل غير دقيق.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsPageLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    if (notification.status !== 'Read') {
        await markNotificationAsRead(notification.id);
    }
  };

  let displayName = user?.name;
  if (!displayName || displayName.includes('حساب')) {
      if (familyData) displayName = isFatherRole ? familyData.father?.fullName : familyData.mother?.fullName;
      else displayName = isFatherRole ? 'حساب الأب' : 'حساب الأم';
  }

  if (isLoading) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] text-blue-800 font-sans" dir="rtl">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">جاري تحميل بيانات الملف...</p>
          </div>
      );
  }

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
          
          <DashboardHeader isFatherRole={isFatherRole} displayName={displayName} />

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-8">
            <CaseSummary courtCase={courtCase} familyData={familyData} isFatherRole={isFatherRole} navigate={navigate} />

            <StatusCards 
              navigate={navigate} basePath={basePath} visitsError={visitsError} alimonyError={alimonyError} 
              isFatherRole={isFatherRole} stats={stats} 
            />

            <QuickActions navigate={navigate} basePath={basePath} isFatherRole={isFatherRole} />

            <div className="pt-2 border-t border-gray-100 mt-4">
              <div className="flex flex-col lg:flex-row gap-6">
                 
                 <UrgentAlerts 
                   navigate={navigate} basePath={basePath} visitsError={visitsError} alimonyError={alimonyError} 
                   fetchDashboardData={fetchDashboardData} isFatherRole={isFatherRole} stats={stats} isCustodial={isCustodial} 
                 />

                 <RecentActivities 
                   notifications={notifications} unreadCount={unreadCount} 
                   handleNotificationClick={handleNotificationClick} navigate={navigate} 
                 />

              </div>
            </div>
            
          </div>
        </div>
      </div>

      <NotificationPopup selectedNotification={selectedNotification} setSelectedNotification={setSelectedNotification} />

    </div>
  );
}