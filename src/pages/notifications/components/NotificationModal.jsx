import React from 'react';
import { X, Info } from 'lucide-react';
import { getNotificationStyle, formatExactDateTime } from './NotificationsHelpers';

export default function NotificationModal({ selectedNotification, setSelectedNotification }) {
  if (!selectedNotification) return null;

  const style = getNotificationStyle(selectedNotification.type);
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-[95vw] md:max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className={`p-5 md:p-6 flex items-center justify-between ${style.bg} border-b border-gray-100`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-xl shadow-sm ${style.color}`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-base md:text-lg">
              {style.title}
            </h3>
          </div>
          <button 
            onClick={() => setSelectedNotification(null)}
            className="bg-white/50 hover:bg-white text-gray-500 p-1.5 md:p-2 rounded-full transition-colors shadow-sm shrink-0 border-none outline-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 md:p-8 flex flex-col gap-5 md:gap-6">
          <div className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100">
            <p className="text-gray-700 text-xs md:text-sm leading-relaxed font-bold" dir="auto" style={{ wordBreak: 'break-word' }}>
              {selectedNotification.content}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-bold px-2">
               <Info className="w-3 h-3 md:w-4 md:h-4" />
               <span>تاريخ الإشعار</span>
            </div>
            <div className="bg-blue-50/50 text-blue-800 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border border-blue-100 text-xs md:text-sm font-bold">
              {/* ✅ عرض التاريخ والوقت الدقيق */}
              {formatExactDateTime(selectedNotification.sentAt)}
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 pt-0 mt-auto">
          <button 
            onClick={() => setSelectedNotification(null)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 md:py-3.5 rounded-xl transition-colors text-sm md:text-base border-none outline-none cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}