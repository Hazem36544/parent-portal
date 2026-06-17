import React from 'react';
import { X, Download, Eye, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { getReportTheme } from './ReportHelpers';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfPreviewModal({ 
  showPreview, setShowPreview, previewUrl, setPreviewUrl, previewReportType,
  numPages, setNumPages, pageNumber, setPageNumber, pdfScale, setPdfScale, 
  handleDownloadFromPreview 
}) {
  if (!showPreview || !previewUrl) return null;
  const previewTheme = getReportTheme(previewReportType);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0 flex-wrap gap-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Eye className={`w-5 h-5 ${previewTheme.text}`} /> معاينة التقرير المدرسي
          </h3>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm mr-auto ml-4" dir="ltr">
            <button 
              onClick={() => setPdfScale(s => Math.max(s - 0.2, 0.4))} 
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-l-xl transition-colors outline-none cursor-pointer disabled:opacity-30 border-none"
              disabled={pdfScale <= 0.4}
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-xs font-bold ${previewTheme.text} w-12 text-center font-mono`}>
              {Math.round(pdfScale * 100)}%
            </span>
            <button 
              onClick={() => setPdfScale(s => Math.min(s + 0.2, 3.0))} 
              className="p-2 hover:bg-gray-100 text-gray-600 transition-colors outline-none cursor-pointer disabled:opacity-30 border-t-0 border-b-0 border-l border-r border-gray-100"
              disabled={pdfScale >= 3.0}
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPdfScale(1.0)} 
              className="p-2 hover:bg-gray-100 text-gray-600 rounded-r-xl transition-colors outline-none cursor-pointer border-none"
              title="الحجم الأصلي"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleDownloadFromPreview} 
              className={`p-2 bg-white ${previewTheme.iconHoverBg} ${previewTheme.text} rounded-full transition-colors outline-none border ${previewTheme.borderColor} cursor-pointer shadow-sm`} 
              title="تنزيل الملف"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {setShowPreview(false); setPreviewUrl(''); setPdfScale(1.0);}} 
              className="p-2 bg-white hover:bg-gray-200 rounded-full transition-colors outline-none border border-gray-200 cursor-pointer shadow-sm text-gray-600"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-gray-200 flex justify-center p-4 md:p-8 custom-scrollbar" dir="ltr">
           <Document
              file={previewUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Loader2 className="w-12 h-12 animate-spin text-[#1e3a8a] my-20" />}
              error={<div className="text-red-500 font-bold my-20 bg-red-50 p-6 rounded-2xl border border-red-200" dir="rtl">فشل في تحميل أو عرض الملف. يرجى تجربة التنزيل بدلاً من العرض.</div>}
              className="max-w-full flex flex-col items-center"
           >
              <Page
                 pageNumber={pageNumber}
                 scale={pdfScale}
                 renderTextLayer={false}
                 renderAnnotationLayer={false}
                 className="shadow-2xl rounded-lg overflow-hidden transition-transform duration-200 origin-top"
                 width={Math.min(window.innerWidth ? window.innerWidth * 0.95 : 800, 800)}
              />
           </Document>
        </div>

        {numPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-center gap-6 shrink-0" dir="ltr">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => p - 1)}
              className={`p-2.5 bg-gray-100 hover:bg-gray-200 ${previewTheme.text} rounded-xl disabled:opacity-50 transition-colors border-none outline-none cursor-pointer`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-gray-600 font-mono tracking-widest bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              {pageNumber} / {numPages}
            </span>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(p => p + 1)}
              className={`p-2.5 bg-gray-100 hover:bg-gray-200 ${previewTheme.text} rounded-xl disabled:opacity-50 transition-colors border-none outline-none cursor-pointer`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}