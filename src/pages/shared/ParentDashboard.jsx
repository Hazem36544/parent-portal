import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Bell, 
  CalendarClock,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courtAPI, visitationAPI, requestsAPI } from '../../services/api';

const ParentDashboard = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  const [familyData, setFamilyData] = useState(null);
  const [courtCase, setCourtCase] = useState(null);
  
  const [stats, setStats] = useState({
    totalAlimonyDue: 0,
    alimonyStatus: 'مسدد',
    nextVisitDate: null,
    visitationSchedule: null, 
    pendingVisitsCount: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

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

            try {
               const caseResponse = await courtAPI.listCourtCasesByFamily(fId);
               if (caseResponse.data && caseResponse.data.items && caseResponse.data.items.length > 0) {
                   currentCourtCase = caseResponse.data.items[0];
                   setCourtCase(currentCourtCase);
                   cId = currentCourtCase.id;
               }
            } catch (caseErr) {
               console.error("لم نتمكن من جلب بيانات القضية:", caseErr);
            }

            const fetchAlimonySafe = async (caseId) => {
                if (!caseId) return { data: { amount: 0 } };
                try {
                    return await courtAPI.getAlimonyByCourtCase(caseId);
                } catch (err) {
                    if (err.response && err.response.status === 404) return { data: { amount: 0 } }; 
                    throw err; 
                }
            };

            const promises = [
                visitationAPI.list({ FamilyId: fId, PageSize: 50 }),
                requestsAPI.list({ FamilyId: fId, Status: 'Pending', PageSize: 1 })
            ];

            if (cId) {
                promises.push(fetchAlimonySafe(cId));
                promises.push(courtAPI.getVisitationScheduleByCourtCase(cId).catch(() => ({ data: null })));
            } else {
                promises.push(Promise.resolve({ status: 'skipped', data: null }));
                promises.push(Promise.resolve({ status: 'skipped', data: null }));
            }

            const [visitsRes, requestsRes, alimonyRes, scheduleRes] = await Promise.allSettled(promises);
            let newStats = { ...stats };

            if (alimonyRes.status === 'fulfilled' && alimonyRes.value?.data) {
                const alimony = alimonyRes.value.data;
                newStats.totalAlimonyDue = alimony?.amount || 0; 
                newStats.alimonyStatus = newStats.totalAlimonyDue > 0 ? 'معلق' : 'مسدد';
            }

            if (scheduleRes.status === 'fulfilled' && scheduleRes.value?.data) {
                newStats.visitationSchedule = scheduleRes.value.data;
            }

            if (visitsRes.status === 'fulfilled') {
                const visitsData = visitsRes.value.data?.items || [];
                if (Array.isArray(visitsData)) {
                    const now = new Date();
                    const upcoming = visitsData.filter(v => v.startAt && new Date(v.startAt) > now && v.status !== 'Cancelled');
                    if (upcoming.length > 0) {
                        upcoming.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
                        newStats.nextVisitDate = upcoming[0].startAt;
                    }
                }
            }

            if (requestsRes.status === 'fulfilled' && requestsRes.value?.data) {
                newStats.pendingVisitsCount = requestsRes.value.data?.totalCount || 0;
            }

            setStats(newStats);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("حدث خطأ في الاتصال، قد تظهر بعض البيانات بشكل غير دقيق.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const isFather = user?.role === 'father';
  const roleName = isFather ? 'ولي أمر - الأب' : 'ولي أمر - الأم';
  const themeColor = isFather ? 'bg-[#1e3a8a]' : 'bg-[#9d174d]'; 
  const badgeColor = isFather ? 'bg-blue-800/80 text-blue-100' : 'bg-pink-800/80 text-pink-100';
  
  // ==========================================
  // تم تعديل المسار الأساسي ليتوافق مع الروابط في تطبيقك
  // ==========================================
  const basePath = '/parent'; 

  let displayName = user?.name;
  if (!displayName || displayName.includes('حساب')) {
      if (familyData) displayName = isFather ? familyData.father?.fullName : familyData.mother?.fullName;
      else displayName = isFather ? 'حساب الأب' : 'حساب الأم';
  }

  const otherParentName = familyData ? (isFather ? familyData.mother?.fullName : familyData.father?.fullName) : 'غير مسجل';
  const otherParentLabel = isFather ? 'الأم (الطرف الثاني):' : 'الأب (الطرف الثاني):';

  const formatVisitDate = (dateString) => {
      if (!dateString) return null;
      const d = new Date(dateString);
      return {
          dayName: d.toLocaleDateString('ar-EG', { weekday: 'long' }),
          time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          fullDate: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
      };
  };
  const formattedNextVisit = formatVisitDate(stats.nextVisitDate);

  const renderScheduleInfo = () => {
      if (stats.visitationSchedule) {
          const freq = stats.visitationSchedule.frequency === 'Weekly' ? 'أسبوعياً' : stats.visitationSchedule.frequency;
          const start = stats.visitationSchedule.startTime ? stats.visitationSchedule.startTime.substring(0, 5) : '';
          const end = stats.visitationSchedule.endTime ? stats.visitationSchedule.endTime.substring(0, 5) : '';
          return `جدول معتمد: ${freq} (${start} - ${end})`;
      }
      return 'لا توجد زيارات مسجلة';
  };

  if (isLoading) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center min-h-[60vh] text-blue-800">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">جاري تحميل بيانات الملف...</p>
          </div>
      );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10" dir="rtl">
          
      <div className={`${themeColor} text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg relative overflow-hidden gap-6 transition-colors duration-500`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex flex-col z-10">
          <p className="text-white/80 text-sm mb-1 font-medium">مرحباً بك،</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">{displayName}</h1>
          <div className="flex items-center gap-2">
            <span className={`${badgeColor} text-xs px-3 py-1 rounded-lg font-medium`}>{roleName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-3 md:px-5 md:py-3 rounded-2xl backdrop-blur-md border border-white/20 z-10">
          <div className="flex flex-col text-left">
            <span className="text-white/80 text-xs mb-0.5">تاريخ اليوم</span>
            <span className="font-bold text-sm md:text-base">{formattedDate}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-500 mb-2 font-medium">رقم الملف / الأسرة</span>
              <div className="flex flex-row items-center gap-4">
                <span className="text-xl md:text-2xl font-bold text-gray-800 font-mono tracking-wider uppercase">
                  {courtCase?.caseNumber ? courtCase.caseNumber : (familyData ? `FAM-${familyData.familyId.substring(0,8)}` : 'غير متاح')}
                </span>
                <span className="bg-green-100/80 text-green-700 text-xs px-4 py-1.5 rounded-full w-max font-bold">نشط</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/parent/case-details')} 
              className="p-2 hover:bg-gray-50 rounded-full transition-colors text-blue-800"
            >
              <ChevronLeft className="w-6 h-6 text-[#1e3a8a]" />
            </button>
          </div>
          
          <div className="bg-gray-50/50 p-6 md:p-8 flex flex-row items-center justify-start border-t border-gray-100">
            <div className="flex flex-col w-1/2">
              <span className="text-sm text-gray-400 mb-2 font-medium">{otherParentLabel}</span>
              <span className="font-bold text-gray-800 text-base md:text-lg">
                  {otherParentName}
              </span>
            </div>
            <div className="flex flex-col w-1/2">
              <span className="text-sm text-gray-400 mb-2 font-medium">عدد الأطفال:</span>
              <span className="font-bold text-gray-800 text-base md:text-lg">
                  {familyData?.children?.length ? `${familyData.children.length} أطفال` : 'لا يوجد'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate(`${basePath}/visits`)} 
            className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-row items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-14 h-14 rounded-full bg-green-50/80 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-medium">الزيارات</span>
                {formattedNextVisit ? (
                  <>
                    <span className="font-bold text-gray-800 text-lg">{formattedNextVisit.dayName} {formattedNextVisit.time}</span>
                    <span className="text-xs text-gray-400 mt-1 font-medium">{formattedNextVisit.fullDate}</span>
                  </>
                ) : (
                  <span className="font-bold text-gray-800 text-sm mt-1">{renderScheduleInfo()}</span>
                )}
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </div>

          <div 
             onClick={() => navigate(`${basePath}/alimony`)} 
             className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-row items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stats.totalAlimonyDue > 0 ? 'bg-yellow-50' : 'bg-green-50/80'}`}>
                <DollarSign className={`w-7 h-7 ${stats.totalAlimonyDue > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1 font-medium">حالة النفقة</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-lg">
                      {stats.totalAlimonyDue > 0 ? `${stats.totalAlimonyDue.toLocaleString('ar-EG')} ج.م` : 'مسددة بالكامل'}
                  </span>
                </div>
                {stats.totalAlimonyDue > 0 && (
                    <span className="mt-1.5 bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full w-max font-bold">
                        {stats.alimonyStatus}
                    </span>
                )}
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-1.5 h-6 ${isFather ? 'bg-blue-600' : 'bg-pink-600'} rounded-full`}></div>
            <h3 className="text-xl font-bold text-gray-800">الخدمات السريعة</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'تفاصيل القضية', subtitle: 'عرض معلومات القضية', icon: <FileText className="w-7 h-7 text-blue-600" />, bg: 'bg-blue-50', path: '/parent/case-details' },
              { title: 'تقديم شكوى', subtitle: 'شكوى جديدة', icon: <MessageSquare className="w-7 h-7 text-red-500" />, bg: 'bg-red-50', path: '/parent/complaints' },
              { title: 'الإشعارات', subtitle: 'الاطلاع على الإشعارات', icon: <Bell className="w-7 h-7 text-blue-500" />, bg: 'bg-blue-50', path: '/parent/notifications' },
              { title: 'إدارة الزيارات', subtitle: 'عرض وإدارة المواعيد', icon: <Calendar className="w-7 h-7 text-green-600" />, bg: 'bg-green-50', path: `${basePath}/visits` }
            ].map((service, index) => (
              <div 
                key={index} 
                onClick={() => navigate(service.path)} 
                className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center mb-5`}>
                  {service.icon}
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">{service.title}</h4>
                <p className="text-sm text-gray-500 font-medium">{service.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {(stats.totalAlimonyDue > 0 || stats.pendingVisitsCount > 0) && (
            <div className="pt-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">التنبيهات العاجلة</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.totalAlimonyDue > 0 && (
                    <div className="bg-white border border-red-100 rounded-3xl p-6 md:p-8 flex flex-row items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-red-50/50 transition-colors" onClick={() => navigate(`${basePath}/alimony`)}>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xl mb-2">نفقات مستحقة الدفع</span>
                        <span className="text-gray-500 font-medium mb-3">يرجى المراجعة والسداد</span>
                        <span className="font-bold font-mono text-red-600 text-2xl tracking-wide">{stats.totalAlimonyDue.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                      <div className="bg-red-50 text-red-500 rounded-2xl p-4">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                    </div>
                )}
                {stats.pendingVisitsCount > 0 && (
                    <div className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 flex flex-row items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-orange-50/50 transition-colors" onClick={() => navigate(`${basePath}/visits`)}>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xl mb-2">طلبات زيارة معلقة</span>
                        <span className="text-gray-500 font-medium mb-3">بانتظار الموافقة أو الرد</span>
                        <span className="font-bold text-orange-600 text-2xl">{stats.pendingVisitsCount} طلب</span>
                      </div>
                      <div className="bg-orange-50 text-orange-500 rounded-2xl p-4">
                        <CalendarClock className="w-8 h-8" />
                      </div>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;