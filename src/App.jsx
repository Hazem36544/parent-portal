import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

import ParentLogin from './pages/shared/ParentLogin';
import ParentLayout from './layouts/ParentLayout';
import ParentDashboard from './pages/shared/ParentDashboard';
import SchoolReports from './pages/shared/SchoolReports';
import CaseDetails from './pages/shared/CaseDetails'; 
import Complaints from './pages/shared/Complaints';
import Notifications from './pages/shared/Notifications';
import Account from './pages/shared/Account';

import MotherVisits from './pages/mother/Visits';
import MotherAlimony from './pages/mother/Alimony';
import FatherVisits from './pages/father/Visits';
import FatherAlimony from './pages/father/Alimony';

import ScrollToTop from './components/ScrollToTop';
import './App.css';

// ✅ 1. مكون حماية المسارات (ProtectedRoute) لمنع الدخول بدون جلسة نشطة
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#1e3a8a]">جاري التحقق من الصلاحيات...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/parent/login" replace />;
  }

  return children;
};

// 🚀 فصلنا الراوتر في مكون فرعي علشان نقدر نستخدم useAuth
function AppRoutes() {
  const { role, isAuthenticated, isLoading } = useAuth(); 
  
  // التحقق من أوامر تغيير الباسورد الإجبارية من sessionStorage
  const needsPasswordChange = sessionStorage.getItem('force_change_password') === 'true';

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-[#1e3a8a]">جاري التحميل...</div>;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ✅ 2. توجيه ذكي للمسار الرئيسي */}
        <Route 
          path="/" 
          element={
            (isAuthenticated && !needsPasswordChange) 
              ? <Navigate to="/parent/dashboard" replace /> 
              : <Navigate to="/parent/login" replace />
          } 
        />
        
        <Route 
          path="/parent/login" 
          element={
            (isAuthenticated && !needsPasswordChange) 
              ? <Navigate to="/parent/dashboard" replace /> 
              : <ParentLogin />
          } 
        />

        {/* ✅ 3. حماية مجموعة مسارات الآباء بالكامل بوضعها داخل ProtectedRoute */}
        <Route 
          path="/parent" 
          element={
            <ProtectedRoute>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* --- المسارات المشتركة (نفس الشاشة للطرفين) --- */}
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="school-reports" element={<SchoolReports />} />
          <Route path="case-details" element={<CaseDetails />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />

          {/* 🚀 المسارات الذكية: الرابط واحد، بس الشاشة بتتغير حسب الدور */}
          <Route 
            path="visits" 
            element={role === 'father' ? <FatherVisits /> : <MotherVisits />} 
          />
          <Route 
            path="alimony" 
            element={role === 'father' ? <FatherAlimony /> : <MotherAlimony />} 
          />
        </Route>

        {/* التقاط أي مسار غير معروف وإرجاعه للرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// 🚀 تغليف التطبيق بالكامل بالـ AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;