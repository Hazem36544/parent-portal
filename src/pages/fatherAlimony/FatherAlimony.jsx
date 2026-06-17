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
  Receipt,
  X,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast'; 
import api, { courtAPI } from '../../services/api'; 
import { getErrorMessage } from '../../utils/errorHandler';

// بوابة الدفع Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// مكتبات الـ PDF
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// استيراد الخطوط (تأكد من وجودها في نفس المسار المعتمد في مشروعك)
import CairoRegular from '../../assets/fonts/Cairo-Regular.ttf';
import CairoBold from '../../assets/fonts/Cairo-Bold.ttf';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: CairoRegular },
    { src: CairoBold, fontWeight: 'bold' }
  ]
});

// مفتاح Stripe التجريبي
const stripePromise = loadStripe('pk_test_51STR69HQOAmw3IfkHb5zx53MK0s13vDzkGkfdbm5Zsad2APrnxLT4d7x8luLuVFkq0Xq2YaFAGoIzzLJzsnBAIw400SVoubLL4');

// تنسيقات الـ PDF الخاصة بإيصال السداد
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Cairo', backgroundColor: '#ffffff' },
  header: { textAlign: 'center', marginBottom: 25, borderBottom: '2 solid #1e3a8a', paddingBottom: 15 },
  headerMinistry: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 },
  headerSystem: { fontSize: 10, color: '#6b7280', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827', backgroundColor: '#f3f4f6', padding: '6 0', borderRadius: 4 },
  section: { marginBottom: 15, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1 solid #e2e8f0' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  value: { fontSize: 11, color: '#1e293b', fontWeight: 'bold' },
  partySection: { marginTop: 10, padding: 10, backgroundColor: '#ffffff', borderRadius: 6, border: '1 solid #cbd5e1' },
  partyTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 6, textAlign: 'right', borderBottom: '1 solid #f1f5f9', paddingBottom: 4 },
  transactionSection: { marginTop: 15, padding: 15, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1 solid #bbf7d0' },
  transactionTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 8, textAlign: 'right' },
  transactionValue: { fontSize: 12, color: '#15803d', fontWeight: 'bold' },
  referenceBox: { marginTop: 10, padding: 8, backgroundColor: '#ffffff', border: '1 dashed #94a3b8', borderRadius: 4, alignItems: 'center' },
  referenceLabel: { fontSize: 9, color: '#64748b', marginBottom: 2 },
  referenceValue: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', borderTop: '1 solid #e2e8f0', paddingTop: 10 },
  footerText: { fontSize: 9, color: '#94a3b8', lineHeight: 1.5 }
});

const formatTimeAndDatePDF = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};

// مكون PDF لإيصال السداد
const AlimonyReceiptPDF = ({ payment, alimony, parents, caseNumber, courtName }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.headerMinistry}>وزارة العدل - محكمة الأسرة {courtName ? `بـ ${courtName}` : ''}</Text>
        <Text style={pdfStyles.headerSystem}>(نظام وصال الإلكتروني)</Text>
        <Text style={pdfStyles.title}>إيصال سداد نفقة إلكتروني</Text>
      </View>

      <View style={pdfStyles.section}>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>رقم القضية:</Text>
            <Text style={pdfStyles.value}>{caseNumber || 'غير مدرج'}</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>طبيعة النفقة:</Text>
            <Text style={pdfStyles.value}>{alimony?.frequency === 'Monthly' ? 'دورية شهرية' : 'نفقة دورية'}</Text>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <View style={pdfStyles.partySection}>
            <Text style={pdfStyles.partyTitle}>الطرف الملتزم بالسداد (الأب)</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الاسم الرباعي:</Text>
              <Text style={pdfStyles.value}>{parents.fatherName}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الرقم القومي:</Text>
              <Text style={pdfStyles.value}>{parents.fatherNId}</Text>
            </View>
        </View>
        <View style={pdfStyles.partySection}>
            <Text style={pdfStyles.partyTitle}>الطرف المستفيد (الأم)</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الاسم الرباعي:</Text>
              <Text style={pdfStyles.value}>{parents.motherName}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>الرقم القومي:</Text>
              <Text style={pdfStyles.value}>{parents.motherNId}</Text>
            </View>
        </View>
      </View>

      <View style={pdfStyles.transactionSection}>
        <Text style={pdfStyles.transactionTitle}>تفاصيل الدفعة المسددة</Text>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>المبلغ المسدد:</Text>
            <Text style={pdfStyles.transactionValue}>{(payment.amount / 100).toLocaleString('ar-EG')} ج.م</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>عن استحقاق تاريخ:</Text>
            <Text style={pdfStyles.transactionValue}>{new Date(payment.dueDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>تاريخ ووقت السداد الفعلي:</Text>
            <Text style={pdfStyles.transactionValue} dir="ltr">{formatTimeAndDatePDF(payment.paidAt || payment.dueDate)}</Text>
        </View>
        <View style={pdfStyles.referenceBox}>
            <Text style={pdfStyles.referenceLabel}>الرقم المرجعي للعملية (Transaction ID)</Text>
            <Text style={pdfStyles.referenceValue}>{payment.id}</Text>
        </View>
      </View>

      <View style={pdfStyles.footer}>
         <Text style={pdfStyles.footerText}>يُعد هذا المستند إيصالاً إلكترونياً رسمياً بسداد قيمة النفقة الموضحة أعلاه، ومسجل لدى قاعدة بيانات وزارة العدل المصرية، ولا يتطلب ختم الجهة أو التوقيع الورقي.</Text>
         <Text style={pdfStyles.footerText}>تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')} - نظام وصال</Text>
      </View>
    </Page>
  </Document>
);

// مكون الدفع Stripe
const CheckoutForm = ({ amountFormatted, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setIsPaying(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.href.split('?')[0]}?status=success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("حدث خطأ غير متوقع أثناء عملية الدفع.");
      }
      setIsPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200" dir="ltr">
        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      </div>
      
      {message && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start gap-2 border border-red-100 text-sm font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" disabled={isPaying} onClick={onCancel} className="flex-1 bg-white text-gray-700 border border-gray-200 h-12 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm outline-none cursor-pointer">
          إلغاء
        </button>
        <button type="submit" disabled={isPaying || !stripe || !elements} className="flex-[2] bg-[#1e3a8a] text-white h-12 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-sm outline-none border-none cursor-pointer flex justify-center items-center gap-2">
          {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : `تأكيد ودفع ${amountFormatted} ج.م`}
        </button>
      </div>
    </form>
  );
};


export default function FatherAlimony() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [alimonyDetails, setAlimonyDetails] = useState(null);
  const [currentDue, setCurrentDue] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);

  const [courtName, setCourtName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [parentsInfo, setParentsInfo] = useState({ fatherName: '', fatherNId: '', motherName: '', motherNId: '' });
  
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmountToDisplay, setPaymentAmountToDisplay] = useState('');

  const formatMoney = (amount) => (amount ? (amount / 100).toLocaleString('ar-EG') : '0');
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTimeAndDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("status") === "success") {
      toast.success("تم تأكيد عملية الدفع بنجاح!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchAlimonyData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        const famRes = await courtAPI.getMyFamilies();
        const families = Array.isArray(famRes.data) ? famRes.data : (famRes.data?.items || []);
        
        if (families.length > 0) {
          const currentFamily = families[0];
          const familyId = currentFamily.familyId || currentFamily.id;
          
          setParentsInfo({
            fatherName: currentFamily.father?.fullName || 'غير مسجل',
            fatherNId: currentFamily.father?.nationalId || 'غير مسجل',
            motherName: currentFamily.mother?.fullName || 'غير مسجل',
            motherNId: currentFamily.mother?.nationalId || 'غير مسجل'
          });
          
          const ccRes = await courtAPI.listCourtCasesByFamily(familyId, { PageNumber: 1, PageSize: 50 });
          const courtCases = Array.isArray(ccRes.data) ? ccRes.data : (ccRes.data?.items || []);

          let foundAlimony = null;
          let matchedCaseNum = '';

          for (const courtCase of courtCases) {
            try {
              const caseId = courtCase.id || courtCase.courtCaseId;
              const alimonyRes = await api.get(`/api/court-cases/${caseId}/alimonySchedule-schedule`);
              if (alimonyRes.data) {
                foundAlimony = alimonyRes.data;
                matchedCaseNum = courtCase.caseNumber || 'غير مدرج';
                break; 
              }
            } catch (e) { 
              if (e.response?.status !== 404) console.error("Alimony fetch error:", e);
            }
          }

          if (foundAlimony) {
            setCaseNumber(matchedCaseNum);
            setAlimonyDetails(foundAlimony);

            if (foundAlimony.courtId) {
                try {
                    const courtRes = await api.get(`/api/courts/${foundAlimony.courtId}`);
                    if (courtRes.data && courtRes.data.name) {
                        setCourtName(courtRes.data.name);
                    }
                } catch(e) { console.warn("Failed to fetch court name"); }
            }

            const payRes = await api.get(`/api/alimonySchedule-schedules/${foundAlimony.id}/alimonySchedule-dues`, {
              params: { alimonyId: foundAlimony.id, PageNumber: 1, PageSize: 100 }
            });
            
            let rawPayments = Array.isArray(payRes.data) ? payRes.data : (payRes.data?.items || []);
            
            let cleanPayments = [];
            let seenPaymentDates = new Set();

            rawPayments.sort((a, b) => (a.status === 'Paid' ? -1 : 1));

            rawPayments.forEach(p => {
                const dateOnly = p.dueDate.split('T')[0];
                if (!seenPaymentDates.has(dateOnly)) {
                    seenPaymentDates.add(dateOnly);
                    cleanPayments.push(p);
                }
            });

            const allPayments = cleanPayments;
            const now = new Date();
            now.setHours(0, 0, 0, 0); 
            
            const paid = allPayments.filter(p => p.status === 'Paid' || p.status === 'مدفوعة');
            setPaidPayments(paid.sort((a, b) => {
              const dateA = new Date(a.paidAt || a.dueDate).getTime();
              const dateB = new Date(b.paidAt || b.dueDate).getTime();
              return dateB - dateA;
            }));

            const overdue = allPayments.filter(p => {
              if (p.status === 'Paid' || p.status === 'مدفوعة') return false;
              const dueDate = new Date(p.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate < now; 
            }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            
            setOverduePayments(overdue);

            const upcoming = allPayments.filter(p => {
              if (p.status === 'Paid' || p.status === 'مدفوعة') return false;
              const dueDate = new Date(p.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate >= now;
            }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            
            if (upcoming.length > 0) {
              setCurrentDue(upcoming[0]);
            }
          }
        }
      } catch (error) {
        console.error("Fetch Data Error:", error);
        const msg = getErrorMessage(error);
        setErrorMsg(typeof msg === 'string' ? msg : 'حدث خطأ أثناء تحميل بيانات النفقة من الخادم.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlimonyData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, showFullHistory]); 

  const handlePayment = async (paymentDueId, amount) => {
    try {
      setIsProcessingPayment(true);
      
      const response = await api.post(`/api/alimonySchedule-dues/${paymentDueId}/payments`);
      
      if (response.data && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setPaymentAmountToDisplay(formatMoney(amount));
        setShowPaymentModal(true); 
      } else {
        toast.error("لم يتم استرجاع مفتاح الدفع (Client Secret) من الخادم.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(getErrorMessage(error) || 'حدث خطأ أثناء تهيئة بوابة الدفع.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadReceiptPDF = async () => {
    if (!selectedReceipt) return;
    setIsGeneratingPDF(true);
    try {
        const blob = await pdf(
          <AlimonyReceiptPDF 
            payment={selectedReceipt} 
            alimony={alimonyDetails} 
            parents={parentsInfo} 
            caseNumber={caseNumber} 
            courtName={courtName} 
          />
        ).toBlob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Alimony_Receipt_${selectedReceipt.id.substring(0,8)}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("تم تحميل الإيصال بنجاح");
    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast.error("حدث خطأ أثناء استخراج الإيصال");
    } finally {
        setIsGeneratingPDF(false);
    }
  };

  const getDelayDays = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(now - dueDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const appearance = {
    theme: 'stripe',
    variables: { colorPrimary: '#1e3a8a', borderRadius: '12px' },
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] text-[#1e3a8a] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري جلب تفاصيل النفقة من المحكمة...</p>
      </div>
    );
  }

  // في حالة الفشل في جلب البيانات الرئيسية (لا يوجد قرار نفقة)
  if (errorMsg && !alimonyDetails) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-sans" dir="rtl">
        <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] flex flex-col items-center gap-4 shadow-sm border border-red-100 text-center max-w-lg">
          <AlertCircle className="w-12 h-12" />
          <h2 className="text-xl font-bold">{errorMsg}</h2>
          <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm outline-none border-none cursor-pointer">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  if (showFullHistory) {
    return (
      <div className="w-full font-sans" dir="rtl">
        <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10 px-4 md:px-0">
            
            <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-5 md:p-6 text-white flex items-center justify-between overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 md:gap-5 relative z-10">
                <button 
                  onClick={() => setShowFullHistory(false)} 
                  className="bg-white/10 p-2.5 md:p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border-none outline-none cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold mb-1">سجل المدفوعات الكامل</h1>
                  <p className="text-blue-200 text-xs md:text-sm font-bold opacity-90">جميع الدفعات التي قمت بتسديدها سابقاً</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-l from-green-50 to-emerald-50/30 border border-green-100 rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col gap-1 text-center sm:text-right">
                 <span className="text-green-700 font-bold text-sm">إجمالي المبالغ المسددة</span>
                 <div className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                   {formatMoney(paidPayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
                   <CheckCircle className="w-8 h-8 text-[#16a34a] hidden sm:block" />
                 </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md border border-green-200/50 py-3.5 px-8 rounded-2xl flex items-center gap-3 shadow-sm">
                 <span className="text-gray-500 text-sm font-bold">عدد المدفوعات الناجحة:</span>
                 <span className="text-green-700 font-bold text-lg">{paidPayments.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paidPayments.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => { setSelectedReceipt(item); setShowReceiptModal(true); }}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-24 h-24 bg-green-50 rounded-br-full -translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform opacity-50 pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-gray-50 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 p-2.5 rounded-xl text-green-600 group-hover:scale-105 transition-transform"><Receipt className="w-5 h-5" /></div>
                      <div>
                        <h3 className="font-bold text-gray-800">{formatDate(item.dueDate)}</h3>
                        <span className="text-xs text-gray-500 font-bold">استحقاق شهر</span>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">مسددة</span>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-xs font-bold">المبلغ المسدد:</span>
                      <span className="text-xl font-bold text-[#16a34a] font-mono">{formatMoney(item.amount)} <span className="text-sm text-gray-500">ج.م</span></span>
                    </div>
                    <div className="text-blue-600 bg-blue-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
              {paidPayments.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                   <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                   <p className="font-bold text-lg">لا توجد مدفوعات سابقة مسجلة في النظام</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* ✅ نافذة عرض الإيصال وتحميله */}
        {showReceiptModal && selectedReceipt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
                    
                    <div className="bg-green-600 text-white p-4 flex justify-between items-center shrink-0">
                        <h2 className="font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> إيصال سداد نفقة إلكتروني</h2>
                        <button onClick={() => setShowReceiptModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        <div className="text-center pb-4 border-b border-gray-100">
                            <Receipt className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-80" />
                            <h3 className="text-3xl font-black text-gray-800 font-mono tracking-tight">{formatMoney(selectedReceipt.amount)} <span className="text-lg">ج.م</span></h3>
                            <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full mt-2 inline-block">تم السداد بنجاح</span>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">عن استحقاق شهر</span>
                                <span className="text-gray-800 font-bold text-sm">{formatDate(selectedReceipt.dueDate)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-gray-500 font-bold text-sm">تاريخ ووقت السداد</span>
                                <span className="text-gray-800 font-bold text-xs font-mono" dir="ltr">{formatTimeAndDate(selectedReceipt.paidAt || selectedReceipt.dueDate)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-gray-500 font-bold text-sm">الرقم المرجعي</span>
                                <span className="text-gray-800 font-bold text-[10px] font-mono tracking-widest">{selectedReceipt.id.split('-')[0].toUpperCase()}...</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm text-center">
                            <p className="text-xs text-blue-800 font-bold leading-relaxed">
                                هذا الإيصال معتمد إلكترونياً من محكمة الأسرة {courtName ? `بـ ${courtName}` : ''} ويُعد بمثابة إبراء ذمة للدفعة المذكورة.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
                        <button onClick={() => setShowReceiptModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm outline-none cursor-pointer">إغلاق</button>
                        <button onClick={handleDownloadReceiptPDF} disabled={isGeneratingPDF} className="flex-[2] bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm outline-none border-none cursor-pointer flex justify-center items-center gap-2">
                            {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> تحميل الإيصال (PDF)</>}
                        </button>
                    </div>

                </div>
            </div>
        )}

      </div>
    );
  }

  const dueTodayList = overduePayments.filter(p => Math.floor((new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24)) <= 0);
  const strictlyOverdueList = overduePayments.filter(p => Math.floor((new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24)) > 0);

  return (
    <div className="w-full font-sans pb-10" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 px-4 md:px-0">
          
          <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-5 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden shadow-xl gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            <div className="flex items-center gap-4 md:gap-5 relative z-10">
              <button 
                onClick={() => navigate(-1)} 
                className="bg-white/10 p-2.5 md:p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group shrink-0 border-none outline-none cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold mb-1">النفقة المالية</h1>
                <p className="text-blue-200 text-xs md:text-sm opacity-90 font-bold tracking-wide">إدارة ومتابعة الالتزامات المالية</p>
              </div>
            </div>
            
            <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
               <Wallet className="w-8 h-8 text-blue-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* البطاقة الصفراء: الدفعة الحالية */}
              {currentDue && (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 p-3.5 rounded-2xl shrink-0 text-yellow-600 shadow-sm">
                        <Clock className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">النفقة الشهرية المستحقة</h2>
                        <p className="text-gray-500 text-sm font-bold">دفعة استحقاق {formatDate(currentDue.dueDate)}</p>
                      </div>
                    </div>
                    <span className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-[10px] md:text-xs font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-sm">
                      بانتظار الدفع
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 relative z-10 shadow-sm">
                    <div className="md:col-span-1 flex flex-col justify-center items-center md:items-start md:border-l border-gray-200 md:pl-6">
                      <span className="text-gray-500 text-xs font-bold mb-1">المبلغ المطلوب</span>
                      <span className="text-3xl font-bold text-gray-800 font-mono tracking-tight text-center md:text-right w-full">
                        {formatMoney(currentDue.amount)} <span className="text-lg">ج.م</span>
                      </span>
                    </div>
                    
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-gray-500 text-[10px] md:text-xs font-bold">تاريخ الاستحقاق</span>
                        <span className="font-bold text-gray-700 text-xs md:text-sm">{formatDate(currentDue.dueDate)}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-gray-500 text-[10px] md:text-xs font-bold">الوقت المتبقي</span>
                        <span className="font-bold text-orange-600 text-xs md:text-sm">
                          {Math.max(0, Math.ceil((new Date(currentDue.dueDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)))} يوم
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-white p-3 rounded-xl border border-gray-100 col-span-2 shadow-sm">
                        <span className="text-gray-500 text-[10px] md:text-xs font-bold">طريقة الدفع المعتمدة</span>
                        <span className="font-bold text-gray-700 text-xs md:text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500"/> الدفع الإلكتروني الآمن (Stripe)</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handlePayment(currentDue.id, currentDue.amount)}
                    disabled={isProcessingPayment}
                    className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 relative z-10 outline-none border-none cursor-pointer"
                  >
                    {isProcessingPayment ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CreditCard className="w-5 h-5" /> دفع النفقة الآن ({formatMoney(currentDue.amount)} ج.م)</>}
                  </button>
                </div>
              )}

              {/* البطاقة الحمراء: المتأخرات */}
              {overduePayments.length > 0 && (
                <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/50 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                      <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-1">
                        <AlertCircle className="w-6 h-6" /> النفقات المتأخرة
                      </h2>
                      <p className="text-red-500/80 text-xs md:text-sm font-bold">يجب سدادها لتجنب الإجراءات القانونية</p>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] md:text-xs text-red-500 font-bold block mb-1">إجمالي المتأخرات</span>
                      <span className="text-xl md:text-2xl font-bold text-red-600 font-mono">
                        {formatMoney(overduePayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 relative z-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {overduePayments.map(payment => (
                      <div key={payment.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-red-100 shadow-sm hover:border-red-200 transition-colors gap-4 sm:gap-0">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-800 font-bold text-sm">
                            دفعة {formatDate(payment.dueDate)}
                          </span>
                          <span className="text-red-500 text-[10px] md:text-xs font-bold">
                            متأخرة منذ {getDelayDays(payment.dueDate)} يوم
                          </span>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0">
                          <span className="text-red-600 font-bold font-mono text-lg">{formatMoney(payment.amount)} ج.م</span>
                          <button 
                            onClick={() => handlePayment(payment.id, payment.amount)}
                            disabled={isProcessingPayment}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 outline-none border-none cursor-pointer flex items-center gap-2"
                          >
                            {isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : "سداد الآن"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔴 بطاقة الخطأ: تظهر فقط عند فشل جلب الدفعات مع وجود قرار نفقة */}
              {errorMsg && alimonyDetails && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full min-h-[300px]">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-500 mb-5 shadow-sm border border-red-100">
                     <AlertCircle className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-2">تعذر جلب الدفعات المستحقة</h3>
                   <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-sm">يوجد مشكلة في الاتصال بالخادم ولم نتمكن من جلب تفاصيل دفعات النفقة الخاصة بك.</p>
                   <button onClick={() => window.location.reload()} className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm outline-none border-none cursor-pointer">إعادة المحاولة</button>
                </div>
              )}

              {/* البطاقة الخضراء */}
              {!currentDue && overduePayments.length === 0 && !errorMsg && (
                <div className="bg-green-50 border border-green-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full min-h-[300px]">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-500 mb-5 shadow-sm border border-green-100">
                     <CheckCircle className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أي مستحقات حالياً</h3>
                   <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-sm">أنت ملتزم بجميع الدفعات المقررة، ولا يوجد أي متأخرات على حسابك. شكراً لالتزامك ومسؤوليتك.</p>
                </div>
              )}

            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-xl"><FileText className="w-5 h-5"/></div>
                  <h2 className="text-base font-bold text-gray-800">بيانات قرار النفقة</h2>
                </div>
                
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold text-xs md:text-sm">المبلغ الشهري المقرر</span>
                    <span className="font-bold text-[#1e3a8a] font-mono text-base">{formatMoney(alimonyDetails?.amount)} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold text-xs md:text-sm">معدل الدفع</span>
                    <span className="font-bold text-gray-800 text-xs md:text-sm">
                      {alimonyDetails?.frequency === 'Weekly' ? 'أسبوعياً' : 
                       alimonyDetails?.frequency === 'Monthly' ? 'شهرياً' : 
                       alimonyDetails?.frequency === 'Yearly' ? 'سنوياً' : (alimonyDetails?.frequency || 'غير محدد')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-1">
                     <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex flex-col justify-center items-center text-center gap-1 shadow-sm">
                       <span className="text-xl font-bold text-green-700 font-mono">{paidPayments.length}</span>
                       <span className="text-green-700 text-[10px] md:text-xs font-bold">دفعة مسددة</span>
                     </div>
                     <div className={`${overduePayments.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border p-3 rounded-xl flex flex-col justify-center items-center text-center gap-1 shadow-sm`}>
                       <span className={`text-xl font-bold font-mono ${overduePayments.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{overduePayments.length}</span>
                       <span className={`${overduePayments.length > 0 ? 'text-red-600' : 'text-gray-500'} text-[10px] md:text-xs font-bold`}>دفعة متأخرة</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col flex-1">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-50">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-xl"><CalendarDays className="w-5 h-5"/></div>
                      سجل المدفوعات
                    </h2>
                    <button 
                      onClick={() => setShowFullHistory(true)}
                      className="text-[#1e3a8a] text-[10px] md:text-xs font-bold bg-blue-50 py-1.5 px-3 rounded-lg hover:bg-blue-100 transition-colors border-none outline-none cursor-pointer"
                    >
                      عرض السجل
                    </button>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  {paidPayments.slice(0, 3).map(payment => (
                    <div key={payment.id} className="bg-gray-50 p-3.5 rounded-xl flex justify-between items-center border border-gray-100 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-800 font-bold text-xs md:text-sm font-mono" dir="ltr">{formatDate(payment.dueDate)}</span>
                        <span className="text-green-600 text-[10px] md:text-[11px] font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> تم السداد بنجاح</span>
                      </div>
                      <span className="font-bold text-[#1e3a8a] text-sm font-mono">{formatMoney(payment.amount)} ج.م</span>
                    </div>
                  ))}
                  
                  {paidPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-6 opacity-50 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Receipt className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 font-bold">لا توجد عمليات دفع سابقة</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ✅ نافذة الدفع */}
      {showPaymentModal && clientSecret && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" dir="rtl">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="bg-[#1e3a8a] p-5 border-b border-white/10 flex justify-between items-center text-white shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-200" /> الدفع الآمن
              </h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="text-center mb-6">
                 <p className="text-sm font-bold text-gray-500 mb-1">المبلغ المطلوب سداده</p>
                 <p className="text-3xl font-black text-[#1e3a8a] font-mono">{paymentAmountToDisplay} <span className="text-lg font-sans">ج.م</span></p>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                <CheckoutForm 
                   amountFormatted={paymentAmountToDisplay}
                   onCancel={() => setShowPaymentModal(false)}
                   onSuccess={() => {
                     setShowPaymentModal(false);
                     toast.success("تم تأكيد عملية الدفع بنجاح!");
                     setTimeout(() => window.location.reload(), 1500);
                   }}
                />
              </Elements>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-2 shrink-0">
               <span className="text-[10px] font-bold text-gray-400">مدعوم ومشفر بواسطة</span>
               <span className="text-xs font-black text-indigo-600 tracking-widest font-mono">stripe</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}