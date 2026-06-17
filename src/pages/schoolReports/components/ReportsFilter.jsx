import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, Calendar, CheckCircle } from 'lucide-react';
import { filterOptions } from './ReportHelpers';

export default function ReportsFilter({ filterType, setFilterType, selectedMonth, setSelectedMonth, availableMonths }) {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterHighlightedIndex, setFilterHighlightedIndex] = useState(-1);
  const filterDropdownRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
        setFilterHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterKeyDown = (e) => {
    if (!isFilterDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFilterDropdownOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFilterHighlightedIndex(prev => (prev < filterOptions.length - 1 ? prev + 1 : prev)); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFilterHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev)); } 
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (filterHighlightedIndex >= 0 && filterHighlightedIndex < filterOptions.length) {
        setFilterType(filterOptions[filterHighlightedIndex].value);
        setIsFilterDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsFilterDropdownOpen(false);
      setFilterHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsDropdownOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(prev => (prev < availableMonths.length - 1 ? prev + 1 : prev)); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev)); } 
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < availableMonths.length) {
        setSelectedMonth(availableMonths[highlightedIndex].value);
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-56" ref={filterDropdownRef}>
        <div
          tabIndex={0}
          onKeyDown={handleFilterKeyDown}
          onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          className={`w-full h-[48px] px-4 pr-12 rounded-xl flex items-center justify-between outline-none transition-all font-bold text-sm border cursor-pointer shadow-sm
            ${isFilterDropdownOpen ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 bg-white' : 'bg-white border-gray-200 hover:border-gray-300'}
          `}
        >
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a8a]" />
          <span className="text-gray-800 truncate pl-2">{filterOptions.find(o => o.value === filterType)?.label}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isFilterDropdownOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
        </div>

        {isFilterDropdownOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
            <ul className="py-2 m-0 list-none max-h-60 overflow-y-auto custom-scrollbar">
              {filterOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => { setFilterType(option.value); setIsFilterDropdownOpen(false); }}
                  onMouseEnter={() => setFilterHighlightedIndex(index)}
                  className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex justify-between items-center
                    ${filterType === option.value ? 'bg-blue-50 text-[#1e3a8a]' : ''}
                    ${filterHighlightedIndex === index && filterType !== option.value ? 'bg-gray-50 text-[#1e3a8a]' : 'text-gray-600'}
                  `}
                >
                  {option.label}
                  {filterType === option.value && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {availableMonths.length > 1 && (
        <div className="relative w-full sm:w-56" ref={dropdownRef}>
          <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full h-[48px] px-4 pr-12 rounded-xl flex items-center justify-between outline-none transition-all font-bold text-sm border cursor-pointer shadow-sm
              ${isDropdownOpen ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 bg-white' : 'bg-white border-gray-200 hover:border-gray-300'}
            `}
          >
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e3a8a]" />
            <span className="text-gray-800 truncate pl-2">{availableMonths.find(m => m.value === selectedMonth)?.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
              <ul className="py-2 m-0 list-none max-h-60 overflow-y-auto custom-scrollbar">
                {availableMonths.map((option, index) => (
                  <li
                    key={option.value}
                    onClick={() => { setSelectedMonth(option.value); setIsDropdownOpen(false); }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex justify-between items-center
                      ${selectedMonth === option.value ? 'bg-blue-50 text-[#1e3a8a]' : ''}
                      ${highlightedIndex === index && selectedMonth !== option.value ? 'bg-gray-50 text-[#1e3a8a]' : 'text-gray-600'}
                    `}
                  >
                    {option.label}
                    {selectedMonth === option.value && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}