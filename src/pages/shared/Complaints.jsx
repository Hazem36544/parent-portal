import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Upload, 
  Info, 
  ChevronRight, 
  FileText, 
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { courtAPI, complaintsAPI, commonAPI } from '../../services/api';

export default function Complaints() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caseInfo, setCaseInfo] = useState({
    caseNumber: 'جاري التحميل...',
    otherParty: 'جاري التحميل...',
    familyId: null
  });

  // ✅ التعديل هنا: استخدام 'Denied' كقيمة افتراضية مطابقة لأول خيار
  const [formData, setFormData] = useState({
    type: 'Denied', 
    description: '',
    incidentDate: '',
    file: null
  });

  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchCaseInfo = async () => {
      try {
        setIsLoadingInfo(true);
        const familyRes = await courtAPI.getMyFamilies();
        const family = familyRes.data?.items ? familyRes.data.items[0] : (Array.isArray(familyRes.data) ? familyRes.data[0] : familyRes.data);
        
        if (family && family.familyId) {
          const fId = family.familyId;
          const isFather = user?.role === 'father';
          const otherPartyName = isFather ? family.mother?.fullName : family.father?.fullName;

          let cNumber = `FAM-${fId.substring(0,8).toUpperCase()}`; 
          try {
            const caseRes = await courtAPI.listCourtCasesByFamily(fId);
            const courtCase = caseRes.data?.items ? caseRes.data.items[0] : (Array.isArray(caseRes.data) ? caseRes.data[0] : caseRes.data);
            if (courtCase?.caseNumber) {
              cNumber = courtCase.caseNumber;
            }
          } catch (e) { console.warn("لم نتمكن من جلب رقم القضية الفعلي"); }

          setCaseInfo({
            caseNumber: cNumber,
            otherParty: otherPartyName || 'غير مسجل',
            familyId: fId
          });
        } else {
           setCaseInfo(prev => ({ ...prev, caseNumber: 'لا يوجد', otherParty: 'لا يوجد' }));
        }
      } catch (err) {
        console.error("Error fetching case info:", err);
        setCaseInfo(prev => ({ ...prev, caseNumber: 'غير متاح', otherParty: 'غير متاح' }));
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchCaseInfo();
  }, [user?.role]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!caseInfo.familyId) {
        setSubmitStatus({ type: 'error', message: 'لا يمكن إرسال الشكوى، لم يتم العثور على ملف أسرة نشط.' });
        return;
    }

    if (!formData.description || formData.description.trim().length < 20) {
      setSubmitStatus({ type: 'error', message: 'يرجى كتابة وصف تفصيلي للشكوى (20 حرف على الأقل).' });
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
        familyId: caseInfo.familyId,
        type: formData.type, 
        description: finalDescription
      };

      if (documentId) {
          payload.documentId = documentId;
      }

      console.log("Payload Sending to Server:", payload);

      await complaintsAPI.create(payload);

      setSubmitStatus({ type: 'success', message: 'تم إرسال شكواك بنجاح، سيتم مراجعتها من قبل المحكمة.' });
      
      // ✅ التعديل هنا: إعادة تهيئة النموذج بنفس القيمة الافتراضية الصحيحة
      setFormData({ type: 'Denied', description: '', incidentDate: '', file: null }); 

    } catch (err) {
      console.error("Error submitting complaint:", err);
      
      const serverMsg = err.message || err.response?.data?.detail || err.response?.data?.title;
      
      if (err.response?.status === 403) {
          setSubmitStatus({ type: 'error', message: 'عذراً، الصلاحيات الحالية لا تسمح لك بإنشاء شكوى مباشرة. يرجى مراجعة إدارة النظام. (خطأ 403)' });
      } else if (err.response?.status === 400) {
           setSubmitStatus({ type: 'error', message: 'تأكد من صحة البيانات المرسلة: ' + (serverMsg || '') });
      } else {
          setSubmitStatus({ type: 'error', message: serverMsg || 'حدث خطأ في الخادم (500). يرجى مراجعة الكونسول.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">تقديم شكوى</h1>
            </div>
            <p className="text-blue-200 text-sm opacity-90 tracking-wider">تقديم شكوى جديدة للمراجعة</p>
          </div>
        </div>

        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
           <MessageSquare className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-1 flex flex-col gap-6">
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
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
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
                <p className="font-medium text-sm">{submitStatus.message}</p>
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              
              <div className="flex flex-col gap-3">
                <label className="text-gray-700 font-bold text-sm">نوع الشكوى</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-gray-50/50 cursor-pointer"
                >
                  <option value="Denied">تأخير في سداد النفقة</option>
                  <option value="Visitation">تعطيل موعد الرؤية</option>
                  <option value="Harassment">تغيير في حالة الحضانة</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-gray-700 font-bold text-sm">وصف الشكوى</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm bg-gray-50/50"
                  placeholder="اكتب تفاصيل الشكوى بشكل واضح ومفصل..."
                ></textarea>
                <div className="text-left">
                  <span className="text-xs text-gray-400">الحد الأدنى 20 حرف</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-gray-700 font-bold text-sm">تاريخ الواقعة <span className="text-gray-400 font-normal text-xs">(اختياري)</span></label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:border-blue-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-gray-700 font-bold text-sm">المستندات الداعمة <span className="text-gray-400 text-xs font-normal">(اختياري)</span></label>
                <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer group relative">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-bold text-gray-600 mb-1">
                      {formData.file ? formData.file.name : "اضغط لرفع المستندات"}
                    </p>
                    {!formData.file && <p className="text-xs text-gray-400 font-medium">(حتى 5 ميجابايت) PDF, JPG, PNG</p>}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !caseInfo.familyId}
                className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 mt-4 group ${
                  isSubmitting || !caseInfo.familyId ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-900 hover:shadow-lg active:scale-95'
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

              <p className="text-center text-gray-400 text-xs mt-2">
                بتقديم هذه الشكوى، أؤكد أن المعلومات المقدمة صحيحة وكاملة
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}