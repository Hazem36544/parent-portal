import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    // 🚀 التعديل الجوهري 1: قراءة بيانات المستخدم فوراً مع تحميل الصفحة (Synchronous) لمنع اللوب
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('wesal_parent_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    // 🚀 التعديل الجوهري 2: قراءة التوكن فوراً مع تحميل الصفحة
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return !!sessionStorage.getItem('wesal_parent_token');
    });
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // مفيش داعي نقرأ الداتا هنا تاني لأننا قرأناها فوق في الـ useState
        // فقط بنقفل شاشة التحميل ليعمل الـ ProtectedRoute
        setIsLoading(false);
    }, []);

    const login = (userData, token) => {
        // ✅ الحفظ في sessionStorage بدلاً من localStorage
        sessionStorage.setItem('wesal_parent_token', token);
        sessionStorage.setItem('wesal_parent_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        // ✅ التنظيف الذكي من sessionStorage للتابة الحالية فقط
        sessionStorage.removeItem('wesal_parent_token');
        sessionStorage.removeItem('wesal_parent_user');
        sessionStorage.removeItem('force_change_password'); // تنظيف إضافي لضمان الأمان
        
        setUser(null);
        setIsLoggedIn(false);
        
        // التوجيه الآمن يتم الآن من خلال زر تسجيل الخروج في ملف Sidebar.jsx أو ParentLayout
    };

    // استخراج الدور لتسهيل استخدامه في الراوتر
    const role = user?.role || null;

    return (
        // ✅ تم توفير isAuthenticated لتتوافق مع مكون ProtectedRoute
        <AuthContext.Provider value={{ 
            user, 
            role, 
            isLoggedIn, 
            isAuthenticated: isLoggedIn, 
            login, 
            logout, 
            isLoading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);