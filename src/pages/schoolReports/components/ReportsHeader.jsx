import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function ReportsHeader() {
  return (
    <div className="bg-[#1e3a8a] text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="flex flex-col z-10 w-full text-right">
        <h1 className="text-2xl font-bold mb-2">التقارير المدرسية</h1>
        <p className="text-blue-200 text-sm font-bold tracking-wide">متابعة الأداء الأكاديمي والتقييمات المدرسية للأبناء</p>
      </div>
      <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
         <GraduationCap className="w-8 h-8 text-blue-100" />
      </div>
    </div>
  );
}