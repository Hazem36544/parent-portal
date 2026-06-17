import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function CaseSummary({ courtCase, familyData, isFatherRole, navigate }) {
  const otherParentName = familyData ? (isFatherRole ? familyData.mother?.fullName : familyData.father?.fullName) : 'غير مسجل';
  const otherParentLabel = isFatherRole ? 'الأم (الطرف الثاني):' : 'الأب (الطرف الثاني):';

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-6 md:p-8 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <span className="text-sm text-gray-500 mb-2 font-medium">رقم الملف / الأسرة</span>
          <div className="flex flex-row items-center gap-4">
            <span className="text-xl md:text-2xl font-bold text-gray-800 font-mono tracking-wider uppercase">
              {courtCase?.caseNumber ? courtCase.caseNumber : (familyData ? `FAM-${familyData.familyId.substring(0,8)}` : 'غير متاح')}
            </span>
            <span className="bg-green-100/80 text-green-700 text-xs px-4 py-1.5 rounded-full w-max font-bold">نشط</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/parent/case-details')} 
          className="p-2 hover:bg-gray-50 rounded-full transition-colors text-blue-800 border-none outline-none cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-[#1e3a8a] rotate-180" />
        </button>
      </div>
      
      <div className="bg-gray-50/50 p-6 md:p-8 flex flex-row items-center justify-start border-t border-gray-100">
        <div className="flex flex-col w-1/2">
          <span className="text-sm text-gray-400 mb-2 font-medium">{otherParentLabel}</span>
          <span className="font-bold text-gray-800 text-base md:text-lg">
              {otherParentName}
          </span>
        </div>
        <div className="flex flex-col w-1/2">
          <span className="text-sm text-gray-400 mb-2 font-medium">عدد الأطفال:</span>
          <span className="font-bold text-gray-800 text-base md:text-lg">
              {familyData?.children?.length ? `${familyData.children.length} أطفال` : 'لا يوجد'}
          </span>
        </div>
      </div>
    </div>
  );
}