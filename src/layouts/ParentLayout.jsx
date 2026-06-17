import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
// ✅ 1. استيراد useAuth بدلاً من الـ API
import { useAuth } from '../context/AuthContext';

export default function ParentLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ✅ 2. جلب unreadCount من الكونتكست مباشرة
  const { unreadCount } = useAuth();

  // تم حذف الـ useEffect والـ State القديمة لأن الكونتكست بيتكفل بكل شيء ويحدث الرقم لحظياً

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-right" dir="rtl">
      
      {/* 📱 Navbar الموبايل */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e3a8a] text-white z-40 flex items-center px-4 shadow-md justify-between">
        <div className="flex items-center gap-3">
          {/* ✅ زر البرجر مع دائرة الإشعارات */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border-none outline-none relative cursor-pointer"
          >
            <Menu className="w-6 h-6" />
            
            {/* ✅ نقطة الإشعارات الحمراء (تعتمد على الكونتكست الآن) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#1e3a8a] px-0.5 shadow-sm">
                {unreadCount > 9 ? '!' : unreadCount}
              </span>
            )}
          </button>
          <span className="font-bold text-lg tracking-wide">بوابة الآباء</span>
        </div>
        
        <img 
          src={`${import.meta.env.BASE_URL}logo.svg`} 
          alt="شعار وصال" 
          className="w-10 h-10 object-contain drop-shadow-md"
          onError={(e) => { e.target.src = 'https://placehold.co/40x40/png?text=Logo'; }}
        />
      </div>

      {/* 📋 القائمة الجانبية */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* 🌑 Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 📄 منطقة المحتوى الرئيسي */}
      <div className="flex-1 w-full overflow-y-auto pt-16 md:pt-0 md:pr-32 transition-all duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <main className="w-full max-w-7xl mx-auto p-4 md:p-8">
            <Outlet /> 
        </main>
      </div>
      
    </div>
  );
}