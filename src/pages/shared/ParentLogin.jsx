import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { authAPI } from '../../services/api'; 

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const ParentLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [step, setStep] = useState('login');
  
  // 🚀 حالة جديدة لحفظ التوكن المؤقت دون تفعيل النظام العام
  const [tempToken, setTempToken] = useState(null);
  
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanNationalId = nationalId.trim();
    const cleanPassword = password.trim();
    
    await executeRealLogin(cleanNationalId, cleanPassword);
  };

  const executeRealLogin = async (id, pass) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authAPI.loginParent({ nationalId: id, password: pass });
      const token = response.data.token || response.data.Token || response.data;
      
      const decodedToken = parseJwt(token);
      console.log("🎉 التوكن بعد فك التشفير:", decodedToken);

      const isTemporary = decodedToken?.tmp_pwd === "True" || decodedToken?.tmp_pwd === true || decodedToken?.tmp_pwd === "true";

      if (isTemporary) {
        // 🚀 التعديل الجوهري: نحفظ التوكن هنا فقط، ولا نستدعي دالة login() الخاصة بالنظام
        setTempToken(token);
        setCurrentPassword(pass);
        setStep('change_password');
        setIsLoading(false);
        return; // نوقف التنفيذ هنا علشان ميروحش للداشبورد
      }

      // إذا لم تكن كلمة المرور مؤقتة (الدخول الطبيعي أو بعد التغيير بنجاح)
      const actualRole = decodedToken?.parentRole?.toLowerCase() || 'father'; 
      const isMother = actualRole === 'mother';
      
      const userData = { 
        ...decodedToken,
        role: actualRole, 
        name: decodedToken?.name || (isMother ? 'حساب الأم' : 'حساب الأب') 
      };

      // 🚀 هنا فقط نفعل الدخول العام ونتوجه للداشبورد
      login(userData, token);
      navigate('/parent/dashboard');

    } catch (error) {
      console.error("Login Error:", error);
      
      const status = error.response?.status;
      const errorDataString = JSON.stringify(error.response?.data || error.message);

      if (status === 403 || errorDataString.includes('temporary password')) {
        setCurrentPassword(pass);
        setStep('change_password');
        setIsLoading(false);
        return; 
      }

      const serverError = error.response?.data;
      if (serverError && Array.isArray(serverError.errors) && serverError.errors.length > 0) {
         setErrorMessage(serverError.errors[0].description || 'خطأ في التحقق من البيانات');
      } else if (serverError && serverError.errors) {
         const firstErrorKey = Object.keys(serverError.errors)[0];
         setErrorMessage(serverError.errors[firstErrorKey][0]);
      } else {
         setErrorMessage(error.message || 'الرقم القومي أو كلمة المرور غير صحيحة');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 🚀 استخدام fetch مباشر لتمرير التوكن المؤقت في الهيدر، لتفادي مشاكل الـ Router
      const response = await fetch('https://wesal.runasp.net/api/users/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}` // نستخدم التوكن المؤقت هنا
        },
        body: JSON.stringify({
          nationalId: nationalId.trim(),
          oldPassword: currentPassword, 
          newPassword: newPassword
        })
      });

      if (!response.ok) {
         let errorData;
         try { errorData = await response.json(); } 
         catch(err) { errorData = { detail: "حدث خطأ غير متوقع أثناء تغيير كلمة المرور" }; }
         throw { response: { data: errorData } }; // لمحاكاة شكل خطأ Axios
      }

      // 🚀 بعد نجاح التغيير، نعمل تسجيل دخول بالباسورد الجديدة عشان ناخد التوكن الدائم
      await executeRealLogin(nationalId.trim(), newPassword);

    } catch (error) {
      console.error("Change Password Error:", error);
      const serverError = error.response?.data;
      
      if (serverError && Array.isArray(serverError.errors) && serverError.errors.length > 0) {
         setErrorMessage(serverError.errors[0].description || 'خطأ في البيانات');
      } else if (serverError && serverError.errors) {
         const firstErrorKey = Object.keys(serverError.errors)[0];
         setErrorMessage(serverError.errors[firstErrorKey][0] || 'خطأ في البيانات');
      } else {
         setErrorMessage(serverError?.detail || serverError?.title || 'حدث خطأ أثناء تغيير كلمة المرور. تأكد من البيانات.');
      }
      setIsLoading(false); 
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans text-right">
      {step === 'login' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 mb-4 flex items-center justify-center overflow-hidden">
               <img 
                 src={`${import.meta.env.BASE_URL}logo.svg`} 
                 alt="شعار محكمة الأسرة" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.target.src = '/logo.svg'; }}
               />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-1">نظام إدارة الاباء</h1>
            <p className="text-gray-500">لم الشمل</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول</h2>
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">الرقم القومي</label>
                <input
                  type="text"
                  placeholder="أدخل الرقم القومي"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 relative">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all pr-4 pl-12"
                    required
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 text-gray-500 hover:text-gray-700 focus:outline-none" disabled={isLoading}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={`w-full text-white font-medium py-3 rounded-full transition-colors mt-6 shadow-md flex justify-center items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-900'}`}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الدخول...
                  </>
                ) : 'تسجيل الدخول'}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'change_password' && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><Lock className="w-8 h-8 text-green-600" /></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">تغيير كلمة المرور</h1>
            <p className="text-gray-500 text-sm">أول تسجيل دخول - يجب تغيير كلمة المرور</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
                <div className="relative flex items-center">
                  <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] pr-4 pl-12 font-mono text-left direction-ltr" required disabled={isLoading} dir="ltr" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-4 text-gray-500 focus:outline-none">{showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
                <div className="relative flex items-center">
                  <input type={showNewPassword ? 'text' : 'password'} placeholder="أدخل كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] pr-4 pl-12 font-mono text-left direction-ltr" required disabled={isLoading} dir="ltr" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-4 text-gray-500 focus:outline-none">{showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
                <div className="relative flex items-center">
                  <input type={showConfirmPassword ? 'text' : 'password'} placeholder="أعد إدخال كلمة المرور الجديدة" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] pr-4 pl-12 font-mono text-left direction-ltr" required disabled={isLoading} dir="ltr" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 text-gray-500 focus:outline-none">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mt-6 border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">متطلبات كلمة المرور:</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500 ml-2" /> 8 أحرف على الأقل</li>
                  <li className="flex items-center text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500 ml-2" /> أحرف كبيرة وصغيرة</li>
                  <li className="flex items-center text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-green-500 ml-2" /> رقم واحد على الأقل</li>
                </ul>
              </div>
              <button type="submit" disabled={isLoading} className={`w-full text-white font-medium py-3 rounded-full mt-6 shadow-md flex justify-center items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-900'}`}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التحديث...
                  </>
                ) : 'تأكيد التغيير'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLogin;