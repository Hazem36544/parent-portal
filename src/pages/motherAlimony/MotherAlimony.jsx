import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  Loader2,
  Wallet,
  CalendarDays,
  FileText,
  Receipt,
  Download,
  Landmark,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast'; 
import api, { courtAPI } from '../../services/api'; 
import { getErrorMessage } from '../../utils/errorHandler';

// ✅ مكتبات الـ PDF
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// استيراد الخطوط
import CairoRegular from '../../assets/fonts/Cairo-Regular.ttf';
import CairoBold from '../../assets/fonts/Cairo-Bold.ttf';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: CairoRegular },
    { src: CairoBold, fontWeight: 'bold' }
  ]
});

// ✅ تنسيقات الـ PDF
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Cairo', backgroundColor: '#ffffff' },
  header: { textAlign: 'center', marginBottom: 25, borderBottom: '2 solid #1e3a8a', paddingBottom: 15 },
  headerMinistry: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 4 },
  headerSystem: { fontSize: 10, color: '#6b7280', marginBottom: 8 },
  titleReceipt: { fontSize: 16, fontWeight: 'bold', color: '#111827', backgroundColor: '#f0fdf4', padding: '6 0', borderRadius: 4, border: '1 solid #bbf7d0' },
  titleOverdue: { fontSize: 16, fontWeight: 'bold', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '6 0', borderRadius: 4, border: '1 solid #fecaca' },
  section: { marginBottom: 15, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1 solid #e2e8f0' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 11, color: '#64748b', fontWeight: 'bold' },
  value: { fontSize: 11, color: '#1e293b', fontWeight: 'bold' },
  partySection: { marginTop: 10, padding: 10, backgroundColor: '#ffffff', borderRadius: 6, border: '1 solid #cbd5e1' },
  partyTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 6, textAlign: 'right', borderBottom: '1 solid #f1f5f9', paddingBottom: 4 },
  partyTitleRed: { fontSize: 11, fontWeight: 'bold', color: '#b91c1c', marginBottom: 6, textAlign: 'right', borderBottom: '1 solid #f1f5f9', paddingBottom: 4 },
  transactionSection: { marginTop: 15, padding: 15, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1 solid #bbf7d0' },
  transactionTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 8, textAlign: 'right' },
  transactionValue: { fontSize: 12, color: '#15803d', fontWeight: 'bold' },
  overdueSection: { marginTop: 15, padding: 15, backgroundColor: '#fef2f2', borderRadius: 8, border: '1 solid #fecaca' },
  overdueTitle: { fontSize: 12, fontWeight: 'bold', color: '#b91c1c', marginBottom: 8, textAlign: 'right' },
  overdueValue: { fontSize: 12, color: '#dc2626', fontWeight: 'bold' },
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

const getDelayDays = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    dueDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.max(0, now - dueDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const WithdrawnReceiptPDF = ({ payment, alimony, parents, caseNumber, courtName }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.headerMinistry}>وزارة العدل - محكمة الأسرة {courtName ? `بـ ${courtName}` : ''}</Text>
        <Text style={pdfStyles.headerSystem}>(نظام وصال الإلكتروني)</Text>
        <Text style={pdfStyles.titleReceipt}>إيصال استلام / سحب نفقة إلكتروني</Text>
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
            <Text style={pdfStyles.partyTitle}>الطرف الملتزم بالدفع (الأب)</Text>
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
            <Text style={pdfStyles.partyTitle}>الطرف المستلم (الأم)</Text>
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
        <Text style={pdfStyles.transactionTitle}>تفاصيل الدفعة المستلمة</Text>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>المبلغ المستلم:</Text>
            <Text style={pdfStyles.transactionValue}>{(payment.amount / 100).toLocaleString('ar-EG')} ج.م</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>عن استحقاق تاريخ:</Text>
            <Text style={pdfStyles.transactionValue}>{new Date(payment.dueDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>تاريخ ووقت السحب الفعلي:</Text>
            <Text style={pdfStyles.transactionValue} dir="ltr">{formatTimeAndDatePDF(payment.withdrawnAt || payment.paidAt || payment.dueDate)}</Text>
        </View>
        <View style={pdfStyles.referenceBox}>
            <Text style={pdfStyles.referenceLabel}>الرقم المرجعي لعملية السحب (Transaction ID)</Text>
            <Text style={pdfStyles.referenceValue}>{payment.id}</Text>
        </View>
      </View>

      <View style={pdfStyles.footer}>
         <Text style={pdfStyles.footerText}>يُعد هذا المستند إيصالاً إلكترونياً رسمياً باستلام قيمة النفقة الموضحة أعلاه، ومسجل لدى قاعدة بيانات وزارة العدل المصرية، ولا يتطلب ختم الجهة أو التوقيع الورقي.</Text>
         <Text style={pdfStyles.footerText}>تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')} - نظام وصال</Text>
      </View>
    </Page>
  </Document>
);

const OverdueCertificatePDF = ({ payment, alimony, parents, caseNumber, courtName }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerMinistry}>وزارة العدل - محكمة الأسرة {courtName ? `بـ ${courtName}` : ''}</Text>
          <Text style={pdfStyles.headerSystem}>(نظام وصال الإلكتروني)</Text>
          <Text style={pdfStyles.titleOverdue}>إفادة إلكترونية بتأخر سداد التزام مالي (نفقة)</Text>
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
              <Text style={pdfStyles.partyTitleRed}>الطرف الممتنع عن السداد (المشكو في حقه)</Text>
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
              <Text style={pdfStyles.partyTitle}>الطرف المتضرر (الشاكي)</Text>
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
  
        <View style={pdfStyles.overdueSection}>
          <Text style={pdfStyles.overdueTitle}>تفاصيل المخالفة المالية</Text>
          <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>المبلغ المتأخر سداده:</Text>
              <Text style={pdfStyles.overdueValue}>{(payment.amount / 100).toLocaleString('ar-EG')} ج.م</Text>
          </View>
          <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>تاريخ الاستحقاق الأصلي:</Text>
              <Text style={pdfStyles.overdueValue}>{new Date(payment.dueDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>مدة التأخير حتى تاريخه:</Text>
              <Text style={pdfStyles.overdueValue}>{getDelayDays(payment.dueDate)} يوماً</Text>
          </View>
        </View>
  
        <View style={pdfStyles.footer}>
           <Text style={pdfStyles.footerText}>تُعد هذه الإفادة مستنداً رسمياً مستخرجاً من نظام وصال يثبت تخلف الطرف المذكور أعلاه عن السداد حتى تاريخه، ويُعتد بها في تقديم الشكاوى أو اتخاذ الإجراءات القانونية اللازمة.</Text>
           <Text style={pdfStyles.footerText}>تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')} - نظام وصال</Text>
        </View>
      </Page>
    </Document>
  );

export default function MotherAlimony() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const navigate = useNavigate();
  
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  
  const [alimonyDetails, setAlimonyDetails] = useState(null);
  const [currentDue, setCurrentDue] = useState(null); 
  const [overduePayments, setOverduePayments] = useState([]); 
  const [availableToWithdraw, setAvailableToWithdraw] = useState([]); 
  const [withdrawnPayments, setWithdrawnPayments] = useState([]); 

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [courtName, setCourtName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [parentsInfo, setParentsInfo] = useState({ fatherName: '', fatherNId: '', motherName: '', motherNId: '' });

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOverdue, setSelectedOverdue] = useState(null);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchAlimonyData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        let foundAlimony = null;
        let matchedCaseNum = '';

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

            rawPayments.sort((a, b) => {
              const aIsPaid = a.status?.toLowerCase() === 'paid' || a.status?.toLowerCase() === 'مدفوعة';
              const bIsPaid = b.status?.toLowerCase() === 'paid' || b.status?.toLowerCase() === 'مدفوعة';
              const aIsDone = aIsPaid || a.withdrawalStatus?.toLowerCase() === 'withdrawn' || a.withdrawalStatus?.toLowerCase() === 'completed';
              const bIsDone = bIsPaid || b.withdrawalStatus?.toLowerCase() === 'withdrawn' || b.withdrawalStatus?.toLowerCase() === 'completed';
              
              if (aIsDone && !bIsDone) return -1;
              if (!aIsDone && bIsDone) return 1;
              return 0;
            });

            rawPayments.forEach(p => {
                if (!p.dueDate) return;
                const dateOnly = p.dueDate.split('T')[0]; 
                if (!seenPaymentDates.has(dateOnly)) {
                    seenPaymentDates.add(dateOnly);
                    cleanPayments.push(p);
                }
            });

            const allPayments = cleanPayments; 
            
            const todayZero = new Date();
            todayZero.setHours(0, 0, 0, 0);
            const todayTime = todayZero.getTime();

            const getNormTime = (dateStr) => {
                if (!dateStr) return 0;
                const dStr = dateStr.split('T')[0]; 
                const [y, m, d] = dStr.split('-');
                return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
            };
            
            const withdrawn = allPayments.filter(p => {
              const ws = p.withdrawalStatus?.toLowerCase();
              const s = p.status?.toLowerCase(); 
              return ws === 'completed' || ws === 'withdrawn' || ws === 'مستلمة' || s === 'withdrawn' || s === 'مستلمة';
            });
            setWithdrawnPayments(withdrawn.sort((a, b) => new Date(b.withdrawnAt || b.paidAt || b.dueDate).getTime() - new Date(a.withdrawnAt || a.paidAt || a.dueDate).getTime()));

            const available = allPayments.filter(p => {
              const s = p.status?.toLowerCase();
              const ws = p.withdrawalStatus?.toLowerCase();
              const isPaid = s === 'paid' || s === 'مدفوعة';
              const isWithdrawn = ws === 'completed' || ws === 'withdrawn' || ws === 'مستلمة' || s === 'withdrawn' || s === 'مستلمة';
              return isPaid && !isWithdrawn;
            });
            setAvailableToWithdraw(available);

            const overdue = allPayments.filter(p => {
              const s = p.status?.toLowerCase();
              const ws = p.withdrawalStatus?.toLowerCase();
              const isPaidOrWithdrawn = s === 'paid' || s === 'مدفوعة' || ws === 'completed' || ws === 'withdrawn' || ws === 'مستلمة' || s === 'withdrawn' || s === 'مستلمة';
              return !isPaidOrWithdrawn && getNormTime(p.dueDate) <= todayTime;
            });
            setOverduePayments(overdue);

            const upcoming = allPayments.filter(p => {
              const s = p.status?.toLowerCase();
              const ws = p.withdrawalStatus?.toLowerCase();
              const isPaidOrWithdrawn = s === 'paid' || s === 'مدفوعة' || ws === 'completed' || ws === 'withdrawn' || ws === 'مستلمة' || s === 'withdrawn' || s === 'مستلمة';
              return !isPaidOrWithdrawn && getNormTime(p.dueDate) > todayTime;
            }).sort((a, b) => getNormTime(a.dueDate) - getNormTime(b.dueDate));
            
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

  const handleWithdraw = async (paymentDueId) => {
    try {
      setIsProcessingWithdrawal(true);
      
      await api.post(`/api/alimonySchedule-dues/${paymentDueId}/withdraw?alimonyDueId=${paymentDueId}`, {
        withdrawalMethod: "BankTransfer" 
      });
      
      toast.success("تم تقديم طلب سحب النفقة بنجاح!");
      
      const withdrawnItem = availableToWithdraw.find(p => p.id === paymentDueId);
      if (withdrawnItem) {
        withdrawnItem.withdrawalStatus = 'Completed'; 
        withdrawnItem.withdrawnAt = new Date().toISOString(); 
        setAvailableToWithdraw(prev => prev.filter(p => p.id !== paymentDueId));
        setWithdrawnPayments(prev => [withdrawnItem, ...prev]);
      }

    } catch (error) {
      console.error("Withdrawal Error:", error);
      const errDetails = error.response?.data?.detail || '';
      const errTitle = error.response?.data?.title || '';
      const errMessage = error.message || '';
      
      if (
          errTitle.includes('AlreadyWithdrawn') || 
          errDetails.toLowerCase().includes('already been withdrawn') || 
          errMessage.toLowerCase().includes('already been withdrawn')
      ) {
          toast.success("هذا المبلغ تم سحبه مسبقاً وموجود في حسابك.");
          
          const withdrawnItem = availableToWithdraw.find(p => p.id === paymentDueId);
          if (withdrawnItem) {
             withdrawnItem.withdrawalStatus = 'Completed'; 
             withdrawnItem.withdrawnAt = new Date().toISOString();
             setAvailableToWithdraw(prev => prev.filter(p => p.id !== paymentDueId));
             setWithdrawnPayments(prev => [withdrawnItem, ...prev]);
          }
      }
      else if (errTitle.includes('balance_insufficient') || errDetails.includes('insufficient funds')) {
          toast.error("عذراً، رصيد المحكمة في سترايب غير كافٍ لإتمام التحويل. (يرجى إبلاغ مطور الباك إند بشحن رصيد الاختبار)", { duration: 5000 });
      }
      else if (errDetails.toLowerCase().includes('payout') || errTitle.toLowerCase().includes('payout')) {
         setShowOnboardingModal(true); 
      } 
      else {
         toast.error(getErrorMessage(error) || 'حدث خطأ أثناء محاولة سحب الرصيد.');
      }
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const handleSetupBank = async () => {
    try {
      setIsOnboarding(true);
      const currentUrl = window.location.href; 
      
      const response = await api.post('/api/payments/onboarding-session', {
        refreshUrl: currentUrl,
        returnUrl: currentUrl
      });

      if (response.data && response.data.url) {
        window.location.href = response.data.url; 
      } else {
        toast.error("فشل في الحصول على رابط إعداد الحساب من الخادم.");
      }
    } catch (error) {
      console.error("Onboarding Error:", error);
      toast.error(getErrorMessage(error) || "حدث خطأ أثناء تجهيز صفحة إعداد الحساب.");
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleDownloadReceiptPDF = async () => {
    if (!selectedReceipt) return;
    setIsGeneratingPDF(true);
    try {
        const blob = await pdf(
          <WithdrawnReceiptPDF 
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

  const handleDownloadOverduePDF = async () => {
    if (!selectedOverdue) return;
    setIsGeneratingPDF(true);
    try {
        const blob = await pdf(
          <OverdueCertificatePDF 
            payment={selectedOverdue} 
            alimony={alimonyDetails} 
            parents={parentsInfo} 
            caseNumber={caseNumber} 
            courtName={courtName} 
          />
        ).toBlob();
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Overdue_Certificate_${selectedOverdue.id.substring(0,8)}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("تم تحميل الإفادة بنجاح");
    } catch (error) {
        console.error("PDF Generation Error:", error);
        toast.error("حدث خطأ أثناء استخراج الإفادة");
    } finally {
        setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatTimeAndDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-EG')} - ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined) return '0';
    return (amount / 100).toLocaleString('ar-EG');
  };

  const todayZeroTime = new Date();
  todayZeroTime.setHours(0,0,0,0);
  const todayTimeValue = todayZeroTime.getTime();

  const getNormTimeValue = (dateStr) => {
      if(!dateStr) return 0;
      const [y,m,d] = dateStr.split('T')[0].split('-');
      return new Date(y, m-1, d, 0,0,0,0).getTime();
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[80vh] text-[#1e3a8a] font-sans" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-lg">جاري جلب تفاصيل النفقة من المحكمة...</p>
      </div>
    );
  }

  // ✅ التعديل هنا: في حالة وجود خطأ (عدم وجود قرار نفقة) لا تظهر البطاقة الخضراء
  if (errorMsg && !alimonyDetails) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-sans" dir="rtl">
        <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] flex flex-col items-center gap-4 shadow-sm border border-red-100 text-center max-w-lg">
          <AlertCircle className="w-12 h-12" />
          <h2 className="text-xl font-bold">{errorMsg}</h2>
          <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm border-none outline-none cursor-pointer">إعادة المحاولة</button>
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
                <button onClick={() => setShowFullHistory(false)} className="bg-white/10 p-2.5 md:p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border-none outline-none cursor-pointer">
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold mb-1">سجل المستحقات المستلمة</h1>
                  <p className="text-blue-200 text-xs md:text-sm font-bold opacity-90">جميع الدفعات التي قمتِ بسحبها مسبقاً</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-l from-green-50 to-emerald-50/30 border border-green-100 rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col gap-1 text-center sm:text-right">
                 <span className="text-green-700 font-bold text-sm">إجمالي المبالغ المستلمة</span>
                 <div className="text-3xl lg:text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                   {formatMoney(withdrawnPayments.reduce((sum, p) => sum + p.amount, 0))} ج.م
                   <CheckCircle className="w-8 h-8 text-[#16a34a] hidden sm:block" />
                 </div>
              </div>
              <div className="bg-white/80 backdrop-blur-md border border-green-200/50 py-3.5 px-8 rounded-2xl flex items-center gap-3 shadow-sm">
                 <span className="text-gray-500 text-sm font-bold">عدد المدفوعات المستلمة:</span>
                 <span className="text-green-700 font-bold text-lg">{withdrawnPayments.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {withdrawnPayments.map((item) => (
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
                        <span className="text-xs text-gray-500 font-bold">شهر الاستحقاق</span>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">تم الاستلام</span>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-xs font-bold">تاريخ السحب:</span>
                      <span className="font-bold text-gray-700 text-sm font-mono" dir="ltr">{formatDate(item.withdrawnAt || item.paidAt || item.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xl font-bold text-[#16a34a] font-mono">{formatMoney(item.amount)} <span className="text-sm text-gray-500">ج.م</span></span>
                       <div className="text-blue-600 bg-blue-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                           <Download className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                </div>
              ))}
              {withdrawnPayments.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                   <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                   <p className="font-bold text-lg">لم تقومي بسحب أي دفعات حتى الآن</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* نافذة إيصال السحب */}
        {showReceiptModal && selectedReceipt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
                    <div className="bg-[#16a34a] text-white p-4 flex justify-between items-center shrink-0">
                        <h2 className="font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> إيصال استلام إلكتروني</h2>
                        <button onClick={() => setShowReceiptModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        <div className="text-center pb-4 border-b border-gray-100">
                            <Receipt className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-80" />
                            <h3 className="text-3xl font-black text-gray-800 font-mono tracking-tight">{formatMoney(selectedReceipt.amount)} <span className="text-lg">ج.م</span></h3>
                            <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full mt-2 inline-block">تم استلام المبلغ بنجاح</span>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold text-sm">عن استحقاق شهر</span>
                                <span className="text-gray-800 font-bold text-sm">{formatDate(selectedReceipt.dueDate)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-gray-500 font-bold text-sm">تاريخ ووقت السحب</span>
                                <span className="text-gray-800 font-bold text-xs font-mono" dir="ltr">{formatTimeAndDate(selectedReceipt.withdrawnAt || selectedReceipt.paidAt || selectedReceipt.dueDate)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-gray-500 font-bold text-sm">الرقم المرجعي</span>
                                <span className="text-gray-800 font-bold text-[10px] font-mono tracking-widest">{selectedReceipt.id.split('-')[0].toUpperCase()}...</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm text-center">
                            <p className="text-xs text-blue-800 font-bold leading-relaxed">
                                هذا الإيصال معتمد إلكترونياً من محكمة الأسرة {courtName ? `بـ ${courtName}` : ''} ويثبت إتمام عملية سحب المستحقات المالية.
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

  const dueTodayList = overduePayments.filter(p => getNormTimeValue(p.dueDate) === todayTimeValue);
  const strictlyOverdueList = overduePayments.filter(p => getNormTimeValue(p.dueDate) < todayTimeValue);

  return (
    <div className="w-full font-sans pb-10" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 px-4 md:px-0">
          
          <div className="relative w-full bg-[#1e3a8a] rounded-[2rem] p-5 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden shadow-xl gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            <div className="flex items-center gap-4 md:gap-5 relative z-10">
              <button onClick={() => navigate(-1)} className="bg-white/10 p-2.5 md:p-3 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border-none outline-none cursor-pointer">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold mb-1">النفقة المستحقة</h1>
                <p className="text-blue-200 text-xs md:text-sm opacity-90 font-bold tracking-wide">متابعة وسحب المستحقات المالية</p>
              </div>
            </div>
            
            <div className="hidden md:flex bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 relative z-10">
               <Wallet className="w-8 h-8 text-blue-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* 1. رصيد متاح للسحب */}
              {availableToWithdraw.length > 0 && (
                <div className="bg-gradient-to-br from-[#16a34a] to-green-600 border border-green-500 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4 text-white">
                      <div className="bg-white/20 p-3.5 rounded-2xl shrink-0 backdrop-blur-sm">
                        <Wallet className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-1">رصيد متاح للسحب</h2>
                        <p className="text-green-100 text-sm font-bold">تم إيداعها من قبل المحكمة وتنتظر سحبك</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 relative z-10 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {availableToWithdraw.map(payment => (
                      <div key={payment.id} className="flex justify-between items-center bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors text-white">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm">دفعة استحقاق {formatDate(payment.dueDate)}</span>
                          <span className="text-green-200 text-xs font-mono font-bold">{formatMoney(payment.amount)} ج.م</span>
                        </div>
                        <button 
                          onClick={() => handleWithdraw(payment.id)}
                          disabled={isProcessingWithdrawal}
                          className="bg-white text-green-700 hover:bg-green-50 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 outline-none border-none cursor-pointer"
                        >
                          {isProcessingWithdrawal ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4"/> سحب للبنك</>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. الدفعات المستحقة (اليوم) */}
              {dueTodayList.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                      <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-1">
                        <CheckCircle className="w-6 h-6" /> الدفعات المستحقة
                      </h2>
                      <p className="text-emerald-600/80 text-sm font-bold">نفقات حان موعد سدادها اليوم وفي انتظار الدفع</p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-emerald-600 font-bold block mb-1">إجمالي المستحق</span>
                      <span className="text-2xl font-bold text-emerald-600 font-mono">
                        {formatMoney(dueTodayList.reduce((sum, p) => sum + p.amount, 0))} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 relative z-10 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {dueTodayList.map(payment => (
                      <div key={payment.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-800 font-bold text-sm">استحقاق {formatDate(payment.dueDate)}</span>
                          <span className="text-emerald-500 text-xs font-bold">مستحقة الدفع اليوم</span>
                        </div>
                        <span className="text-emerald-600 font-bold font-mono text-lg">{formatMoney(payment.amount)} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. الدفعات المتأخرة */}
              {strictlyOverdueList.length > 0 && (
                <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-red-100/50 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                      <h2 className="text-xl font-bold text-red-700 flex items-center gap-2 mb-1">
                        <AlertCircle className="w-6 h-6" /> دفعات متأخرة على الطرف الآخر
                      </h2>
                      <p className="text-red-500/80 text-sm font-bold">يمكنك استخراج إفادة تأخير لتقديم شكوى رسمية</p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-red-500 font-bold block mb-1">إجمالي المتأخرات</span>
                      <span className="text-2xl font-bold text-red-600 font-mono">
                        {formatMoney(strictlyOverdueList.reduce((sum, p) => sum + p.amount, 0))} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 relative z-10 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {strictlyOverdueList.map(payment => (
                      <div 
                        key={payment.id} 
                        onClick={() => { setSelectedOverdue(payment); setShowOverdueModal(true); }}
                        className="flex justify-between items-center bg-white p-4 rounded-2xl border border-red-100 shadow-sm hover:border-red-300 transition-colors cursor-pointer group"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-800 font-bold text-sm">استحقاق {formatDate(payment.dueDate)}</span>
                          <span className="text-red-500 text-xs font-bold">متأخرة منذ {getDelayDays(payment.dueDate)} يوم</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-red-600 font-bold font-mono text-lg">{formatMoney(payment.amount)} ج.م</span>
                           <div className="bg-red-50 text-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download className="w-4 h-4" />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. النفقة القادمة المنتظرة (يتم عرضها أسفل المستحقات) */}
              {currentDue && (
                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 p-3.5 rounded-2xl shrink-0 text-yellow-600">
                        <Clock className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">النفقة القادمة المنتظرة</h2>
                        <p className="text-gray-500 text-sm font-bold">لم يحن موعد استحقاقها بعد</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex justify-between items-center relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-xs font-bold">تاريخ الاستحقاق</span>
                      <span className="font-bold text-gray-700">{formatDate(currentDue.dueDate)}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-gray-500 text-xs font-bold">المبلغ المنتظر</span>
                      <span className="font-bold text-gray-800 font-mono text-lg">{formatMoney(currentDue.amount)} ج.م</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 🔴 بطاقة الخطأ المخصصة في حالة فشل الاتصال بالسيرفر مع وجود قرار نفقة */}
              {errorMsg && alimonyDetails && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full min-h-[300px] mt-4 relative z-10">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-500 mb-5 shadow-sm border border-red-100">
                     <AlertCircle className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-2">تعذر جلب الدفعات المستحقة</h3>
                   <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-sm">يوجد مشكلة في الاتصال بالخادم ولم نتمكن من جلب تفاصيل دفعات النفقة الخاصة بك.</p>
                   <button onClick={() => window.location.reload()} className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-sm outline-none border-none cursor-pointer">إعادة المحاولة</button>
                </div>
              )}

              {/* 5. بطاقة الحالة الفارغة (لا مستحقات نهائياً) */}
              {!currentDue && strictlyOverdueList.length === 0 && dueTodayList.length === 0 && availableToWithdraw.length === 0 && !errorMsg && (
                <div className="bg-green-50 border border-green-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full min-h-[300px] relative z-10 mt-4">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-500 mb-5 shadow-sm border border-green-100">
                     <CheckCircle className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أي مستحقات منتظرة حالياً</h3>
                   <p className="text-gray-600 font-bold text-sm leading-relaxed max-w-sm">تم استلام جميع الدفعات بنجاح، ولا يوجد متأخرات مسجلة.</p>
                </div>
              )}

            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><FileText className="w-5 h-5"/></div>
                  <h2 className="text-lg font-bold text-gray-800">بيانات قرار النفقة</h2>
                </div>
                
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold">المبلغ الشهري المقرر</span>
                    <span className="font-bold text-[#1e3a8a] font-mono text-base">{formatMoney(alimonyDetails?.amount)} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-gray-500 font-bold">معدل الدفع</span>
                    <span className="font-bold text-gray-800">
                      {alimonyDetails?.frequency === 'Weekly' ? 'أسبوعياً' : 
                       alimonyDetails?.frequency === 'Monthly' ? 'شهرياً' : 
                       alimonyDetails?.frequency === 'Yearly' ? 'سنوياً' : (alimonyDetails?.frequency || 'غير محدد')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                     <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col justify-center items-center text-center gap-1">
                       <span className="text-2xl font-bold text-green-700 font-mono">{withdrawnPayments.length}</span>
                       <span className="text-green-700 text-xs font-bold">دفعة استُلمت</span>
                     </div>
                     <div className={`${strictlyOverdueList.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border p-4 rounded-xl flex flex-col justify-center items-center text-center gap-1`}>
                       <span className={`text-2xl font-bold font-mono ${strictlyOverdueList.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{strictlyOverdueList.length}</span>
                       <span className={`${strictlyOverdueList.length > 0 ? 'text-red-600' : 'text-gray-500'} text-xs font-bold`}>دفعة متأخرة</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-gray-400"/> سجل المسحوبات
                    </h2>
                    <button 
                      onClick={() => setShowFullHistory(true)}
                      className="text-[#1e3a8a] text-xs font-bold bg-blue-50 py-2 px-3.5 rounded-lg hover:bg-blue-100 transition-colors border-none outline-none cursor-pointer"
                    >
                      عرض الكل
                    </button>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  {withdrawnPayments.slice(0, 3).map(payment => (
                    <div 
                        key={payment.id} 
                        onClick={() => { setSelectedReceipt(payment); setShowReceiptModal(true); }}
                        className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100 hover:border-blue-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-col gap-1.5">
                        <span className="text-gray-800 font-bold text-sm font-mono" dir="ltr">{formatDate(payment.dueDate)}</span>
                        <span className="text-green-600 text-[11px] font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> تم الاستلام</span>
                      </div>
                      <span className="font-bold text-[#1e3a8a] text-sm font-mono">{formatMoney(payment.amount)} ج.م</span>
                    </div>
                  ))}
                  
                  {withdrawnPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-8 opacity-50">
                      <Receipt className="w-10 h-10 text-gray-400 mb-3" />
                      <span className="text-sm text-gray-500 font-bold">لا توجد عمليات سحب سابقة</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* نافذة إعداد الحساب البنكي */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 md:p-8 text-center animate-in zoom-in-95">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto shadow-inner">
                 <Landmark className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 mb-3">إعداد الحساب البنكي</h2>
             <p className="text-gray-500 text-sm font-bold mb-8 leading-relaxed">
                 لاستلام أموال النفقة، يجب عليكِ أولاً ربط حسابك البنكي أو بطاقتك البنكية عبر بوابة الدفع الآمنة (Stripe).
             </p>
             <div className="flex gap-3">
                 <button 
                   onClick={() => setShowOnboardingModal(false)} 
                   disabled={isOnboarding} 
                   className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all outline-none cursor-pointer"
                 >
                   تأجيل
                 </button>
                 <button 
                   onClick={handleSetupBank} 
                   disabled={isOnboarding} 
                   className="flex-[2] py-3.5 bg-[#1e3a8a] text-white rounded-xl font-bold shadow-sm hover:bg-blue-900 transition-all border-none outline-none cursor-pointer flex justify-center items-center gap-2"
                 >
                     {isOnboarding ? <Loader2 className="w-5 h-5 animate-spin" /> : "إعداد الحساب الآن"}
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* نافذة عرض إفادة التأخير (للدفعات المتأخرة) */}
      {showOverdueModal && selectedOverdue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
                <div className="bg-red-600 text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5" /> إفادة إلكترونية بتأخر السداد</h2>
                    <button onClick={() => setShowOverdueModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors border-none outline-none cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 bg-white overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    <div className="text-center pb-4 border-b border-gray-100">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2 opacity-80" />
                        <h3 className="text-3xl font-black text-gray-800 font-mono tracking-tight">{formatMoney(selectedOverdue.amount)} <span className="text-lg">ج.م</span></h3>
                        <span className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full mt-2 inline-block">تجاوزت موعد الاستحقاق</span>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-bold text-sm">عن استحقاق شهر</span>
                            <span className="text-gray-800 font-bold text-sm">{formatDate(selectedOverdue.dueDate)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span className="text-gray-500 font-bold text-sm">مدة التأخير</span>
                            <span className="text-red-600 font-bold text-sm">{getDelayDays(selectedOverdue.dueDate)} يوماً</span>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm text-center">
                        <p className="text-xs text-red-800 font-bold leading-relaxed">
                            هذه الإفادة تعتبر مستنداً رسمياً يثبت تخلف الطرف الآخر عن سداد الدفعة المذكورة. يمكنك تحميلها لتقديم شكوى رسمية للمحكمة.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
                    <button onClick={() => setShowOverdueModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm outline-none cursor-pointer">إغلاق</button>
                    <button onClick={handleDownloadOverduePDF} disabled={isGeneratingPDF} className="flex-[2] bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm outline-none border-none cursor-pointer flex justify-center items-center gap-2">
                        {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> استخراج الإفادة (PDF)</>}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}