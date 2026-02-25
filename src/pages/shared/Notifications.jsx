import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  Calendar, 
  DollarSign, 
  FileText, 
  CalendarCheck, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  X,
  Save,
  Loader2
} from 'lucide-react';

// استيراد الـ API
import { commonAPI } from '../../services/api';

export default function Notifications() {
  const navigate = useNavigate();
  
  // حالات الواجهة (UI States)
  const [showSettings, setShowSettings] = useState(false);
  const [visits, setVisits] = useState(true);
  const [alimony, setAlimony] = useState(true);
  const [violations, setViolations] = useState(true);

  // حالات البيانات (Data States)
  const [data, setData] = useState({ items: [], unreadCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

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

  // 2. تحديث حالة الإشعار إلى "مقروء"
  const handleMarkAsRead = async (notificationId, currentStatus) => {
    // إذا كان الإشعار مقروءاً مسبقاً، لا نفعل شيئاً
    if (currentStatus === 'Read') return; 

    try {
      // إرسال الطلب للسيرفر
      await commonAPI.markAsRead(notificationId);
      
      // تحديث الواجهة محلياً فوراً (Optimistic Update)
      setData(prevData => ({
        ...prevData,
        unreadCount: Math.max(0, prevData.unreadCount - 1),
        items: prevData.items.map(notif => 
          notif.id === notificationId ? { ...notif, status: 'Read' } : notif
        )
      }));
    } catch (error) {
      console.error("خطأ في تحديث حالة الإشعار:", error);
    }
  };

  // 3. دالة لتحديد الأيقونة واللون بناءً على نوع الإشعار القادم من السيرفر
  const getNotificationStyle = (type) => {
    switch(type) {
      case 'Alimony':
      case 'PaymentDue':
        return { icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50", title: "تنبيه نفقة" };
      case 'Visitation':
      case 'Schedule':
        return { icon: Calendar, color: "text-green-600", bg: "bg-green-50", title: "تنبيه زيارة" };
      case 'CourtCase':
      case 'Document':
        return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", title: "تحديث قضية" };
      case 'ObligationAlert':
      case 'Violation':
        return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", title: "تنبيه هام" };
      default:
        return { icon: Bell, color: "text-gray-600", bg: "bg-gray-100", title: "إشعار نظام" };
    }
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

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      {/* Header (Standard Rounded Blue Header) */}
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

      {/* Settings Bar */}
      <button 
        onClick={() => setShowSettings(true)}
        className="w-full bg-white shadow-sm border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-400 group-hover:text-[#1e3a8a] transition-colors" />
          <span className="text-gray-700 font-bold text-sm">إعدادات الإشعارات</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 rtl:-scale-x-100 group-hover:-translate-x-1 transition-transform" />
      </button>

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
              const isUnread = notification.status !== 'Read'; // التحقق من حالة القراءة

              return (
                <div 
                  key={notification.id} 
                  onClick={() => handleMarkAsRead(notification.id, notification.status)}
                  className={`bg-white shadow-sm border ${isUnread ? 'border-blue-200' : 'border-gray-100 opacity-75'} rounded-2xl p-6 flex items-start justify-between relative hover:shadow-md transition-shadow cursor-pointer`}
                >
                  {isUnread && (
                    <span className="absolute top-6 right-5 w-2 h-2 bg-blue-600 rounded-full" title="غير مقروء"></span>
                  )}
                  
                  <div className="flex flex-col gap-1.5 pr-4 flex-1">
                    <h3 className={`text-sm ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-700 font-bold'}`}>
                       {style.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed max-w-[90%]">
                      {notification.content}
                    </p>
                    <span className="text-gray-400 text-[11px] mt-2 font-medium">
                      {timeAgo(notification.sentAt)}
                    </span>
                  </div>

                  <div className={`p-3 rounded-2xl shrink-0 ${style.bg}`}>
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

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <h2 className="font-bold">إعدادات الإشعارات</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-500 text-sm text-right mb-4">اختر أنواع التنبيهات التي تريد استلامها</p>
              
              {/* Toggles */}
              <div className="flex flex-col gap-3 mb-6">
                
                {/* Visits Alert Toggle */}
                <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-50 p-2.5 rounded-xl shrink-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">تنبيهات الزيارات</h4>
                      <p className="text-xs text-gray-500">إشعارات مواعيد الزيارات</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setVisits(!visits)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out shrink-0 ${visits ? 'bg-[#1e3a8a]' : 'bg-gray-300'}`}
                  >
                    <span 
                      className={`absolute top-0.5 right-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${visits ? '-translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {/* Alimony Alert Toggle */}
                <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-50 p-2.5 rounded-xl shrink-0">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">تنبيهات النفقة</h4>
                      <p className="text-xs text-gray-500">إشعارات النفقة والمدفوعات</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAlimony(!alimony)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out shrink-0 ${alimony ? 'bg-[#1e3a8a]' : 'bg-gray-300'}`}
                  >
                    <span 
                      className={`absolute top-0.5 right-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${alimony ? '-translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {/* Violations Alert Toggle */}
                <div className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-50 p-2.5 rounded-xl shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">تنبيهات المخالفات</h4>
                      <p className="text-xs text-gray-500">إشعارات المخالفات والتحذيرات</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViolations(!violations)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out shrink-0 ${violations ? 'bg-[#1e3a8a]' : 'bg-gray-300'}`}
                  >
                    <span 
                      className={`absolute top-0.5 right-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out ${violations ? '-translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

              </div>
              
              {/* Info Box */}
              <div className="bg-gray-50 text-gray-500 text-[11px] p-3 rounded-xl text-center mb-6 border border-gray-100">
                سيتم إرسال التنبيهات المفعلة عبر الإشعارات والبريد الإلكتروني
              </div>

              {/* Modal Footer Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="bg-[#1e3a8a] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}