import React from 'react';
import { FileText, Loader2 } from 'lucide-react';

export default function CaseInfoCard({ caseInfo, isLoadingInfo }) {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow sticky top-6">
      <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
        <div className="bg-blue-50 p-2 rounded-xl"><FileText className="w-6 h-6" /></div>
        <h2 className="text-lg font-bold">معلومات القضية</h2>
      </div>
      
      {isLoadingInfo ? (
         <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">رقم القضية:</span>
              <span className="text-gray-800 font-bold font-mono">{caseInfo.caseNumber}</span>
            </div>
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">الطرف الآخر:</span>
              <span className="text-gray-800 font-medium">{caseInfo.otherParty}</span>
            </div>
          </div>
      )}
    </div>
  );
}