import React from 'react';
import { ChevronRight, Bell } from 'lucide-react';

export default function NotificationsHeader({ navigate, unreadCount }) {
  return (
    <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-5 md:p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="flex items-center gap-4 md:gap-5 relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-white/10 p-2.5 md:p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group shrink-0 border-none outline-none cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <div>
          <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl md:text-2xl font-bold">الإشعارات</h1>
          </div>
          <p className="text-blue-200 text-xs md:text-sm opacity-90 tracking-wider font-bold">جميع الإشعارات والتنبيهات</p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-4 relative z-10">
         {unreadCount > 0 && (
           <span className="bg-red-500 text-white text-[10px] md:text-[11px] font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
             {unreadCount} جديد
           </span>
         )}
         <div className="bg-white/10 p-3 md:p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative">
           <Bell className="w-6 h-6 md:w-8 h-8 text-blue-100" />
         </div>
      </div>
    </div>
  );
}