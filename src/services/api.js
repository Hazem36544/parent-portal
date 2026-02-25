console.log("Current API URL:", import.meta.env.VITE_API_URL);
import axios from 'axios';

/**
 * 1. الإعدادات الأساسية
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://wesal.runasp.net'; // تأكدت إن الرابط https

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * 2. Request Interceptor: حقن التوكن
 */
api.interceptors.request.use(
    (config) => {
        // ✅ تم إضافة || localStorage.getItem('token') لحل مشكلة 401 Unauthorized و CORS
        const token = localStorage.getItem('wesal_parent_token') || localStorage.getItem('wesal_token') || localStorage.getItem('token');
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
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access - redirecting to login...");
            // window.location.href = '/login'; 
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
    loginVisitCenter: (creds) => api.post('/api/auth/visit-center-staff/sign-in', creds),
    loginCourtStaff: (creds) => api.post('/api/auth/court-staff/sign-in', creds),
    loginFamilyCourt: (creds) => api.post('/api/auth/family-court/sign-in', creds),
    loginSchool: (creds) => api.post('/api/auth/school/sign-in', creds),
    loginSystemAdmin: (creds) => api.post('/api/auth/system-admin/sign-in', creds),
    loginParent: (creds) => api.post('/api/auth/parent/sign-in', creds),
    changePassword: (data) => api.patch('/api/users/change-password', data),
    
    // محاكاة جلب المستخدم الحالي
    getCurrentUser: () => {
        const savedUser = localStorage.getItem('wesal_user_data');
        return Promise.resolve({ data: savedUser ? JSON.parse(savedUser) : {} });
    }
};

/**
 * --- [ B. خدمات إدارة القضايا والأسر - Court Workflow ] ---
 */
export const courtAPI = {
    // 1. الأسرة (Families)
    enrollFamily: (data) => api.post('/api/families', data),
    getFamily: (id) => api.get(`/api/families/${id}`),
    searchFamilies: (params) => api.get('/api/courts/me/families', { params }),
    
    // جلب أسرة الأب/الأم المسجل الدخول حالياً
    getMyFamilies: () => api.get('/api/families'), 

    // إدارة الأبناء داخل الأسرة
    addChild: (familyId, data) => api.post(`/api/families/${familyId}/children`, data),
    removeChild: (familyId, childId) => api.delete(`/api/families/${familyId}/children`, { params: { childId } }),
    
    // 2. أولياء الأمور (Parents)
    updateParent: (id, data) => api.put(`/api/parents/${id}`, data),

    // 3. القضايا (Court Cases)
    createCase: (data) => api.post('/api/court-cases', data),
    listCourtCasesByFamily: (familyId, params) => api.get(`/api/families/${familyId}/court-cases`, { params }),
    closeCase: (caseId, notes) => api.patch(`/api/court-cases/${caseId}/close`, { closureNotes: notes }),

    // 4. النفقة (Alimony)
    createAlimony: (data) => api.post('/api/alimonies', data),
    updateAlimony: (id, data) => api.put(`/api/alimonies/${id}`, data, { params: { alimoneyId: id } }),
    deleteAlimony: (id) => api.delete(`/api/alimonies/${id}`, { params: { alimoneyId: id } }),
    getAlimonyByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/alimony`),
    
    // 5. الحضانة (Custody)
    createCustody: (data) => api.post('/api/custodies', data),
    updateCustody: (id, data) => api.put(`/api/custodies/${id}`, data),
    deleteCustody: (id) => api.delete(`/api/custodies/${id}`),
    getCustodyByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/custodies`),
    
    // 6. جداول الزيارة (Schedules)
    createSchedule: (data) => api.post('/api/visitation-schedules', data),
    updateSchedule: (id, data) => api.put(`/api/visitation-schedules/${id}`, data),
    deleteSchedule: (id) => api.delete(`/api/visitation-schedules/${id}`),
    getVisitationScheduleByCourtCase: (caseId) => api.get(`/api/court-cases/${caseId}/visitation-schedules`),

    // 7. المستحقات المالية (Payments Due)
    listPaymentsDueByAlimony: (alimonyId, params) => api.get(`/api/alimonies/${alimonyId}/payments-due`, { params }),
    listPaymentsHistory: (paymentDueId, params) => api.get(`/api/payments-due/${paymentDueId}/payments`, { params }),
    withdrawPayment: (paymentDueId, data) => api.post(`/api/payments-due/${paymentDueId}/withdraw`, data),
    initiateAlimonyPayment: (paymentDueId, data) => api.post(`/api/payments-due/${paymentDueId}/payments`, data),
};

/**
 * --- [ C. خدمات البيانات المساعدة - Lookups ] ---
 */
export const lookupAPI = {
    getVisitationLocations: (params) => api.get('/api/visitation-locations', { params }),
    createLocation: (data) => api.post('/api/visitation-locations', data),
    updateLocation: (id, data) => api.put(`/api/visitation-locations/${id}`, data),
    deleteLocation: (id) => api.delete(`/api/visitation-locations/${id}`),
};

/**
 * --- [ D. خدمات مركز الرؤية - Visitation Execution ] ---
 */
export const visitationAPI = {
    list: (params) => api.get('/api/visitations', { params }),
    checkIn: (id, nationalId) => api.patch(`/api/visitations/${id}/check-in`, { nationalId }),
    complete: (id) => api.patch(`/api/visitations/${id}/complete`),
    
    // ✅ تم التعديل بذكاء: تقبل (Object) كما يرسله الأب والأم، أو تقبل نص مباشر.
    // هذا التعديل يضمن أن كود الأب لن يتأثر وسيعمل بشكل مثالي.
    setCompanion: (id, data) => api.patch(`/api/visitations/${id}`, typeof data === 'object' ? data : { companionNationalId: data }),
};

/**
 * --- [ E. خدمات المدرسة - Schools ] ---
 */
export const schoolAPI = {
    listSchools: (params) => api.get('/api/schools', { params }),
    registerSchool: (data) => api.post('/api/schools', data),
    listChildren: (params) => api.get('/api/schools/me/children', { params }),
    uploadReport: (data) => api.post('/api/school-reports', data),
    listReports: (childId, params) => api.get(`/api/school-reports/${childId}`, { params }),
};

/**
 * --- [ F. الشكاوى - Complaints ] ---
 */
export const complaintsAPI = {
    create: (data) => api.post('/api/complaints', data),
    listComplaintsByCourt: (params) => api.get('/api/courts/me/complaints', { params }), 
    listComplaintsByFamily: (familyId, params) => api.get(`/api/families/${familyId}/complaints`, { params }),
    updateStatus: (id, data) => api.patch(`/api/complaints/${id}/status`, data),
};

/**
 * --- [ G. التنبيهات والمخالفات - Obligation Alerts ] ---
 */
export const alertsAPI = {
    list: (params) => api.get('/api/obligation-alerts', { params }),
    updateStatus: (id, data) => api.patch(`/api/obligation-alerts/${id}/status`, data),
};

/**
 * --- [ H. طلبات التعديل - Custody Requests ] ---
 */
export const requestsAPI = {
    list: (params) => api.get('/api/custody-requests', { params }),
    process: (id, data) => api.patch(`/api/custody-requests/${id}/process`, data),
    create: (data) => api.post('/api/custody-requests', data),
};

/**
 * --- [ I. الإشعارات والملفات - Common ] ---
 */
export const commonAPI = {
    uploadDocument: (formData) => api.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDocument: (id) => api.get(`/api/documents/${id}`),
    deleteDocument: (id) => api.delete(`/api/documents/${id}`),
    getUnreadNotificationsCount: () => api.get('/api/notifications/unread-count'),
    listNotifications: (params) => api.get('/api/notifications/me', { params }),
    markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
    registerDevice: (data) => api.post('/api/notifications/devices', data),
    unregisterDevice: (token) => api.delete(`/api/user-devices/${token}`),
};

export default api;