import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { 
  Home, 
  CalendarDays, 
  DollarSign, 
  GraduationCap, 
  FileText, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ سحب دالة logout من الكونتكست اللي بتفضي الـ sessionStorage
  const { logout } = useAuth(); 
  
  const [logoError, setLogoError] = useState(false);
  
  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent/dashboard' },
    { id: 'visits', label: 'الزيارات', icon: CalendarDays, path: '/parent/visits' },
    { id: 'alimony', label: 'النفقة', icon: DollarSign, path: '/parent/alimony' },
    { id: 'school-reports', label: 'التقارير المدرسية', icon: GraduationCap, path: '/parent/school-reports' },
    { id: 'case-details', label: 'تفاصيل القضية', icon: FileText, path: '/parent/case-details' },
    { id: 'complaints', label: 'تقديم شكوى', icon: MessageSquare, path: '/parent/complaints' },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, path: '/parent/notifications' },
    { id: 'account', label: 'الحساب', icon: User, path: '/parent/account' }
  ];

  // ✅ التعديل الآمن والناعم لتسجيل الخروج
  const handleLogout = () => {
    // 1. مسح البيانات من الـ sessionStorage للتابة الحالية فقط عبر الكونتكست
    logout(); 
    
    // 2. التوجيه السلس لصفحة اللوجين (بدون ريفريش عنيف يكسر تجربة الـ SPA)
    navigate('/parent/login', { replace: true });
  };

  return (
    <div 
      className="fixed right-0 top-0 h-screen w-32 bg-[#1e3a8a] text-white flex flex-col items-center py-6 shadow-2xl z-50 font-sans rounded-l-[2rem] border-l border-white/5 transition-all duration-300" 
      dir="rtl"
    >
      
      {/* --- 1. الشعار --- */}
      <div className="mb-6 flex-shrink-0 w-full flex justify-center">
        {!logoError ? (
          <img 
            src={`${import.meta.env.BASE_URL}logo.svg`} 
            alt="شعار" 
            className="w-24 h-24 object-contain hover:scale-110 transition-transform duration-300 drop-shadow-xl"
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
              onClick={() => navigate(item.path)}
              className={`
                w-full py-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' 
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className="w-6 h-6 transition-colors duration-300 mb-0.5" />
              
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
          className="w-full py-3 flex flex-col items-center justify-center gap-1 rounded-2xl text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>

    </div>
  );
}