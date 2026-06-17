import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courtAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler';

// استيراد المكونات الفرعية الموحدة
import AccountHeader from './components/AccountHeader';
import ProfileCard from './components/ProfileCard';
import BasicInfo from './components/BasicInfo';
import SecurityBanner from './components/SecurityBanner';

export default function Account() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({
    name: "جاري التحميل...",
    role: "ولي أمر",
    caseNumber: "جاري التحميل...",
    nationalId: "...",
    phone: "...",
    email: "...",
    address: "..."
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const familyRes = await courtAPI.getMyFamilies();
        const family = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (!family) {
          throw new Error("لم يتم العثور على ملف أسرة مرتبط بهذا الحساب.");
        }

        const isFather = user?.role === 'father';
        const parentProfile = isFather ? family.father : family.mother;
        const roleLabel = isFather ? "ولي أمر - الأب" : "ولي أمر - الأم";

        let caseNum = `FAM-${family.familyId.substring(0,8).toUpperCase()}`;
        try {
          const caseRes = await courtAPI.listCourtCasesByFamily(family.familyId);
          const courtCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
          if (courtCase?.caseNumber) {
            caseNum = courtCase.caseNumber;
          }
        } catch (e) {
          console.warn("لم نتمكن من جلب رقم القضية الفعلي");
        }

        if (parentProfile) {
          setUserData({
            name: parentProfile.fullName || "غير مسجل",
            role: roleLabel,
            caseNumber: caseNum,
            nationalId: parentProfile.nationalId || "غير مسجل",
            phone: parentProfile.phone || "غير مسجل",
            email: parentProfile.email || "غير مسجل",
            address: parentProfile.address || "غير مسجل"
          });
        }

      } catch (err) {
        console.error("خطأ في جلب بيانات الحساب:", err);
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleLogout = () => {
    logout();
    navigate('/parent/login');
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] text-[#1e3a8a] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري تحميل بيانات الحساب...</p>
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

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`px-4 md:px-8 pb-8 pt-0 md:pt-2 w-full transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full">
          
          <AccountHeader />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ProfileCard 
                userData={userData} 
                onLogout={handleLogout} 
              />
            </div>

            <div className="lg:col-span-2">
              <BasicInfo userData={userData} />
            </div>
          </div>

          <SecurityBanner />

        </div>
      </div>
    </div>
  );
}