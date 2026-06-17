import React from 'react';
import { ChevronRight, Wallet } from 'lucide-react';

export default function FatherAlimonyHeader({ navigate }) {
  return (
    <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden shadow-xl gap-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="flex items-center gap-5 relative z-10">
        <button onClick={() => navigate(-1)} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border-none outline-none cursor-pointer">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">إدارة نفقة الأبناء</h1>
          <p className="text-blue-200 text-sm md:text-base opacity-90 font-bold">متابعة وسداد الالتزامات المالية</p>
        </div>
      </div>
      
      <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
         <Wallet className="w-8 h-8 text-blue-100" />
      </div>
    </div>
  );
}