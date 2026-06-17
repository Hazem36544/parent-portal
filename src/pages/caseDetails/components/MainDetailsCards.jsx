import React from 'react';
import { Scale, Users, Calendar, FileText } from 'lucide-react';
import { formatDate, getCustodianName, translateFrequency } from './CaseDetailsHelpers';

export default function MainDetailsCards({ data, caseNumber, childrenList }) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      
      {/* حالة القضية */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-[#1e3a8a]">
            <div className="bg-blue-50 p-2 rounded-xl"><Scale className="w-6 h-6" /></div>
            <h2 className="text-lg font-bold">حالة القضية</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-400 text-sm font-bold">رقم القضية</span>
            <span className="text-gray-800 font-bold font-mono">{caseNumber}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-400 text-sm font-bold">تاريخ التسجيل</span>
            <span className="text-gray-800 font-bold">{formatDate(data.courtCase?.filedAt)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-400 text-sm font-bold">نوع القضية</span>
            <span className="text-gray-800 font-bold">أحوال شخصية</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-400 text-sm font-bold">المحكمة</span>
            <span className="text-gray-800 font-bold">{data.court?.name || 'محكمة الأسرة'}</span>
          </div>
        </div>
      </div>

      {/* قرار الحضانة */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
          <div className="bg-blue-50 p-2 rounded-xl"><Users className="w-6 h-6" /></div>
          <h2 className="text-lg font-bold">قرار الحضانة</h2>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-bold">صاحب الحضانة</span>
            <span className="text-purple-900 font-bold text-lg">{getCustodianName(data.custody, data.family)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-purple-100 pt-3">
            <span className="text-gray-500 text-sm font-bold">عدد الأطفال</span>
            <span className="text-gray-800 font-bold">{childrenList.length} أطفال</span>
          </div>
          <div className="flex justify-between items-center border-t border-purple-100 pt-3">
            <span className="text-gray-500 text-sm font-bold">تاريخ القرار</span>
            <span className="text-gray-800 font-bold">{formatDate(data.custody?.startAt)}</span>
          </div>
        </div>
      </div>

      {/* جدول الرؤية المعتمد */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
          <div className="bg-blue-50 p-2 rounded-xl"><Calendar className="w-6 h-6" /></div>
          <h2 className="text-lg font-bold">جدول الرؤية المعتمد</h2>
        </div>
        {data.schedule ? (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-bold">معدل التكرار</span>
                <span className="text-blue-900 font-bold">{translateFrequency(data.schedule.frequency)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-100 pt-3">
                <span className="text-gray-500 text-sm font-bold">التوقيت</span>
                <span className="text-gray-800 font-bold font-mono" dir="ltr">
                    {data.schedule.startTime?.substring(0,5)} - {data.schedule.endTime?.substring(0,5)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-100 pt-3">
                <span className="text-gray-500 text-sm font-bold">مكان الزيارة</span>
                {/* ✅ يعرض اسم المركز بشكل صحيح بعد الإصلاح */}
                <span className="text-gray-800 font-bold">{data.location?.name || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-100 pt-3">
                <span className="text-gray-500 text-sm font-bold">تاريخ البدء</span>
                <span className="text-gray-800 font-bold">{formatDate(data.schedule.startDate)}</span>
              </div>
            </div>
        ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                <span className="text-gray-500 text-sm font-bold">لا يوجد جدول رؤية مسجل لهذه القضية حالياً.</span>
            </div>
        )}
      </div>

      {/* معلومات النفقة */}
      <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
          <div className="bg-blue-50 p-2 rounded-xl"><FileText className="w-6 h-6" /></div>
          <h2 className="text-lg font-bold">معلومات النفقة</h2>
        </div>
        {data.alimony ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center">
                <p className="text-xs text-green-600 mb-1 font-bold">المبلغ المقرر</p>
                <p className="text-xl font-bold text-green-800">{(data.alimony.amount / 100)?.toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1 font-bold">دورية الدفع</p>
                <p className="text-lg font-bold text-gray-800">{translateFrequency(data.alimony.frequency)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-center">
                <p className="text-xs text-gray-500 mb-1 font-bold">تاريخ التطبيق</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{formatDate(data.alimony.startDate)}</p>
              </div>
            </div>
        ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                <span className="text-gray-500 text-sm font-bold">لا توجد بيانات نفقة مسجلة لهذه القضية حالياً.</span>
            </div>
        )}
      </div>

    </div>
  );
}