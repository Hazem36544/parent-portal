import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import { Toaster } from 'react-hot-toast'; 
import { Loader2 } from 'lucide-react'; 

// المكونات الأساسية 
import ScrollToTop from './components/ScrollToTop';
import './App.css';

// ✅ تطبيق التحميل الديناميكي (Lazy Loading) للصفحات
const ParentLogin = lazy(() => import('./pages/parentLogin/ParentLogin'));
const ParentLayout = lazy(() => import('./layouts/ParentLayout'));
const ParentDashboard = lazy(() => import('./pages/parentDashboard/ParentDashboard'));
const SchoolReports = lazy(() => import('./pages/schoolReports/SchoolReports'));
const CaseDetails = lazy(() => import('./pages/caseDetails/CaseDetails')); 
const Complaints = lazy(() => import('./pages/complaints/Complaints'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const Account = lazy(() => import('./pages/account/Account'));

// ✅ ملف الزيارات المدمج
const Visits = lazy(() => import('./pages/visits/Visits'));

// ✅ العودة لاستيراد ملفات النفقة المنفصلة الأصلية
const MotherAlimony = lazy(() => import('./pages/motherAlimony/MotherAlimony'));
const FatherAlimony = lazy(() => import('./pages/fatherAlimony/FatherAlimony'));

// ✅ مكون حماية المسارات
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="text-[#1e3a8a] font-bold text-lg">جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/parent/login" replace />;
  }

  return children;
};

// 🚀 الراوتر
function AppRoutes() {
  const { role, isAuthenticated, isLoading } = useAuth(); 
  
  const needsPasswordChange = sessionStorage.getItem('force_change_password') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
        <span className="text-[#1e3a8a] font-bold text-lg">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center font-sans" dir="rtl">
          <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] mb-4" />
          <span className="text-[#1e3a8a] font-bold text-lg">جاري تحميل الشاشة...</span>
        </div>
      }>
        <Routes>
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

          <Route 
            path="/parent" 
            element={
              <ProtectedRoute>
                <ParentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* --- المسارات المشتركة --- */}
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="school-reports" element={<SchoolReports />} />
            <Route path="case-details" element={<CaseDetails />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="account" element={<Account />} />

            {/* مسار الزيارات الموحد */}
            <Route path="visits" element={<Visits />} />

            {/* ✅ العودة لتوجيه مسار النفقة ذكياً بناءً على دور الحساب الحالي */}
            <Route 
              path="alimony" 
              element={role === 'father' ? <FatherAlimony /> : <MotherAlimony />} 
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

// 🚀 تغليف التطبيق بالكامل
function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: '"Times New Roman", "Traditional Arabic", serif',
            fontWeight: 'bold',
            borderRadius: '9999px', 
            padding: '12px 24px',
            direction: 'rtl',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          },
          success: {
            style: {
              background: '#ECFDF5', 
              color: '#065F46',      
              border: '1px solid #A7F3D0',
            },
            iconTheme: {
              primary: '#10B981',    
              secondary: '#FFFFFF',
            },
          },
          error: {
            style: {
              background: '#FEF2F2', 
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }} 
      />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;