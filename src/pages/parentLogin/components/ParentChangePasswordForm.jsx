import React from 'react';
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const ParentChangePasswordForm = ({
  currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
  showCurrentPassword, setShowCurrentPassword, showNewPassword, setShowNewPassword,
  isLoading, error, formErrors, handleInputChange, handleKeyPress, handleChangePassword
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-in zoom-in-95 duration-300 relative overflow-hidden border-t-4" style={{ borderColor: '#2c5aa0' }}>
    <div className="flex flex-col items-center mb-6 mt-2">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#eef2f7', color: '#2c5aa0' }}>
        <ShieldCheck className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold text-[#2c3e50] mb-2 text-center">تأمين الحساب</h2>
      <p className="text-center text-[#95a5a6] text-sm font-bold">
        يرجى تغيير كلمة المرور المؤقتة بكلمة مرور خاصة بك للمتابعة.
      </p>
    </div>

    <div className="space-y-6">
      
      <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
        <input type="password" name="fake_parent_pwd" autoComplete="current-password" tabIndex="-1" />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-bold flex items-center gap-2 justify-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
          كلمة المرور الحالية
        </label>
        <div className="relative">
          <input
            type="text" 
            name="ws_curr_pass"
            value={currentPassword}
            onChange={handleInputChange(setCurrentPassword, 'currentPassword')}
            placeholder="••••••••"
            autoComplete="off"
            style={{ WebkitTextSecurity: showCurrentPassword ? 'none' : 'disc' }} 
            className={`w-full h-12 pr-4 pl-12 text-sm rounded-lg text-right outline-none transition-all font-mono tracking-widest border
              ${formErrors.currentPassword ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
            `}
            dir="ltr"
            disabled={isLoading}
            onKeyDown={handleKeyPress}
          />
          <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] focus:outline-none border-none bg-transparent cursor-pointer">
            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {formErrors.currentPassword && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.currentPassword}</p>}
      </div>

      <div className="relative">
        <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <input
            type="text" 
            name="ws_new_pass"
            value={newPassword}
            onChange={handleInputChange(setNewPassword, 'newPassword')}
            placeholder="••••••••"
            autoComplete="off"
            style={{ WebkitTextSecurity: showNewPassword ? 'none' : 'disc' }}
            className={`w-full h-12 pr-4 pl-12 text-sm rounded-lg text-right outline-none transition-all font-mono tracking-widest border
              ${formErrors.newPassword ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
            `}
            dir="ltr"
            disabled={isLoading}
            onKeyDown={handleKeyPress}
          />
          <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95a5a6] hover:text-[#2c3e50] focus:outline-none border-none bg-transparent cursor-pointer">
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {formErrors.newPassword && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.newPassword}</p>}
      </div>

      <div className="relative">
        <label className="block mb-2 text-[#2c3e50] font-bold text-sm text-right">
          تأكيد كلمة المرور الجديدة
        </label>
        <div className="relative">
          <input
            type="text" 
            name="ws_conf_pass"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
            placeholder="••••••••"
            autoComplete="off"
            style={{ WebkitTextSecurity: showNewPassword ? 'none' : 'disc' }} 
            className={`w-full h-12 px-4 text-sm rounded-lg text-right outline-none transition-all font-mono tracking-widest border
              ${formErrors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400' : 'bg-[#F8F9FA] border-[#E1E8ED] focus:border-[#2c5aa0] focus:ring-1 focus:ring-[#2c5aa0]'}
            `}
            dir="ltr"
            disabled={isLoading}
            onKeyDown={handleKeyPress}
          />
        </div>
        {formErrors.confirmPassword && <p className="absolute -bottom-5 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.confirmPassword}</p>}
      </div>

      <button
        onClick={handleChangePassword}
        disabled={isLoading}
        className="w-full h-12 text-base font-bold rounded-lg mt-8 flex items-center justify-center gap-2 border-none transition-all text-white outline-none"
        style={{
          background: isLoading ? '#95a5a6' : '#2c5aa0',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
        ) : (
          <><Lock className="w-4 h-4" /> حفظ وتأمين الحساب</>
        )}
      </button>
    </div>
  </div>
);

export default ParentChangePasswordForm;