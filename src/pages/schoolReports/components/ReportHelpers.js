export const getReportTheme = (type) => {
  switch (type) {
    case 'Attendance':
      return { 
        bg: 'bg-blue-50', cardBg: 'bg-blue-50/50', iconBg: 'bg-blue-100', iconHoverBg: 'hover:bg-blue-50',
        text: 'text-blue-600', darkText: 'text-blue-900', hoverText: 'group-hover:text-blue-700', 
        borderColor: 'border-blue-100', hoverBorder: 'hover:border-blue-200', headerBg: 'bg-[#1e3a8a]',
        primaryBtn: 'bg-[#1e3a8a] text-white hover:bg-[#172554]', secondaryBtn: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        outlineBtn: 'border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50'
      };
    case 'Grades': 
      return { 
        bg: 'bg-green-50', cardBg: 'bg-green-50/50', iconBg: 'bg-green-100', iconHoverBg: 'hover:bg-green-50',
        text: 'text-green-600', darkText: 'text-green-900', hoverText: 'group-hover:text-green-700', 
        borderColor: 'border-green-100', hoverBorder: 'hover:border-green-200', headerBg: 'bg-green-600',
        primaryBtn: 'bg-green-600 text-white hover:bg-green-700', secondaryBtn: 'bg-green-50 text-green-700 hover:bg-green-100',
        outlineBtn: 'border-2 border-green-600 text-green-600 hover:bg-green-50'
      };
    case 'Behavior':
      return { 
        bg: 'bg-purple-50', cardBg: 'bg-purple-50/50', iconBg: 'bg-purple-100', iconHoverBg: 'hover:bg-purple-50',
        text: 'text-purple-600', darkText: 'text-purple-900', hoverText: 'group-hover:text-purple-700', 
        borderColor: 'border-purple-100', hoverBorder: 'hover:border-purple-200', headerBg: 'bg-purple-600',
        primaryBtn: 'bg-purple-600 text-white hover:bg-purple-700', secondaryBtn: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
        outlineBtn: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
      };
    default:
      return { 
        bg: 'bg-gray-50', cardBg: 'bg-gray-50/50', iconBg: 'bg-gray-100', iconHoverBg: 'hover:bg-gray-50',
        text: 'text-gray-600', darkText: 'text-gray-900', hoverText: 'group-hover:text-gray-700', 
        borderColor: 'border-gray-100', hoverBorder: 'hover:border-gray-200', headerBg: 'bg-gray-600',
        primaryBtn: 'bg-gray-600 text-white hover:bg-gray-700', secondaryBtn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        outlineBtn: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50'
      };
  }
};

export const filterOptions = [
    { value: 'all', label: 'جميع التقارير' },
    { value: 'Attendance', label: 'تقرير الحضور' },
    { value: 'Grades', label: 'تقرير الدرجات الأكاديمية' },
    { value: 'Behavior', label: 'تقرير السلوك' }
];

export const translateReportType = (type) => {
    if (type === 'Comprehensive') return 'تقرير شامل';
    if (type === 'Attendance') return 'تقرير حضور';
    if (type === 'Behavior') return 'تقرير سلوك';
    if (type === 'Grades') return 'تقرير الدرجات الأكاديمية';
    return type || 'تقرير مدرسي';
};

export const forceDownloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      return true;
    } catch (error) {
      console.error("Download failed", error);
      return false;
    }
};