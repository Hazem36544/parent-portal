import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { 
  Home, 
  CalendarDays, 
  DollarSign, 
  GraduationCap, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut 
} from 'lucide-react';

// ✅ 1. استلام Props التجاوب
export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ 2. سحب دالة الخروج ورقم الإشعارات الموحد (Real-time) من الكونتكست
  const { logout, unreadCount } = useAuth(); 
  
  const [logoError, setLogoError] = useState(false);
  
  // ✅ تم إزالة "تفاصيل القضية" لتوفير المساحة ومنع مشاكل العرض
  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent/dashboard' },
    { id: 'visits', label: 'الزيارات', icon: CalendarDays, path: '/parent/visits' },
    { id: 'alimony', label: 'النفقة', icon: DollarSign, path: '/parent/alimony' },
    { id: 'school-reports', label: 'التقارير المدرسية', icon: GraduationCap, path: '/parent/school-reports' },
    { id: 'complaints', label: 'تقديم شكوى', icon: MessageSquare, path: '/parent/complaints' },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, path: '/parent/notifications' },
    { id: 'account', label: 'الحساب', icon: User, path: '/parent/account' }
  ];

  const handleLogout = () => {
    // ✅ إغلاق القائمة في الموبايل قبل الخروج
    if (setIsOpen) setIsOpen(false); 
    logout(); 
    navigate('/parent/login', { replace: true });
  };

  return (
    <div 
      // ✅ إضافة كلاسات التجاوب والانزلاق
      className={`fixed right-0 top-0 h-screen w-32 bg-[#1e3a8a] text-white flex flex-col items-center py-6 shadow-2xl z-50 font-sans rounded-l-[2.5rem] border-l border-white/5 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`} 
      dir="rtl"
    >
      
      {/* --- 1. الشعار --- */}
      <div className="mb-6 flex-shrink-0 w-full flex justify-center px-2">
        {!logoError ? (
          <img 
            src={`${import.meta.env.BASE_URL}logo.svg`} 
            alt="شعار" 
            className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
            onError={() => setLogoError(true)} 
          />
        ) : (
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#1e3a8a] font-extrabold text-xl shadow-lg border-2 border-blue-200">
            وصال
          </div>
        )}
      </div>

      {/* --- 2. الأيقونات والنصوص --- */}
      <nav className="flex-1 w-full px-3 flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          
          return (
            <button
              key={item.id}
              onClick={() => {
                // ✅ التوجيه وإغلاق القائمة
                navigate(item.path);
                if (setIsOpen) setIsOpen(false);
              }}
              className={`
                w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 group outline-none border-none relative cursor-pointer
                ${isActive 
                  ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' 
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {/* حاوية الأيقونة لوضع النقطة الحمراء فوقها */}
              <div className="relative inline-flex mb-0.5">
                <Icon className="w-7 h-7 transition-colors duration-300" strokeWidth={2.5} />
                
                {/* ✅ نقطة الإشعارات الحمراء تعتمد الآن على الكونتكست */}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className={`absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 px-0.5 shadow-sm
                    ${isActive ? 'border-white' : 'border-[#1e3a8a]'}
                  `}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              
              <span className="text-[11px] font-bold tracking-wide text-center leading-tight whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* --- 3. خروج --- */}
      <div className="mt-auto pt-4 w-full px-3 pb-2">
        <button
          onClick={handleLogout} 
          className="w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 border border-transparent hover:border-red-500/20 outline-none cursor-pointer"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>

    </div>
  );
}