import React, { createContext, useContext, useState, useEffect } from 'react';
import { commonAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('wesal_parent_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return !!sessionStorage.getItem('wesal_parent_token');
    });
    
    const [isLoading, setIsLoading] = useState(true);

    // 🔔 حالات الإشعارات العالمية (Global Notification States)
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // 🚀 دالة جلب الإشعارات وحساب العداد محلياً (الفرونت إند فقط)
    const fetchNotifications = async () => {
        if (!isLoggedIn) return;
        try {
            const response = await commonAPI.listNotifications({ PageNumber: 1, PageSize: 50 });
            
            const items = response.data?.notifications?.items || response.data?.items || [];
            
            // 1. تحديث قائمة الإشعارات
            setNotifications(items);
            
            // 2. حساب الإشعارات الغير مقروءة بدقة من المصفوفة
            const actualUnreadCount = items.filter(n => n.status !== 'Read' && n.status !== 'read').length;
            setUnreadCount(actualUnreadCount);

        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    // 🚀 دالة قراءة الإشعار (تحديث المصفوفة والعداد معاً)
    const markNotificationAsRead = async (notificationId) => {
        try {
            // تحديث الواجهة فوراً (Optimistic Update)
            setNotifications(prevNotifications => {
                const updatedNotifications = prevNotifications.map(n => 
                    n.id === notificationId ? { ...n, status: 'Read' } : n
                );
                
                // إعادة حساب العداد من المصفوفة الجديدة بعد التعديل
                const newUnreadCount = updatedNotifications.filter(n => n.status !== 'Read' && n.status !== 'read').length;
                setUnreadCount(newUnreadCount);
                
                return updatedNotifications;
            });

            // ✅ تم تصحيح اسم الدالة هنا لتطابق الموجودة في ملف الـ api.js
            await commonAPI.markAsRead(notificationId);
        } catch (error) {
            console.error("Error marking notification as read:", error);
            // في حالة فشل السيرفر، نعيد تحميل الإشعارات لتصحيح الواجهة
            fetchNotifications();
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
        }
        setIsLoading(false);
    }, [isLoggedIn]);

    const login = (userData, token) => {
        sessionStorage.setItem('wesal_parent_token', token);
        sessionStorage.setItem('wesal_parent_user', JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem('wesal_parent_token');
        sessionStorage.removeItem('wesal_parent_user');
        sessionStorage.removeItem('force_change_password');
        setUser(null);
        setIsLoggedIn(false);
        setNotifications([]); 
        setUnreadCount(0);
    };

    const role = user?.role || null;

    return (
        <AuthContext.Provider value={{ 
            user, 
            role, 
            isLoggedIn, 
            isAuthenticated: isLoggedIn, 
            login, 
            logout, 
            isLoading,
            notifications,
            unreadCount,
            fetchNotifications,
            markNotificationAsRead
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);