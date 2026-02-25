import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext'; // 🚀 استيراد الـ Hook

export default function ParentLayout() {
  const { role } = useAuth(); // 🚀 قراءة بيانات المستخدم (أو التوكن)
  const token = localStorage.getItem('wesal_parent_token'); // أو حسب ما بتخزنه في الـ login

  // 🚀 لو مفيش توكن أو المستخدم مش موجود، اطرده لصفحة الدخول فوراً
  if (!token) {
    return <Navigate to="/parent/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-right relative overflow-x-hidden" dir="rtl">
      
      {/* السايد بار الثابت */}
      <Sidebar />
      
      {/* حاوية المحتوى الرئيسية */}
      <div className="mr-32 min-h-screen flex flex-col">
        
        {/* منطقة عرض الصفحات (Outlet) */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}