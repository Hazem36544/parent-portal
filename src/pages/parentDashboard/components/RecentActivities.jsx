import React from 'react';
import { Bell } from 'lucide-react';
import { getNotificationStyle, formatExactDate } from './DashboardHelpers';

export default function RecentActivities({ notifications, unreadCount, handleNotificationClick, navigate }) {
  const sortedNotifications = [...(notifications || [])].sort((a, b) => {
      const aUnread = a.status !== 'Read';
      const bUnread = b.status !== 'Read';
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
      return new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime();
  });

  const displayNotifications = sortedNotifications.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-gray-300 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">أحدث النشاطات</h3>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-sm flex flex-col h-full min-h-[250px]">
            {displayNotifications.length > 0 ? (
                <>
                    {displayNotifications.map(notification => {
                        const style = getNotificationStyle(notification.type);
                        const isUnread = notification.status !== 'Read';
                        const IconComponent = style.icon;
                        
                        return (
                            <div 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification)}
                                // ✅ هنا تم إضافة margin (mb-3) وحدود وshadow لتفصل الإشعارات
                                className={`flex flex-col gap-2 p-4 mb-3 last:mb-0 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer rounded-2xl relative ${isUnread ? 'bg-blue-50/40' : 'bg-gray-50/40'}`}
                            >
                                {isUnread && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></span>}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl shrink-0 ${style.bg}`}><IconComponent className={`w-4 h-4 ${style.color}`} /></div>
                                    <span className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-bold text-gray-600'}`}>{style.title}</span>
                                </div>
                                <p className="text-xs text-gray-600 pr-11 line-clamp-2 font-medium leading-relaxed">{notification.content}</p>
                                
                                {/* ✅ هنا تم استخدام الدالة الجديدة لعرض التاريخ والوقت بدقة */}
                                <span className="text-[10px] text-gray-400 font-bold pr-11 mt-1 font-mono" dir="ltr" style={{textAlign: "right"}}>
                                    {formatExactDate(notification.sentAt)}
                                </span>
                            </div>
                        );
                    })}
                    
                    {unreadCount > 3 && (
                        <div 
                            onClick={() => navigate('/parent/notifications')}
                            className="mt-2 mx-2 mb-2 text-center text-xs font-bold text-[#1e3a8a] hover:text-blue-800 cursor-pointer transition-colors p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl"
                        >
                            لديك {unreadCount - 3} إشعارات أخرى غير مقروءة - عرض الكل
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 opacity-50">
                    <Bell className="w-10 h-10 text-gray-400 mb-3" />
                    <span className="text-sm font-bold text-gray-500">لا توجد نشاطات أو إشعارات حديثة</span>
                </div>
            )}
        </div>
    </div>
  );
}