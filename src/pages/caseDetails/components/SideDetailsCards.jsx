import React, { useState } from 'react';
import { Users, MapPin, Copy, Check } from 'lucide-react';

export default function SideDetailsCards({ data, childrenList }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="lg:col-span-1 flex flex-col gap-6">
      
      {/* معلومات الأطفال */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
          <div className="bg-blue-50 p-2 rounded-xl relative">
             <Users className="w-6 h-6" />
             {childrenList.length > 0 && (
                 <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
             )}
          </div>
          <h2 className="text-lg font-bold">معلومات الأطفال</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          {childrenList.length > 0 ? (
              childrenList.map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="text-right">
                    <h3 className="text-gray-800 font-bold text-sm mb-1">{child.fullName}</h3>
                    <p className="text-gray-500 font-bold text-[11px]">{child.schoolId ? 'مسجل بنظام المدارس' : 'غير مسجل بمدرسة'}</p>
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    {child.age} سنوات
                  </div>
                </div>
              ))
          ) : (
              <div className="text-center py-4 text-gray-500 font-bold text-sm">لا يوجد أطفال مسجلين.</div>
          )}
        </div>
      </div>

      {/* بيانات المحكمة */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow sticky top-6">
        <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
          <div className="bg-blue-50 p-2 rounded-xl"><MapPin className="w-6 h-6" /></div>
          <h2 className="text-lg font-bold">بيانات محكمة الأسرة</h2>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 text-right flex flex-col gap-3 border border-gray-100">
          <h3 className="text-gray-800 font-bold text-sm">
             {data.court?.name || 'محكمة الأسرة المختصة'}
          </h3>
          
          <p className="text-gray-500 font-bold text-xs leading-relaxed">
             {data.court?.address 
                ? `${data.court.address}${data.court.governorate ? `، محافظة ${data.court.governorate}` : ''}` 
                : 'العنوان غير مدرج في النظام.'
             }
          </p>
          
          {data.court?.contactInfo && (
             <div className="flex items-center justify-start gap-2 mt-1">
                <p className="text-[#1e3a8a] font-bold text-xs m-0" dir="ltr">
                   📞 {data.court.contactInfo}
                </p>
                <button 
                  onClick={() => handleCopy(data.court.contactInfo)}
                  className="p-1.5 rounded-lg bg-transparent hover:bg-gray-200 text-gray-400 hover:text-[#1e3a8a] transition-all cursor-pointer outline-none border-none flex items-center justify-center"
                  title="نسخ الرقم"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}