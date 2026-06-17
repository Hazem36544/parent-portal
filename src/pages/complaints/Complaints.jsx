import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courtAPI } from '../../services/api';

import ComplaintsHeader from './components/ComplaintsHeader';
import CaseInfoCard from './components/CaseInfoCard';
import ComplaintForm from './components/ComplaintForm';

export default function Complaints() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const { user } = useAuth();

  const [caseInfo, setCaseInfo] = useState({
    caseNumber: 'جاري التحميل...',
    otherParty: 'جاري التحميل...',
    familyId: null
  });

  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  useEffect(() => {
    const forceScrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      const scrollableElements = document.querySelectorAll('.overflow-y-auto, .overflow-auto, main');
      scrollableElements.forEach(el => {
        el.scrollTop = 0;
      });
    };

    forceScrollToTop();
    
    const timer1 = setTimeout(() => {
      forceScrollToTop();
      setIsPageLoaded(true);
    }, 50);

    const timer2 = setTimeout(() => {
      forceScrollToTop();
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const fetchCaseInfo = async () => {
      try {
        setIsLoadingInfo(true);
        const familyRes = await courtAPI.getMyFamilies();
        const family = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (family && family.familyId) {
          const fId = family.familyId;
          const isFather = user?.role === 'father';
          const otherPartyName = isFather ? family.mother?.fullName : family.father?.fullName;

          let cNumber = `FAM-${fId.substring(0,8).toUpperCase()}`; 
          try {
            const caseRes = await courtAPI.listCourtCasesByFamily(fId);
            const courtCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
            if (courtCase?.caseNumber) {
              cNumber = courtCase.caseNumber;
            }
          } catch (e) { console.warn("لم نتمكن من جلب رقم القضية الفعلي"); }

          setCaseInfo({
            caseNumber: cNumber,
            otherParty: otherPartyName || 'غير مسجل',
            familyId: fId
          });
        } else {
           setCaseInfo(prev => ({ ...prev, caseNumber: 'لا يوجد', otherParty: 'لا يوجد' }));
        }
      } catch (err) {
        console.error("Error fetching case info:", err);
        setCaseInfo(prev => ({ ...prev, caseNumber: 'غير متاح', otherParty: 'غير متاح' }));
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchCaseInfo();
  }, [user?.role]);

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
      
          <ComplaintsHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-1 flex flex-col gap-6">
              <CaseInfoCard caseInfo={caseInfo} isLoadingInfo={isLoadingInfo} />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <ComplaintForm user={user} familyId={caseInfo.familyId} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}