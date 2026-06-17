import React from 'react';
import { User } from 'lucide-react';

export default function ChildrenSelector({ childrenList, selectedChild, setSelectedChild }) {
  if (childrenList.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[2rem] text-center text-gray-500 font-bold border border-gray-100 shadow-sm flex flex-col items-center">
        <User className="w-12 h-12 mb-3 text-gray-300" />
        لا يوجد أبناء مسجلين في ملفك الحالي.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
      {childrenList.map((child) => (
        <button
          key={child.id}
          onClick={() => setSelectedChild(child)}
          className={`flex items-center gap-4 px-6 py-4 rounded-3xl font-bold transition-all whitespace-nowrap min-w-[200px] border-2 outline-none cursor-pointer ${
            selectedChild?.id === child.id
              ? 'bg-blue-50/50 border-[#1e3a8a] shadow-md ring-2 ring-[#1e3a8a]/20'
              : 'bg-white border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'
          }`}
        >
          <div className={`p-3 rounded-full flex-shrink-0 transition-colors ${
            selectedChild?.id === child.id ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-gray-100 text-gray-500'
          }`}>
            <User size={24} />
          </div>
          <div className="text-right">
            <p className={`text-base font-bold ${selectedChild?.id === child.id ? 'text-[#1e3a8a]' : 'text-gray-700'}`}>
              {child.fullName.split(' ').slice(0, 2).join(' ')}
            </p>
            <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-1">
              {child.gender === 'Male' ? 'ذكر' : 'أنثى'} <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span> العمر {child.age}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}