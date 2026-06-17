import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Users, Camera } from 'lucide-react';
import { translateFrequency } from './VisitsHelpers';

export default function ScheduleCard({ isCustodial, schedule, locationName, hasUpcomingVisit, currentCompanion, setShowCompanionModal, setCompanionError, setCompanionNationalId }) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">جدول الرؤية المعتمد</h2>
        {schedule ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] p-6 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden text-center items-center justify-center h-full">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200/50 rounded-full blur-xl pointer-events-none"></div>
                <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600 shrink-0 w-max mb-4 relative z-10"><CalendarIcon className="w-7 h-7" /></div>
                <div className="relative z-10 flex-col flex items-center w-full">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">زيارة دورية {translateFrequency(schedule.frequency)}</h3>
                    <div className="flex items-center gap-3 text-gray-600 bg-white px-4 py-2.5 rounded-xl mb-3 border border-blue-50 w-full justify-center">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-mono text-sm font-bold" dir="ltr">{schedule.startTime?.substring(0, 5) || '21:00'} - {schedule.endTime?.substring(0, 5) || '23:00'}</span>
                    </div>
                    
                    {locationName && (
                        <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-xl mb-4 border border-blue-50 w-full justify-center text-sm font-bold shadow-sm">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{locationName}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-5 py-2 rounded-full font-bold text-sm border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-600" /> ساري المفعول
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center h-full text-gray-400 gap-3">
                <CalendarIcon className="w-10 h-10 opacity-50 mb-1 text-gray-300" />
                <p className="font-bold text-gray-500">لا يوجد جدول رؤية معتمد</p>
            </div>
        )}
      </div>

      {isCustodial && (
        <div className="flex flex-col gap-4 h-full">
          <h2 className="text-xl font-bold text-gray-800">المرافق للزيارة القادمة</h2>
          <div className="bg-white border-2 border-blue-200 rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center gap-4 relative overflow-hidden h-full justify-center">
            {!hasUpcomingVisit ? (
                <div className="flex flex-col items-center text-center opacity-70">
                   <Users className="w-10 h-10 text-gray-400 mb-3" />
                   <p className="font-bold text-gray-500">لا توجد زيارات قادمة مجدولة</p>
                </div>
            ) : currentCompanion ? (
                <>
                   <div className="bg-green-100 p-3.5 rounded-full relative z-10"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                   <div className="relative z-10 w-full">
                      <h2 className="text-lg font-bold text-gray-800 mb-1">تم تسجيل مرافق بديل</h2>
                      <div className="bg-blue-50 border border-blue-100 py-2.5 px-4 rounded-xl mt-3 flex flex-col items-center gap-1">
                         <span className="text-gray-500 text-xs font-bold">الرقم القومي للمرافق</span>
                         <span className="text-blue-800 font-mono font-bold text-sm tracking-wider" dir="ltr">{currentCompanion}</span>
                      </div>
                   </div>
                   <button onClick={() => {setCompanionError(''); setCompanionNationalId(''); setShowCompanionModal(true);}} className="w-full mt-2 bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm relative z-10 outline-none border-none cursor-pointer">
                     تغيير المرافق
                   </button>
                </>
            ) : (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  <div className="bg-blue-100 p-3.5 rounded-full relative z-10"><Users className="w-6 h-6 text-[#1e3a8a]" /></div>
                  <div className="relative z-10">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">الحضور للزيارة القادمة</h2>
                    <p className="text-gray-500 text-xs font-bold leading-relaxed px-2 mt-2">أنت المرافق الافتراضي، يمكنك إضافة شخص بديل للحضور بدلاً منك.</p>
                  </div>
                  <button onClick={() => {setCompanionError(''); setCompanionNationalId(''); setShowCompanionModal(true);}} className="w-full mt-2 bg-[#1e3a8a] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm relative z-10 outline-none border-none cursor-pointer">
                    <Camera className="w-4 h-4" /> إضافة مرافق بديل
                  </button>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}