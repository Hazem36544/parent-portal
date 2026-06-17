// src/utils/errorHandler.js

export const getErrorMessage = (error) => {
    // 1. التأكد من وجود اتصال بالسيرفر (سقوط السيرفر أو انقطاع الإنترنت)
    if (!error.response || error.code === 'ERR_NETWORK') {
        return "تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت أو حالة الخادم.";
    }

    const { status, data } = error.response;

    // 2. تجميع نصوص الخطأ للبحث عن الرسائل الإنجليزية الثابتة (Identity & Domain Logic)
    const errorText = String(
        data?.detail || data?.title || data?.message || (typeof data === 'string' ? data : "")
    ).toLowerCase();

    // --- أخطاء تسجيل الدخول (نظام الآباء يعتمد على الرقم القومي) ---
    if (errorText.includes("credentials are invalid") || errorText.includes("invalid credentials")) {
        return "الرقم القومي أو كلمة المرور غير صحيحة.";
    }
    if (errorText.includes("locked out") || errorText.includes("lockout")) {
        return "تم قفل الحساب مؤقتاً لكثرة المحاولات الخاطئة، يرجى المحاولة لاحقاً.";
    }
    if (errorText.includes("temporary password") || errorText.includes("change password")) {
        return "يجب تأمين حسابك بكلمة مرور جديدة قبل الدخول.";
    }

    // --- أخطاء نظام الآباء (طلبات، نفقات، وصول) ---
    if (errorText.includes("already paid") || errorText.includes("payment completed")) {
        return "تم سداد هذه الدفعة مسبقاً ولا يمكن دفعها مرة أخرى.";
    }
    if (errorText.includes("already responded") || errorText.includes("status cannot be changed")) {
        return "تم الرد على هذا الطلب مسبقاً ولا يمكن تعديله.";
    }
    if (errorText.includes("not authorized") || errorText.includes("forbidden") || errorText.includes("access denied")) {
        return "ليس لديك الصلاحية لعرض أو تعديل هذه البيانات.";
    }

    // 3. قراءة رسائل الخطأ التفصيلية من الباك إند (Validation Errors من FluentValidation)
    if (data) {
        if (data.errors && typeof data.errors === 'object') {
            const firstErrorKey = Object.keys(data.errors)[0];
            if (Array.isArray(data.errors[firstErrorKey]) && data.errors[firstErrorKey].length > 0) {
                return data.errors[firstErrorKey][0]; 
            }
        }
    }

    // 4. معالجة أكواد الخطأ الأساسية (Fallbacks)
    // في حالة 400، نعطي الأولوية لرسالة الباك إند لو موجودة لأنها غالباً فيها سبب الرفض
    if (status === 400) return data?.detail || data?.title || "البيانات المدخلة غير صحيحة، يرجى المراجعة والمحاولة مجدداً.";
    if (status === 401) return "انتهت الجلسة أو يجب تسجيل الدخول أولاً.";
    if (status === 403) return "غير مصرح لك بإجراء هذه العملية أو الوصول لهذه البيانات (الخاصة بعائلة أخرى).";
    if (status === 404) return "البيانات المطلوبة غير موجودة في النظام.";
    if (status === 409) return "يوجد تعارض: (مثل طلب مكرر أو حالة تمنع التعديل).";

    // 5. عرض الرسالة المخصصة من الباك إند (لو لم يتم اصطيادها في الشروط السابقة)
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;

    // 6. رسالة افتراضية لأي خطأ غير معروف
    return "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.";
};