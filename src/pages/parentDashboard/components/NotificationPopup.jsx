import React from 'react';
import { X, Info } from 'lucide-react';
import { getNotificationStyle } from './DashboardHelpers';

export default function NotificationPopup({ selectedNotification, setSelectedNotification }) {
  if (!selectedNotification) return null;
  const style = getNotificationStyle(selectedNotification.type);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className={`p-5 flex items-center justify-between ${style.bg} border-b border-gray-100`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white rounded-xl shadow-sm ${style.color}`}>
              {React.createElement(style.icon, { className: "w-5 h-5" })}
            </div>
            <h3 className="font-bold text-gray-800 text-base">{style.title}</h3>
          </div>
          <button onClick={() => setSelectedNotification(null)} className="bg-white/50 hover:bg-white text-gray-500 p-1.5 rounded-full transition-colors border-none outline-none cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed font-bold">{selectedNotification.content}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold px-2"><Info className="w-4 h-4" /><span>تاريخ الإشعار</span></div>
            <div className="bg-blue-50/50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100 text-sm font-bold" dir="ltr">
              {new Date(selectedNotification.sentAt).toLocaleString('ar-EG')}
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 mt-auto">
          <button onClick={() => setSelectedNotification(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-colors border-none outline-none cursor-pointer">إغلاق</button>
        </div>
      </div>
    </div>
  );
}