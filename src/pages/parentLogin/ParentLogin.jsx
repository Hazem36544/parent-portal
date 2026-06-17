import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { authAPI } from '../../services/api'; 
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorHandler';

// 🚀 الاستيرادات من مجلد المكونات الجديد
import { parseJwt } from './components/ParentLoginHelpers';
import { ParentHeader, ParentFooter } from './components/ParentLayout';
import ParentLoginForm from './components/ParentLoginForm';
import ParentChangePasswordForm from './components/ParentChangePasswordForm';
import ParentSuccessTransition from './components/ParentSuccessTransition';

export default function ParentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [step, setStep] = useState('login');

  const [tempToken, setTempToken] = useState(null);
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (sessionStorage.getItem('force_change_password') === 'true') {
      setStep('change_password');
      setPassword('');
      setError('يرجى تغيير كلمة المرور المؤقتة قبل الدخول للداشبورد');
    } else {
      sessionStorage.removeItem('wesal_parent_token');
      sessionStorage.removeItem('wesal_parent_user');
      sessionStorage.removeItem('force_change_password');
    }
  }, []);

  const validateLoginForm = () => {
    let errors = {};
    let isValid = true;
    
    if (!nationalId.trim() || nationalId.length !== 14 || !/^\d{14}$/.test(nationalId)) {
      errors.nationalId = "الرقم القومي يجب أن يتكون من 14 رقماً بالضبط";
      isValid = false;
    }
    
    if (!password.trim()) {
      errors.password = "يرجى إدخال كلمة المرور";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateLoginForm()) {
        return;
    }

    setIsLoading(true);
    setError('');
    setFormErrors({});

    try {
      const response = await authAPI.loginParent({ nationalId: nationalId.trim(), password: password.trim() });
      const token = response.data.token || response.data.Token || response.data;
      const decodedToken = parseJwt(token);

      const isTemporary = decodedToken?.tmp_pwd === "True" || decodedToken?.tmp_pwd === true || decodedToken?.tmp_pwd === "true";

      if (isTemporary) {
        setTempToken(token);
        setCurrentPassword(password.trim());
        sessionStorage.setItem('force_change_password', 'true');
        setStep('change_password');
        toast('يجب تأمين حسابك بكلمة مرور جديدة قبل الدخول', { icon: '🔒', duration: 4000 });
        return; 
      }

      const actualRole = decodedToken?.parentRole?.toLowerCase() || 'father'; 
      const isMother = actualRole === 'mother';
      const userData = { 
        ...decodedToken,
        nationalId: nationalId.trim(),
        role: actualRole, 
        name: decodedToken?.name || (isMother ? 'حساب الأم' : 'حساب الأب') 
      };

      login(userData, token);
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/parent/dashboard');

    } catch (err) {
      console.error("Login Error:", err);
      const status = err.response?.status;
      const errorDataString = JSON.stringify(err.response?.data || err.message);

      if (status === 403 && (errorDataString.includes('temporary password') || errorDataString.includes('تغيير كلمة المرور'))) {
        setCurrentPassword(password.trim());
        setStep('change_password');
        toast('يجب تأمين حسابك بكلمة مرور جديدة قبل الدخول', { icon: '🔒', duration: 4000 });
        return; 
      }

      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswordChange = () => {
    let errors = {};
    let isValid = true;
    
    if (!currentPassword.trim()) {
      errors.currentPassword = "يرجى إدخال كلمة المرور الحالية";
      isValid = false;
    }
    
    if (!newPassword.trim() || newPassword.length < 6) {
      errors.newPassword = "يجب أن تتكون كلمة المرور من 6 خانات على الأقل";
      isValid = false;
    }
    
    if (!confirmPassword.trim() || newPassword !== confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    
    if (!validatePasswordChange()) {
        return;
    }

    setIsLoading(true);
    setError("");
    setFormErrors({});

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://wesal.runasp.net';
      const response = await fetch(`${baseUrl}/api/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
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
          throw { response: { data: errorData } };
      }

      sessionStorage.removeItem('force_change_password');
      
      setStep('success_transition');

      setTimeout(() => {
        setStep('login');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000); 

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false); 
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      step === 'login' ? handleLogin(e) : handleChangePassword(e);
    }
  };

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (formErrors[fieldName]) {
        setFormErrors(prev => ({...prev, [fieldName]: null}));
    }
  };

  const handleNationalIdChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 14) {
      setNationalId(val);
      if (formErrors.nationalId) {
        setFormErrors(prev => ({...prev, nationalId: null}));
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      dir="rtl"
      style={{
        fontFamily: '"Times New Roman", "Traditional Arabic", serif',
        background: '#F5F5F5'
      }}
    >
      <div className="w-full max-w-[460px]">
        
        <ParentHeader />

        {step === 'login' && (
          <ParentLoginForm 
            nationalId={nationalId}
            password={password}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            error={error}
            formErrors={formErrors}
            handleNationalIdChange={handleNationalIdChange}
            handleInputChange={handleInputChange}
            setPassword={setPassword}
            handleKeyPress={handleKeyPress}
            handleLogin={handleLogin}
          />
        )}

        {step === 'change_password' && (
          <ParentChangePasswordForm 
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            isLoading={isLoading}
            error={error}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleKeyPress={handleKeyPress}
            handleChangePassword={handleChangePassword}
          />
        )}

        {step === 'success_transition' && <ParentSuccessTransition />}

        <ParentFooter />
        
      </div>
    </div>
  );
}