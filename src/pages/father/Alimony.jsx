import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  ChevronRight,
  Loader2,
  Wallet,
  CalendarDays,
  FileText,
  Receipt
} from 'lucide-react';
import { toast } from 'react-hot-toast'; 
import { courtAPI } from '../../services/api'; 

export default function Alimony() {
  const navigate = useNavigate();
  
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [alimonyDetails, setAlimonyDetails] = useState(null);
  const [currentDue, setCurrentDue] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);

  useEffect(() => {
    const fetchAlimonyData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        let foundAlimony = null;
        let allPayments = [];

        const famRes = await courtAPI.getMyFamilies();
        const families = Array.isArray(famRes.data) ? famRes.data : (famRes.data?.items || []);
        
        if (families.length > 0) {
          const familyId = families[0].familyId || families[0].id;
          
          const ccRes = await courtAPI.listCourtCasesByFamily(familyId, { PageNumber: 1, PageSize: 50 });
          const courtCases = Array.isArray(ccRes.data) ? ccRes.data : (ccRes.data?.items || []);

          for (const courtCase of courtCases) {
            try {
              const caseId = courtCase.id || courtCase.courtCaseId;
              const alimonyRes = await courtAPI.getAlimonyByCourtCase(caseId);
              if (alimonyRes.data) {
                foundAlimony = alimonyRes.data;
                break; 
              }
            } catch (e) { 
              if (e.response?.status !== 404) console.error("Alimony fetch error:", e);
            }
          }

          if (foundAlimony) {
            setAlimonyDetails(foundAlimony);
            const payRes = await courtAPI.listPaymentsDueByAlimony(foundAlimony.id, { PageNumber: 1, PageSize: 100 });
            allPayments = Array.isArray(payRes.data) ? payRes.data : (payRes.data?.items || []);
            
            const now = new Date();
            
            // ✅ تم إصلاح مشكلة الترتيب لتجنب أخطاء الـ null في حقل paidAt
            const paid = allPayments.filter(p => p.status === 'Paid' || p.status === 'مدفوعة');
            setPaidPayments(paid.sort((a, b) => {
              const dateA = new Date(a.paidAt || a.dueDate).getTime();
              const dateB = new Date(b.paidAt || b.dueDate).getTime();
              return dateB - dateA;
            }));

            const overdue = allPayments.filter(p => p.status !== 'Paid' && p.status !== 'مدفوعة' && new Date(p.dueDate) < now);
            setOverduePayments(overdue);

            const upcoming = allPayments.filter(p => p.status !== 'Paid' && p.status !== 'مدفوعة' && new Date(p.dueDate) >= now)
                                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            
            if (upcoming.length > 0) {
              setCurrentDue(upcoming[0]);
            }
          }
        }
      } catch (error) {
        console.error("Fetch Data Error:", error);
        setErrorMsg('حدث خطأ أثناء تحميل بيانات النفقة من الخادم.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlimonyData();
  }, []);

  const handlePayment = async (paymentDueId) => {
    try {
      setIsProcessingPayment(true);
      
      // ✅ تم وضع روابط https لاختبار المشكلة.. 
      // بمجرد رفع المشروع أو إصلاح الباك إند، قم بتبديلها بالأسطر المعطلة (المتعلقة بـ window.location.origin)
      const response = await courtAPI.initiateAlimonyPayment(paymentDueId, {
        successUrl: `https://google.com?status=success`, // روابط مؤقتة للاختبار
        cancelUrl: `https://google.com?status=cancel`    // روابط مؤقتة للاختبار
        
        // successUrl: `${window.location.origin}/parent/alimony/success`, 
        // cancelUrl: `${window.location.origin}/parent/alimony` 
      });
      
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("لم يتم استرجاع رابط الدفع من السيرفر.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error('حدث خطأ أثناء الاتصال ببوابة الدفع.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatMoney = (amount) => amount?.toLocaleString('ar-EG');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a]" />
        <p className="text-gray-500 font-medium animate-pulse">جاري جلب تفاصيل النفقة من المحكمة...</p>
      </div>
    );
  }

  if (errorMsg && !alimonyDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white rounded-[2rem] p-10 text-center m-4 shadow-sm border border-gray-100" dir="rtl">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{errorMsg}</h2>
        <button onClick={() => window.location.reload()} className="mt-4 bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm">إعادة المحاولة</button>
      </div>
    );
  }

  if (showFullHistory) {
    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
        
        <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-5 relative z-10">
            <button onClick={() => setShowFullHistory(false)} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold mb-1">سجل المدفوعات الكامل</h1>
              <p className="text-blue-200 text-sm">جميع الدفعات التي قمت بتسديدها سابقاً</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-l from-green-50 to-emerald-50/30 border border-green-100 rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="flex flex-col gap-1 text-center sm:text-right">
             <span className="text-green-700 font-bold text-sm">إجمالي المبالغ المسددة</span>
             <div className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
               {formatMoney(paidPayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
               <CheckCircle className="w-8 h-8 text-[#16a34a] hidden sm:block" />
             </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-green-200/50 py-3.5 px-8 rounded-2xl flex items-center gap-3 shadow-sm">
             <span className="text-gray-500 text-sm font-medium">عدد المدفوعات الناجحة:</span>
             <span className="text-green-700 font-bold text-lg">{paidPayments.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paidPayments.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2.5 rounded-xl text-green-600"><Receipt className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-800">{formatDate(item.dueDate)}</h3>
                    <span className="text-xs text-gray-400">تاريخ الاستحقاق</span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full">تم الدفع</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs">تاريخ السداد الفعلي:</span>
                  <span className="font-bold text-gray-700 text-sm font-mono" dir="ltr">{formatDate(item.paidAt || item.dueDate)}</span>
                </div>
                <span className="text-xl font-bold text-gray-800 font-mono">{formatMoney(item.amount)} ج.م</span>
              </div>
            </div>
          ))}
          {paidPayments.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p className="font-medium text-lg">لا توجد مدفوعات سابقة مسجلة في النظام</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-10 animate-in fade-in duration-500" dir="rtl">
      
      <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden shadow-xl gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-5 relative z-10">
          <button onClick={() => navigate(-1)} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">النفقة المالية</h1>
            <p className="text-blue-200 text-sm md:text-base opacity-90">إدارة ومتابعة الالتزامات المالية</p>
          </div>
        </div>
        
        <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
           <Wallet className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 flex flex-col order-2 lg:order-1 gap-6">
          
          {/* البطاقة الصفراء: الدفعة الحالية */}
          {currentDue && (
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3.5 rounded-2xl shrink-0 text-yellow-600">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">النفقة الشهرية المستحقة</h2>
                    <p className="text-gray-500 text-sm">دفعة استحقاق {formatDate(currentDue.dueDate)}</p>
                  </div>
                </div>
                <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                  بانتظار الدفع
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="md:col-span-1 flex flex-col justify-center items-center md:items-start md:border-l border-gray-200 md:pl-6">
                  <span className="text-gray-400 text-xs font-bold mb-1">المبلغ المطلوب</span>
                  <span className="text-3xl font-bold text-gray-800 font-mono tracking-tight text-center md:text-right w-full">
                    {formatMoney(currentDue.amount)} <span className="text-lg">ج.م</span>
                  </span>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-gray-50">
                    <span className="text-gray-400 text-xs font-bold">تاريخ الاستحقاق</span>
                    <span className="font-bold text-gray-700 text-sm">{formatDate(currentDue.dueDate)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-gray-50">
                    <span className="text-gray-400 text-xs font-bold">الوقت المتبقي</span>
                    <span className="font-bold text-orange-600 text-sm">
                      {Math.max(0, Math.ceil((new Date(currentDue.dueDate) - new Date()) / (1000 * 60 * 60 * 24)))} يوم
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-gray-50 col-span-2">
                    <span className="text-gray-400 text-xs font-bold">طريقة الدفع</span>
                    <span className="font-bold text-gray-700 text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500"/> الدفع الإلكتروني عبر البوابة (Stripe)</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handlePayment(currentDue.id)}
                disabled={isProcessingPayment}
                className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 relative z-10"
              >
                {isProcessingPayment ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CreditCard className="w-5 h-5" /> دفع النفقة الآن ({formatMoney(currentDue.amount)} ج.م)</>}
              </button>
            </div>
          )}

          {/* البطاقة الحمراء: المتأخرات */}
          {overduePayments.length > 0 && (
            <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-6 lg:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/50 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-1">
                    <AlertCircle className="w-6 h-6" /> النفقات المتأخرة
                  </h2>
                  <p className="text-red-500/80 text-sm font-medium">يجب سدادها لتجنب الإجراءات القانونية</p>
                </div>
                <div className="text-left">
                  <span className="text-xs text-gray-500 font-bold block mb-1">إجمالي المتأخرات</span>
                  <span className="text-2xl font-bold text-red-600 font-mono">
                    {formatMoney(overduePayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                {overduePayments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-red-100 shadow-sm hover:border-red-200 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-800 font-bold text-sm">
                        دفعة {formatDate(payment.dueDate)}
                      </span>
                      <span className="text-red-400 text-xs font-bold">
                        متأخرة منذ {Math.floor((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} يوم
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-red-600 font-bold font-mono text-lg">{formatMoney(payment.amount)} ج.م</span>
                      <button 
                        onClick={() => handlePayment(payment.id)}
                        disabled={isProcessingPayment}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                      >
                        سداد الآن
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* البطاقة الخضراء: تظهر فقط عند عدم وجود أي مستحقات حالية أو متأخرة */}
          {!currentDue && overduePayments.length === 0 && (
            <div className="bg-green-50 border-2 border-green-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-sm">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-500 mb-4 shadow-sm">
                 <CheckCircle className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أي مستحقات حالياً</h3>
               <p className="text-gray-600">أنت ملتزم بجميع الدفعات المقررة. شكراً لالتزامك ومسؤوليتك.</p>
            </div>
          )}

        </div>

        <div className="lg:col-span-1 flex flex-col gap-6 order-1 lg:order-2">
          
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-5 h-5"/></div>
              <h2 className="text-lg font-bold text-gray-800">بيانات قرار النفقة</h2>
            </div>
            
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl">
                <span className="text-gray-500 font-bold">المبلغ الشهري المقرر</span>
                <span className="font-bold text-gray-800 font-mono text-base">{formatMoney(alimonyDetails?.amount)} ج.م</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl">
                <span className="text-gray-500 font-bold">معدل الدفع</span>
                <span className="font-bold text-gray-800">
                  {alimonyDetails?.frequency === 'Weekly' ? 'أسبوعياً' : 
                   alimonyDetails?.frequency === 'Monthly' ? 'شهرياً' : 
                   alimonyDetails?.frequency === 'Yearly' ? 'سنوياً' : (alimonyDetails?.frequency || 'غير محدد')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                 <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col justify-center items-center text-center gap-1">
                   <span className="text-2xl font-bold text-green-700 font-mono">{paidPayments.length}</span>
                   <span className="text-green-600/80 text-xs font-bold">دفعة سددت</span>
                 </div>
                 <div className={`${overduePayments.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border p-4 rounded-xl flex flex-col justify-center items-center text-center gap-1`}>
                   <span className={`text-2xl font-bold font-mono ${overduePayments.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{overduePayments.length}</span>
                   <span className={`${overduePayments.length > 0 ? 'text-red-500/80' : 'text-gray-400'} text-xs font-bold`}>دفعة متأخرة</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-gray-400"/> أحدث المدفوعات
                </h2>
                <button 
                  onClick={() => setShowFullHistory(true)}
                  className="text-[#1e3a8a] text-xs font-bold bg-blue-50 py-1.5 px-3 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  عرض الكل
                </button>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {paidPayments.slice(0, 3).map(payment => (
                <div key={payment.id} className="bg-gray-50 p-3.5 rounded-2xl flex justify-between items-center border border-gray-100 hover:border-blue-100 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-800 font-bold text-sm font-mono" dir="ltr">{formatDate(payment.dueDate)}</span>
                    <span className="text-green-600 text-[10px] font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> تم السداد</span>
                  </div>
                  <span className="font-bold text-gray-800 text-sm font-mono">{formatMoney(payment.amount)} ج.م</span>
                </div>
              ))}
              
              {paidPayments.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-8 opacity-50">
                  <Receipt className="w-10 h-10 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">لا توجد عمليات دفع سابقة</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}