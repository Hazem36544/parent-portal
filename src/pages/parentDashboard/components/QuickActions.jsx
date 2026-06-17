import React from 'react';
import { FileText, MessageSquare, Bell, Calendar } from 'lucide-react';

export default function QuickActions({ navigate, basePath, isFatherRole }) {
  const services = [
    { title: 'تفاصيل القضية', subtitle: 'عرض معلومات القضية', icon: <FileText className="w-7 h-7 text-blue-600" />, bg: 'bg-blue-50', path: '/parent/case-details' },
    { title: 'تقديم شكوى', subtitle: 'شكوى جديدة', icon: <MessageSquare className="w-7 h-7 text-red-500" />, bg: 'bg-red-50', path: '/parent/complaints' },
    { title: 'الإشعارات', subtitle: 'الاطلاع على الإشعارات', icon: <Bell className="w-7 h-7 text-blue-500" />, bg: 'bg-blue-50', path: '/parent/notifications' },
    { title: 'إدارة الزيارات', subtitle: 'عرض وإدارة المواعيد', icon: <Calendar className="w-7 h-7 text-green-600" />, bg: 'bg-green-50', path: `${basePath}/visits` }
  ];

  return (
    <div className="pt-2">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-1.5 h-6 ${isFatherRole ? 'bg-blue-600' : 'bg-pink-600'} rounded-full`}></div>
        <h3 className="text-xl font-bold text-gray-800">الخدمات السريعة</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div 
            key={index} 
            onClick={() => navigate(service.path)} 
            className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-16 h-16 rounded-2xl ${service.bg} flex items-center justify-center mb-5`}>
              {service.icon}
            </div>
            <h4 className="font-bold text-gray-800 text-lg mb-2">{service.title}</h4>
            <p className="text-sm text-gray-500 font-medium">{service.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}