import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import { authAPI } from '../../services/api'; 

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // إضافة علامات التكملة لتجنب خطأ InvalidCharacterError
    let paddedBase64 = base64;
    while (paddedBase64.length % 4 !== 0) {
      paddedBase64 += "=";
    }
    const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
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
  
  // حالة لحفظ التوكن المؤقت دون تفعيل النظام العام
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

  // =========================================================================
  // التنظيف الذكي والتقاط أمر التغيير الإجباري (باستخدام sessionStorage)
  // =========================================================================
  useEffect(() => {
    if (sessionStorage.getItem('force_change_password') === 'true') {
      setStep('change_password');
      setPassword('');
      setErrorMessage('يرجى تغيير كلمة المرور المؤقتة قبل الدخول');
    } else {
      // تنظيف التابة الحالية فقط
      sessionStorage.removeItem('wesal_parent_token');
      sessionStorage.removeItem('wesal_parent_user');
      sessionStorage.removeItem('force_change_password');
    }
  }, []);

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
        // نحفظ التوكن هنا فقط، ولا نستدعي دالة login() الخاصة بالنظام
        setTempToken(token);
        setCurrentPassword(pass);
        setStep('change_password');
        setIsLoading(false);
        return; 
      }

      // إذا لم تكن كلمة المرور مؤقتة (الدخول الطبيعي أو بعد التغيير بنجاح)
      const actualRole = decodedToken?.parentRole?.toLowerCase() || 'father'; 
      const isMother = actualRole === 'mother';
      
      const userData = { 
        ...decodedToken,
        role: actualRole, 
        name: decodedToken?.name || (isMother ? 'حساب الأم' : 'حساب الأب') 
      };

      // 🚀 تفعيل الدخول العام
      login(userData, token);
      
      // ✅ التعديل هنا: التوجيه للمسار المحمي الصحيح
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
         setErrorMessage(serverError?.detail || serverError?.title || 'الرقم القومي أو كلمة المرور غير صحيحة');
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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://wesal.runasp.net';
      
      // 🚀 استخدام fetch مباشر لتمرير التوكن المؤقت في الهيدر، لتفادي مشاكل الـ Router
      const response = await fetch(`${baseUrl}/api/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}` // نستخدم التوكن المؤقت هنا
        },
        body: JSON.stringify({
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

      // تنظيف أمر التغيير الإجباري بعد النجاح
      sessionStorage.removeItem('force_change_password');

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
                 onError={(e) => { e.target.src = 'https://placehold.co/128x128/png?text=Wisal'; }}
               />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-1">نظام إدارة الآباء</h1>
            <p className="text-gray-500">بوابة وصال - لم الشمل</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 w-full border border-gray-100">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول</h2>
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-start gap-2 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
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
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all font-mono"
                  required
                  disabled={isLoading}
                  dir="ltr"
                  style={{ textAlign: 'right' }}
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
                    className="w-full py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all pr-4 pl-12 font-mono text-left"
                    required
                    disabled={isLoading}
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 text-gray-400 hover:text-[#1e3a8a] focus:outline-none transition-colors" disabled={isLoading}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3.5 rounded-xl transition-all mt-6 shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 active:scale-[0.98] ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-900'}`}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
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
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4"><Lock className="w-8 h-8 text-[#1e3a8a]" /></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">تأمين الحساب</h1>
            <p className="text-gray-500 text-sm">يرجى تغيير كلمة المرور المؤقتة قبل الدخول</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full border border-gray-100">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-start gap-2 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
                <div className="relative flex items-center">
                  <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] pr-4 pl-12 font-mono text-left transition-all" required disabled={isLoading} dir="ltr" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-4 text-gray-400 hover:text-[#1e3a8a] focus:outline-none">{showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
                <div className="relative flex items-center">
                  <input type={showNewPassword ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] pr-4 pl-12 font-mono text-left transition-all" required disabled={isLoading} dir="ltr" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-4 text-gray-400 hover:text-[#1e3a8a] focus:outline-none">{showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">تأكيد كلمة المرور</label>
                <div className="relative flex items-center">
                  <input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] pr-4 pl-12 font-mono text-left transition-all" required disabled={isLoading} dir="ltr" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-4 text-gray-400 hover:text-[#1e3a8a] focus:outline-none">{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <button type="submit" disabled={isLoading || !newPassword || !confirmPassword} className={`w-full text-white font-bold py-3.5 rounded-xl transition-all mt-8 shadow-lg flex justify-center items-center gap-2 active:scale-[0.98] ${isLoading || !newPassword || !confirmPassword ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-[#1e3a8a] hover:bg-blue-900 shadow-blue-900/20'}`}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : 'تأكيد وحفظ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentLogin;