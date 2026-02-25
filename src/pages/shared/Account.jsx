import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  LogOut, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  X, 
  Send, 
  ChevronRight, 
  Briefcase,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// 🚀 استيراد واجهات الاتصال بالسيرفر
import { courtAPI } from '../../services/api';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 🚀 استخدام الـ Context لجلب بيانات المستخدم ودالة تسجيل الخروج
  const [showEditModal, setShowEditModal] = useState(false);

  // 🚀 حالات حفظ بيانات المستخدم الحقيقية
  const [userData, setUserData] = useState({
    name: "جاري التحميل...",
    role: "ولي أمر",
    caseNumber: "جاري التحميل...",
    nationalId: "...",
    phone: "...",
    email: "...",
    address: "..."
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🚀 دالة جلب البيانات من السيرفر
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. جلب بيانات الأسرة
        const familyRes = await courtAPI.getMyFamilies();
        const family = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (!family) {
          throw new Error("لم يتم العثور على ملف أسرة مرتبط بهذا الحساب.");
        }

        // 2. تحديد هل المستخدم أب أم أم لاستخراج البيانات الصحيحة
        const isFather = user?.role === 'father';
        const parentProfile = isFather ? family.father : family.mother;
        const roleLabel = isFather ? "ولي أمر - الأب" : "ولي أمر - الأم";

        // 3. جلب رقم القضية الفعلي
        let caseNum = `FAM-${family.familyId.substring(0,8).toUpperCase()}`; // رقم احتياطي
        try {
          const caseRes = await courtAPI.listCourtCasesByFamily(family.familyId);
          const courtCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
          if (courtCase?.caseNumber) {
            caseNum = courtCase.caseNumber;
          }
        } catch (e) {
          console.warn("لم نتمكن من جلب رقم القضية الفعلي");
        }

        // 4. تعيين البيانات في الـ State
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
        setError(err.message || "حدث خطأ أثناء تحميل البيانات الشخصية.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // 🚀 دالة تسجيل الخروج الفعلي
  const handleLogout = () => {
    logout(); // تمسح التوكن من الـ LocalStorage وتصفر الـ Context
    navigate('/parent/login'); // تحول لصفحة الدخول
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      {/* Header (Standard Rounded Blue Header) */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
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
                <h1 className="text-2xl font-bold">الحساب الشخصي</h1>
            </div>
            <p className="text-blue-200 text-sm opacity-90 tracking-wider font-medium">إدارة بياناتك الشخصية</p>
          </div>
        </div>

        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
           <User className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* 🚀 إظهار حالة التحميل أو الخطأ */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 text-blue-800">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">جاري تحميل البيانات...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Grid Layout (يظهر فقط عند انتهاء التحميل بنجاح) */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Right Column (Profile) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-[#1e3a8a]" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{userData.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{userData.role}</p>
              <div className="bg-gray-50 text-gray-600 text-xs font-bold px-4 py-1.5 rounded-full border border-gray-200 font-mono">
                قضية رقم: {userData.caseNumber}
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-3">
              <Shield className="w-5 h-5 text-gray-400 shrink-0" />
              <div className="text-right">
                <h4 className="text-gray-700 font-bold text-[13px]">نظام آمن ومشفر</h4>
                <p className="text-gray-400 text-[10px]">جميع بياناتك محمية وفقاً لمعايير الأمن السيبراني المصرية</p>
              </div>
            </div>

            {/* 🚀 Logout Button (مربوط بالـ Context) */}
            <button 
              onClick={handleLogout}
              className="border border-red-200 text-red-500 rounded-xl py-3 w-full flex justify-center items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-sm shadow-sm"
            >
              <LogOut className="w-4 h-4 rtl:-scale-x-100" />
              تسجيل الخروج
            </button>

            {/* Version */}
            <p className="text-center text-gray-400 text-[10px] mt-2">
              نظام إدارة محكمة الأسرة - الإصدار 1.0.0
            </p>

          </div>

          {/* Left Column (Personal Info) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col h-full">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1e3a8a]" />
                المعلومات الشخصية
              </h2>

              <div className="flex flex-col gap-1 flex-1">
                
                {/* National ID */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">الرقم القومي</p>
                    <p className="text-gray-800 font-bold font-mono">{userData.nationalId}</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-full shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">رقم الجوال</p>
                    <p className="text-gray-800 font-bold font-mono" dir="ltr">{userData.phone}</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-full shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">البريد الإلكتروني</p>
                    <p className="text-gray-800 font-bold font-mono text-sm leading-tight text-right w-full">{userData.email}</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-full shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">العنوان</p>
                    <p className="text-gray-800 font-bold text-sm leading-tight">{userData.address}</p>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-full shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

              </div>

              {/* Edit Button */}
              <button 
                onClick={() => setShowEditModal(true)}
                className="mt-6 border border-[#1e3a8a] text-[#1e3a8a] py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors font-bold w-full"
              >
                <Edit className="w-4 h-4" />
                طلب تعديل البيانات
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Edit Data Modal Overly */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          {/* Modal Box */}
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2">
                <Edit className="w-5 h-5" />
                طلب تعديل البيانات
              </h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="text-sm text-gray-500 font-bold block mb-2">سبب طلب التعديل والتفاصيل</label>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm mb-2"
                placeholder="يرجى كتابة البيانات المراد تعديلها (مثال: تم تغيير رقم الهاتف إلى 011...)"
                required
              />
              <div className="bg-gray-100 text-gray-500 text-[11px] p-3 rounded-xl mt-4 text-center font-medium border border-gray-200">
                سيتم إرسال هذا الطلب كشكوى/طلب لموظفي المحكمة لمراجعته وتحديث بياناتك الرسمية.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  // هنا يمكن مستقبلاً ربطها بـ API الشكاوى لإرسال الطلب
                  alert("تم إرسال طلب التعديل بنجاح للمراجعة."); 
                  setShowEditModal(false); 
                }}
                className="flex-1 bg-[#4760a0] hover:bg-[#1e3a8a] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 rtl:-scale-x-100" />
                إرسال الطلب
              </button>
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-gray-300 bg-white text-gray-700 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}