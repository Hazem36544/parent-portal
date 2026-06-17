import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { getNotificationStyle, formatExactDateTime } from './NotificationsHelpers';

export default function NotificationsList({ notifications, visibleCount, setVisibleCount, handleNotificationClick }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {notifications.length > 0 ? (
          notifications.slice(0, visibleCount).map((notification) => {
            const style = getNotificationStyle(notification.type);
            const Icon = style.icon;
            const isUnread = notification.status !== 'Read' && notification.status !== 'read';

            return (
              <div 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white shadow-sm border ${isUnread ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-100 opacity-80'} rounded-2xl p-4 md:p-6 flex items-start gap-4 relative hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1`}
              >
                {isUnread && (
                  <span className="absolute top-3 right-3 md:top-4 md:right-4 w-3 h-3 bg-red-600 rounded-full animate-pulse shrink-0 shadow-sm" title="غير مقروء"></span>
                )}
                
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <h3 className={`text-sm truncate pr-2 ${isUnread ? 'text-gray-900 font-extrabold' : 'text-gray-700 font-bold'}`}>
                     {style.title}
                  </h3>
                  
                  <p className={`text-xs leading-relaxed line-clamp-2 break-words mt-1 ${isUnread ? 'text-gray-700 font-bold' : 'text-gray-500 font-medium'}`} dir="auto">
                    {notification.content}
                  </p>
                  
                  {/* ✅ عرض التاريخ والوقت الدقيق */}
                  <span className="text-gray-400 text-[10px] mt-1 font-bold">
                    {formatExactDateTime(notification.sentAt)}
                  </span>
                </div>

                <div className={`p-2.5 md:p-3 rounded-2xl shrink-0 transition-colors ${isUnread ? style.bg.replace('50', '100') : style.bg}`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${style.color}`} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-bold text-lg text-gray-500">لا توجد إشعارات حالياً</p>
          </div>
        )}
      </div>

      {visibleCount < notifications.length && (
        <div className="flex justify-center mt-4 animate-in fade-in">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-8 py-3.5 bg-white border-2 border-blue-100 text-[#1e3a8a] rounded-2xl font-bold shadow-sm hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-center gap-2 outline-none active:scale-95 border-none"
          >
            <ChevronDown className="w-5 h-5" /> عرض المزيد من الإشعارات
          </button>
        </div>
      )}
    </>
  );
}