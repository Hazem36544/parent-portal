import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // التحقق من وجود بيانات محفوظة عند عمل Refresh للصفحة
        const token = localStorage.getItem('wesal_parent_token');
        const savedUser = localStorage.getItem('wesal_parent_user');
        
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    const login = (userData, token) => {
        // userData المفروض تحتوي على حقل يحدد الهوية مثل: { role: 'father' } أو { role: 'mother' }
        localStorage.setItem('wesal_parent_token', token);
        localStorage.setItem('wesal_parent_user', JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('wesal_parent_token');
        localStorage.removeItem('wesal_parent_user');
        setUser(null);
        setIsLoggedIn(false);
        // التوجيه لصفحة الدخول الخاصة بالآباء بدلاً من المسار الرئيسي
        window.location.href = '/parent/login'; 
    };

    // 🚀 التعديل هنا: استخراج الدور لتسهيل استخدامه في الراوتر
    const role = user?.role || null;

    return (
        <AuthContext.Provider value={{ user, role, isLoggedIn, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);