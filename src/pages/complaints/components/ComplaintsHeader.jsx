import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';

export default function ComplaintsHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="flex items-center gap-5 relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group border-none outline-none cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <div>
          <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">تقديم شكوى</h1>
          </div>
          <p className="text-blue-200 text-sm opacity-90 tracking-wider">تقديم شكوى جديدة للمراجعة</p>
        </div>
      </div>

      <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
         <MessageSquare className="w-8 h-8 text-blue-100" />
      </div>
    </div>
  );
}