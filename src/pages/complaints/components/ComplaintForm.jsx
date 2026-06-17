import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Upload, Info, Send, Loader2, CheckCircle2, AlertCircle, ChevronDown, Calendar, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { complaintsAPI, commonAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../../utils/errorHandler';

const complaintTypes = [
  { value: 'Denied', label: 'تأخير أو امتناع عن سداد النفقة' },
  { value: 'VisitSession', label: 'تعطيل أو تخلف عن موعد الرؤية' },
  { value: 'Harassment', label: 'التعرض لمضايقات أو سوء سلوك' }
];

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const daysOfWeek = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function ComplaintForm({ user, familyId }) {
  const availableComplaintTypes = complaintTypes.filter(type => {
    if (user?.role === 'father' && type.value === 'Denied') return false;
    return true;
  });

  const [formData, setFormData] = useState({
    type: user?.role === 'father' ? 'VisitSession' : 'Denied',
    description: '',
    incidentDate: '',
    file: null
  });

  useEffect(() => {
    if (user?.role === 'father' && formData.type === 'Denied') {
      setFormData(prev => ({ ...prev, type: 'VisitSession' }));
    }
  }, [user?.role]);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [typeHighlightedIndex, setTypeHighlightedIndex] = useState(-1);
  const typeDropdownRef = useRef(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const calendarRef = useRef(null);

  // حساب تاريخ اليوم لتمييزه في التقويم
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
        setTypeHighlightedIndex(-1);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeKeyDown = (e) => {
    if (!isTypeDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsTypeDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setTypeHighlightedIndex(prev => (prev < availableComplaintTypes.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setTypeHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (typeHighlightedIndex >= 0 && typeHighlightedIndex < availableComplaintTypes.length) {
        setFormData({...formData, type: availableComplaintTypes[typeHighlightedIndex].value});
        if (formErrors.type) setFormErrors({...formErrors, type: null});
        setIsTypeDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsTypeDropdownOpen(false);
      setTypeHighlightedIndex(-1);
    }
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));
  };

  const selectDate = (day) => {
    const year = calendarViewDate.getFullYear();
    const month = String(calendarViewDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setFormData({...formData, incidentDate: `${year}-${month}-${formattedDay}`});
    setIsCalendarOpen(false);
  };

  const daysInMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1).getDay();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.type) {
      errors.type = "يرجى اختيار نوع الشكوى";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "يرجى إدخال تفاصيل الشكوى";
      isValid = false;
    } else if (formData.description.trim().length < 20) {
      errors.description = "وصف الشكوى قصير جداً، يرجى كتابة تفاصيل واضحة (20 حرف على الأقل)";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!familyId) {
        const errorMsg = 'لا يمكن إرسال الشكوى، لم يتم العثور على ملف أسرة نشط.';
        toast.error(errorMsg);
        setSubmitStatus({ type: 'error', message: errorMsg });
        return;
    }

    if (!validateForm()) {
        toast.error('يرجى مراجعة الحقول المطلوبة');
        return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      let documentId = null;

      if (formData.file) {
        const fileData = new FormData();
        fileData.append('file', formData.file); 
        
        try {
            const uploadRes = await commonAPI.uploadDocument(fileData);
            documentId = uploadRes.data?.id || uploadRes.data?.documentId || (typeof uploadRes.data === 'string' ? uploadRes.data : null);
            
            if (!documentId) {
                console.warn("تم رفع الملف ولكن لم نستلم ID صالح:", uploadRes.data);
            }
        } catch (uploadErr) {
            console.error("فشل في رفع المستند:", uploadErr);
            throw new Error("حدث خطأ أثناء رفع المستند المرفق. يرجى المحاولة بدون مرفقات مؤقتاً.");
        }
      }

      const finalDescription = formData.incidentDate 
        ? `[تاريخ الواقعة: ${formData.incidentDate}] \n\n${formData.description}` 
        : formData.description;

      const payload = {
        familyId: familyId,
        type: formData.type, 
        documentId: documentId || null, 
        description: finalDescription
      };

      await complaintsAPI.create(payload);

      toast.success('تم إرسال شكواك بنجاح، سيتم مراجعتها من قبل المحكمة.');
      setSubmitStatus({ type: 'success', message: 'تم إرسال شكواك بنجاح، سيتم مراجعتها من قبل المحكمة.' });
      
      setFormData({ type: user?.role === 'father' ? 'VisitSession' : 'Denied', description: '', incidentDate: '', file: null }); 
      setFormErrors({}); 

    } catch (err) {
      console.error("Error submitting complaint:", err);
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 mb-8">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-blue-800 text-sm font-medium leading-relaxed">
          <span className="font-bold">ملاحظة مهمة:</span> سيتم مراجعة شكواك من قبل موظفي المحكمة خلال 48 ساعة عمل
        </p>
      </div>

      <div className="flex items-center gap-3 text-[#1e3a8a] mb-6">
        <div className="bg-blue-50 p-2 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
        <h2 className="text-lg font-bold">تفاصيل الشكوى</h2>
      </div>

      {submitStatus.message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${submitStatus.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
          {submitStatus.type === 'success' ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 flex-shrink-0" />}
          <p className="font-bold text-sm">{submitStatus.message}</p>
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        
        <div className="flex flex-col gap-3 relative mb-2" ref={typeDropdownRef}>
          <label className="text-gray-700 font-bold text-sm">نوع الشكوى</label>
          <div
            tabIndex={0}
            onKeyDown={handleTypeKeyDown}
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className={`w-full p-4 rounded-2xl border outline-none transition-all text-sm cursor-pointer font-bold flex justify-between items-center
              ${formErrors.type ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-[#1e3a8a]'}
              ${isTypeDropdownOpen ? 'border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20 bg-white' : ''}
            `}
          >
            <span className="text-gray-800">
              {availableComplaintTypes.find(opt => opt.value === formData.type)?.label || 'اختر نوع الشكوى'}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`} />
          </div>

          {isTypeDropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-opacity duration-300">
              <ul className="py-2 m-0 list-none">
                {availableComplaintTypes.map((option, index) => (
                  <li
                    key={option.value}
                    onClick={() => {
                      setFormData({...formData, type: option.value});
                      if (formErrors.type) setFormErrors({...formErrors, type: null});
                      setIsTypeDropdownOpen(false);
                    }}
                    onMouseEnter={() => setTypeHighlightedIndex(index)}
                    className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors flex justify-between items-center
                      ${formData.type === option.value ? 'bg-blue-50 text-[#1e3a8a]' : ''}
                      ${typeHighlightedIndex === index && formData.type !== option.value ? 'bg-gray-50 text-[#1e3a8a]' : 'text-gray-600'}
                    `}
                  >
                    {option.label}
                    {formData.type === option.value && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {formErrors.type && <p className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.type}</p>}
        </div>

        <div className="flex flex-col gap-3 relative mb-2">
          <label className="text-gray-700 font-bold text-sm">وصف الشكوى</label>
          <textarea 
            value={formData.description}
            onChange={(e) => {
              setFormData({...formData, description: e.target.value});
              if (formErrors.description) setFormErrors({...formErrors, description: null});
            }}
            className={`w-full h-32 p-4 rounded-2xl border outline-none transition-all resize-none text-sm font-medium
              ${formErrors.description ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400' : 'bg-gray-50/50 border-gray-200 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] hover:border-gray-300'}
            `}
            placeholder="اكتب تفاصيل الشكوى بشكل واضح ومفصل..."
          ></textarea>
          {formErrors.description ? (
            <p className="absolute -bottom-6 right-0 text-red-500 text-[11px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.description}</p>
          ) : (
            <div className="text-left">
              <span className="text-xs text-gray-400">الحد الأدنى 20 حرف</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 relative" ref={calendarRef}>
          <label className="text-gray-700 font-bold text-sm">تاريخ الواقعة <span className="text-gray-400 font-normal text-xs">(اختياري)</span></label>
          <div className="relative flex items-center">
            {/* ✅ التعديل هنا: منع زر المسافة (Space) من العمل داخل حقل التاريخ */}
            <input 
              type="date" 
              value={formData.incidentDate}
              onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
              onKeyDown={(e) => { if (e.key === ' ' || e.code === 'Space') e.preventDefault(); }}
              className="w-full p-4 pr-12 rounded-2xl border border-gray-200 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none transition-all text-sm bg-gray-50/50 hover:border-gray-300 font-bold [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-clear]:hidden"
            />
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setIsCalendarOpen(!isCalendarOpen); }}
              className="absolute right-4 text-gray-400 hover:text-[#1e3a8a] transition-colors outline-none border-none bg-transparent cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>

          {isCalendarOpen && (
            <div className="absolute top-[calc(100%+12px)] right-0 w-72 bg-white border border-gray-100 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 rounded-tl-[2px]"></div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors outline-none border-none bg-transparent cursor-pointer">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-sm font-bold text-[#1e3a8a]">
                  {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                </h3>
                <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors outline-none border-none bg-transparent cursor-pointer">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-2 relative z-10">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-xs font-bold text-gray-400">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 relative z-10">
                {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = `${calendarViewDate.getFullYear()}-${String(calendarViewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = formData.incidentDate === dateStr;
                  const isToday = dateStr === todayStr;
                  
                  let btnClass = "h-8 w-8 mx-auto rounded-full text-sm font-bold flex items-center justify-center transition-all outline-none border-none cursor-pointer ";
                  
                  if (isSelected) {
                    btnClass += "bg-[#1e3a8a] text-white shadow-md scale-110";
                  } else if (isToday) {
                    btnClass += "bg-blue-50 text-blue-700 border border-blue-300 shadow-sm";
                  } else {
                    btnClass += "text-gray-700 bg-transparent hover:bg-blue-50 hover:text-[#1e3a8a]";
                  }

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDate(day)}
                      className={btnClass}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-gray-700 font-bold text-sm">المستندات الداعمة <span className="text-gray-400 text-xs font-normal">(اختياري)</span></label>
          <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer group relative">
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-center mt-2 relative z-0">
              <p className="text-sm font-bold text-gray-600 mb-1">
                {formData.file ? formData.file.name : "اضغط لرفع المستندات"}
              </p>
              {!formData.file && <p className="text-xs text-gray-400 font-medium">(حتى 5 ميجابايت) PDF, JPG, PNG</p>}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || !familyId}
          className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 mt-4 group border-none outline-none cursor-pointer ${
            isSubmitting || !familyId ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-900 hover:shadow-lg active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              إرسال الشكوى
            </>
          )}
        </button>

        <p className="text-center text-gray-400 text-xs mt-2 font-bold">
          بتقديم هذه الشكوى، أؤكد أن المعلومات المقدمة صحيحة وكاملة
        </p>

      </form>
    </div>
  );
}