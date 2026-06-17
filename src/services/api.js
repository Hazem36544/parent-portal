// ✅ تم نقل جملة import لأعلى الملف لتجنب أخطاء Vite
import axios from 'axios';
console.log("Current API URL:", import.meta.env.VITE_API_URL);

/**
 * 1. الإعدادات الأساسية
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://wesal.runasp.net';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * 2. Request Interceptor: حقن التوكن (استخدام sessionStorage للعزل التام)
 */
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('wesal_parent_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 3. Response Interceptor: معالجة الأخطاء بشكل موحد
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const skipRedirect = error.config?.skipAuthRedirect;

        // --- التقاط 403 للتوكن المقيد (الباسورد المؤقت) ---
        if (error.response && error.response.status === 403) {
            const serverError = error.response.data;
            const message = serverError?.detail || serverError?.title || "";
            
            if (message.toLowerCase().includes("temporary password")) {
                console.warn("Temporary password detected - redirecting to change password...");
                sessionStorage.setItem('force_change_password', 'true'); 
                
                if (!skipRedirect) {
                    // ✅ التعديل هنا ليتوافق مع جيت هاب والـ HashRouter
                    window.location.hash = '/parent/login'; 
                }
                return Promise.reject(error); 
            }
        }

        // --- التعامل العادي مع 401 (انتهاء صلاحية التوكن) ---
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access - redirecting to login...");
            sessionStorage.removeItem('wesal_parent_token');
            sessionStorage.removeItem('wesal_parent_user_data');
            sessionStorage.removeItem('wesal_parent_user_role');
            
            if (!skipRedirect) {
                // ✅ التعديل هنا ليتوافق مع جيت هاب والـ HashRouter
                window.location.hash = '/parent/login'; 
            }
        }
        
        const serverError = error.response?.data;
        if (serverError) {
            const message = serverError.detail || serverError.title || "حدث خطأ في الاتصال";
            error.message = message;
        }
        return Promise.reject(error);
    }
);

/**
 * --- [ A. خدمات الهوية - Auth ] ---
 */
export const authAPI = {
    loginParent: (creds) => api.post('/api/auth/parent/sign-in', creds),
    changePassword: (data) => api.patch('/api/users/change-password', data),
    
    getCurrentUser: () => {
        const savedUser = sessionStorage.getItem('wesal_parent_user_data');
        return Promise.resolve({ data: savedUser ? JSON.parse(savedUser) : {} });
    }
};

/**
 * --- [ B. خدمات إدارة القضايا والأسر - Court Workflow ] ---
 */
export const courtAPI = {
    getFamily: (id) => api.get(`/api/families/${id}`),
    getMyFamilies: () => api.get('/api/families'), 
    updateParent: (id, data) => api.put(`/api/parents/${id}`, data),
    listCourtCasesByFamily: (familyId, params) => api.get(`/api/families/${familyId}/court-cases`, { params }),
    getAlimonyByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/alimony-schedule`),
    getCustodyByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/custodies`),
    getVisitationScheduleByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/visit-schedules`),
    listPaymentsDueByAlimony: (alimonyId, params) => api.get(`/api/alimony-schedules/${alimonyId}/alimony-dues`, { params }),
    listPaymentsHistory: (paymentDueId, params) => api.get(`/api/alimony-dues/${paymentDueId}/payments`, { params }),
    withdrawPayment: (paymentDueId, data) => api.post(`/api/alimony-dues/${paymentDueId}/withdraw`, data),
    initiateAlimonyPayment: (paymentDueId, data) => api.post(`/api/alimony-dues/${paymentDueId}/payments`, data),
};

/**
 * --- [ C. خدمات البيانات المساعدة - Lookups ] ---
 */
export const lookupAPI = {
    getVisitationLocations: (params) => api.get('/api/visit-centers', { params }),
};

/**
 * --- [ D. خدمات مركز الرؤية - Visitation Execution ] ---
 */
export const visitationAPI = {
    list: (params) => api.get('/api/visit-sessions', { params }),
    // 🚀 التعديل هنا: إضافة دالة تعيين المرافق اللي الأم بتستخدمها
    setCompanion: (id, data) => api.patch(`/api/visit-sessions/${id}`, data),
};

/**
 * --- [ E. خدمات المدرسة - Schools ] ---
 */
export const schoolAPI = {
    listReports: (childId, params) => api.get(`/api/school-reports/${childId}`, { params }),
};

/**
 * --- [ F. الشكاوى - Complaints ] ---
 */
export const complaintsAPI = {
    create: (data) => api.post('/api/complaints', data),
    listComplaintsByFamily: (familyId, params) => api.get(`/api/families/${familyId}/complaints`, { params }),
};

/**
 * --- [ G. التنبيهات والمخالفات - Obligation Alerts ] ---
 */
export const alertsAPI = {
    list: (params) => api.get('/api/violation-alerts', { params }),
};

/**
 * --- [ H. طلبات التعديل - Custody Requests ] ---
 */
export const requestsAPI = {
    list: (params) => api.get('/api/hosting-requests', { params }),
    create: (data) => api.post('/api/hosting-requests', data),
    // 🚀 التعديل هنا: إضافة دوال معالجة الطلبات (موافقة/رفض)
    process: (id, data) => api.patch(`/api/hosting-requests/${id}/respond`, data),
    respondToCustodyRequest: (id, data) => api.patch(`/api/hosting-requests/${id}/respond`, data),
};

/**
 * --- [ I. الإشعارات والملفات - Common ] ---
 */
export const commonAPI = {
    uploadDocument: (formData) => api.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDocument: (id) => api.get(`/api/documents/${id}`),
    getUnreadNotificationsCount: () => api.get('/api/notifications/unread-count'),
    listNotifications: (params) => api.get('/api/notifications/me', { params }),
    markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
    registerDevice: (data) => api.post('/api/notifications/devices', data),
    unregisterDevice: (token) => api.delete(`/api/user-devices/${token}`),
};

export default api;