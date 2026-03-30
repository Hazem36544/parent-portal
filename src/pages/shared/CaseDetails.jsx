import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  Users, 
  Calendar, 
  FileText, 
  MapPin, 
  ChevronRight, 
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
// 🚀 استيراد واجهات الاتصال بالسيرفر
import { courtAPI } from '../../services/api';

export default function CaseDetails() {
  const navigate = useNavigate();

  // 🚀 حالات (States) لحفظ البيانات الحقيقية من السيرفر
  const [data, setData] = useState({
    family: null,
    courtCase: null,
    custody: null,
    schedule: null,
    alimony: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. جلب بيانات الأسرة (Family)
        const familyRes = await courtAPI.getMyFamilies();
        const currentFamily = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (!currentFamily || !currentFamily.familyId) {
          throw new Error("لم يتم العثور على بيانات الأسرة.");
        }
        
        const fId = currentFamily.familyId;
        let currentCase = null;
        let caseId = null;

        // 2. جلب بيانات القضية المرتبطة بالأسرة
        try {
          const caseRes = await courtAPI.listCourtCasesByFamily(fId);
          currentCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
          if (currentCase) {
            caseId = currentCase.id;
          }
        } catch (err) {
          console.warn("لم يتم العثور على قضية مسجلة:", err);
        }

        // 3. جلب تفاصيل (الحضانة، الرؤية، النفقة) إذا وُجدت قضية
        let custodyData = null;
        let scheduleData = null;
        let alimonyData = null;

        if (caseId) {
          const [cusRes, schRes, aliRes] = await Promise.allSettled([
            courtAPI.getCustodyByCourtCase(caseId),
            courtAPI.getVisitationScheduleByCourtCase(caseId),
            courtAPI.getAlimonyByCourtCase(caseId)
          ]);

          if (cusRes.status === 'fulfilled' && cusRes.value.data) custodyData = cusRes.value.data;
          if (schRes.status === 'fulfilled' && schRes.value.data) scheduleData = schRes.value.data;
          if (aliRes.status === 'fulfilled' && aliRes.value.data) alimonyData = aliRes.value.data;
        }

        // تحديث حالة البيانات
        setData({
          family: currentFamily,
          courtCase: currentCase,
          custody: custodyData,
          schedule: scheduleData,
          alimony: alimonyData
        });

      } catch (err) {
        console.error("خطأ في جلب التفاصيل:", err);
        setError("حدث خطأ أثناء تحميل تفاصيل القضية. يرجى المحاولة لاحقاً.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullDetails();
  }, []);

  // 🚀 دوال مساعدة لتنسيق البيانات للعرض
  const formatDate = (dateStr) => {
    if (!dateStr) return 'غير محدد';
    return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCustodianName = () => {
    if (!data.custody || !data.family) return 'لم يصدر قرار / غير محدد';
    if (data.custody.custodialParentId === data.family.mother?.id) return data.family.mother?.fullName;
    if (data.custody.custodialParentId === data.family.father?.id) return data.family.father?.fullName;
    return 'غير محدد';
  };

  const translateFrequency = (freq) => {
    if(freq === 'Weekly') return 'أسبوعياً';
    if(freq === 'Monthly') return 'شهرياً';
    return freq || 'غير محدد';
  };

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-[#1e3a8a]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري تحميل تفاصيل القضية والقرارات...</p>
      </div>
    );
  }

  // شاشة الخطأ
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 border border-red-100 m-6">
        <AlertCircle className="w-8 h-8 flex-shrink-0" />
        <span className="text-lg font-medium">{error}</span>
      </div>
    );
  }

  // تجهيز المتغيرات الآمنة للعرض
  const caseNumber = data.courtCase?.caseNumber || 'FAM-' + (data.family?.familyId?.substring(0,8).toUpperCase());
  const caseStatus = data.courtCase?.status || 'نشطة';
  const childrenList = data.family?.children || [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      {/* --- الهيدر الموحد الجديد --- */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
        {/* خلفيات جمالية */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">تفاصيل القضية</h1>
                <span className="bg-green-500/20 text-green-100 border border-green-500/30 text-xs px-3 py-0.5 rounded-full font-bold">
                    {caseStatus}
                </span>
            </div>
            <p className="text-blue-200 text-sm opacity-90 font-mono tracking-wider">{caseNumber}</p>
          </div>
        </div>

        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
           <Briefcase className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Right Side - Main Details (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 🚀 Case Status Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-[#1e3a8a]">
                <div className="bg-blue-50 p-2 rounded-xl"><Scale className="w-6 h-6" /></div>
                <h2 className="text-lg font-bold">حالة القضية</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-400 text-sm">رقم القضية</span>
                <span className="text-gray-800 font-bold font-mono">{caseNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-400 text-sm">تاريخ التسجيل</span>
                <span className="text-gray-800 font-medium">{formatDate(data.courtCase?.filedAt)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-400 text-sm">نوع القضية</span>
                <span className="text-gray-800 font-medium">أحوال شخصية</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-400 text-sm">المحكمة</span>
                <span className="text-gray-800 font-medium">محكمة الأسرة</span>
              </div>
            </div>
          </div>

          {/* 🚀 Custody Decision Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
              <div className="bg-blue-50 p-2 rounded-xl"><Users className="w-6 h-6" /></div>
              <h2 className="text-lg font-bold">قرار الحضانة</h2>
            </div>
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">صاحب الحضانة</span>
                <span className="text-purple-900 font-bold text-lg">{getCustodianName()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-purple-100 pt-3">
                <span className="text-gray-500 text-sm">عدد الأطفال</span>
                <span className="text-gray-800 font-medium">{childrenList.length} أطفال</span>
              </div>
              <div className="flex justify-between items-center border-t border-purple-100 pt-3">
                <span className="text-gray-500 text-sm">تاريخ القرار</span>
                <span className="text-gray-800 font-medium">{formatDate(data.custody?.startAt)}</span>
              </div>
            </div>
          </div>

          {/* 🚀 Visitation Schedule Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
              <div className="bg-blue-50 p-2 rounded-xl"><Calendar className="w-6 h-6" /></div>
              <h2 className="text-lg font-bold">جدول الرؤية المعتمد</h2>
            </div>
            {data.schedule ? (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">معدل التكرار</span>
                    <span className="text-blue-900 font-bold">{translateFrequency(data.schedule.frequency)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-blue-100 pt-3">
                    <span className="text-gray-500 text-sm">التوقيت</span>
                    <span className="text-gray-800 font-medium font-mono" dir="ltr">
                        {data.schedule.startTime?.substring(0,5)} - {data.schedule.endTime?.substring(0,5)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-blue-100 pt-3">
                    <span className="text-gray-500 text-sm">تاريخ البدء</span>
                    <span className="text-gray-800 font-medium">{formatDate(data.schedule.startDate)}</span>
                  </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                    <span className="text-gray-500 text-sm">لا يوجد جدول رؤية مسجل لهذه القضية حالياً.</span>
                </div>
            )}
          </div>

          {/* 🚀 Alimony Info Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
              <div className="bg-blue-50 p-2 rounded-xl"><FileText className="w-6 h-6" /></div>
              <h2 className="text-lg font-bold">معلومات النفقة</h2>
            </div>
            {data.alimony ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center">
                    <p className="text-xs text-green-600 mb-1">المبلغ المقرر</p>
                    <p className="text-xl font-bold text-green-800">{(data.alimony.amount / 100)?.toLocaleString('ar-EG')} ج.م</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-500 mb-1">دورية الدفع</p>
                    <p className="text-lg font-bold text-gray-800">{translateFrequency(data.alimony.frequency)}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-500 mb-1">تاريخ التطبيق</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{formatDate(data.alimony.startDate)}</p>
                  </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                    <span className="text-gray-500 text-sm">لا توجد بيانات نفقة مسجلة لهذه القضية حالياً.</span>
                </div>
            )}
          </div>

        </div>

        {/* Left Side - Side Details (1 Column) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* 🚀 Children Info Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
              <div className="bg-blue-50 p-2 rounded-xl relative">
                 <Users className="w-6 h-6" />
                 {childrenList.length > 0 && (
                     <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                 )}
              </div>
              <h2 className="text-lg font-bold">معلومات الأطفال</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              {childrenList.length > 0 ? (
                  childrenList.map((child) => (
                    <div key={child.id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                      <div className="text-right">
                        <h3 className="text-gray-800 font-bold text-sm mb-1">{child.fullName}</h3>
                        <p className="text-gray-400 text-[11px]">{child.schoolId ? 'مسجل بنظام المدارس' : 'غير مسجل بمدرسة'}</p>
                      </div>
                      <div className="bg-white border text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {child.age} سنوات
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">لا يوجد أطفال مسجلين.</div>
              )}
            </div>
          </div>

          {/* Court Location Card (Static Placeholder for now) */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow sticky top-6">
            <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
              <div className="bg-blue-50 p-2 rounded-xl"><MapPin className="w-6 h-6" /></div>
              <h2 className="text-lg font-bold">موقع المحكمة</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 text-right flex flex-col gap-3 border border-gray-100">
              <h3 className="text-gray-800 font-bold text-sm">محكمة الأسرة المختصة</h3>
              <p className="text-gray-500 text-xs leading-relaxed">يرجى مراجعة إدارة المحكمة لمعرفة العنوان الدقيق المربوط برقم القضية.</p>
              <div className="w-full h-px bg-gray-200 my-1"></div>
              <p className="text-gray-400 text-[10px]">ساعات العمل: السبت - الخميس (8:00 ص - 2:00 م)</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}