import React from 'react';

export default function DashboardHeader({ isFatherRole, displayName }) {
  const roleName = isFatherRole ? 'ولي أمر - الأب' : 'ولي أمر - الأم';
  const themeColor = isFatherRole ? 'bg-[#1e3a8a]' : 'bg-[#9d174d]'; 
  const badgeColor = isFatherRole ? 'bg-blue-800/80 text-blue-100' : 'bg-pink-800/80 text-pink-100';
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`${themeColor} text-white rounded-[2rem] p-6 md:p-8 flex flex-row justify-between items-center shadow-lg relative overflow-hidden gap-4 transition-colors duration-500`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="flex flex-col z-10">
        <p className="text-white/80 text-sm mb-1 font-medium">مرحباً بك،</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">{displayName}</h1>
        <div className="flex items-center gap-2">
          <span className={`${badgeColor} text-xs px-3 py-1 rounded-lg font-medium`}>{roleName}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white/10 p-3 md:px-5 md:py-3 rounded-2xl backdrop-blur-md border border-white/20 z-10">
        <div className="flex flex-col text-center md:text-right w-full">
          <span className="text-white/80 text-xs mb-0.5">تاريخ اليوم</span>
          <span className="font-bold text-sm md:text-base">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}