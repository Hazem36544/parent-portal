import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '/src/services/api'; 
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '../../utils/errorHandler';

// استيراد المكونات الفرعية والمساعدات
import { forceDownloadFile } from './components/ReportHelpers';
import ReportsHeader from './components/ReportsHeader';
import ChildrenSelector from './components/ChildrenSelector';
import ReportsFilter from './components/ReportsFilter';
import ReportsList from './components/ReportsList';
import ReportDetailsModal from './components/ReportDetailsModal';
import PdfPreviewModal from './components/PdfPreviewModal';

const SchoolReports = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(false);

  const [filteredReports, setFilteredReports] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  const [previewReportType, setPreviewReportType] = useState('Attendance');
  const [pdfScale, setPdfScale] = useState(1.0);
  
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        const response = await api.get('/api/families');
        const families = response.data || [];
        
        const allChildren = families.reduce((acc, family) => {
          if (family.children && family.children.length > 0) {
            return [...acc, ...family.children];
          }
          return acc;
        }, []);

        setChildrenList(allChildren);
        if (allChildren.length > 0) {
          setSelectedChild(allChildren[0]);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedChild) return;
      try {
        setLoadingReports(true);
        setPermissionError(false); 
        setFilterType('all');
        setSelectedMonth('all');
        setVisibleCount(6);

        const response = await api.get(`/api/school-reports/${selectedChild.id}`, {
          params: { PageNumber: 1, PageSize: 100 } 
        });
        
        const fetchedReports = response.data?.items || [];
        fetchedReports.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        setReports(fetchedReports);
        
        const monthsSet = new Set();
        fetchedReports.forEach(r => {
            if (r.uploadedAt) {
                const d = new Date(r.uploadedAt);
                const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthsSet.add(monthStr);
            }
        });
        
        const monthsArray = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
        const formattedMonths = monthsArray.map(mStr => {
            const [year, month] = mStr.split('-');
            const d = new Date(year, parseInt(month) - 1, 1);
            return {
                value: mStr,
                label: d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
            };
        });
        
        setAvailableMonths([{ value: 'all', label: 'جميع الشهور' }, ...formattedMonths]);
      } catch (err) {
        if (err.response && err.response.status === 403) setPermissionError(true);
        else if (err.response && err.response.status !== 404) toast.error(getErrorMessage(err));
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [selectedChild]);

  useEffect(() => {
      let result = reports;
      
      if (filterType !== 'all') {
          result = result.filter(r => r.reportType === filterType);
      }
      
      if (selectedMonth !== 'all') {
          result = result.filter(r => {
              if (!r.uploadedAt) return false;
              const d = new Date(r.uploadedAt);
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
          });
      }
      
      setFilteredReports(result);
      setVisibleCount(6); 
  }, [filterType, selectedMonth, reports]);

  useEffect(() => {
    if (!loadingChildren) {
      const timer = setTimeout(() => setIsPageLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loadingChildren]);

  const handleDownload = async (documentId) => {
    if (!documentId) { toast.error("معرف الملف غير متاح"); return; }
    const toastId = toast.loading("جاري تجهيز الملف للتنزيل...");
    try {
      const response = await api.get(`/api/documents/${documentId}`);
      const downloadUrl = response.data?.downloadUrl || response.data?.fileUrl;
      
      if (downloadUrl) {
        const fileName = response.data?.fileName || `report-${documentId.substring(0, 8)}.pdf`;
        const success = await forceDownloadFile(downloadUrl, fileName);
        
        if (success) {
           toast.success("تم التنزيل بنجاح!", { id: toastId });
        } else {
           window.open(downloadUrl, '_blank');
           toast.success("جاري التنزيل...", { id: toastId });
        }
      } else {
        toast.error("عذراً، رابط الملف غير متوفر من الخادم", { id: toastId });
      }
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    }
  };

  const handleDownloadFromPreview = async () => {
    if (!previewUrl) return;
    const toastId = toast.loading("جاري التنزيل...");
    const fileName = `report-${Date.now()}.pdf`;
    
    const success = await forceDownloadFile(previewUrl, fileName);
    if (success) {
        toast.success("تم التنزيل بنجاح!", { id: toastId });
    } else {
        window.open(previewUrl, '_blank');
        toast.success("جاري التنزيل...", { id: toastId });
    }
  };

  const handleOpenPreview = async (documentId, rType = 'Attendance') => {
    if (!documentId) { toast.error("معرف الملف غير متاح"); return; }
    setIsPreviewLoading(true);
    setPreviewReportType(rType);
    const toastId = toast.loading("جاري جلب الملف للمعاينة...");
    try {
      const response = await api.get(`/api/documents/${documentId}`);
      const url = response.data?.downloadUrl || response.data?.fileUrl;
      if (url) {
        setPreviewUrl(url);
        setPageNumber(1);
        setPdfScale(1.0);
        setShowPreview(true);
        toast.dismiss(toastId);
      } else {
        toast.error("عذراً، رابط الملف غير متوفر", { id: toastId });
      }
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  if (loadingChildren) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center font-sans" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-[#1e3a8a] mb-4" />
        <p className="text-[#1e3a8a] font-bold text-lg">جاري تحميل الملفات المدرسية...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-sans" dir="rtl">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3 shadow-sm border border-red-100">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <p className="font-bold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans" dir="rtl">
      <div className={`transition-all duration-500 ease-out transform ${isPageLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
      
          <ReportsHeader />

          <ChildrenSelector 
            childrenList={childrenList} 
            selectedChild={selectedChild} 
            setSelectedChild={setSelectedChild} 
          />

          {selectedChild && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 border-r-4 border-[#1e3a8a] pr-3 flex items-center gap-2">
                  تقارير الطالب: <span className="text-[#1e3a8a]">{selectedChild.fullName.split(' ')[0]}</span>
                </h2>

                {reports.length > 0 && (
                  <ReportsFilter 
                    filterType={filterType} 
                    setFilterType={setFilterType} 
                    selectedMonth={selectedMonth} 
                    setSelectedMonth={setSelectedMonth} 
                    availableMonths={availableMonths} 
                  />
                )}
              </div>

              <ReportsList 
                loadingReports={loadingReports}
                permissionError={permissionError}
                reports={reports}
                filteredReports={filteredReports}
                visibleCount={visibleCount}
                setVisibleCount={setVisibleCount}
                setSelectedReportDetail={setSelectedReportDetail}
              />
            </div>
          )}
        </div>
      </div>

      <ReportDetailsModal 
        selectedReportDetail={selectedReportDetail}
        setSelectedReportDetail={setSelectedReportDetail}
        handleDownload={handleDownload}
        handleOpenPreview={handleOpenPreview}
        isPreviewLoading={isPreviewLoading}
      />

      <PdfPreviewModal 
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        previewReportType={previewReportType}
        numPages={numPages}
        setNumPages={setNumPages}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        pdfScale={pdfScale}
        setPdfScale={setPdfScale}
        handleDownloadFromPreview={handleDownloadFromPreview}
      />

    </div>
  );
};

export default SchoolReports;