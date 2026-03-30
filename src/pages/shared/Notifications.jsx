import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  ChevronRight,
  Loader2,
  X,
  Info
} from 'lucide-react';

// استيراد الـ API
import { commonAPI } from '../../services/api';

export default function Notifications() {
  const navigate = useNavigate();

  // حالات البيانات (Data States)
  const [data, setData] = useState({ items: [], unreadCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // حالة النافذة المنبثقة (Popup State)
  const [selectedNotification, setSelectedNotification] = useState(null);

  // 1. جلب الإشعارات من السيرفر
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await commonAPI.listNotifications({ PageNumber: 1, PageSize: 50 });
      
      setData({
        items: response.data?.notifications?.items || [],
        unreadCount: response.data?.unreadCount || 0
      });
    } catch (error) {
      console.error("خطأ في جلب الإشعارات:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. معالجة النقر على الإشعار (فتح البوب أب وتحديث الحالة)
  const handleNotificationClick = async (notification) => {
    // فتح البوب أب لعرض التفاصيل
    setSelectedNotification(notification);

    // إذا كان الإشعار جديداً، قم بتحديث حالته في السيرفر
    if (notification.status !== 'Read') {
      try {
        await commonAPI.markAsRead(notification.id);
        
        // تحديث الواجهة محلياً فوراً (Optimistic Update)
        setData(prevData => ({
          ...prevData,
          unreadCount: Math.max(0, prevData.unreadCount - 1),
          items: prevData.items.map(notif => 
            notif.id === notification.id ? { ...notif, status: 'Read' } : notif
          )
        }));
      } catch (error) {
        console.error("خطأ في تحديث حالة الإشعار:", error);
      }
    }
  };

  // 3. دالة لتحديد الأيقونة واللون بناءً على نوع الإشعار القادم من السيرفر
  const getNotificationStyle = (type) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('alimony') || lowerType.includes('payment')) {
      return { icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50", title: "تنبيه نفقة" };
    }
    if (lowerType.includes('visitation') || lowerType.includes('schedule') || lowerType.includes('custody')) {
      return { icon: Calendar, color: "text-green-600", bg: "bg-green-50", title: "تنبيه زيارة وحضانة" };
    }
    if (lowerType.includes('case') || lowerType.includes('document') || lowerType.includes('school')) {
      return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", title: "تحديث ملفات وقضايا" };
    }
    if (lowerType.includes('alert') || lowerType.includes('violation')) {
      return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "تنبيه هام" };
    }
    return { icon: Bell, color: "text-gray-600", bg: "bg-gray-100", title: "إشعار نظام" };
  };

  // 4. دالة لتنسيق الوقت (منذ كم يوم)
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'اليوم';
    if (diffInDays === 1) return 'أمس';
    if (diffInDays === 2) return 'منذ يومين';
    if (diffInDays > 2 && diffInDays < 7) return `منذ ${diffInDays} أيام`;
    if (diffInDays >= 7 && diffInDays < 14) return 'منذ أسبوع';
    return date.toLocaleDateString('ar-EG');
  };

  // دالة مساعدة لتنسيق الوقت واليوم في النافذة المنبثقة
  const formatFullDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      {/* Header */}
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">الإشعارات</h1>
            </div>
            <p className="text-blue-200 text-sm opacity-90 tracking-wider font-medium">جميع الإشعارات والتنبيهات</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 relative z-10">
           {data.unreadCount > 0 && (
             <span className="bg-red-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
               {data.unreadCount} جديد
             </span>
           )}
           <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative">
             <Bell className="w-8 h-8 text-blue-100" />
           </div>
        </div>
      </div>

      {/* Notifications Grid */}
      {isLoading ? (
         <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-blue-800" />
             <span className="text-blue-800 font-bold">جاري جلب الإشعارات...</span>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.length > 0 ? (
            data.items.map((notification) => {
              const style = getNotificationStyle(notification.type);
              const Icon = style.icon;
              const isUnread = notification.status !== 'Read';

              return (
                <div 
                  key={notification.id} 
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white shadow-sm border ${isUnread ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-100 opacity-80'} rounded-2xl p-6 flex items-start justify-between relative hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1`}
                >
                  {isUnread && (
                    <span className="absolute top-6 right-5 w-2 h-2 bg-blue-600 rounded-full animate-pulse" title="غير مقروء"></span>
                  )}
                  
                  <div className="flex flex-col gap-2 pr-4 flex-1">
                    <h3 className={`text-sm ${isUnread ? 'text-gray-900 font-extrabold' : 'text-gray-700 font-bold'}`}>
                       {style.title}
                    </h3>
                    <p className={`text-xs leading-relaxed max-w-[95%] truncate ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`} dir="auto">
                      {notification.content}
                    </p>
                    <span className="text-gray-400 text-[10px] mt-1 font-bold">
                      {timeAgo(notification.sentAt)}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl shrink-0 transition-colors ${isUnread ? style.bg.replace('50', '100') : style.bg}`}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
              <Bell className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium text-lg text-gray-500">لا توجد إشعارات حالياً</p>
            </div>
          )}
        </div>
      )}

      {/* 🚀 Popup Modal لعرض تفاصيل الإشعار */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`p-6 flex items-center justify-between ${getNotificationStyle(selectedNotification.type).bg} border-b border-gray-100`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 bg-white rounded-xl shadow-sm ${getNotificationStyle(selectedNotification.type).color}`}>
                  {React.createElement(getNotificationStyle(selectedNotification.type).icon, { className: "w-6 h-6" })}
                </div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {getNotificationStyle(selectedNotification.type).title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="bg-white/50 hover:bg-white text-gray-500 p-2 rounded-full transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex flex-col gap-6">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed font-medium" dir="auto" style={{ wordBreak: 'break-word' }}>
                  {selectedNotification.content}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold px-2">
                   <Info className="w-4 h-4" />
                   <span>تاريخ الإشعار</span>
                </div>
                <div className="bg-blue-50/50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100 text-sm font-medium">
                  {formatFullDateTime(selectedNotification.sentAt)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 mt-auto">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-colors"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}