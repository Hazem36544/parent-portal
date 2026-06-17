import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import api, { courtAPI } from '../../services/api';

// استيراد المكونات الفرعية
import CaseHeader from './components/CaseHeader';
import MainDetailsCards from './components/MainDetailsCards';
import SideDetailsCards from './components/SideDetailsCards';

export default function CaseDetails() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState({
    family: null,
    courtCase: null,
    custody: null,
    schedule: null,
    alimony: null,
    court: null,
    location: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const familyRes = await courtAPI.getMyFamilies();
        const currentFamily = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (!currentFamily || !currentFamily.familyId) {
          throw new Error("لم يتم العثور على بيانات الأسرة.");
        }
        
        const fId = currentFamily.familyId;
        let currentCase = null;
        let caseId = null;

        try {
          const caseRes = await courtAPI.listCourtCasesByFamily(fId);
          currentCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
          if (currentCase) caseId = currentCase.id;
        } catch (err) { console.warn("لم يتم العثور على قضية مسجلة:", err); }

        let custodyData = null;
        let scheduleData = null;
        let alimonyData = null;
        let courtData = null;
        let locationData = null;

        if (caseId) {
          const [cusRes, schRes, aliRes] = await Promise.allSettled([
            courtAPI.getCustodyByCourtCase(caseId),
            courtAPI.getVisitationScheduleByCourtCase(caseId),
            courtAPI.getAlimonyByCourtCase(caseId)
          ]);

          if (cusRes.status === 'fulfilled' && cusRes.value.data) custodyData = cusRes.value.data;
          if (schRes.status === 'fulfilled' && schRes.value.data) scheduleData = schRes.value.data;
          if (aliRes.status === 'fulfilled' && aliRes.value.data) alimonyData = aliRes.value.data;

          if (currentCase.courtId) {
             try {
                const courtRes = await api.get(`/api/courts/${currentCase.courtId}`);
                if (courtRes.data) courtData = courtRes.data;
             } catch (e) { console.warn("لم يتم العثور على بيانات المحكمة:", e); }
          }

          // ✅ التعديل هنا: استخدام visitCenterId بناءً على رد السيرفر الجديد
          if (scheduleData && scheduleData.visitCenterId) {
             try {
                const locRes = await api.get(`/api/visit-centers/${scheduleData.visitCenterId}`, {
                    params: { locationId: scheduleData.visitCenterId } // تمرير locationId كـ query إرضاءً لمتطلبات السواجر
                });
                if (locRes.data) locationData = locRes.data;
             } catch (e) { console.warn("لم يتم العثور على بيانات مركز الرؤية:", e); }
          }
        }

        setData({
          family: currentFamily,
          courtCase: currentCase,
          custody: custodyData,
          schedule: scheduleData,
          alimony: alimonyData,
          court: courtData,
          location: locationData
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

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsPageLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] text-[#1e3a8a] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري تحميل تفاصيل القضية والقرارات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-sans" dir="rtl">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 border border-red-100 shadow-sm">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <span className="text-lg font-bold">{error}</span>
        </div>
      </div>
    );
  }

  const caseNumber = data.courtCase?.caseNumber || 'FAM-' + (data.family?.familyId?.substring(0,8).toUpperCase());
  const caseStatus = data.courtCase?.status || 'نشطة';
  const childrenList = data.family?.children || [];

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
      
          <CaseHeader navigate={navigate} caseStatus={caseStatus} caseNumber={caseNumber} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MainDetailsCards data={data} caseNumber={caseNumber} childrenList={childrenList} />
            <SideDetailsCards data={data} childrenList={childrenList} />
          </div>

        </div>
      </div>
    </div>
  );
}