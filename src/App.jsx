import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// 🚀 استيراد الـ AuthProvider والـ Hook الخاص بالذاكرة
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

// 🚀 فصلنا الراوتر في مكون فرعي علشان نقدر نستخدم useAuth (لأن الـ Hook لازم يكون جوه الـ Provider)
function AppRoutes() {
  const { role } = useAuth(); // سحبنا الدور (أب أو أم) من الذاكرة

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/parent/login" replace />} />
        <Route path="/parent/login" element={<ParentLogin />} />

        {/* مجموعة مسارات الآباء (محمية بداخل الـ Layout) */}
        <Route path="/parent" element={<ParentLayout />}>
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