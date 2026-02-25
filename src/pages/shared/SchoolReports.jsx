import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  FileText, 
  Info, 
  Download,
  User,
  Loader2,
  AlertCircle,
  FileWarning
} from 'lucide-react';
import api from '/src/services/api'; 
import { toast } from 'react-hot-toast';

const SchoolReports = () => {
  // --- الحالات (States) الخاصة بالربط مع السيرفر ---
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState(null);
  
  // 🚀 حالة جديدة لمعالجة خطأ الصلاحيات 403 القادم من الباك إند
  const [permissionError, setPermissionError] = useState(false);

  // 1. جلب قائمة الأبناء عند فتح الصفحة (المرحلة الأولى)
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        // نداء مسار العائلات لجلب الأبناء
        const response = await api.get('/api/families');
        const families = response.data || [];
        
        // استخراج جميع الأطفال من كل العائلات المتاحة للوالد
        const allChildren = families.reduce((acc, family) => {
          if (family.children && family.children.length > 0) {
            return [...acc, ...family.children];
          }
          return acc;
        }, []);

        setChildrenList(allChildren);

        // اختيار أول طفل افتراضياً
        if (allChildren.length > 0) {
          setSelectedChild(allChildren[0]);
        }
      } catch (err) {
        console.error("Error fetching families:", err);
        setError("حدث خطأ أثناء جلب بيانات الأبناء.");
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, []);

  // 2. جلب التقارير عند تغيير الطفل المختار (المرحلة الثانية)
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedChild) return;

      try {
        setLoadingReports(true);
        setPermissionError(false); // إعادة ضبط الخطأ مع كل محاولة جديدة

        // نداء مسار التقارير وتمرير childId
        const response = await api.get(`/api/school-reports/${selectedChild.id}`, {
          params: { PageNumber: 1, PageSize: 10 }
        });
        
        setReports(response.data?.items || []);
      } catch (err) {
        // 🚀 المعالجة الذكية للخطأ
        if (err.response && err.response.status === 403) {
            // إذا كان الخطأ 403 (ChildNotInSchool)، نفعل حالة الخطأ بدون إشعار مزعج
            setPermissionError(true);
        } else if (err.response && err.response.status === 404) {
            // لو لم يتم العثور على تقارير، نترك القائمة فارغة ببساطة
            setReports([]);
        } else {
            console.error("Error fetching reports:", err);
            toast.error("حدث خطأ أثناء جلب التقارير المدرسية.");
        }
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [selectedChild]);

  // دالة لتحميل التقرير الفعلي
  const handleDownload = (documentId) => {
    if (!documentId) {
        toast.error("معرف الملف غير متاح");
        return;
    }
    // بناء الرابط بناءً على الـ baseURL
    const fileUrl = `${api.defaults.baseURL}/api/documents/${documentId}`;
    window.open(fileUrl, '_blank');
    toast.success("جاري فتح الملف...");
  };

  // واجهة التحميل الأولية للأطفال
  if (loadingChildren) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a] mb-4" />
        <p className="text-gray-500 font-medium">جاري تحميل الملفات المدرسية...</p>
      </div>
    );
  }

  // واجهة الخطأ
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 shadow-sm border border-red-100">
          <AlertCircle className="w-6 h-6" />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10 font-sans" dir="rtl">
      
      {/* Top Banner */}
      <div className="bg-[#1e3a8a] text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex flex-col z-10 w-full text-right">
          <h1 className="text-2xl font-bold mb-2">التقارير المدرسية</h1>
          <p className="text-blue-200 text-sm">متابعة الأداء الأكاديمي والتقييمات المدرسية للأبناء</p>
        </div>
      </div>

      {/* TABS: قائمة الأطفال المتاحة */}
      {childrenList.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {childrenList.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-4 px-6 py-4 rounded-3xl font-bold transition-all whitespace-nowrap min-w-[200px] border-2 ${
                selectedChild?.id === child.id
                  ? 'bg-white border-[#1e3a8a] shadow-md transform scale-[1.02]'
                  : 'bg-white border-transparent text-gray-500 hover:border-blue-100'
              }`}
            >
              <div className={`p-3 rounded-full flex-shrink-0 transition-colors ${
                selectedChild?.id === child.id ? 'bg-[#1e3a8a] text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <User size={24} />
              </div>
              <div className="text-right">
                <p className={`text-base ${selectedChild?.id === child.id ? 'text-[#1e3a8a]' : 'text-gray-700'}`}>
                  {child.fullName.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {child.gender === 'Male' ? 'ذكر' : 'أنثى'} • العمر: {child.age}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl text-center text-gray-500 border border-gray-100 shadow-sm">
          لا يوجد أبناء مسجلين في ملفك الحالي.
        </div>
      )}

      {/* قسم التقارير للطفل المختار */}
      {selectedChild && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-800 border-r-4 border-[#1e3a8a] pr-3">
              تقارير الطالب: <span className="text-[#1e3a8a]">{selectedChild.fullName.split(' ')[0]}</span>
            </h2>
          </div>

          {loadingReports ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#1e3a8a]" />
            </div>
          ) : permissionError ? (
            // 🚀 واجهة عرض خطأ الصلاحيات 403 بدلاً من الـ Toast
            <div className="bg-yellow-50 p-10 rounded-3xl flex flex-col items-center text-center border border-yellow-200 shadow-sm">
                <FileWarning className="w-16 h-16 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-yellow-800 mb-2">الصلاحيات غير مكتملة</h3>
                <p className="text-yellow-700 max-w-md leading-relaxed">
                    لا يمكن عرض تقارير المدرسة حالياً. يرجى مراجعة الإدارة لتحديث صلاحيات حسابات أولياء الأمور لتشمل قراءة التقارير.
                </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center flex flex-col items-center border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold text-lg">لا توجد تقارير مدرسية مرفوعة حتى الآن.</p>
              <p className="text-sm text-gray-400 mt-2">ستظهر التقارير هنا فور قيام المدرسة برفعها.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow relative">
                  
                  {/* الشريط العلوي الديكوري */}
                  <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-green-500"></div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold text-gray-800 text-lg">{selectedChild.fullName.split(' ').slice(0,2).join(' ')}</h3>
                          <span className="text-sm text-gray-500">التقييم الأكاديمي</span>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-50 text-green-700 border border-green-200">
                        مُعتمد
                      </span>
                    </div>

                    <hr className="border-gray-100 my-4" />

                    {/* Date Row */}
                    <div className="flex justify-between items-center mb-6 bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-5 h-5 text-[#1e3a8a]" />
                        <span className="text-sm font-bold">
                          {report.reportType === 'Comprehensive' ? 'تقرير شامل' : 
                           report.reportType === 'Attendance' ? 'تقرير حضور' : 
                           report.reportType === 'Behavior' ? 'تقرير سلوك' : 
                           (report.reportType || 'تقرير مدرسي')}
                        </span>
                      </div>
                      <span className="text-sm text-[#1e3a8a] font-bold">
                        {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </span>
                    </div>

                    {/* Teacher Notes */}
                    <div className="bg-blue-50 text-blue-800 rounded-2xl p-4 mt-auto border border-blue-100">
                      <div className="flex gap-2 items-start mb-1">
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span className="font-bold text-sm">ملاحظة النظام:</span>
                      </div>
                      <p className="text-sm leading-relaxed pr-7">
                        التفاصيل الدقيقة للدرجات والمواد والسلوك موجودة داخل الملف المرفق (PDF). يرجى تحميله للاطلاع على التقييم الكامل.
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="p-6 pt-0 mt-auto">
                    <button 
                      onClick={() => handleDownload(report.documentId)}
                      className="w-full bg-[#1e3a8a] text-white flex items-center justify-center gap-2 py-3.5 rounded-xl hover:bg-blue-800 transition-colors font-bold shadow-md shadow-blue-900/20 active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                      disabled={!report.documentId}
                    >
                      <Download className="w-5 h-5" />
                      <span>{report.documentId ? 'تحميل التقرير المرفق' : 'الملف غير متاح'}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolReports;