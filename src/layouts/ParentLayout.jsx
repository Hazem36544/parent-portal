import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function ParentLayout() {
  // 🚀 تم حذف سطور الحماية والـ Navigate من هنا تماماً!
  // لأن الـ ProtectedRoute اللي عملناه في App.jsx بيقوم بالواجب وبيفحص الـ sessionStorage بشكل سليم قبل ما يفتح الملف ده أصلاً.

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-right relative overflow-x-hidden" dir="rtl">
      
      {/* السايد بار الثابت */}
      <Sidebar />
      
      {/* حاوية المحتوى الرئيسية */}
      <div className="mr-32 min-h-screen flex flex-col">
        
        {/* منطقة عرض الصفحات (Outlet) المتغيرة (الداشبورد، الزيارات، النفقة، إلخ) */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}