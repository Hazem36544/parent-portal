import React from 'react';
import { Filter, ChevronDown, CheckCircle, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { statusOptions, getSmartVisitStatus, formatDate } from './VisitsHelpers';

export default function VisitsHistory({ 
  statusFilter, setStatusFilter, isDropdownOpen, setIsDropdownOpen, 
  handleKeyDown, dropdownRef, highlightedIndex, setHighlightedIndex, 
  filteredPastVisits, setSelectedHistoryVisit, setShowHistoryDetailsModal 
}) {
  const getSelectedLabel = () => {
    const selected = statusOptions.find(opt => opt.value === statusFilter);
    return selected ? selected.label : 'جميع الزيارات';
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <h2 className="text-xl font-bold text-gray-800 px-2 w-full sm:w-auto text-right">سجل الزيارات السابقة</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-gray-600 px-2 shrink-0">
            <Filter className="w-4 h-4 text-[#1e3a8a]" />
            <span className="text-sm font-bold">تصفية:</span>
          </div>
          
          <div className="relative w-full sm:w-56" ref={dropdownRef}>
            <div
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full h-12 px-4 pr-10 rounded-xl flex items-center justify-between outline-none transition-all font-bold text-sm border cursor-pointer shadow-sm
                ${isDropdownOpen ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 bg-white' : 'bg-gray-50 border-gray-200 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'}
              `}
            >
              <span className="text-gray-800 truncate">{getSelectedLabel()}</span>
              <ChevronDown className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-opacity duration-300 opacity-100">
                <ul className="py-2 m-0 list-none">
                  {statusOptions.map((option, index) => (
                    <li
                      key={option.value}
                      onClick={() => { setStatusFilter(option.value); setIsDropdownOpen(false); }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex justify-between items-center
                        ${statusFilter === option.value ? 'bg-blue-50 text-[#1e3a8a]' : ''}
                        ${highlightedIndex === index && statusFilter !== option.value ? 'bg-gray-50 text-[#1e3a8a]' : 'text-gray-600'}
                      `}
                    >
                      {option.label}
                      {statusFilter === option.value && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredPastVisits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPastVisits.map((visit) => {
            const statusDisplay = getSmartVisitStatus(visit);
            
            return (
              <div 
                key={visit.id} 
                onClick={() => { setSelectedHistoryVisit(visit); setShowHistoryDetailsModal(true); }}
                className={`group bg-white border border-gray-100 shadow-sm transition-all duration-300 rounded-[2rem] p-6 cursor-pointer relative overflow-hidden ${statusDisplay.hoverBorderClass}`}
              >
                <div className={`absolute top-0 left-0 w-24 h-24 rounded-br-full -translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform opacity-50 pointer-events-none ${statusDisplay.cornerBgClass}`}></div>

                <div className="flex flex-col gap-5 relative z-10">
                  <div className="flex justify-between items-start">
                     <div className={`p-3 rounded-2xl shrink-0 ${statusDisplay.lightBgClass} ${statusDisplay.timeColor} group-hover:scale-105 transition-transform`}>
                       <CalendarIcon className="w-6 h-6" />
                     </div>
                     <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ${statusDisplay.bgClass} ${statusDisplay.textClass}`}>
                       {statusDisplay.label}
                     </span>
                  </div>

                  <div>
                     <span className="text-[10px] font-bold text-gray-400 block mb-1">تاريخ الزيارة</span>
                     <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#1e3a8a] transition-colors">
                       {formatDate(visit.startAt)}
                     </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-gray-400">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg text-gray-800">لا توجد زيارات مطابقة للبحث أو التصفية</p>
          <p className="text-sm font-bold text-gray-500 mt-1">تأكد من اختيار فلتر آخر للسجل.</p>
        </div>
      )}
    </div>
  );
}